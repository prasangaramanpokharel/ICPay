import { IDL } from "@icp-sdk/core/candid"

export const launchpadIdl: IDL.InterfaceFactory = ({ IDL }) => {
  const LaunchpadStatus = IDL.Variant({
    Pending: IDL.Null,
    Open: IDL.Null,
    Committed: IDL.Null,
    Aborted: IDL.Null,
    Finalized: IDL.Null,
  })

  const CampaignPublic = IDL.Record({
    id: IDL.Nat64,
    creator: IDL.Principal,
    token_ledger: IDL.Principal,
    token_symbol: IDL.Text,
    token_name: IDL.Text,
    token_decimals: IDL.Nat8,
    total_tokens_allocated: IDL.Nat,
    min_icp_target_e8s: IDL.Nat64,
    max_icp_target_e8s: IDL.Nat64,
    min_participant_icp_e8s: IDL.Nat64,
    max_participant_icp_e8s: IDL.Nat64,
    total_icp_raised_e8s: IDL.Nat64,
    participant_count: IDL.Nat64,
    start_timestamp: IDL.Nat64,
    end_timestamp: IDL.Nat64,
    dex_liquidity_percent: IDL.Nat8,
    description: IDL.Text,
    website: IDL.Opt(IDL.Text),
    status: LaunchpadStatus,
    tokens_deposited: IDL.Bool,
  })

  const Commitment = IDL.Record({
    campaign_id: IDL.Nat64,
    participant: IDL.Principal,
    amount_icp_e8s: IDL.Nat64,
    tokens_claimed: IDL.Bool,
    refund_claimed: IDL.Bool,
    timestamp: IDL.Nat64,
  })

  const CreateCampaignArgs = IDL.Record({
    token_ledger: IDL.Principal,
    token_symbol: IDL.Text,
    token_name: IDL.Text,
    token_decimals: IDL.Nat8,
    total_tokens_allocated: IDL.Nat,
    min_icp_target_e8s: IDL.Nat64,
    max_icp_target_e8s: IDL.Nat64,
    min_participant_icp_e8s: IDL.Nat64,
    max_participant_icp_e8s: IDL.Nat64,
    duration_seconds: IDL.Nat64,
    dex_liquidity_percent: IDL.Nat8,
    description: IDL.Text,
    website: IDL.Opt(IDL.Text),
  })

  const FinalizeResult = IDL.Record({
    creator_net_e8s: IDL.Nat64,
    platform_fee_e8s: IDL.Nat64,
  })

  const ApiResultNat64 = IDL.Variant({ Ok: IDL.Nat64, Err: IDL.Text })
  const ApiResultUnit = IDL.Variant({ Ok: IDL.Null, Err: IDL.Text })
  const ApiResultNat = IDL.Variant({ Ok: IDL.Nat, Err: IDL.Text })
  const ApiResultFinalize = IDL.Variant({ Ok: FinalizeResult, Err: IDL.Text })

  return IDL.Service({
    create_campaign: IDL.Func([CreateCampaignArgs], [ApiResultNat64], []),
    mark_tokens_deposited: IDL.Func([IDL.Nat64], [ApiResultUnit], []),
    participate: IDL.Func([IDL.Nat64, IDL.Nat64], [ApiResultNat64], []),
    claim_tokens: IDL.Func([IDL.Nat64], [ApiResultNat], []),
    claim_refund: IDL.Func([IDL.Nat64], [ApiResultNat64], []),
    claim_creator_funds: IDL.Func([IDL.Nat64], [ApiResultFinalize], []),
    get_campaign: IDL.Func([IDL.Nat64], [IDL.Opt(CampaignPublic)], ["query"]),
    list_campaigns: IDL.Func(
      [IDL.Opt(LaunchpadStatus), IDL.Nat64, IDL.Nat64],
      [IDL.Vec(CampaignPublic)],
      ["query"]
    ),
    get_user_commitment: IDL.Func(
      [IDL.Nat64, IDL.Principal],
      [IDL.Opt(Commitment)],
      ["query"]
    ),
    health: IDL.Func([], [IDL.Text], ["query"]),
  })
}
