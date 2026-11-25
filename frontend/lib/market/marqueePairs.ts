import type { TerminalPairRow } from "@/services/market/tradePairSnapshot"

export const MARQUEE_PAIR_LIMIT = 24

export function pickMarqueePairs(
  rows: TerminalPairRow[],
  limit = MARQUEE_PAIR_LIMIT
): TerminalPairRow[] {
  const withPrice = rows.filter((row) => row.stats && row.stats.priceUsd > 0)
  const pooled = withPrice.filter((row) => row.hasPool)
  const list = pooled.length >= 6 ? pooled : withPrice
  return list.slice(0, Math.max(0, limit))
}
