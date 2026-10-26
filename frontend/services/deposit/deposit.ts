import type { Identity } from "@icp-sdk/core/agent"
import { call, query, type Outcome } from "@/services/client"
import type { ICRC1Account, TransactionPublic } from "@/services/types"

export type DepositAddress = {
  address: ICRC1Account
  accountId: string
}

export function getDepositAddress(
  identity: Identity | undefined
): Promise<DepositAddress> {
  return query(identity, async (actor) => {
    const [address, accountId] = await Promise.all([
      actor.getDepositAddress(),
      actor.getDepositAccountIdentifier(),
    ])
    return { address, accountId }
  })
}

export function syncDeposits(
  identity: Identity | undefined,
  ledgerId: string
): Promise<Outcome<TransactionPublic>> {
  return call(identity, "Failed to sync deposits", (actor) => actor.syncDeposits(ledgerId))
}
