import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Types "../types";
import Config "../config/Config";
import AccountHelper "../ledger/Account";
import DateTime "../utils/DateTime";
import TransferService "TransferService";
import UserRepo "../repositories/UserRepository";
import ReservedRepo "../repositories/ReservedUsernameRepository";
import ReservedStorage "../storage/ReservedUsernameStorage";
import UserStorage "../storage/UserStorage";
import UsernameValidator "../validators/UsernameValidator";
import RateLimitService "RateLimitService";
import RateLimitStorage "../storage/RateLimitStorage";

module {
  public func create(
    users: UserStorage.UserMap,
    usernames: UserStorage.UsernameMap,
    reserved: ReservedStorage.ReservedUsernameSet,
    transfers: TransferService.TransferService,
    limits: RateLimitStorage.RateLimitMap,
  ) : UsernameSaleService {
    // Held only for the duration of one purchase, so it is deliberately not
    // persisted: an upgrade landing between two calls must not strand a name
    // behind a lock nobody will ever release.
    { users; usernames; reserved; transfers; limits; pending = Set.empty<Text>() };
  };

  public type UsernameSaleService = {
    users: UserStorage.UserMap;
    usernames: UserStorage.UsernameMap;
    reserved: ReservedStorage.ReservedUsernameSet;
    transfers: TransferService.TransferService;
    limits: RateLimitStorage.RateLimitMap;
    pending: Set.Set<Text>;
  };

  public type Purchase = {
    blockIndex: Nat64;
    txId: Types.TxId;
    username: Types.Username;
    price: Nat;
  };

  public func priceOf(name: Types.Username): Nat {
    UsernameValidator.priceFor(name);
  };

  public func priceOfCurrency(name: Types.Username, currencyText: Text): Nat {
    switch (parseCurrency(currencyText)) {
      case (?c) { UsernameValidator.priceForCurrency(name, c) };
      case (null) { UsernameValidator.priceFor(name) };
    };
  };

  public func parseCurrency(text: Text): ?UsernameValidator.Currency {
    if (text == "ICPAY" or text == "icpay") {
      ?#ICPAY;
    } else if (text == "ICP" or text == "icp") {
      ?#ICP;
    } else {
      null;
    };
  };

  public func treasury(): Principal {
    Principal.fromText(Config.TREASURY);
  };

  // Buys a handle outright. The payment is made first and the name is only
  // assigned once the ledger confirms it, so a failed transfer never hands out
  // a free handle.
  public func purchase(service: UsernameSaleService, caller: Principal, name: Types.Username): async Types.ApiResult<Purchase> {
    await purchaseInternal(service, caller, name, #ICP);
  };

  public func purchaseWithCurrency(service: UsernameSaleService, caller: Principal, name: Types.Username, currencyText: Text): async Types.ApiResult<Purchase> {
    let currency = switch (parseCurrency(currencyText)) {
      case (?c) { c };
      case (null) { return #err("Unsupported payment currency: " # currencyText) };
    };
    await purchaseInternal(service, caller, name, currency);
  };

  func purchaseInternal(service: UsernameSaleService, caller: Principal, name: Types.Username, currency: UsernameValidator.Currency): async Types.ApiResult<Purchase> {
    if (not RateLimitService.allow(service.limits, caller, Config.RATE_PURCHASE_USERNAME, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_PURCHASE_USERNAME));
    };
    switch (UsernameValidator.validate(name)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    let key = UsernameValidator.normalize(name);
    if (ReservedRepo.isReserved(service.reserved, name)) {
      return #err("Username is reserved");
    };
    if (UserRepo.usernameExists(service.usernames, name)) {
      return #err("Username already taken");
    };
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (null) { return #err("User not found") };
      case (?_) {};
    };
    // The ledger call below suspends. Without this lock two buyers could both
    // clear the availability check above and both be charged for one name.
    if (service.pending.contains(key)) {
      return #err("Username purchase already in progress");
    };
    service.pending.add(key);

    let price = UsernameValidator.priceForCurrency(name, currency);
    let ledgerId = switch (currency) {
      case (#ICP) { Config.ICP_LEDGER_CANISTER_ID };
      case (#ICPAY) { Config.ICPAY_LEDGER_ID };
    };
    let destination = AccountHelper.defaultAccount(treasury());
    let memo = saleMemoWithCurrency(name, price, Time.now(), currency);

    let result = await TransferService.transferByAccountInternal(service.transfers, caller, ledgerId, destination, price, ?memo);

    switch (result) {
      case (#err(e)) {
        service.pending.remove(key);
        #err(e);
      };
      case (#ok({ blockIndex; txId })) {
        // Re-checked after the suspension: an ordinary free claim could have
        // taken the name while the payment was in flight.
        if (UserRepo.usernameExists(service.usernames, name)) {
          service.pending.remove(key);
          return #err("Username was claimed while payment was in flight. Payment block " # Nat.toText(Nat64.toNat(blockIndex)) # " -- contact support for a refund.");
        };
        switch (UserRepo.getByPrincipal(service.users, caller)) {
          case (null) {
            service.pending.remove(key);
            #err("User not found");
          };
          case (?user) {
            UserRepo.addAlias(service.usernames, user, name, Time.now());
            service.pending.remove(key);
            #ok({ blockIndex; txId; username = name; price });
          };
        };
      };
    };
  };

  // The ledger memo is capped at 32 bytes, so the fields are packed tight.
  public func saleMemo(name: Types.Username, price: Nat, now: Int): Text {
    saleMemoWithCurrency(name, price, now, #ICP);
  };

  public func saleMemoWithCurrency(name: Types.Username, price: Nat, now: Int, currency: UsernameValidator.Currency): Text {
    switch (currency) {
      case (#ICP) {
        "@" # name # " " # wholeToken(price) # "ICP " # DateTime.toIsoDate(Int.abs(now));
      };
      case (#ICPAY) {
        "@" # name # " " # wholeToken(price) # "ICPAY " # DateTime.toIsoDate(Int.abs(now));
      };
    };
  };

  func wholeToken(e8s: Nat): Text {
    Nat.toText(e8s / 100_000_000);
  };
};
