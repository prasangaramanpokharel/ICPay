use candid::Principal;
use crate::storage::{set_config, CanisterConfig};
use crate::wallet::rate_limit::{
    check_rate_limit, reset_rate_limiters, RATE_CRANK, RATE_ORDER, RATE_SWAP,
};

#[test]
fn rate_limit_allows_burst_then_throttles() {
    reset_rate_limiters();

    let user = Principal::from_slice(&[101; 29]);
    let mut now = 1_000_000_000_000u64;

    // RATE_SWAP has capacity 5.0
    for _ in 0..5 {
        assert!(check_rate_limit(user, RATE_SWAP, now).is_ok());
    }

    // 6th call in same nanosecond must fail
    let err = check_rate_limit(user, RATE_SWAP, now);
    assert!(err.is_err(), "must throttle once burst capacity is spent");
    assert!(err.unwrap_err().contains("rate limit exceeded"));

    // Advance by 2 seconds (refill rate is 0.5/s, so 2s = 1.0 token)
    now += 2_000_000_000;
    assert!(check_rate_limit(user, RATE_SWAP, now).is_ok(), "replenished token must allow call");

    // Second call without advancing time fails again
    assert!(check_rate_limit(user, RATE_SWAP, now).is_err());
}

#[test]
fn distinct_principals_have_independent_quotas() {
    reset_rate_limiters();

    let user1 = Principal::from_slice(&[102; 29]);
    let user2 = Principal::from_slice(&[103; 29]);
    let now = 1_000_000_000_000u64;

    for _ in 0..5 {
        assert!(check_rate_limit(user1, RATE_SWAP, now).is_ok());
    }
    assert!(check_rate_limit(user1, RATE_SWAP, now).is_err());

    // user2 should still have full capacity
    assert!(check_rate_limit(user2, RATE_SWAP, now).is_ok());
}

#[test]
fn distinct_policies_have_independent_buckets() {
    reset_rate_limiters();

    let user = Principal::from_slice(&[104; 29]);
    let now = 1_000_000_000_000u64;

    // Exhaust SWAP budget (5)
    for _ in 0..5 {
        assert!(check_rate_limit(user, RATE_SWAP, now).is_ok());
    }
    assert!(check_rate_limit(user, RATE_SWAP, now).is_err());

    // ORDER budget (10) should still be available
    assert!(check_rate_limit(user, RATE_ORDER, now).is_ok());
}

#[test]
fn trusted_keeper_bypasses_crank_throttle() {
    reset_rate_limiters();

    let wallet = Principal::from_slice(&[201; 29]);
    let treasury = Principal::from_slice(&[202; 29]);
    let regular_user = Principal::from_slice(&[203; 29]);

    set_config(CanisterConfig {
        wallet_canister: wallet,
        treasury,
    });

    let now = 1_000_000_000_000u64;

    // Wallet canister can crank 20 times with zero throttling
    for _ in 0..20 {
        assert!(check_rate_limit(wallet, RATE_CRANK, now).is_ok());
    }

    // Regular user is throttled after RATE_CRANK capacity (6)
    for _ in 0..6 {
        assert!(check_rate_limit(regular_user, RATE_CRANK, now).is_ok());
    }
    assert!(check_rate_limit(regular_user, RATE_CRANK, now).is_err());
}
