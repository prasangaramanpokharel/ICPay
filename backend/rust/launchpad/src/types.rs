use candid::{CandidType, Nat, Principal};
use serde::{Deserialize, Serialize};

#[derive(CandidType, Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum LaunchpadStatus {
    Pending,
    Open,
    Committed,
    Aborted,
    Finalized,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct InitArgs {
    pub wallet_canister: Principal,
    pub treasury: Principal,
    pub fee_e8s: u64, // Default 1.99 ICP (199_000_000 e8s)
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct FinalizeResult {
    pub creator_net_e8s: u64,
    pub platform_fee_e8s: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CreateCampaignArgs {
    pub token_ledger: Principal,
    pub token_symbol: String,
    pub token_name: String,
    pub token_decimals: u8,
    pub total_tokens_allocated: Nat,
    pub min_icp_target_e8s: u64,      // Soft Cap in e8s
    pub max_icp_target_e8s: u64,      // Hard Cap in e8s
    pub min_participant_icp_e8s: u64, // e.g. 1 ICP
    pub max_participant_icp_e8s: u64, // Anti-whale cap, e.g. 50 ICP
    pub duration_seconds: u64,        // e.g. 7 * 86400
    pub dex_liquidity_percent: u8,    // e.g. 30% of raised ICP + paired tokens
    pub description: String,
    pub website: Option<String>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Campaign {
    pub id: u64,
    pub creator: Principal,
    pub token_ledger: Principal,
    pub token_symbol: String,
    pub token_name: String,
    pub token_decimals: u8,
    pub total_tokens_allocated: Nat,
    pub min_icp_target_e8s: u64,
    pub max_icp_target_e8s: u64,
    pub min_participant_icp_e8s: u64,
    pub max_participant_icp_e8s: u64,
    pub total_icp_raised_e8s: u64,
    pub participant_count: u64,
    pub start_timestamp: u64,
    pub end_timestamp: u64,
    pub dex_liquidity_percent: u8,
    pub description: String,
    pub website: Option<String>,
    pub status: LaunchpadStatus,
    pub tokens_deposited: bool,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CampaignPublic {
    pub id: u64,
    pub creator: Principal,
    pub token_ledger: Principal,
    pub token_symbol: String,
    pub token_name: String,
    pub token_decimals: u8,
    pub total_tokens_allocated: Nat,
    pub min_icp_target_e8s: u64,
    pub max_icp_target_e8s: u64,
    pub min_participant_icp_e8s: u64,
    pub max_participant_icp_e8s: u64,
    pub total_icp_raised_e8s: u64,
    pub participant_count: u64,
    pub start_timestamp: u64,
    pub end_timestamp: u64,
    pub dex_liquidity_percent: u8,
    pub description: String,
    pub website: Option<String>,
    pub status: LaunchpadStatus,
    pub tokens_deposited: bool,
}

impl From<Campaign> for CampaignPublic {
    fn from(c: Campaign) -> Self {
        Self {
            id: c.id,
            creator: c.creator,
            token_ledger: c.token_ledger,
            token_symbol: c.token_symbol,
            token_name: c.token_name,
            token_decimals: c.token_decimals,
            total_tokens_allocated: c.total_tokens_allocated,
            min_icp_target_e8s: c.min_icp_target_e8s,
            max_icp_target_e8s: c.max_icp_target_e8s,
            min_participant_icp_e8s: c.min_participant_icp_e8s,
            max_participant_icp_e8s: c.max_participant_icp_e8s,
            total_icp_raised_e8s: c.total_icp_raised_e8s,
            participant_count: c.participant_count,
            start_timestamp: c.start_timestamp,
            end_timestamp: c.end_timestamp,
            dex_liquidity_percent: c.dex_liquidity_percent,
            description: c.description,
            website: c.website,
            status: c.status,
            tokens_deposited: c.tokens_deposited,
        }
    }
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Commitment {
    pub campaign_id: u64,
    pub participant: Principal,
    pub amount_icp_e8s: u64,
    pub tokens_claimed: bool,
    pub refund_claimed: bool,
    pub timestamp: u64,
}

pub type ApiResult<T> = Result<T, String>;
