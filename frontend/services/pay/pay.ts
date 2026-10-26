import { parseIcp, memoByteLength, MEMO_MAX_BYTES } from "@/lib/wallet/utils"
import { profileUrlFor } from "@/lib/profile/url"
import { validateUsername } from "@/lib/profile/username"
import { isReservedHandle } from "@/lib/profile/reservedHandles"

export type PaymentRequest = {
  username: string
  amount?: bigint
  memo?: string
}

const AMOUNT_PARAM = "amount"
const MEMO_PARAM = "memo"

function toDecimalIcp(e8s: bigint): string {
  const whole = e8s / 100_000_000n
  const fraction = (e8s % 100_000_000n).toString().padStart(8, "0").replace(/0+$/, "")
  return fraction ? `${whole}.${fraction}` : `${whole}`
}

export function buildPaymentLink(req: PaymentRequest): string {
  const username = req.username.trim().toLowerCase()
  if (validateUsername(username) !== null || isReservedHandle(username)) {
    throw new Error(`not a payable username: ${req.username}`)
  }

  const url = new URL(profileUrlFor(username))
  if (req.amount !== undefined) {
    if (req.amount <= 0n) throw new Error("amount must be positive")
    url.searchParams.set(AMOUNT_PARAM, toDecimalIcp(req.amount))
  }

  const memo = req.memo?.trim()
  if (memo) {
    if (memoByteLength(memo) > MEMO_MAX_BYTES) throw new Error("memo too long")
    url.searchParams.set(MEMO_PARAM, memo)
  }

  return url.toString()
}

export function parsePaymentLink(raw: string): PaymentRequest | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  let url: URL
  try {
    url = new URL(trimmed, "https://icpay.app")
  } catch {
    return null
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null

  const segments = url.pathname.split("/").filter(Boolean)
  if (segments.length !== 1) return null

  const username = decodeURIComponent(segments[0]).replace(/^@/, "").toLowerCase()
  if (validateUsername(username) !== null || isReservedHandle(username)) return null

  const req: PaymentRequest = { username }

  const rawAmount = url.searchParams.get(AMOUNT_PARAM)
  if (rawAmount) {
    const amount = parseIcp(rawAmount)
    if (amount !== null) req.amount = amount
  }

  const memo = url.searchParams.get(MEMO_PARAM)?.trim()
  if (memo && memoByteLength(memo) <= MEMO_MAX_BYTES) req.memo = memo

  return req
}

export function amountFieldValue(amount: bigint): string {
  return toDecimalIcp(amount)
}
