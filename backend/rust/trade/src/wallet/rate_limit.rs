use candid::Principal;
use std::cell::RefCell;
use std::collections::HashMap;

use crate::storage::with_config;

#[derive(Clone, Debug)]
pub struct TokenBucket {
    pub tokens: f64,
    pub last_update_ns: u64,
}

#[derive(Clone, Copy, Debug)]
pub struct RatePolicy {
    pub capacity: f64,
    pub refill_per_sec: f64,
}

pub const RATE_SWAP: RatePolicy = RatePolicy {
    capacity: 5.0,
    refill_per_sec: 0.5,
};

pub const RATE_ORDER: RatePolicy = RatePolicy {
    capacity: 10.0,
    refill_per_sec: 1.0,
};

pub const RATE_EXECUTE: RatePolicy = RatePolicy {
    capacity: 20.0,
    refill_per_sec: 2.0,
};

pub const RATE_CRANK: RatePolicy = RatePolicy {
    capacity: 6.0,
    refill_per_sec: 0.2,
};

pub const RATE_ADMIN: RatePolicy = RatePolicy {
    capacity: 3.0,
    refill_per_sec: 0.05,
};

const MAX_BUCKETS: usize = 10_000;
const BUCKET_TTL_NS: u64 = 300_000_000_000; // 5 minutes

thread_local! {
    static RATE_LIMITERS: RefCell<HashMap<(Principal, u8), TokenBucket>> = RefCell::new(HashMap::new());
}

fn policy_tag(policy: &RatePolicy) -> u8 {
    if policy.capacity == RATE_SWAP.capacity && policy.refill_per_sec == RATE_SWAP.refill_per_sec {
        1
    } else if policy.capacity == RATE_ORDER.capacity && policy.refill_per_sec == RATE_ORDER.refill_per_sec {
        2
    } else if policy.capacity == RATE_EXECUTE.capacity && policy.refill_per_sec == RATE_EXECUTE.refill_per_sec {
        3
    } else if policy.capacity == RATE_CRANK.capacity && policy.refill_per_sec == RATE_CRANK.refill_per_sec {
        4
    } else if policy.capacity == RATE_ADMIN.capacity && policy.refill_per_sec == RATE_ADMIN.refill_per_sec {
        5
    } else {
        0
    }
}

pub fn is_trusted_keeper(caller: Principal) -> bool {
    with_config(|c| caller == c.wallet_canister || caller == c.treasury)
}

pub fn check_rate_limit(caller: Principal, policy: RatePolicy, now_ns: u64) -> Result<(), String> {
    if is_trusted_keeper(caller) && (policy_tag(&policy) == 4 || policy_tag(&policy) == 5) {
        return Ok(());
    }

    let tag = policy_tag(&policy);
    let key = (caller, tag);

    RATE_LIMITERS.with(|cell| {
        let mut map = cell.borrow_mut();

        if map.len() >= MAX_BUCKETS {
            map.retain(|_, bucket| now_ns.saturating_sub(bucket.last_update_ns) < BUCKET_TTL_NS);
        }

        let bucket = map.entry(key).or_insert(TokenBucket {
            tokens: policy.capacity,
            last_update_ns: now_ns,
        });

        let elapsed_nanos = now_ns.saturating_sub(bucket.last_update_ns);
        let elapsed_secs = (elapsed_nanos as f64) / 1_000_000_000.0;

        bucket.tokens = (bucket.tokens + elapsed_secs * policy.refill_per_sec).min(policy.capacity);
        bucket.last_update_ns = now_ns;

        if bucket.tokens >= 1.0 {
            bucket.tokens -= 1.0;
            Ok(())
        } else {
            let wait_secs = ((1.0 - bucket.tokens) / policy.refill_per_sec).ceil() as u64;
            Err(format!(
                "rate limit exceeded: too many requests. please wait {wait_secs}s before retrying"
            ))
        }
    })
}

#[allow(dead_code)]
pub fn reset_rate_limiters() {
    RATE_LIMITERS.with(|cell| {
        cell.borrow_mut().clear();
    });
}
