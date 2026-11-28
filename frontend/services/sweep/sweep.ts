import type { Identity } from "@icp-sdk/core/agent"
import { IcrcTransferError } from "@icp-sdk/canisters/ledger/icrc"
import { Principal } from "@icp-sdk/core/principal"
import type { Outcome } from "@/services/client"
import { parseAddress } from "@/lib/wallet/icpAddress"
import { icrcLedger } from "@/services/ledger/icrc"
import { custodialSubaccount, canMoveToCustody } from "@/services/tokens"

export type SweepResult = { blockIndex: bigint; amount: bigint }

type IcrcTarget = { owner: Principal; subaccount: [] | [Uint8Array] }

type TransferError = {
  BadFee?: { expected_fee: bigint }
  BadBurn?: { min_burn_amount: bigint }
  InsufficientFunds?: { balance: bigint }
  TooOld?: null
  CreatedInFuture?: { ledger_time: bigint }
  Duplicate?: { duplicate_of: bigint }
  TemporarilyUnavailable?: null
  GenericError?: { error_code: bigint; message: string }
}

function describe(err: TransferError): string {
  if (err.InsufficientFunds) return "Not enough balance to cover the amount and the fee."
  if (err.BadFee) return `The ledger expected a fee of ${err.BadFee.expected_fee}.`
  if (err.BadBurn) return `Below the minimum burn amount of ${err.BadBurn.min_burn_amount}.`
  if (err.TooOld) return "The request expired before the ledger saw it. Try again."
  if (err.CreatedInFuture) return "This device's clock is ahead of the ledger. Try again."
  if (err.TemporarilyUnavailable) return "The ledger is temporarily unavailable. Try again."
  if (err.GenericError) return err.GenericError.message
  return "The transfer was rejected."
}

export function parsePrincipalOrIcrc1(raw: string): IcrcTarget | null {
  const hit = parseAddress(raw)
  if (!hit) return null
  if (hit.kind === "principal") {
    return { owner: Principal.fromText(hit.principal), subaccount: [] }
  }
  if (hit.kind === "icrc1") {
    return { owner: Principal.fromText(hit.owner), subaccount: [hit.subaccount] }
  }
  return null
}

async function transferFromPrincipal(
  identity: Identity | undefined,
  ledgerId: string,
  to: IcrcTarget,
  amount: bigint
): Promise<Outcome<SweepResult>> {
  if (!identity) return { err: "Not authenticated" }
  if (amount <= 0n) return { err: "Nothing to move." }

  try {
    const ledger = await icrcLedger(identity, ledgerId)
    const blockIndex = await ledger.transfer({
      to,
      amount,
      created_at_time: BigInt(Date.now()) * 1_000_000n,
    })
    return { ok: { blockIndex, amount } }
  } catch (e) {
    if (e instanceof IcrcTransferError) {
      const err = e.errorType as TransferError
      if (err.Duplicate) {
        return { ok: { blockIndex: err.Duplicate.duplicate_of, amount } }
      }
      return { err: describe(err) }
    }
    console.error(e)
    return { err: "Could not reach the ledger. Nothing was sent." }
  }
}

export async function sweepToCustody(
  identity: Identity | undefined,
  ledgerId: string,
  custodian: Principal,
  amount: bigint
): Promise<Outcome<SweepResult>> {
  if (!identity) return { err: "Not authenticated" }
  if (amount <= 0n) return { err: "Nothing to move." }

  if (!(await canMoveToCustody(identity, ledgerId))) {
    return { err: "This token cannot be moved into ICPay." }
  }

  return transferFromPrincipal(
    identity,
    ledgerId,
    { owner: custodian, subaccount: [custodialSubaccount(identity.getPrincipal())] },
    amount
  )
}

export async function withdrawFromPrincipal(
  identity: Identity | undefined,
  ledgerId: string,
  destination: string,
  amount: bigint
): Promise<Outcome<SweepResult>> {
  if (!identity) return { err: "Not authenticated" }
  if (amount <= 0n) return { err: "Nothing to withdraw." }

  const target = parsePrincipalOrIcrc1(destination)
  if (!target) {
    return { err: "Enter a valid principal or ICRC-1 address." }
  }
  if (target.subaccount.length === 0 && target.owner.toText() === identity.getPrincipal().toText()) {
    return { err: "Choose a different destination address." }
  }

  return transferFromPrincipal(identity, ledgerId, target, amount)
}
