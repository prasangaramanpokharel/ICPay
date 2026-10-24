import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { call, type Outcome } from "@/services/client"
import { isHexAccountId } from "@/lib/wallet/utils"
import { ICP_LEDGER_ID } from "@/services/tokens"
import type { TransferResult } from "@/services/types"

export function withdraw(
  identity: Identity | undefined,
  amount: bigint,
  destination: string,
  ledgerId: string = ICP_LEDGER_ID
): Promise<Outcome<TransferResult>> {
  return call(identity, "Withdrawal failed", (actor) =>
    isHexAccountId(destination)
      ? actor.transferByAccountId(destination, amount, [])
      : actor.withdraw(ledgerId, amount, {
          owner: Principal.fromText(destination),
          subaccount: [],
        })
  )
}
