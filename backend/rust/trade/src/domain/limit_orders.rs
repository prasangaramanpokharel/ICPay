use candid::{Nat, Principal};
use std::cell::RefCell;

use crate::domain::fees::{amount_after_maker_fee, icrc2_allowance_amount, maker_fee};
use crate::domain::quote::net_out;
use crate::icpswap::factory::resolve_pool;
use crate::icpswap::pool::deposit_from_and_swap;
use crate::icpswap::types::DepositAndSwapArgs;
use crate::ledger::icrc::{approve_spender, transfer_fee};
use crate::storage::{balances, limit_orders::{self, StoredLimitOrder}, trades::{self, StoredTrade}};
use crate::types::{ApiResult, LimitOrder, OrderStatus, SwapResult};
use crate::wallet::lock::UserTradeLock;

thread_local! {
    static ORDER_COUNTER: RefCell<u64> = const { RefCell::new(0) };
}

fn next_order_id(time_ns: u64) -> u64 {
    let count = ORDER_COUNTER.with(|c| {
        let mut n = c.borrow_mut();
        *n = n.wrapping_add(1);
        *n
    });
    (time_ns & 0xFFFFFFFFFFFF0000) | (count & 0xFFFF)
}

pub fn place_limit_order(
    user: Principal,
    token_in: String,
    token_out: String,
    amount_in: Nat,
    min_amount_out: Nat,
) -> ApiResult<LimitOrder> {
    let amount_in_u128: u128 = match amount_in.0.try_into() {
        Ok(v) => v,
        Err(_) => return ApiResult::err("amount_in too large"),
    };
    let min_out_u128: u128 = match min_amount_out.0.try_into() {
        Ok(v) => v,
        Err(_) => return ApiResult::err("min_amount_out too large"),
    };

    if amount_in_u128 == 0 {
        return ApiResult::err("amount_in must be > 0");
    }
    if min_out_u128 == 0 {
        return ApiResult::err("min_amount_out must be > 0");
    }
    if token_in == token_out {
        return ApiResult::err("token_in and token_out must differ");
    }

    if balances::get(user, &token_in) < amount_in_u128 {
        return ApiResult::err("insufficient trading balance to place limit order");
    }

    if let Err(e) = balances::debit(user, &token_in, amount_in_u128) {
        return ApiResult::err(e);
    }

    let time_ns = crate::config::current_time_ns();
    let order_id = next_order_id(time_ns);

    let stored = StoredLimitOrder {
        id: order_id,
        user,
        token_in,
        token_out,
        amount_in: amount_in_u128,
        min_amount_out: min_out_u128,
        created_at_ns: time_ns,
        filled_at_ns: None,
        status: OrderStatus::Open,
    };

    limit_orders::insert_order(stored.clone());
    ApiResult::ok(stored.to_limit_order())
}

pub fn cancel_limit_order(user: Principal, order_id: u64) -> ApiResult<Nat> {
    let order = match limit_orders::get_order(order_id) {
        Some(o) => o,
        None => return ApiResult::err("order not found"),
    };

    if order.user != user {
        return ApiResult::err("unauthorized: not the owner of this order");
    }

    if order.status != OrderStatus::Open {
        return ApiResult::err(format!("cannot cancel order in status {:?}", order.status));
    }

    if let Err(e) = limit_orders::update_order_status(order_id, OrderStatus::Cancelled, None) {
        return ApiResult::err(e);
    }

    balances::credit(user, &order.token_in, order.amount_in);
    ApiResult::ok(Nat::from(order.amount_in))
}

pub async fn execute_single_order(order_id: u64) -> ApiResult<SwapResult> {
    let order = match limit_orders::get_order(order_id) {
        Some(o) => o,
        None => return ApiResult::err("order not found"),
    };

    if order.status != OrderStatus::Open {
        return ApiResult::err(format!("order is not open, current status: {:?}", order.status));
    }

    let _lock = match UserTradeLock::try_acquire(order.user) {
        Ok(guard) => guard,
        Err(e) => return ApiResult::err(format!("user busy: {e}")),
    };

    let token_in_id = match Principal::from_text(&order.token_in) {
        Ok(p) => p,
        Err(e) => return ApiResult::err(format!("invalid token_in: {e}")),
    };
    let token_out_id = match Principal::from_text(&order.token_out) {
        Ok(p) => p,
        Err(e) => return ApiResult::err(format!("invalid token_out: {e}")),
    };

    let fee_in = match transfer_fee(token_in_id).await {
        Ok(f) => f,
        Err(e) => return ApiResult::err(e),
    };
    let fee_out = match transfer_fee(token_out_id).await {
        Ok(f) => f,
        Err(e) => return ApiResult::err(e),
    };

    let maker_fee_amt = maker_fee(order.amount_in);
    let swap_amount = amount_after_maker_fee(order.amount_in).saturating_sub(fee_in);
    if swap_amount == 0 {
        return ApiResult::err("order amount too small after fees");
    }

    let pool = match resolve_pool(&order.token_in, &order.token_out).await {
        Ok(p) => p,
        Err(e) => return ApiResult::err(e),
    };

    let allowance = icrc2_allowance_amount(swap_amount, fee_in);
    let approve_block = match approve_spender(token_in_id, pool.pool_id, allowance, fee_in).await {
        Ok(block) => block,
        Err(e) => return ApiResult::err(format!("approve failed: {e}")),
    };

    let gross_out = match deposit_from_and_swap(
        pool.pool_id,
        DepositAndSwapArgs {
            token_in_fee: Nat::from(fee_in),
            amount_in: swap_amount.to_string(),
            zero_for_one: pool.zero_for_one,
            amount_out_minimum: order.min_amount_out.to_string(),
            token_out_fee: Nat::from(fee_out),
        },
    )
    .await
    {
        Ok(v) => v,
        Err(e) => return ApiResult::err(format!("limit price not yet reached: {e}")),
    };

    if gross_out < order.min_amount_out {
        return ApiResult::err(format!(
            "price not reached: got {gross_out}, minimum {}",
            order.min_amount_out
        ));
    }

    let net_out = net_out(gross_out, fee_out);
    if net_out == 0 {
        return ApiResult::err("amount_out too small after ledger fees");
    }

    balances::credit(order.user, &order.token_out, net_out);

    let tx_ns = crate::config::current_time_ns();
    let tx_id = format!("limit-fill-{order_id}-{tx_ns}");

    if let Err(e) = limit_orders::update_order_status(order_id, OrderStatus::Filled, Some(tx_ns)) {
        return ApiResult::err(format!("order state update failed: {e}"));
    }

    trades::record_trade(
        order.user,
        StoredTrade {
            timestamp_ns: tx_ns,
            token_in: order.token_in.clone(),
            token_out: order.token_out.clone(),
            amount_in: order.amount_in,
            amount_out: net_out,
            service_fee: maker_fee_amt,
            tx_id: tx_id.clone(),
        },
    );

    ApiResult::ok(SwapResult {
        block_index: approve_block,
        amount_in: Nat::from(order.amount_in),
        amount_out: Nat::from(net_out),
        service_fee: Nat::from(maker_fee_amt),
        tx_id,
    })
}

pub async fn crank_orders(limit: Option<u64>) -> Vec<ApiResult<SwapResult>> {
    let max = limit.unwrap_or(10).min(50) as usize;
    let open_orders = limit_orders::get_open_orders(None);
    let mut results = Vec::new();

    for order in open_orders.into_iter().take(max) {
        let res = execute_single_order(order.id).await;
        results.push(res);
    }

    results
}
