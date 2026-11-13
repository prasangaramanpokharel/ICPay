import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat64 "mo:core/Nat64";
import Array "mo:core/Array";
import ProPerkStorage "../storage/ProPerkStorage";

module {
  public func hasClaimed(claims: ProPerkStorage.PerkClaimMap, user: Principal): Bool {
    switch (Map.get(claims, Principal.compare, user)) {
      case (?_) { true };
      case (null) { false };
    };
  };

  public func getClaimTimestamp(claims: ProPerkStorage.PerkClaimMap, user: Principal): ?Nat64 {
    Map.get(claims, Principal.compare, user);
  };

  public func recordClaim(claims: ProPerkStorage.PerkClaimMap, user: Principal, timestamp: Nat64) {
    Map.add(claims, Principal.compare, user, timestamp);
  };

  public func removeClaim(claims: ProPerkStorage.PerkClaimMap, user: Principal) {
    ignore Map.remove(claims, Principal.compare, user);
  };

  public func count(claims: ProPerkStorage.PerkClaimMap): Nat {
    claims.size;
  };

  public func entries(claims: ProPerkStorage.PerkClaimMap): [(Principal, Nat64)] {
    Array.fromIter(Map.entries(claims));
  };
};
