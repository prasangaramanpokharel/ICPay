import { Delegation, DelegationChain } from "@icp-sdk/core/identity"
import { Principal } from "@icp-sdk/core/principal"
import { WALLET_CANISTER_ID, TRADE_CANISTER_ID } from "@/services/icp"
import { ICP_LEDGER_ID, ICPAY_LEDGER_ID, PINNED_LEDGER_IDS } from "@/services/tokens"
import { BLOB_STORE_CANISTER_ID } from "@/lib/ic/constants"

export const NATIVE_AUTH_TTL = 2_592_000_000_000_000n
export const NATIVE_AUTH_POPUP_W = 432
export const NATIVE_AUTH_POPUP_H = 620

export function getNativeAuthTargets(): string[] {
  const targets = new Set<string>([
    WALLET_CANISTER_ID,
    BLOB_STORE_CANISTER_ID,
    ICP_LEDGER_ID,
    ICPAY_LEDGER_ID,
    ...PINNED_LEDGER_IDS,
  ])
  if (TRADE_CANISTER_ID) {
    targets.add(TRADE_CANISTER_ID)
  }
  return [...targets]
}

export type IiDelegation = {
  signature: unknown
  delegation: { pubkey: unknown; expiration: unknown; targets?: unknown }
}

export type IiSuccess = {
  kind?: string
  userPublicKey?: unknown
  publicKey?: unknown
  delegations?: IiDelegation[]
}

function toBytes(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return value
  if (value instanceof ArrayBuffer) return new Uint8Array(value)
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
  }
  if (Array.isArray(value)) return Uint8Array.from(value as number[])
  if (value && typeof value === "object" && "length" in value) {
    return Uint8Array.from(value as ArrayLike<number>)
  }
  if (typeof value === "string") {
    const hex = value.replace(/^0x/i, "")
    if (hex.length >= 64 && hex.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(hex)) {
      const out = new Uint8Array(hex.length / 2)
      for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
      return out
    }
  }
  throw new Error("Invalid key format.")
}

function toExpiration(value: unknown): bigint {
  if (typeof value === "bigint") return value
  if (typeof value === "number") return BigInt(value)
  if (typeof value === "string") {
    const raw = value.replace(/^0x/i, "")
    return /^[0-9]+$/.test(value) ? BigInt(value) : BigInt(`0x${raw}`)
  }
  throw new Error("Invalid expiration.")
}

function toTargets(value: unknown): Principal[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined
  return value.map((item) => {
    if (typeof item === "string") {
      try {
        return Principal.fromText(item)
      } catch {
        return Principal.fromHex(item)
      }
    }
    return Principal.fromUint8Array(toBytes(item))
  })
}

export function chainFromIiSuccess(data: IiSuccess): DelegationChain {
  const delegations = (data.delegations ?? []).map((item) => ({
    delegation: new Delegation(
      toBytes(item.delegation.pubkey),
      toExpiration(item.delegation.expiration),
      toTargets(item.delegation.targets)
    ),
    signature: toBytes(item.signature) as never,
  }))
  return DelegationChain.fromDelegations(
    delegations,
    toBytes(data.userPublicKey ?? data.publicKey) as never
  )
}

export function parseHexKey(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/i, "").trim()
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

export function redirectToNativeCallback(callbackUrl: string): void {
  window.location.href = callbackUrl
}
