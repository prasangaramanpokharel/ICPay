import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { call, optional, type Outcome } from "@/services/client"
import { isHexAccountId } from "@/lib/wallet/utils"
import { ICP_LEDGER_ID } from "@/services/tokens"
import type { TransferResult } from "@/services/types"

export type TransferMode = "username" | "principal" | "account"

export function transfer(
  identity: Identity | undefined,
  ledgerId: string,
  mode: TransferMode,
  to: string,
  amount: bigint,
  memo?: string,
  subaccount?: Uint8Array
): Promise<Outcome<TransferResult>> {
  return call(identity, "Transfer failed", (actor) => {
    const arg = optional(memo)
    if (isHexAccountId(to)) return actor.transferByAccountId(to, amount, arg)
    if (subaccount) {
      return actor.transferByAccount(
        ledgerId,
        { owner: Principal.fromText(to), subaccount: [subaccount] },
        amount,
        arg
      )
    }
    switch (mode) {
      case "username":
        return actor.transferByUsername(ledgerId, to, amount, arg)
      case "principal":
        return actor.transferByPrincipal(ledgerId, Principal.fromText(to), amount, arg)
      case "account":
        return actor.transferByAccount(
          ledgerId,
          { owner: Principal.fromText(to), subaccount: [] },
          amount,
          arg
        )
    }
  })
}

export function tip(
  identity: Identity | undefined,
  username: string,
  amount: bigint,
  memo?: string,
  ledgerId: string = ICP_LEDGER_ID
): Promise<Outcome<TransferResult>> {
  return call(identity, "Tip failed", (actor) =>
    actor.transferByUsername(ledgerId, username, amount, optional(memo))
  )
}
