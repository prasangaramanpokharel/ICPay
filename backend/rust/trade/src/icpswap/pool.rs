use candid::{Nat, Principal};
use ic_cdk::call::Call;

use crate::icpswap::types::{DepositAndSwapArgs, PoolResult};

pub async fn deposit_from_and_swap(pool: Principal, args: DepositAndSwapArgs) -> Result<u128, String> {
    let (result,): (PoolResult<Nat>,) = Call::bounded_wait(pool, "depositFromAndSwap")
        .with_arg(args)
        .await
        .map_err(|e| format!("depositFromAndSwap failed: {e:?}"))?
        .candid_tuple()
        .map_err(|e| format!("depositFromAndSwap decode failed: {e:?}"))?;

    match result {
        PoolResult::Ok(amount) => {
            amount.0.try_into().map_err(|_| "pool amount_out exceeds u128".to_string())
        }
        PoolResult::Err(e) => Err(format!("depositFromAndSwap pool error: {e:?}")),
    }
}
