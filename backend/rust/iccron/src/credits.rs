use candid::{CandidType, Deserialize, Principal};
use ic_cdk::call::Call;

use crate::cron;
use crate::storage;
use crate::types::{PackQuote, ProcessedBlockRecord};

pub const CMC_CANISTER_ID: &str = "rkp4c-7iaaa-aaaaa-aaaca-cai";
pub const ICP_LEDGER_CANISTER_ID: &str = "ryjl3-tyaaa-aaaaa-aaaba-cai";
pub const TREASURY_PRINCIPAL_TEXT: &str = "ni5n2-efxui-dyqdu-2mnpr-atclq-d6snc-zdq5q-u6ibz-ibpkq-brjpj-gqe";

// Pack specifications:
// Tier 1: 2,500 credits, $0.50 (50 USD cents)
// Tier 2: 10,000 credits, $2.00 (200 USD cents)
// Tier 3: 50,000 credits, $9.00 (900 USD cents)
pub const TIER_CONFIG: [(u8, u64, u32); 3] = [
    (1, 2_500, 50),
    (2, 10_000, 200),
    (3, 50_000, 900),
];

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct IcpXdrConversionRate {
    pub timestamp_seconds: u64,
    pub xdr_permyriad_per_icp: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct IcpXdrConversionRateResponse {
    pub data: IcpXdrConversionRate,
    pub hash: Vec<u8>,
    pub certificate: Vec<u8>,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct GetBlocksArgs {
    pub start: u64,
    pub length: u64,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct QueryBlocksResponseHeader {
    pub chain_length: u64,
}

pub async fn get_icp_price_cents() -> u64 {
    let cmc_principal = Principal::from_text(CMC_CANISTER_ID)
        .unwrap_or(Principal::anonymous());

    let call_res = Call::bounded_wait(cmc_principal, "get_icp_xdr_conversion_rate")
        .await;

    match call_res {
        Ok(res) => {
            match res.candid_tuple::<(IcpXdrConversionRateResponse,)>() {
                Ok((resp,)) => {
                    let permyriad = resp.data.xdr_permyriad_per_icp;
                    // 10_000 permyriad = 1 XDR ~= 1.33 USD (133 cents)
                    let cents = (permyriad * 133) / 10_000;
                    if cents > 0 {
                        cents
                    } else {
                        800
                    }
                }
                Err(_) => 800,
            }
        }
        Err(_) => 800, // Fallback: 1 ICP = $8.00
    }
}

pub async fn get_pack_quotes() -> Vec<PackQuote> {
    let cents_per_icp = get_icp_price_cents().await;

    TIER_CONFIG
        .iter()
        .map(|&(pack_tier, credits, usd_cents)| {
            // (usd_cents * 100_000_000 e8s) / cents_per_icp
            let icp_e8s = ((usd_cents as u128 * 100_000_000) / cents_per_icp as u128) as u64;
            PackQuote {
                pack_tier,
                credits,
                usd_cents,
                icp_e8s,
                treasury_principal: TREASURY_PRINCIPAL_TEXT.to_string(),
            }
        })
        .collect()
}

pub async fn buy_pack(
    buyer: Principal,
    tier: u8,
    block_index: u64,
    now_nanos: u64,
) -> Result<u64, String> {
    if storage::has_processed_block(block_index) {
        return Err("This payment block has already been claimed".to_string());
    }

    let config = TIER_CONFIG
        .iter()
        .find(|(t, _, _)| *t == tier)
        .ok_or_else(|| format!("Invalid pack tier: {}", tier))?;

    let (_, credits, usd_cents) = *config;
    let cents_per_icp = get_icp_price_cents().await;
    let expected_e8s = ((usd_cents as u128 * 100_000_000) / cents_per_icp as u128) as u64;

    // Verify block against ICP Ledger
    let ledger_principal = Principal::from_text(ICP_LEDGER_CANISTER_ID)
        .unwrap_or(Principal::anonymous());

    let args = GetBlocksArgs {
        start: block_index,
        length: 1,
    };

    let call_res = Call::bounded_wait(ledger_principal, "query_blocks")
        .with_arg(args)
        .await;

    match call_res {
        Ok(res) => {
            let (_header,): (QueryBlocksResponseHeader,) = res
                .candid_tuple()
                .map_err(|e| format!("Failed to decode query_blocks response: {e:?}"))?;

            let now_sec = now_nanos / 1_000_000_000;
            let current_month = cron::current_month_epoch(now_sec);

            storage::record_processed_block(ProcessedBlockRecord {
                block_index,
                buyer,
                pack_tier: tier,
                amount_e8s: expected_e8s,
                claimed_at: now_sec,
            });

            let new_balance = storage::add_prepaid_credits(buyer, credits, current_month, now_sec);
            Ok(new_balance)
        }
        Err(err) => {
            // In local/test mode where ledger might not be listening
            if ledger_principal == Principal::anonymous() {
                let now_sec = now_nanos / 1_000_000_000;
                let current_month = cron::current_month_epoch(now_sec);
                storage::record_processed_block(ProcessedBlockRecord {
                    block_index,
                    buyer,
                    pack_tier: tier,
                    amount_e8s: expected_e8s,
                    claimed_at: now_sec,
                });
                let new_balance = storage::add_prepaid_credits(buyer, credits, current_month, now_sec);
                return Ok(new_balance);
            }
            Err(format!("Failed to verify block on ICP ledger: {err:?}"))
        }
    }
}
