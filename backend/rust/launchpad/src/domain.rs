use candid::Nat;
use crate::types::{Campaign, CreateCampaignArgs, LaunchpadStatus};

pub const MIN_DURATION_SECS: u64 = 86_400; // 1 day
pub const MAX_DURATION_SECS: u64 = 30 * 86_400; // 30 days

pub fn validate_campaign_args(args: &CreateCampaignArgs) -> Result<(), String> {
    if args.min_icp_target_e8s == 0 {
        return Err("Soft cap must be greater than 0".to_string());
    }
    if args.max_icp_target_e8s < args.min_icp_target_e8s {
        return Err("Hard cap must be greater than or equal to soft cap".to_string());
    }
    if args.min_participant_icp_e8s == 0 {
        return Err("Minimum participant commitment must be greater than 0".to_string());
    }
    if args.max_participant_icp_e8s < args.min_participant_icp_e8s {
        return Err("Max participant commitment must be >= minimum".to_string());
    }
    if args.duration_seconds < MIN_DURATION_SECS || args.duration_seconds > MAX_DURATION_SECS {
        return Err(format!(
            "Duration must be between {} and {} seconds",
            MIN_DURATION_SECS, MAX_DURATION_SECS
        ));
    }
    if args.dex_liquidity_percent > 80 {
        return Err("DEX liquidity percent cannot exceed 80%".to_string());
    }
    Ok(())
}

pub fn update_campaign_status(campaign: &mut Campaign, now_secs: u64) {
    if campaign.status == LaunchpadStatus::Open {
        // If hard cap reached, it is committed
        if campaign.total_icp_raised_e8s >= campaign.max_icp_target_e8s {
            campaign.status = LaunchpadStatus::Committed;
        } else if now_secs >= campaign.end_timestamp {
            // Timer expired: check if soft cap was met
            if campaign.total_icp_raised_e8s >= campaign.min_icp_target_e8s {
                campaign.status = LaunchpadStatus::Committed;
            } else {
                campaign.status = LaunchpadStatus::Aborted;
            }
        }
    }
}

pub fn calculate_token_share(
    user_icp_e8s: u64,
    total_icp_e8s: u64,
    total_tokens: &Nat,
) -> Nat {
    if total_icp_e8s == 0 {
        return Nat::from(0u64);
    }
    // user_share = (total_tokens * user_icp) / total_icp
    let user_icp_nat = Nat::from(user_icp_e8s);
    let total_icp_nat = Nat::from(total_icp_e8s);
    let numerator = total_tokens.clone() * user_icp_nat;
    numerator / total_icp_nat
}

pub const SUCCESS_COMMISSION_BPS: u64 = 250; // 2.5% (250 basis points)
pub const BPS_DENOMINATOR: u64 = 10_000;

/// Calculates (platform_commission_e8s, creator_net_e8s) from raised ICP on successful sale
pub fn calculate_platform_cut(total_raised_e8s: u64) -> (u64, u64) {
    let platform_fee = (total_raised_e8s * SUCCESS_COMMISSION_BPS) / BPS_DENOMINATOR;
    let creator_share = total_raised_e8s.saturating_sub(platform_fee);
    (platform_fee, creator_share)
}

#[cfg(test)]
mod tests {
    use super::*;
    use candid::Principal;

    fn sample_args() -> CreateCampaignArgs {
        CreateCampaignArgs {
            token_ledger: Principal::anonymous(),
            token_symbol: "TEST".to_string(),
            token_name: "Test Token".to_string(),
            token_decimals: 8,
            total_tokens_allocated: Nat::from(1_000_000_000_000u64),
            min_icp_target_e8s: 5_000_000_000,   // 50 ICP
            max_icp_target_e8s: 20_000_000_000,  // 200 ICP
            min_participant_icp_e8s: 100_000_000,// 1 ICP
            max_participant_icp_e8s: 5_000_000_000,// 50 ICP
            duration_seconds: 7 * 86_400,
            dex_liquidity_percent: 30,
            description: "Test campaign".to_string(),
            website: None,
        }
    }

    #[test]
    fn test_validation_rules() {
        let mut args = sample_args();
        assert!(validate_campaign_args(&args).is_ok());

        // Zero soft cap
        args.min_icp_target_e8s = 0;
        assert!(validate_campaign_args(&args).is_err());

        // Hard cap < soft cap
        let mut args2 = sample_args();
        args2.max_icp_target_e8s = 1_000_000_000;
        assert!(validate_campaign_args(&args2).is_err());

        // Duration too short
        let mut args3 = sample_args();
        args3.duration_seconds = 3600;
        assert!(validate_campaign_args(&args3).is_err());
    }

    #[test]
    fn test_lifecycle_transitions() {
        let mut c = Campaign {
            id: 1,
            creator: Principal::anonymous(),
            token_ledger: Principal::anonymous(),
            token_symbol: "T".into(),
            token_name: "Test".into(),
            token_decimals: 8,
            total_tokens_allocated: Nat::from(100_000u64),
            min_icp_target_e8s: 50,
            max_icp_target_e8s: 200,
            min_participant_icp_e8s: 1,
            max_participant_icp_e8s: 50,
            total_icp_raised_e8s: 50,
            participant_count: 1,
            start_timestamp: 1000,
            end_timestamp: 2000,
            dex_liquidity_percent: 20,
            description: "".into(),
            website: None,
            status: LaunchpadStatus::Open,
            tokens_deposited: true,
        };

        // Mid-sale: still Open
        update_campaign_status(&mut c, 1500);
        assert_eq!(c.status, LaunchpadStatus::Open);

        // Reached hard cap: Committed
        c.total_icp_raised_e8s = 200;
        update_campaign_status(&mut c, 1500);
        assert_eq!(c.status, LaunchpadStatus::Committed);

        // Expiry when soft cap not met: Aborted
        c.status = LaunchpadStatus::Open;
        c.total_icp_raised_e8s = 30; // below 50
        update_campaign_status(&mut c, 2500);
        assert_eq!(c.status, LaunchpadStatus::Aborted);
    }

    #[test]
    fn test_token_share_calculation() {
        let total_tokens = Nat::from(1_000_000u64);
        let user_icp = 50u64;
        let total_icp = 200u64;

        let share = calculate_token_share(user_icp, total_icp, &total_tokens);
        // 50/200 = 25% of 1,000,000 = 250,000
        assert_eq!(share, Nat::from(250_000u64));
    }

    #[test]
    fn test_platform_commission() {
        // 100 ICP raised = 10,000,000,000 e8s
        let total_raised_e8s = 10_000_000_000;
        let (platform_cut, creator_net) = calculate_platform_cut(total_raised_e8s);
        // 2.5% of 100 ICP = 2.5 ICP = 250,000,000 e8s
        assert_eq!(platform_cut, 250_000_000);
        // Creator gets 97.5 ICP = 9,750,000,000 e8s
        assert_eq!(creator_net, 9_750_000_000);
        assert_eq!(platform_cut + creator_net, total_raised_e8s);
    }
}
