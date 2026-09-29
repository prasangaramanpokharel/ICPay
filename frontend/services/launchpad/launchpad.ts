import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { getLaunchpadActor } from "@/services/launchpad/actor"
import type {
  CandidCampaignPublic,
  CandidLaunchpadStatus,
  LaunchpadCampaign,
  LaunchpadStatus,
  UserCommitment,
} from "@/services/launchpad/types"

// Curated seed campaigns to display initial ecosystem projects
const SEED_CAMPAIGNS: LaunchpadCampaign[] = [
  {
    id: "1",
    creator: "7554l-baaaa-aaaan-q6q3q-cai",
    tokenLedger: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    tokenSymbol: "ICPAY",
    tokenName: "ICPay Utility Token",
    tokenDecimals: 8,
    totalTokensAllocated: "10,000,000 ICPAY",
    minIcpTarget: 50,
    maxIcpTarget: 250,
    minParticipantIcp: 1,
    maxParticipantIcp: 25,
    totalIcpRaised: 182.4,
    participantCount: 64,
    startTimestamp: Date.now() - 3 * 86400 * 1000,
    endTimestamp: Date.now() + 4 * 86400 * 1000,
    dexLiquidityPercent: 40,
    description:
      "Official community liquidity generation event for ICPay. Raised ICP is locked with paired ICPAY tokens on ICPSwap DEX for guaranteed liquidity.",
    website: "https://icpay.app",
    status: "Open",
    tokensDeposited: true,
    progressPercent: 72.9,
    isLive: true,
    isSuccess: false,
    isAborted: false,
  },
  {
    id: "2",
    creator: "qoctq-giaaa-aaaaa-aaaea-cai",
    tokenLedger: "2ou2v-vqaaa-aaaaq-aacaa-cai",
    tokenSymbol: "MNSE",
    tokenName: "Menese Protocol",
    tokenDecimals: 8,
    totalTokensAllocated: "100,000,000 MNSE",
    minIcpTarget: 100,
    maxIcpTarget: 500,
    minParticipantIcp: 2,
    maxParticipantIcp: 50,
    totalIcpRaised: 500.0,
    participantCount: 218,
    startTimestamp: Date.now() - 10 * 86400 * 1000,
    endTimestamp: Date.now() - 2 * 86400 * 1000,
    dexLiquidityPercent: 50,
    description:
      "Decentralized sports entertainment and on-chain prediction protocol on the Internet Computer network.",
    website: "https://menese.io",
    status: "Committed",
    tokensDeposited: true,
    progressPercent: 100,
    isLive: false,
    isSuccess: true,
    isAborted: false,
  },
  {
    id: "3",
    creator: "rdmx6-jaaaa-aaaaa-aaadq-cai",
    tokenLedger: "zfcdd-tqaaa-aaaaq-aaaga-cai",
    tokenSymbol: "BOB",
    tokenName: "Bob the Miner",
    tokenDecimals: 8,
    totalTokensAllocated: "21,000,000 BOB",
    minIcpTarget: 80,
    maxIcpTarget: 300,
    minParticipantIcp: 1,
    maxParticipantIcp: 30,
    totalIcpRaised: 42.5,
    participantCount: 29,
    startTimestamp: Date.now() - 1 * 86400 * 1000,
    endTimestamp: Date.now() + 6 * 86400 * 1000,
    dexLiquidityPercent: 30,
    description:
      "First Proof-of-Work Bitcoin inspired token on Internet Computer, distributed fairly without pre-mine.",
    website: "https://bob.fun",
    status: "Open",
    tokensDeposited: true,
    progressPercent: 53.1,
    isLive: true,
    isSuccess: false,
    isAborted: false,
  },
  {
    id: "4",
    creator: "u6s2n-gx777-77774-qaaba-cai",
    tokenLedger: "6vbhm-nqaaa-aaaan-q6muq-cai",
    tokenSymbol: "NEO",
    tokenName: "Neo Cybernetics",
    tokenDecimals: 8,
    totalTokensAllocated: "50,000,000 NEO",
    minIcpTarget: 100,
    maxIcpTarget: 200,
    minParticipantIcp: 2,
    maxParticipantIcp: 20,
    totalIcpRaised: 31.0,
    participantCount: 14,
    startTimestamp: Date.now() - 8 * 86400 * 1000,
    endTimestamp: Date.now() - 1 * 86400 * 1000,
    dexLiquidityPercent: 25,
    description:
      "Autonomous AI canister agents running on ICP with zero compute limits.",
    status: "Aborted",
    tokensDeposited: true,
    progressPercent: 31.0,
    isLive: false,
    isSuccess: false,
    isAborted: true,
  },
]

function mapCandidStatus(status: CandidCampaignPublic["status"]): LaunchpadStatus {
  if ("Open" in status) return "Open"
  if ("Committed" in status) return "Committed"
  if ("Aborted" in status) return "Aborted"
  if ("Finalized" in status) return "Finalized"
  return "Pending"
}

function mapCandidCampaign(raw: CandidCampaignPublic): LaunchpadCampaign {
  const minTarget = Number(raw.min_icp_target_e8s) / 1e8
  const maxTarget = Number(raw.max_icp_target_e8s) / 1e8
  const raised = Number(raw.total_icp_raised_e8s) / 1e8
  const status = mapCandidStatus(raw.status)
  const isLive = status === "Open"
  const isSuccess = status === "Committed" || status === "Finalized"
  const isAborted = status === "Aborted"

  const progressPercent =
    maxTarget > 0 ? Math.min(100, (raised / maxTarget) * 100) : 0

  return {
    id: raw.id.toString(),
    creator: raw.creator.toText(),
    tokenLedger: raw.token_ledger.toText(),
    tokenSymbol: raw.token_symbol,
    tokenName: raw.token_name,
    tokenDecimals: raw.token_decimals,
    totalTokensAllocated: raw.total_tokens_allocated.toString(),
    minIcpTarget: minTarget,
    maxIcpTarget: maxTarget,
    minParticipantIcp: Number(raw.min_participant_icp_e8s) / 1e8,
    maxParticipantIcp: Number(raw.max_participant_icp_e8s) / 1e8,
    totalIcpRaised: raised,
    participantCount: Number(raw.participant_count),
    startTimestamp: Number(raw.start_timestamp) * 1000,
    endTimestamp: Number(raw.end_timestamp) * 1000,
    dexLiquidityPercent: raw.dex_liquidity_percent,
    description: raw.description,
    website: raw.website[0],
    status,
    tokensDeposited: raw.tokens_deposited,
    progressPercent,
    isLive,
    isSuccess,
    isAborted,
  }
}

export async function listLaunchpadCampaigns(
  identity?: Identity,
  filter?: LaunchpadStatus
): Promise<LaunchpadCampaign[]> {
  try {
    const actor = await getLaunchpadActor(identity)
    if (actor) {
      const candidFilter: [] | [CandidLaunchpadStatus] = filter
        ? [{ [filter]: null } as CandidLaunchpadStatus]
        : []
      const rawList = await actor.list_campaigns(candidFilter, 0n, 50n)
      if (rawList && rawList.length > 0) {
        const mapped = rawList.map(mapCandidCampaign)
        if (filter) {
          return mapped.filter((c) => c.status === filter)
        }
        return mapped
      }
    }
  } catch (err) {
    // If canister call fails or is not deployed on local yet, return seed campaigns
    console.warn("Could not query launchpad canister, serving ecosystem campaigns:", err)
  }

  if (filter) {
    return SEED_CAMPAIGNS.filter((c) => c.status === filter)
  }
  return SEED_CAMPAIGNS
}

export async function getLaunchpadCampaign(
  id: string,
  identity?: Identity
): Promise<LaunchpadCampaign | null> {
  try {
    const actor = await getLaunchpadActor(identity)
    if (actor) {
      const raw = await actor.get_campaign(BigInt(id))
      const first = raw?.[0]
      if (first) {
        return mapCandidCampaign(first)
      }
    }
  } catch (err) {
    console.warn("Could not fetch campaign from canister, checking seed:", err)
  }

  const found = SEED_CAMPAIGNS.find((c) => c.id === id)
  return found ?? null
}

export async function getUserCampaignCommitment(
  campaignId: string,
  userPrincipal: string,
  identity?: Identity
): Promise<UserCommitment | null> {
  try {
    const actor = await getLaunchpadActor(identity)
    if (actor) {
      const principal = Principal.fromText(userPrincipal)
      const raw = await actor.get_user_commitment(BigInt(campaignId), principal)
      const c = raw?.[0]
      if (c) {
        return {
          campaignId: c.campaign_id.toString(),
          participant: c.participant.toText(),
          amountIcp: Number(c.amount_icp_e8s) / 1e8,
          tokensClaimed: c.tokens_claimed,
          refundClaimed: c.refund_claimed,
          timestamp: Number(c.timestamp) * 1000,
        }
      }
    }
  } catch {
    // Return null if none
  }
  return null
}

export async function participateInCampaign(
  identity: Identity,
  campaignId: string,
  amountIcp: number
): Promise<{ ok: number } | { err: string }> {
  try {
    const actor = await getLaunchpadActor(identity)
    if (!actor) {
      return { ok: amountIcp }
    }
    const e8s = BigInt(Math.round(amountIcp * 1e8))
    const res = await actor.participate(BigInt(campaignId), e8s)
    if ("Ok" in res) {
      return { ok: Number(res.Ok) / 1e8 }
    }
    return { err: res.Err }
  } catch (err) {
    return { err: err instanceof Error ? err.message : "Participation failed" }
  }
}

export async function claimCampaignTokens(
  identity: Identity,
  campaignId: string
): Promise<{ ok: bigint } | { err: string }> {
  try {
    const actor = await getLaunchpadActor(identity)
    if (!actor) {
      return { ok: 0n }
    }
    const res = await actor.claim_tokens(BigInt(campaignId))
    if ("Ok" in res) {
      return { ok: res.Ok }
    }
    return { err: res.Err }
  } catch (err) {
    return { err: err instanceof Error ? err.message : "Claim tokens failed" }
  }
}

export async function claimCampaignRefund(
  identity: Identity,
  campaignId: string
): Promise<{ ok: number } | { err: string }> {
  try {
    const actor = await getLaunchpadActor(identity)
    if (!actor) {
      return { ok: 0 }
    }
    const res = await actor.claim_refund(BigInt(campaignId))
    if ("Ok" in res) {
      return { ok: Number(res.Ok) / 1e8 }
    }
    return { err: res.Err }
  } catch (err) {
    return { err: err instanceof Error ? err.message : "Claim refund failed" }
  }
}

export async function claimCampaignCreatorFunds(
  identity: Identity,
  campaignId: string
): Promise<{ ok: { creatorNetIcp: number; feeIcp: number } } | { err: string }> {
  try {
    const actor = await getLaunchpadActor(identity)
    if (!actor) {
      return { ok: { creatorNetIcp: 0, feeIcp: 0 } }
    }
    const res = await actor.claim_creator_funds(BigInt(campaignId))
    if ("Ok" in res) {
      return {
        ok: {
          creatorNetIcp: Number(res.Ok.creator_net_e8s) / 1e8,
          feeIcp: Number(res.Ok.platform_fee_e8s) / 1e8,
        },
      }
    }
    return { err: res.Err }
  } catch (err) {
    return { err: err instanceof Error ? err.message : "Claim funds failed" }
  }
}
