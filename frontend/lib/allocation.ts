export type Holding = {
  symbol: string
  value: number
}

export type UnpricedHolding = {
  symbol: string
  amount: string
}

export type AllocationSlice = Holding & {
  percent: number
  isOther: boolean
}

const MAX_SLICES = 4

export function percentOf(value: number, total: number): number {
  return total > 0 ? (value / total) * 100 : 0
}

export function formatPercent(percent: number): string {
  if (percent <= 0) return "0%"
  if (percent < 0.1) return "<0.1%"
  if (percent >= 99.95) return "100%"
  return `${percent.toFixed(1)}%`
}

/**
 * Shares of the portfolio by value, largest first. Everything past the top four is
 * grouped into one `other` slice so the bar and list stay short.
 */
export function computeAllocation(
  holdings: readonly Holding[],
  otherLabel: string
): { slices: AllocationSlice[]; total: number } {
  const priced = holdings
    .filter((holding) => Number.isFinite(holding.value) && holding.value > 0)
    .sort((a, b) => b.value - a.value)

  const total = priced.reduce((sum, holding) => sum + holding.value, 0)
  if (total === 0) return { slices: [], total: 0 }

  const head = priced.slice(0, MAX_SLICES)
  const restValue = priced.slice(MAX_SLICES).reduce((sum, holding) => sum + holding.value, 0)

  const slices: AllocationSlice[] = head.map((holding) => ({
    ...holding,
    percent: percentOf(holding.value, total),
    isOther: false,
  }))

  if (restValue > 0) {
    slices.push({
      symbol: otherLabel,
      value: restValue,
      percent: percentOf(restValue, total),
      isOther: true,
    })
  }

  return { slices, total }
}
