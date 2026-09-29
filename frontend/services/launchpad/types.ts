import type { Principal } from "@icp-sdk/core/principal"

export type LaunchpadStatus =
  | "Pending"
  | "Open"
  | "Committed"
  | "Aborted"
  | "Finalized"

export interface CandidLaunchpadStatus {
  Pending?: null
  Open?: null
  Committed?: null
  Aborted?: null
  Finalized?: null
}

export interface CandidCampaignPublic {
  id: bigint
  creator: Principal
  token_ledger: Principal
  token_symbol: string
  token_name: string
  token_decimals: number
  total_tokens_allocated: bigint
  min_icp_target_e8s: bigint
  max_icp_target_e8s: bigint
  min_participant_icp_e8s: bigint
  max_participant_icp_e8s: bigint
  total_icp_raised_e8s: bigint
  participant_count: bigint
  start_timestamp: bigint
  end_timestamp: bigint
  dex_liquidity_percent: number
  description: string
  website: [] | [string]
  status: CandidLaunchpadStatus
  tokens_deposited: boolean
}

export interface CandidCommitment {
  campaign_id: bigint
  participant: Principal
  amount_icp_e8s: bigint
  tokens_claimed: boolean
  refund_claimed: boolean
  timestamp: bigint
}

export interface CandidCreateCampaignArgs {
  token_ledger: Principal
  token_symbol: string
  token_name: string
  token_decimals: number
  total_tokens_allocated: bigint
  min_icp_target_e8s: bigint
  max_icp_target_e8s: bigint
  min_participant_icp_e8s: bigint
  max_participant_icp_e8s: bigint
  duration_seconds: bigint
  dex_liquidity_percent: number
  description: string
  website: [] | [string]
}

export interface CandidFinalizeResult {
  creator_net_e8s: bigint
  platform_fee_e8s: bigint
}

export type CandidApiResultNat64 = { Ok: bigint } | { Err: string }
export type CandidApiResultUnit = { Ok: null } | { Err: string }
export type CandidApiResultNat = { Ok: bigint } | { Err: string }
export type CandidApiResultFinalize = { Ok: CandidFinalizeResult } | { Err: string }

export interface LaunchpadActor {
  create_campaign: (args: CandidCreateCampaignArgs) => Promise<CandidApiResultNat64>
  mark_tokens_deposited: (campaignId: bigint) => Promise<CandidApiResultUnit>
  participate: (campaignId: bigint, amountIcpE8s: bigint) => Promise<CandidApiResultNat64>
  claim_tokens: (campaignId: bigint) => Promise<CandidApiResultNat>
  claim_refund: (campaignId: bigint) => Promise<CandidApiResultNat64>
  claim_creator_funds: (campaignId: bigint) => Promise<CandidApiResultFinalize>
  get_campaign: (campaignId: bigint) => Promise<[] | [CandidCampaignPublic]>
  list_campaigns: (
    status: [] | [CandidLaunchpadStatus],
    offset: bigint,
    limit: bigint
  ) => Promise<CandidCampaignPublic[]>
  get_user_commitment: (
    campaignId: bigint,
    participant: Principal
  ) => Promise<[] | [CandidCommitment]>
  health: () => Promise<string>
}

export interface LaunchpadCampaign {
  id: string
  creator: string
  tokenLedger: string
  tokenSymbol: string
  tokenName: string
  tokenDecimals: number
  totalTokensAllocated: string
  minIcpTarget: number
  maxIcpTarget: number
  minParticipantIcp: number
  maxParticipantIcp: number
  totalIcpRaised: number
  participantCount: number
  startTimestamp: number
  endTimestamp: number
  dexLiquidityPercent: number
  description: string
  website?: string
  status: LaunchpadStatus
  tokensDeposited: boolean
  progressPercent: number
  isLive: boolean
  isSuccess: boolean
  isAborted: boolean
}

export interface UserCommitment {
  campaignId: string
  participant: string
  amountIcp: number
  tokensClaimed: boolean
  refundClaimed: boolean
  timestamp: number
}
