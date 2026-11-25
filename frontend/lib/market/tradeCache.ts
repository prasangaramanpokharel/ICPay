import type { IcpPrice } from "@/lib/market/icpPrice"
import type { OhlcBar, ChartWindow } from "@/lib/market/ohlc"
import type { TerminalPairRow, TradePairSnapshot } from "@/services/market/tradePairSnapshot"

const WATCHLIST_KEY = "icpay:market:watchlist"
const ICP_PRICE_KEY = "icpay:market:icp-price"
const PAIR_PREFIX = "icpay:market:pair:"
const OHLC_PREFIX = "icpay:market:ohlc:"
const BALANCES_PREFIX = "icpay:trade:balances:"
const LAST_PRINCIPAL_KEY = "icpay:trade:last-principal"
const LAST_PRINCIPAL_EVENT = "icpay-last-principal"

type Envelope<T> = {
  at: number
  data: T
}

function serialize(value: unknown): string {
  return JSON.stringify(value, (_key, val) =>
    typeof val === "bigint" ? { __bi: val.toString() } : val
  )
}

function deserialize<T>(raw: string): T | undefined {
  return JSON.parse(raw, (_key, val) =>
    val && typeof val === "object" && "__bi" in val && typeof val.__bi === "string"
      ? BigInt(val.__bi)
      : val
  ) as T
}

function readEnvelope<T>(key: string, maxAgeMs: number): T | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return undefined
    const parsed = deserialize<Envelope<T>>(raw)
    if (!parsed || typeof parsed.at !== "number") return undefined
    if (Date.now() - parsed.at > maxAgeMs) return undefined
    return parsed.data
  } catch {
    return undefined
  }
}

function writeEnvelope<T>(key: string, data: T): void {
  if (typeof window === "undefined") return
  try {
    const payload: Envelope<T> = { at: Date.now(), data }
    localStorage.setItem(key, serialize(payload))
  } catch {
  }
}

export function readWatchlistCache(maxAgeMs = 10 * 60_000): TerminalPairRow[] | undefined {
  return readEnvelope<TerminalPairRow[]>(WATCHLIST_KEY, maxAgeMs)
}

export function writeWatchlistCache(rows: TerminalPairRow[]): void {
  if (rows.length > 0) writeEnvelope(WATCHLIST_KEY, rows)
}

export function readPairSnapshotCache(
  ledgerId: string,
  maxAgeMs = 5 * 60_000
): TradePairSnapshot | undefined {
  return readEnvelope<TradePairSnapshot>(PAIR_PREFIX + ledgerId, maxAgeMs)
}

export function writePairSnapshotCache(ledgerId: string, snapshot: TradePairSnapshot): void {
  if (!snapshot.stats && snapshot.priceInIcp === null) return
  writeEnvelope(PAIR_PREFIX + ledgerId, snapshot)
}

export function readOhlcCache(
  ledgerId: string,
  window: ChartWindow,
  maxAgeMs = 5 * 60_000
): OhlcBar[] | undefined {
  return readEnvelope<OhlcBar[]>(`${OHLC_PREFIX}${ledgerId}:${window}`, maxAgeMs)
}

export function writeOhlcCache(ledgerId: string, window: ChartWindow, bars: OhlcBar[]): void {
  if (bars.length > 0) writeEnvelope(`${OHLC_PREFIX}${ledgerId}:${window}`, bars)
}

export function readIcpPriceCache(maxAgeMs = 10 * 60_000): IcpPrice | undefined {
  return readEnvelope<IcpPrice>(ICP_PRICE_KEY, maxAgeMs)
}

export function writeIcpPriceCache(price: IcpPrice): void {
  writeEnvelope(ICP_PRICE_KEY, price)
}

export function readTradeBalancesCache(
  principal: string | undefined,
  maxAgeMs = 15 * 60_000
): Map<string, bigint> | undefined {
  if (!principal) return undefined
  const entries = readEnvelope<[string, bigint][]>(BALANCES_PREFIX + principal, maxAgeMs)
  if (!entries) return undefined
  return new Map(entries)
}

export function writeTradeBalancesCache(principal: string, balances: Map<string, bigint>): void {
  writeEnvelope(BALANCES_PREFIX + principal, Array.from(balances.entries()))
}

export function patchTradeBalancesCache(
  principal: string,
  updates: Array<{ ledgerId: string; next: bigint } | { ledgerId: string; delta: bigint }>
): void {
  const existing = readTradeBalancesCache(principal)
  if (!existing) return
  for (const u of updates) {
    if ("next" in u) {
      existing.set(u.ledgerId, u.next > 0n ? u.next : 0n)
    } else {
      const cur = existing.get(u.ledgerId) ?? 0n
      const next = cur + u.delta
      existing.set(u.ledgerId, next > 0n ? next : 0n)
    }
  }
  writeTradeBalancesCache(principal, existing)
}

export function getLastPrincipalSnapshot(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(LAST_PRINCIPAL_KEY)
  } catch {
    return null
  }
}

export function getLastPrincipalServerSnapshot(): string | null {
  return null
}

export function subscribeLastPrincipal(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  const onStorage = (e: StorageEvent) => {
    if (e.key === LAST_PRINCIPAL_KEY) cb()
  }
  window.addEventListener("storage", onStorage)
  window.addEventListener(LAST_PRINCIPAL_EVENT, cb)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(LAST_PRINCIPAL_EVENT, cb)
  }
}

export function writeLastPrincipal(principal: string): void {
  if (typeof window === "undefined") return
  try {
    if (localStorage.getItem(LAST_PRINCIPAL_KEY) === principal) return
    localStorage.setItem(LAST_PRINCIPAL_KEY, principal)
    window.dispatchEvent(new Event(LAST_PRINCIPAL_EVENT))
  } catch {
  }
}

export function clearLastPrincipal(): void {
  if (typeof window === "undefined") return
  try {
    if (localStorage.getItem(LAST_PRINCIPAL_KEY) === null) return
    localStorage.removeItem(LAST_PRINCIPAL_KEY)
    window.dispatchEvent(new Event(LAST_PRINCIPAL_EVENT))
  } catch {
  }
}
