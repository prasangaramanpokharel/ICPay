import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import {
  AccountIdentifier,
  IcpIndexCanister,
  SubAccount,
} from "@icp-sdk/canisters/ledger/icp"
import { createAgent } from "@/services/icp"
import { ICP_INDEX_CANISTER_ID } from "@/lib/ic/constants"

export type AccountStats = {
  balance: bigint
  txCount: number
  firstBlock?: bigint
  lastBlock?: bigint
  lastActivity?: bigint
}

const PAGE = 100n

function resolveAccountId(owner: string, subaccount?: Uint8Array) {
  return AccountIdentifier.fromPrincipal({
    principal: Principal.fromText(owner),
    ...(subaccount ? { subAccount: SubAccount.fromBytes(subaccount) } : {}),
  })
}

export async function fetchAccountStats(
  owner: string,
  subaccount: Uint8Array | undefined,
  identity?: Identity
): Promise<AccountStats> {
  const agent = await createAgent(identity)
  const index = IcpIndexCanister.create({
    agent,
    canisterId: Principal.fromText(ICP_INDEX_CANISTER_ID),
  })
  const accountIdentifier = resolveAccountId(owner, subaccount)

  try {
    const page = await index.getTransactions({
      accountIdentifier,
      maxResults: PAGE,
      certified: false,
    })

    const oldest = page.oldest_tx_id[0]
    const newest = page.transactions[0]?.id

    return {
      balance: page.balance,
      txCount: page.transactions.length,
      firstBlock: oldest,
      lastBlock: newest,
    }
  } catch {
    const balance = await index.accountBalance({
      accountIdentifier,
      certified: false,
    })
    return { balance, txCount: 0 }
  }
}
