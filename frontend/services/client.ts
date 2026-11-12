import type { Identity } from "@icp-sdk/core/agent"
import { getWalletActor, type WalletActor } from "@/services/wallet"

export type Outcome<T> = { ok: T } | { err: string }

export const optional = (value?: string): [] | [string] => (value ? [value] : [])

export async function call<T>(
  identity: Identity | undefined,
  fallback: string,
  fn: (actor: WalletActor) => Promise<Outcome<T>>
): Promise<Outcome<T>> {
  if (!identity) return { err: "Not authenticated" }
  try {
    return await fn(await getWalletActor(identity))
  } catch (e) {
    console.error(e)
    const msg = e instanceof Error ? e.message : String(e)
    if (
      msg.includes("too large") ||
      msg.includes("413") ||
      msg.includes("2097152") ||
      msg.includes("max allowed")
    ) {
      return { err: msg }
    }
    // Legacy agent path: v4 sync returned "processing" after the call already
    // ran. PreferAsyncUpdates should prevent this; keep a clear label if not.
    if (
      msg.includes('Unexpected request status in v4 sync response: "processing"') ||
      msg.includes("UnexpectedV4StatusErrorCode")
    ) {
      return { err: "Trade is still confirming. Refresh balances in a moment." }
    }
    return { err: fallback }
  }
}

export async function query<T>(
  identity: Identity | undefined,
  fn: (actor: WalletActor) => Promise<T>
): Promise<T> {
  if (!identity) throw new Error("Not authenticated")
  return fn(await getWalletActor(identity))
}

export function unwrap<T>(result: Outcome<T>): T {
  if ("err" in result) throw new Error(result.err)
  return result.ok
}
