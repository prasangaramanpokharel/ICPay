import Text "mo:core/Text";
import Blob "mo:core/Blob";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Timer "mo:core/Timer";
import Types "./Types";
import HttpOutcall "./HttpOutcall";
import EmailTemplate "./EmailTemplate";

persistent actor class Notifier(initBackendPrincipal: Principal) {
  var backendPrincipal = initBackendPrincipal;
  var apiKey : Text = "";
  var fromEmail : Text = "ICPay Cloud <alerts@alert.icpay.app>";
  var totalEmailsSent : Nat = 0;
  var lastSweepAt : Int = 0;
  var timerActive : Bool = true;
  var activeTimerId : ?Nat = null;
  let COOLDOWN_NANOS : Int = 20 * 3600 * 1_000_000_000;

  // Stable registry: bucketId -> NotificationSubscriber
  let subscribers = Map.empty<Text, Types.NotificationSubscriber>();

  func getWalletBackend() : Types.WalletBackend {
    actor(Principal.toText(backendPrincipal))
  };

  // -------------------------------------------------------------------------
  // Access Control
  // -------------------------------------------------------------------------
  func isController(caller: Principal) : Bool {
    Principal.isController(caller)
  };

  // -------------------------------------------------------------------------
  // Public Subscriber APIs
  // -------------------------------------------------------------------------
  public shared(msg) func registerEmail(bucketId: Text, email: Text) : async { #ok: (); #err: Text } {
    let caller = msg.caller;
    if (Principal.isAnonymous(caller)) {
      return #err("Anonymous caller not allowed");
    };
    if (Text.equal(bucketId, "") or Text.equal(email, "")) {
      return #err("Bucket ID and email are required");
    };
    if (not (Text.contains(email, #text("@")) and Text.contains(email, #text(".")))) {
      return #err("Invalid email address format");
    };

    switch (subscribers.get(bucketId)) {
      case (?existing) {
        if (existing.owner != caller and not isController(caller)) {
          return #err("Unauthorized: bucket already registered by another owner");
        };
      };
      case (null) ();
    };

    let sub : Types.NotificationSubscriber = {
      bucketId = bucketId;
      owner = caller;
      email = email;
      createdAt = Time.now();
      var lastNotifiedAt = 0;
      var lastNotifiedStage = "none";
    };
    subscribers.add(bucketId, sub);

    // Dispatches welcome email upon bucket registration with idempotency key
    if (not Text.equal(apiKey, "")) {
      try {
        let statsRes = await getWalletBackend().getBucketStats(bucketId);
        let (bucketName, capGB) = switch (statsRes) {
          case (#ok(s)) {
            let gb = if (s.capacity > 1000) s.capacity / (1024 * 1024 * 1024) else s.capacity;
            (s.name, gb)
          };
          case (#err(_)) (bucketId, 5);
        };
        let subject = "✨ Your ICPay Storage Bucket '" # bucketName # "' is Ready";
        let html = EmailTemplate.renderBucketCreated(bucketName, bucketId, capGB);
        let idempotencyKey = "created-" # bucketId;

        ignore await HttpOutcall.sendResendEmail(
          apiKey,
          fromEmail,
          email,
          subject,
          html,
          idempotencyKey,
          ?(transform)
        );
      } catch (_) {
        ();
      };
    };

    #ok(())
  };

  public shared(msg) func unregisterEmail(bucketId: Text) : async { #ok: (); #err: Text } {
    let caller = msg.caller;
    if (Principal.isAnonymous(caller)) {
      return #err("Anonymous caller not allowed");
    };

    switch (subscribers.get(bucketId)) {
      case (null) #err("Subscription not found");
      case (?sub) {
        if (sub.owner != caller and not isController(caller)) {
          return #err("Unauthorized: caller is not bucket owner");
        };
        subscribers.remove(bucketId);
        #ok(())
      };
    };
  };

  public shared query(msg) func getEmail(bucketId: Text) : async ?Text {
    let caller = msg.caller;
    switch (subscribers.get(bucketId)) {
      case (null) null;
      case (?sub) {
        if (sub.owner == caller or isController(caller)) {
          ?sub.email
        } else {
          null
        }
      };
    };
  };

  // -------------------------------------------------------------------------
  // Autonomous 24-Hour Timer Sweep
  // -------------------------------------------------------------------------
  public func runDailySweep() : async Nat {
    lastSweepAt := Time.now();
    var sentThisRun = 0;
    let now = Time.now();

    let entries = subscribers.entries();
    for ((_bId, sub) in entries) {
      try {
        let statsRes = await getWalletBackend().getBucketStats(sub.bucketId);
        switch (statsRes) {
          case (#err(_)) (); // Bucket not found or query error, skip
          case (#ok(stats)) {
            let daysLeft = stats.daysRemaining;
            let isCooledDown = (now - sub.lastNotifiedAt) >= COOLDOWN_NANOS;

            // Scenario 1: Expiring Soon Warning (<= 3 days left and Active)
            if (stats.status == #ACTIVE and daysLeft <= 3 and sub.lastNotifiedStage != "soon" and isCooledDown) {
              let subject = "⚠️ Action Required: ICPay Bucket '" # stats.name # "' expires in " # Nat.toText(daysLeft) # " day(s)";
              let html = EmailTemplate.renderExpirySoon(stats.name, stats.id, daysLeft);
              let idempotencyKey = "expiry-" # sub.bucketId # "-" # Nat.toText(daysLeft);

              let sendRes = await HttpOutcall.sendResendEmail(
                apiKey,
                fromEmail,
                sub.email,
                subject,
                html,
                idempotencyKey,
                ?(transform)
              );

              switch (sendRes) {
                case (#ok(_)) {
                  sub.lastNotifiedStage := "soon";
                  sub.lastNotifiedAt := Time.now();
                  totalEmailsSent := totalEmailsSent + 1;
                  sentThisRun := sentThisRun + 1;
                };
                case (#err(_)) ();
              };
            }
            // Scenario 2: Plan Expired — Grace Period Warning (Day 1-7)
            else if (stats.status == #EXPIRED and sub.lastNotifiedStage != "grace" and isCooledDown) {
              let subject = "🚨 Plan Expired: ICPay Bucket '" # stats.name # "' is now in Read-Only Grace Period";
              let html = EmailTemplate.renderGracePeriod(stats.name, stats.id);
              let idempotencyKey = "grace-" # sub.bucketId;

              let sendRes = await HttpOutcall.sendResendEmail(
                apiKey,
                fromEmail,
                sub.email,
                subject,
                html,
                idempotencyKey,
                ?(transform)
              );

              switch (sendRes) {
                case (#ok(_)) {
                  sub.lastNotifiedStage := "grace";
                  sub.lastNotifiedAt := Time.now();
                  totalEmailsSent := totalEmailsSent + 1;
                  sentThisRun := sentThisRun + 1;
                };
                case (#err(_)) ();
              };
            }
            // Reset notification stage once bucket has been renewed
            else if (stats.status == #ACTIVE and daysLeft > 7 and sub.lastNotifiedStage != "none") {
              sub.lastNotifiedStage := "none";
            };
          };
        };
      } catch (_) {
        // Individual bucket network failure does not crash the sweep
        ();
      };
    };

    sentThisRun
  };

  // Normalizes headers and empties response body to guarantee deterministic subnet consensus.
  public query func transform(args: { response: Types.CanisterHttpResponse; context: Blob }) : async Types.CanisterHttpResponse {
    {
      status = args.response.status;
      headers = [];
      body = Blob.fromArray([]);
    }
  };

  // -------------------------------------------------------------------------
  // Admin & Operational Controls
  // -------------------------------------------------------------------------
  public shared(msg) func setApiKey(key: Text) : async () {
    assert isController(msg.caller);
    apiKey := key;
  };

  public shared(msg) func setFromEmail(sender: Text) : async () {
    assert isController(msg.caller);
    fromEmail := sender;
  };

  public shared(msg) func setTimerActive(active: Bool) : async () {
    assert isController(msg.caller);
    timerActive := active;
  };

  public shared(msg) func setBackendPrincipal(p: Principal) : async () {
    assert isController(msg.caller);
    backendPrincipal := p;
  };

  public shared(msg) func triggerManualSweep() : async Nat {
    assert isController(msg.caller);
    await runDailySweep()
  };

  public shared(msg) func restartTimer() : async () {
    assert isController(msg.caller);
    armSweepTimer<system>();
  };

  public shared query(msg) func getStatus() : async Types.NotifierStatus {
    assert isController(msg.caller);
    {
      subscribersCount = subscribers.size();
      totalEmailsSent = totalEmailsSent;
      lastSweepAt = lastSweepAt;
      timerActive = timerActive;
      backendCanisterId = backendPrincipal;
    }
  };

  // Ensures only one active recurring timer runs across upgrades.
  func armSweepTimer<system>() {
    switch (activeTimerId) {
      case (?tid) {
        Timer.cancelTimer(tid);
        activeTimerId := null;
      };
      case (null) ();
    };
    let tid = Timer.recurringTimer<system>(#hours 24, func() : async () {
      if (timerActive) {
        ignore await runDailySweep();
      };
    });
    activeTimerId := ?tid;
  };

  armSweepTimer<system>();
};
