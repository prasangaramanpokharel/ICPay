import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat64 "mo:core/Nat64";
import Types "../types";
import ProPerkStorage "../storage/ProPerkStorage";
import ProPerkRepo "../repositories/ProPerkRepository";
import UserStorage "../storage/UserStorage";
import UserRepo "../repositories/UserRepository";
import UsernameValidator "../validators/UsernameValidator";

module {
  public type ProPerkService = {
    claims: ProPerkStorage.PerkClaimMap;
    users: UserStorage.UserMap;
  };

  public func create(
    claims: ProPerkStorage.PerkClaimMap,
    users: UserStorage.UserMap,
  ): ProPerkService {
    { claims; users };
  };

  public func isEligible(service: ProPerkService, user: Principal): Bool {
    switch (UserRepo.getByPrincipal(service.users, user)) {
      case (null) { false };
      case (?u) {
        switch (u.username) {
          case (null) { false };
          case (?name) {
            switch (UsernameValidator.tierFor(name)) {
              case (#ultra or #premium) { true };
              case (_) { false };
            };
          };
        };
      };
    };
  };

  public func hasClaimed(service: ProPerkService, user: Principal): Bool {
    ProPerkRepo.hasClaimed(service.claims, user);
  };

  public func getClaimTimestamp(service: ProPerkService, user: Principal): ?Nat64 {
    ProPerkRepo.getClaimTimestamp(service.claims, user);
  };

  public func claim(service: ProPerkService, caller: Principal): Types.ApiResult<Bool> {
    if (not isEligible(service, caller)) {
      return #err("Only Pro handle owners (Gold Ultra or Blue Premium) qualify for cloud storage perks");
    };
    if (ProPerkRepo.hasClaimed(service.claims, caller)) {
      return #err("Perk already claimed");
    };
    let now = Nat64.fromIntWrap(Time.now());
    ProPerkRepo.recordClaim(service.claims, caller, now);
    #ok(true);
  };

  func requireController(caller: Principal): ?Text {
    if (Principal.isController(caller)) { null } else { ?"Not authorized" };
  };

  public type AdminStats = {
    totalClaims: Nat;
    claims: [(Principal, Nat64)];
  };

  public type AdminUserCheck = {
    eligible: Bool;
    claimed: Bool;
    claimedAt: ?Nat64;
    username: ?Text;
  };

  public func adminGetStats(service: ProPerkService, caller: Principal): Types.ApiResult<AdminStats> {
    switch (requireController(caller)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    #ok({
      totalClaims = ProPerkRepo.count(service.claims);
      claims = ProPerkRepo.entries(service.claims);
    });
  };

  public func adminCheckUser(service: ProPerkService, caller: Principal, target: Principal): Types.ApiResult<AdminUserCheck> {
    switch (requireController(caller)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    let username = switch (UserRepo.getByPrincipal(service.users, target)) {
      case (?u) { u.username };
      case (null) { null };
    };
    #ok({
      eligible = isEligible(service, target);
      claimed = ProPerkRepo.hasClaimed(service.claims, target);
      claimedAt = ProPerkRepo.getClaimTimestamp(service.claims, target);
      username;
    });
  };

  public func adminResetClaim(service: ProPerkService, caller: Principal, target: Principal): Types.ApiResult<Bool> {
    switch (requireController(caller)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    ProPerkRepo.removeClaim(service.claims, target);
    #ok(true);
  };
};
