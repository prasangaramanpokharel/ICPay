import type { TxTypeVariant, TxStatusVariant } from "@/services/types"

const ICP_DECIMALS = 8n

export const E8S = 100_000_000n

export const ICP_FEE = 10_000n

const HEX_ACCOUNT_ID = /^[0-9a-fA-F]{64}$/

export function isHexAccountId(s: string): boolean {
  return HEX_ACCOUNT_ID.test(s)
}

export function parseIcp(value: string): bigint | null {
  const t = value.trim().replace(/,/g, "")
  if (t === "" || t === "." || !/^\d*\.?\d*$/.test(t)) return null
  const n = Number(t)
  if (!Number.isFinite(n) || n <= 0) return null
  return BigInt(Math.round(n * Number(E8S)))
}

export function parseTokenAmount(value: string, decimals: number): bigint | null {
  const t = value.trim().replace(/,/g, "")
  if (t === "" || t === "." || !/^\d*\.?\d*$/.test(t)) return null

  const [whole, fraction = ""] = t.split(".")
  if (fraction.length > decimals) return null

  const amount = BigInt(whole || "0") * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, "0") || "0")
  return amount > 0n ? amount : null
}

export function shortenCounterparty(value: string): string {
  if (value.startsWith("@")) return value
  if (value.length <= 16) return value
  return `${value.slice(0, 6)}…${value.slice(-4)}`
}

export async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement("textarea")
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand("copy")
    document.body.removeChild(ta)
  }
}

export const MEMO_MAX_BYTES = 32

export function memoByteLength(s: string): number {
  return new TextEncoder().encode(s).length
}

export function formatE8s(amount: bigint): string {
  const whole = amount / 10n ** ICP_DECIMALS
  const fraction = amount % 10n ** ICP_DECIMALS
  const fractionStr = fraction.toString().padStart(Number(ICP_DECIMALS), "0")
  return `${whole.toLocaleString()}.${fractionStr}`
}

export function formatAmount(amount: bigint): string {
  const whole = amount / 10n ** ICP_DECIMALS
  const fraction = amount % 10n ** ICP_DECIMALS
  const fractionStr = fraction.toString().padStart(Number(ICP_DECIMALS), "0")
  const trimmed = fractionStr.replace(/0+$/, "") || "0"
  return `${whole.toLocaleString()}.${trimmed.slice(0, 4)}`
}

export function formatTokenAmount(amount: bigint, decimals: number, maxFraction = 6): string {
  const scale = 10n ** BigInt(decimals)
  const whole = amount / scale
  const fraction = (amount % scale).toString().padStart(decimals, "0")
  const trimmed = fraction.slice(0, maxFraction).replace(/0+$/, "")
  if (!trimmed) return whole === 0n && amount > 0n ? "<0.000001" : whole.toLocaleString()
  return `${whole.toLocaleString()}.${trimmed}`
}

export function toPlainTokenAmount(amount: bigint, decimals: number): string {
  const scale = 10n ** BigInt(decimals)
  const whole = amount / scale
  const fraction = (amount % scale).toString().padStart(decimals, "0").replace(/0+$/, "")
  return fraction ? `${whole}.${fraction}` : `${whole}`
}

const KNOWN_TOKEN_NAMES: Record<string, string> = {
  ICP: "Internet Computer",
  ICPAY: "ICPay",
  CKBTC: "Chain-Key Bitcoin",
  CKETH: "Chain-Key Ethereum",
  CKUSDC: "Chain-Key USD Coin",
  CKUSDT: "Chain-Key Tether USD",
  CKEURC: "Chain-Key Euro Coin",
  CKSOL: "Chain-Key Solana",
  CKSEPETH: "Chain-Key Sepolia ETH",
  CKLINK: "Chain-Key Chainlink",
  CKPEPE: "Chain-Key Pepe",
  CKSHIB: "Chain-Key Shiba Inu",
  CKUNI: "Chain-Key Uniswap",
  CKWSTETH: "Chain-Key Wrapped stETH",
  CKXAUT: "Chain-Key Tether Gold",
}

export function resolveTokenDisplayName(symbol: string, name?: string): string {
  const cleanSymbol = symbol.trim()
  const cleanName = (name ?? "").trim()
  const known = KNOWN_TOKEN_NAMES[cleanSymbol.toUpperCase()]
  if (!cleanName || cleanName.toLowerCase() === cleanSymbol.toLowerCase()) {
    return known ?? "ICRC-1 Token"
  }
  return cleanName
}

export function shortPrincipal(text: string): string {
  return text.length > 12 ? `${text.slice(0, 6)}…${text.slice(-4)}` : text
}

export function formatPrincipal(p: string): string {
  if (p.length <= 10) return p
  return `${p.slice(0, 5)}...${p.slice(-5)}`
}

export function explorerTxUrl(blockIndex: bigint): string {
  return `https://dashboard.internetcomputer.org/transaction/${blockIndex}`
}

export function formatTime(t: bigint): string {
  const ms = Number(t / 1_000_000n)
  const date = new Date(ms)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatRelativeTime(t: bigint): string {
  const ms = Number(t / 1_000_000n)
  if (!ms || Number.isNaN(ms) || ms <= 0) return "—"
  const now = Date.now()
  const diffSec = Math.max(0, Math.floor((now - ms) / 1000))
  if (diffSec < 60) return "just now"
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  if (diffSec < 86400 * 30) return `${Math.floor(diffSec / 86400)}d ago`
  if (diffSec < 86400 * 365) return `${Math.floor(diffSec / (86400 * 30))}mo ago`
  return `${Math.floor(diffSec / (86400 * 365))}y ago`
}

export function formatDetailTime(t: bigint): string {
  const date = new Date(Number(t / 1_000_000n))
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function formatTimeIso(t: bigint): string {
  return new Date(Number(t / 1_000_000n)).toISOString()
}

export function formatClockTime(t: bigint): string {
  return new Date(Number(t / 1_000_000n)).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })
}

function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function transactionDateKey(t: bigint): string {
  const date = new Date(Number(t / 1_000_000n))
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export function formatTransactionDateGroup(
  t: bigint,
  labels: { today: string; yesterday: string }
): string {
  const date = new Date(Number(t / 1_000_000n))
  const now = new Date()
  const txDay = startOfLocalDay(date)
  const today = startOfLocalDay(now)
  const yesterday = today - 86_400_000

  if (txDay === today) return labels.today
  if (txDay === yesterday) return labels.yesterday

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(date.getFullYear() !== now.getFullYear() ? { year: "numeric" as const } : {}),
  })
}

export function groupTransactionsByDate<T extends { createdAt: bigint }>(
  transactions: T[]
): { key: string; items: T[] }[] {
  const groups = new Map<string, T[]>()
  const order: string[] = []

  for (const tx of transactions) {
    const key = transactionDateKey(tx.createdAt)
    if (!groups.has(key)) {
      groups.set(key, [])
      order.push(key)
    }
    groups.get(key)!.push(tx)
  }

  return order.map((key) => ({ key, items: groups.get(key)! }))
}

export type TxTypeKey = "deposit" | "withdraw" | "transfer" | "fee" | "swapIn" | "swapOut"

export function txTypeKey(txType: TxTypeVariant): TxTypeKey {
  if ("deposit" in txType) return "deposit"
  if ("withdraw" in txType) return "withdraw"
  if ("transfer" in txType) return "transfer"
  if ("swapIn" in txType) return "swapIn"
  if ("swapOut" in txType) return "swapOut"
  return "fee"
}

export function txTypeLabel(txType: TxTypeVariant): TxTypeKey {
  return txTypeKey(txType)
}

export function isIncomingTx(txType: TxTypeVariant): boolean {
  const key = txTypeKey(txType)
  return key === "deposit" || key === "swapIn"
}

export function txStatusLabel(status: TxStatusVariant): "completed" | "pending" | "failed" | "cancelled" {
  if ("completed" in status) return "completed"
  if ("pending" in status) return "pending"
  if ("failed" in status) return "failed"
  return "cancelled"
}

export function getTxStatusVariant(status: TxStatusVariant): "default" | "secondary" | "destructive" | "outline" {
  const label = txStatusLabel(status)
  switch (label) {
    case "completed":
      return "default"
    case "pending":
      return "secondary"
    case "failed":
      return "destructive"
    default:
      return "outline"
  }
}
