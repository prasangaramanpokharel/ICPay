import type { TokenHolding } from "@/services/tokens"

const KEY = "icpay:holdings:"

type Stored = Omit<TokenHolding, "balance" | "fee"> & { balance: string; fee: string }

export function readHoldings(principal: string): TokenHolding[] | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const raw = localStorage.getItem(KEY + principal)
    if (!raw) return undefined
    return (JSON.parse(raw) as Stored[]).map((h) => ({
      ...h,
      balance: BigInt(h.balance),
      fee: BigInt(h.fee),
    }))
  } catch {
    return undefined
  }
}

export function cachedBalanceMap(principal: string | undefined): Map<string, bigint> {
  const map = new Map<string, bigint>()
  if (!principal) return map
  for (const holding of readHoldings(principal) ?? []) {
    map.set(holding.ledgerId, holding.balance)
  }
  return map
}

export function writeHoldings(principal: string, holdings: TokenHolding[]) {
  try {
    localStorage.setItem(
      KEY + principal,
      JSON.stringify(
        holdings.map((h) => ({ ...h, balance: h.balance.toString(), fee: h.fee.toString() }))
      )
    )
  } catch {
  }
}

export function patchHoldings(
  principal: string,
  updates: { ledgerId: string; delta: bigint }[]
): TokenHolding[] | undefined {
  const current = readHoldings(principal)
  if (!current?.length) return undefined
  const next = current.map((h) => {
    const hit = updates.find((u) => u.ledgerId === h.ledgerId)
    if (!hit) return h
    const balance = h.balance + hit.delta
    return { ...h, balance: balance > 0n ? balance : 0n }
  })
  writeHoldings(principal, next)
  return next
}
