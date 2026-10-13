import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Int "mo:core/Int";
import Blob "mo:core/Blob";

module {
  public type BucketId = Text;

  public type NotificationSubscriber = {
    bucketId: BucketId;
    owner: Principal;
    email: Text;
    createdAt: Int;
    var lastNotifiedAt: Int;
    var lastNotifiedStage: Text; // "none" | "soon" | "grace" | "frozen"
  };

  public type HeaderField = {
    name: Text;
    value: Text;
  };

  public type HttpHeader = HeaderField;

  public type HttpMethod = {
    #get;
    #post;
    #head;
  };

  public type CanisterHttpRequest = {
    url: Text;
    max_response_bytes: ?Nat64;
    method: HttpMethod;
    headers: [HttpHeader];
    body: ?Blob;
    transform: ?{
      function: shared query { response: CanisterHttpResponse; context: Blob } -> async CanisterHttpResponse;
      context: Blob;
    };
  };

  public type CanisterHttpResponse = {
    status: Nat;
    headers: [HttpHeader];
    body: Blob;
  };

  public type ManagementCanister = actor {
    http_request: CanisterHttpRequest -> async CanisterHttpResponse;
  };

  public type BackendBucketStats = {
    id: Text;
    name: Text;
    capacity: Nat;
    storageUsed: Nat;
    usagePercent: Nat;
    fileCount: Nat;
    visibility: { #Public; #Private };
    status: { #ACTIVE; #EXPIRED };
    expiresAt: Int;
    daysRemaining: Nat;
    isExpiringSoon: Bool;
    renewPriceE8s: Nat64;
    periodDays: Nat;
    publicBaseUrl: ?Text;
    storageCanisterId: ?Text;
  };

  public type WalletBackend = actor {
    getBucketStats: (Text) -> async { #ok: BackendBucketStats; #err: Text };
  };

  public type NotifierStatus = {
    subscribersCount: Nat;
    totalEmailsSent: Nat;
    lastSweepAt: Int;
    timerActive: Bool;
    backendCanisterId: Principal;
  };
};
