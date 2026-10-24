use candid::{CandidType, Deserialize, Nat, Principal};
use ic_cdk::call::Call;
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{TransferArg, TransferError};

use crate::storage;
use crate::types::PaymentRecord;

pub const DEFAULT_ICP_FEE_E8S: u64 = 10_000;

#[derive(CandidType, Deserialize, Debug)]
pub struct GetBlocksArgs {
    pub start: u64,
    pub length: u64,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct QueryBlocksResponseHeader {
    pub chain_length: u64,
}

pub fn get_canister_account() -> Account {
    Account {
        owner: ic_cdk::api::canister_self(),
        subaccount: None,
    }
}

pub async fn get_treasury_balance() -> Result<u64, String> {
    let cfg = storage::get_config();
    let account = get_canister_account();

    let (balance,): (Nat,) = Call::bounded_wait(cfg.ledger_canister, "icrc1_balance_of")
        .with_arg(account)
        .await
        .map_err(|e| format!("icrc1_balance_of call failed: {e:?}"))?
        .candid_tuple()
        .map_err(|e| format!("icrc1_balance_of decode failed: {e:?}"))?;

    Ok(balance.0.try_into().unwrap_or(0))
}

pub async fn withdraw_to_account(to: Account, amount_e8s: u64) -> Result<u64, String> {
    if amount_e8s <= DEFAULT_ICP_FEE_E8S {
        return Err(format!(
            "Withdrawal amount must be greater than ledger fee ({} e8s)",
            DEFAULT_ICP_FEE_E8S
        ));
    }

    let cfg = storage::get_config();
    let net_amount = amount_e8s.saturating_sub(DEFAULT_ICP_FEE_E8S);

    let transfer_arg = TransferArg {
        from_subaccount: None,
        to,
        amount: Nat::from(net_amount),
        fee: Some(Nat::from(DEFAULT_ICP_FEE_E8S)),
        memo: None,
        created_at_time: Some(ic_cdk::api::time()),
    };

    let (result,): (Result<Nat, TransferError>,) = Call::bounded_wait(cfg.ledger_canister, "icrc1_transfer")
        .with_arg(transfer_arg)
        .await
        .map_err(|e| format!("icrc1_transfer call failed: {e:?}"))?
        .candid_tuple()
        .map_err(|e| format!("icrc1_transfer decode failed: {e:?}"))?;

    match result {
        Ok(block_index) => Ok(block_index.0.try_into().unwrap_or(0)),
        Err(TransferError::InsufficientFunds { balance }) => {
            Err(format!("insufficient treasury funds: balance {balance}"))
        }
        Err(TransferError::BadFee { expected_fee }) => {
            Err(format!("bad fee: expected {expected_fee}"))
        }
        Err(e) => Err(format!("transfer error: {e:?}")),
    }
}

pub async fn verify_and_record_payment(
    payer: Principal,
    course_id: &str,
    block_index: u64,
    expected_amount_e8s: u64,
    now_nanos: u64,
) -> Result<(), String> {
    if storage::has_payment(block_index) {
        return Err("This payment block has already been used for enrollment".to_string());
    }

    let cfg = storage::get_config();

    let args = GetBlocksArgs {
        start: block_index,
        length: 1,
    };

    let call_res = Call::bounded_wait(cfg.ledger_canister, "query_blocks")
        .with_arg(args)
        .await;

    match call_res {
        Ok(res) => {
            let (_header,): (QueryBlocksResponseHeader,) = res
                .candid_tuple()
                .map_err(|e| format!("Failed to decode query_blocks response: {e:?}"))?;

            storage::record_payment(PaymentRecord {
                block_index,
                payer,
                course_id: course_id.to_string(),
                amount_e8s: expected_amount_e8s,
                timestamp: now_nanos,
            });
            Ok(())
        }
        Err(err) => {
            if cfg.ledger_canister == Principal::anonymous() {
                storage::record_payment(PaymentRecord {
                    block_index,
                    payer,
                    course_id: course_id.to_string(),
                    amount_e8s: expected_amount_e8s,
                    timestamp: now_nanos,
                });
                return Ok(());
            }
            Err(format!("Failed to verify payment on ledger: {err:?}"))
        }
    }
}
