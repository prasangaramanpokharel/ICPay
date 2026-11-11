use candid::{Nat, Principal};
use ic_cdk::{query, update};

use crate::domain::limit_orders;
use crate::storage::limit_orders as storage_orders;
use crate::types::{ApiResult, LimitOrder, SwapResult};
use crate::wallet::{gate, rate_limit};

#[update]
fn place_limit_order(
    token_in: String,
    token_out: String,
    amount_in: Nat,
    min_amount_out: Nat,
) -> ApiResult<LimitOrder> {
    let caller = ic_cdk::api::msg_caller();
    if let Err(e) = gate::reject_anonymous(caller) {
        return ApiResult::err(e);
    }
    let now = crate::config::current_time_ns();
    if let Err(e) = rate_limit::check_rate_limit(caller, rate_limit::RATE_ORDER, now) {
        return ApiResult::err(e);
    }
    limit_orders::place_limit_order(caller, token_in, token_out, amount_in, min_amount_out)
}

#[update]
fn cancel_limit_order(order_id: u64) -> ApiResult<Nat> {
    let caller = ic_cdk::api::msg_caller();
    if let Err(e) = gate::reject_anonymous(caller) {
        return ApiResult::err(e);
    }
    let now = crate::config::current_time_ns();
    if let Err(e) = rate_limit::check_rate_limit(caller, rate_limit::RATE_ORDER, now) {
        return ApiResult::err(e);
    }
    limit_orders::cancel_limit_order(caller, order_id)
}

#[update]
async fn execute_limit_order(order_id: u64) -> ApiResult<SwapResult> {
    let caller = ic_cdk::api::msg_caller();
    if let Err(e) = gate::reject_anonymous(caller) {
        return ApiResult::err(e);
    }
    let now = crate::config::current_time_ns();
    if let Err(e) = rate_limit::check_rate_limit(caller, rate_limit::RATE_EXECUTE, now) {
        return ApiResult::err(e);
    }
    limit_orders::execute_single_order(order_id).await
}

/// Crank open orders (callable by cron, keepers, or frontend).
#[update]
async fn crank_open_orders(limit: Option<u64>) -> Vec<ApiResult<SwapResult>> {
    let caller = ic_cdk::api::msg_caller();
    if let Err(e) = gate::reject_anonymous(caller) {
        return vec![ApiResult::err(e)];
    }
    let now = crate::config::current_time_ns();
    if let Err(e) = rate_limit::check_rate_limit(caller, rate_limit::RATE_CRANK, now) {
        return vec![ApiResult::err(e)];
    }
    limit_orders::crank_orders(limit).await
}

#[query]
fn get_user_limit_orders(user: Principal, limit: Option<u64>) -> Vec<LimitOrder> {
    let lim = limit.unwrap_or(50).min(100) as usize;
    storage_orders::get_user_orders(user, lim)
}

#[query]
fn get_open_limit_orders(user: Option<Principal>) -> Vec<LimitOrder> {
    storage_orders::get_open_orders(user)
}
