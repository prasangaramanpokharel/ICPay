import type { Holding, UnpricedHolding } from "@/lib/allocation"
import { formatTokenAmount } from "@/lib/wallet/utils"

export function tokenUsdValue(
  amount: bigint,
  decimals: number,
  priceUsd: number | undefined
): number | null {
  if (priceUsd === undefined || amount <= 0n) return null
  return (Number(amount) / 10 ** decimals) * priceUsd
}

export function partitionHoldingsByPrice(
  icpAmount: number,
  icpUsd: number | undefined,
  fiatRate: number,
  holdings: ReadonlyArray<{
    ledgerId: string
    symbol: string
    balance: bigint
    decimals: number
  }>,
  prices: ReadonlyMap<string, number>
): { pricedHoldings: Holding[]; unpricedHoldings: UnpricedHolding[] } {
  const pricedHoldings: Holding[] = []
  const unpricedHoldings: UnpricedHolding[] = []

  const icpVal = icpUsd && icpUsd > 0 ? icpAmount * icpUsd * fiatRate : 0
  if (icpVal > 0) {
    pricedHoldings.push({ symbol: "ICP", value: icpVal })
  }

  for (const h of holdings) {
    if (h.symbol === "ICP" || h.balance <= 0n) continue
    const priceUsd = prices.get(h.ledgerId)
    if (priceUsd && priceUsd > 0) {
      const amt = Number(h.balance) / 10 ** h.decimals
      if (amt > 0) {
        pricedHoldings.push({ symbol: h.symbol, value: amt * priceUsd * fiatRate })
        continue
      }
    }
    unpricedHoldings.push({
      symbol: h.symbol,
      amount: formatTokenAmount(h.balance, h.decimals, 4),
    })
  }

  return { pricedHoldings, unpricedHoldings }
}
