import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat64 "mo:core/Nat64";

module {
  public type PerkClaimMap = Map.Map<Principal, Nat64>;
  public type PerkBucketMap = Map.Map<Principal, Text>;

  public func createPerkClaimMap(): PerkClaimMap {
    Map.empty<Principal, Nat64>()
  };

  public func createPerkBucketMap(): PerkBucketMap {
    Map.empty<Principal, Text>()
  };
};
