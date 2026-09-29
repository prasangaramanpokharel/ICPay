use candid::Principal;
use ic_cdk::{init, post_upgrade, query, update};

mod domain;
mod storage;
mod types;

use domain::{
    calculate_platform_cut, calculate_token_share, update_campaign_status, validate_campaign_args,
};
use storage::{get_config, set_config, CanisterConfig};
use types::{
    ApiResult, Campaign, CampaignPublic, Commitment, CreateCampaignArgs, FinalizeResult, InitArgs,
    LaunchpadStatus,
};

#[init]
fn init(args: InitArgs) {
    set_config(CanisterConfig {
        wallet_canister: args.wallet_canister,
        treasury: args.treasury,
        fee_e8s: args.fee_e8s,
    });
}

#[post_upgrade]
fn post_upgrade(args: InitArgs) {
    set_config(CanisterConfig {
        wallet_canister: args.wallet_canister,
        treasury: args.treasury,
        fee_e8s: args.fee_e8s,
    });
}

fn now_seconds() -> u64 {
    ic_cdk::api::time() / 1_000_000_000
}

#[query]
fn health() -> String {
    let cfg = get_config();
    format!(
        "icpay_launchpad: ok; fee_e8s={}; treasury={}",
        cfg.fee_e8s, cfg.treasury
    )
}

#[update]
fn create_campaign(args: CreateCampaignArgs) -> ApiResult<u64> {
    let caller = ic_cdk::api::msg_caller();
    if caller == Principal::anonymous() {
        return Err("Anonymous principal not allowed".to_string());
    }

    validate_campaign_args(&args)?;

    let now = now_seconds();
    let id = storage::next_campaign_id();

    let campaign = Campaign {
        id,
        creator: caller,
        token_ledger: args.token_ledger,
        token_symbol: args.token_symbol,
        token_name: args.token_name,
        token_decimals: args.token_decimals,
        total_tokens_allocated: args.total_tokens_allocated,
        min_icp_target_e8s: args.min_icp_target_e8s,
        max_icp_target_e8s: args.max_icp_target_e8s,
        min_participant_icp_e8s: args.min_participant_icp_e8s,
        max_participant_icp_e8s: args.max_participant_icp_e8s,
        total_icp_raised_e8s: 0,
        participant_count: 0,
        start_timestamp: now,
        end_timestamp: now + args.duration_seconds,
        dex_liquidity_percent: args.dex_liquidity_percent,
        description: args.description,
        website: args.website,
        status: LaunchpadStatus::Pending,
        tokens_deposited: false,
    };

    storage::save_campaign(campaign);
    Ok(id)
}

#[update]
fn mark_tokens_deposited(campaign_id: u64) -> ApiResult<()> {
    let caller = ic_cdk::api::msg_caller();
    let mut campaign = storage::get_campaign(campaign_id)
        .ok_or_else(|| "Campaign not found".to_string())?;

    if campaign.creator != caller {
        return Err("Only creator can mark tokens as deposited".to_string());
    }
    if campaign.status != LaunchpadStatus::Pending {
        return Err("Campaign is not in Pending status".to_string());
    }

    campaign.tokens_deposited = true;
    campaign.status = LaunchpadStatus::Open;
    storage::save_campaign(campaign);
    Ok(())
}

#[update]
fn participate(campaign_id: u64, amount_icp_e8s: u64) -> ApiResult<u64> {
    let caller = ic_cdk::api::msg_caller();
    if caller == Principal::anonymous() {
        return Err("Anonymous principal not allowed".to_string());
    }

    let mut campaign = storage::get_campaign(campaign_id)
        .ok_or_else(|| "Campaign not found".to_string())?;

    let now = now_seconds();
    update_campaign_status(&mut campaign, now);

    if campaign.status != LaunchpadStatus::Open {
        storage::save_campaign(campaign);
        return Err("Campaign is not open for participation".to_string());
    }

    if amount_icp_e8s < campaign.min_participant_icp_e8s {
        return Err(format!(
            "Amount below minimum commitment of {} e8s",
            campaign.min_participant_icp_e8s
        ));
    }

    let mut commitment = storage::get_commitment(campaign_id, caller).unwrap_or(Commitment {
        campaign_id,
        participant: caller,
        amount_icp_e8s: 0,
        tokens_claimed: false,
        refund_claimed: false,
        timestamp: now,
    });

    let new_user_total = commitment.amount_icp_e8s + amount_icp_e8s;
    if new_user_total > campaign.max_participant_icp_e8s {
        return Err(format!(
            "Amount exceeds maximum allowed commitment of {} e8s per user",
            campaign.max_participant_icp_e8s
        ));
    }

    let new_raised = campaign.total_icp_raised_e8s + amount_icp_e8s;
    if new_raised > campaign.max_icp_target_e8s {
        return Err("Amount exceeds hard cap".to_string());
    }

    if commitment.amount_icp_e8s == 0 {
        campaign.participant_count += 1;
    }

    commitment.amount_icp_e8s = new_user_total;
    commitment.timestamp = now;
    campaign.total_icp_raised_e8s = new_raised;

    update_campaign_status(&mut campaign, now);

    storage::save_commitment(commitment);
    storage::save_campaign(campaign);

    Ok(new_raised)
}

#[update]
fn claim_tokens(campaign_id: u64) -> ApiResult<candid::Nat> {
    let caller = ic_cdk::api::msg_caller();
    let mut campaign = storage::get_campaign(campaign_id)
        .ok_or_else(|| "Campaign not found".to_string())?;

    let now = now_seconds();
    update_campaign_status(&mut campaign, now);

    if campaign.status != LaunchpadStatus::Committed && campaign.status != LaunchpadStatus::Finalized {
        storage::save_campaign(campaign);
        return Err("Campaign is not successfully committed".to_string());
    }

    let mut commitment = storage::get_commitment(campaign_id, caller)
        .ok_or_else(|| "No commitment found for caller".to_string())?;

    if commitment.tokens_claimed {
        return Err("Tokens already claimed".to_string());
    }

    let user_tokens = calculate_token_share(
        commitment.amount_icp_e8s,
        campaign.total_icp_raised_e8s,
        &campaign.total_tokens_allocated,
    );

    commitment.tokens_claimed = true;
    storage::save_commitment(commitment);

    Ok(user_tokens)
}

#[update]
fn claim_refund(campaign_id: u64) -> ApiResult<u64> {
    let caller = ic_cdk::api::msg_caller();
    let mut campaign = storage::get_campaign(campaign_id)
        .ok_or_else(|| "Campaign not found".to_string())?;

    let now = now_seconds();
    update_campaign_status(&mut campaign, now);

    if campaign.status != LaunchpadStatus::Aborted {
        storage::save_campaign(campaign);
        return Err("Campaign is not aborted; refund not available".to_string());
    }

    let mut commitment = storage::get_commitment(campaign_id, caller)
        .ok_or_else(|| "No commitment found for caller".to_string())?;

    if commitment.refund_claimed {
        return Err("Refund already claimed".to_string());
    }

    let refund_amount = commitment.amount_icp_e8s;
    commitment.refund_claimed = true;
    storage::save_commitment(commitment);

    Ok(refund_amount)
}

#[update]
fn claim_creator_funds(campaign_id: u64) -> Result<FinalizeResult, String> {
    let caller = ic_cdk::api::msg_caller();
    let mut campaign = storage::get_campaign(campaign_id)
        .ok_or_else(|| "Campaign not found".to_string())?;

    if caller != campaign.creator {
        return Err("Only the campaign creator can claim raised funds".to_string());
    }

    let now = now_seconds();
    update_campaign_status(&mut campaign, now);

    if campaign.status != LaunchpadStatus::Committed {
        storage::save_campaign(campaign);
        return Err("Campaign is not successfully committed or already finalized".to_string());
    }

    let (platform_fee_e8s, creator_net_e8s) = calculate_platform_cut(campaign.total_icp_raised_e8s);
    campaign.status = LaunchpadStatus::Finalized;
    storage::save_campaign(campaign);

    Ok(FinalizeResult {
        creator_net_e8s,
        platform_fee_e8s,
    })
}

#[query]
fn get_campaign(id: u64) -> Option<CampaignPublic> {
    let mut camp = storage::get_campaign(id)?;
    update_campaign_status(&mut camp, now_seconds());
    Some(camp.into())
}

#[query]
fn list_campaigns(
    status_filter: Option<LaunchpadStatus>,
    limit: u64,
    offset: u64,
) -> Vec<CampaignPublic> {
    let limit = (limit as usize).min(100);
    let offset = offset as usize;
    let now = now_seconds();

    storage::list_campaigns(limit + offset, 0)
        .into_iter()
        .map(|mut c| {
            update_campaign_status(&mut c, now);
            c
        })
        .filter(|c| match status_filter {
            Some(st) => c.status == st,
            None => true,
        })
        .skip(offset)
        .take(limit)
        .map(CampaignPublic::from)
        .collect()
}

#[query]
fn get_user_commitment(campaign_id: u64, user: Principal) -> Option<Commitment> {
    storage::get_commitment(campaign_id, user)
}

ic_cdk::export_candid!();
