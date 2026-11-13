import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import UserStorage "../../src/storage/UserStorage";
import ProPerkStorage "../../src/storage/ProPerkStorage";
import ProPerkService "../../src/services/ProPerkService";
import UserRepo "../../src/repositories/UserRepository";

let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let usersById = UserStorage.createUserIdMap();
let claims = ProPerkStorage.createPerkClaimMap();
let svc = ProPerkService.create(claims, users);

let pUnknown = Principal.fromText("mk4xk-sqaaa-aaaaa-qadjq-cai");
let pGold = Principal.fromText("aaaaa-aa");
let pBlue = Principal.fromText("2vxsx-fae");
let pBasic = Principal.fromText("rwlgt-iiaaa-aaaaa-aaaaa-cai");

let now = Time.now();
let _ = UserRepo.create(users, usernames, usersById, "u-gold", pGold, ?"ceo", "CEO", now, null);
let _ = UserRepo.create(users, usernames, usersById, "u-blue", pBlue, ?"elon", "Elon", now, null);
let _ = UserRepo.create(users, usernames, usersById, "u-basic", pBasic, ?"satoshi", "Satoshi", now, null);

// 1. Unknown user cannot claim
switch (ProPerkService.claim(svc, pUnknown)) {
  case (#ok(_)) { assert false };
  case (#err(_)) { Debug.print("PASS: unknown user rejected") };
};

// 2. Basic user (6 chars) cannot claim
switch (ProPerkService.claim(svc, pBasic)) {
  case (#ok(_)) { assert false };
  case (#err(_)) { Debug.print("PASS: basic user rejected from pro perk") };
};

// 3. Gold user (3 chars) is eligible and not yet claimed
assert ProPerkService.isEligible(svc, pGold) == true;
assert ProPerkService.hasClaimed(svc, pGold) == false;
Debug.print("PASS: gold user is eligible and initially unclaimed");

// 4. Gold user claims successfully
switch (ProPerkService.claim(svc, pGold)) {
  case (#ok(true)) {
    assert ProPerkService.hasClaimed(svc, pGold) == true;
    Debug.print("PASS: gold user claimed perk successfully");
  };
  case (#err(e)) { assert false; Debug.print("FAIL: " # e) };
};

// 5. Double claim by gold user is rejected
switch (ProPerkService.claim(svc, pGold)) {
  case (#ok(_)) { assert false };
  case (#err(e)) {
    assert e == "Perk already claimed";
    Debug.print("PASS: double claim rejected with correct error");
  };
};

// 6. Blue user (4 chars) claims successfully
assert ProPerkService.isEligible(svc, pBlue) == true;
switch (ProPerkService.claim(svc, pBlue)) {
  case (#ok(true)) {
    assert ProPerkService.hasClaimed(svc, pBlue) == true;
    Debug.print("PASS: blue user claimed perk successfully");
  };
  case (#err(e)) { assert false };
};

Debug.print("ALL PRO PERK SERVICE TESTS PASSED");
