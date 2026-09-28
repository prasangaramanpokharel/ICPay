"use client"

import { formatAmount } from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import { formatUsd } from "@/lib/market/icpPrice"

export function BucketPriceLabel({
  priceE8s,
  listPriceE8s,
  perMonth,
  showUsd = true,
  className,
  priceClassName,
}: {
  priceE8s: bigint
  listPriceE8s: bigint
  perMonth?: string
  showUsd?: boolean
  className?: string
  priceClassName?: string
}) {
  const showDiscount = listPriceE8s > priceE8s
  const { price: icpPrice } = useIcpPrice()
  const usdFormatted =
    showUsd && icpPrice?.usd
      ? formatUsd((Number(priceE8s) / 1e8) * icpPrice.usd)
      : null

  return (
    <span className={cn("inline-flex flex-wrap items-baseline justify-end gap-x-2 gap-y-0.5", className)}>
      {showDiscount ? (
        <span className="text-xs text-muted-foreground line-through tabular-nums">
          {formatAmount(listPriceE8s)} ICP
        </span>
      ) : null}
      <span className={cn("font-semibold tabular-nums text-foreground", priceClassName)}>
        {formatAmount(priceE8s)} ICP
        {usdFormatted && (
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            (≈ {usdFormatted})
          </span>
        )}
        {perMonth ? (
          <span className="text-xs font-normal text-muted-foreground"> {perMonth}</span>
        ) : null}
      </span>
    </span>
  )
}
