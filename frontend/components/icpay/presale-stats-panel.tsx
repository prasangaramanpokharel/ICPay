"use client"

import { useTranslations } from "next-intl"
import { formatAmount, formatTokenAmount } from "@/lib/wallet/utils"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import type { IcpaySaleQuote } from "@/services/icpay/sale"

const ICP_DECIMALS = 8

export function PresaleStatsPanel({
  sale,
  symbol,
  isLoading,
  inactiveLabel,
}: {
  sale: IcpaySaleQuote | undefined
  symbol: string
  isLoading: boolean
  remainingLabel?: (amount: string, symbol: string) => string
  raisedLabel?: (icp: string) => string
  inactiveLabel: string
}) {
  const t = useTranslations("buyIcpay")

  if (isLoading && !sale) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  if (!sale) return null

  const percent = Math.min(100, Number(sale.percentSold))
  const percentLabel = percent.toFixed(2)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-baseline justify-between text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="font-bold text-zinc-100">
              {formatTokenAmount(sale.icpaySold, ICP_DECIMALS, 0)}
            </span>
            <span className="text-zinc-600">/</span>
            <span>{formatTokenAmount(sale.inventoryCap, ICP_DECIMALS, 0)}</span>
            <span className="font-medium text-zinc-300">{symbol}</span>
          </div>
          <span className="font-mono text-xs font-bold text-amber-400 tabular-nums">
            {percentLabel}%
          </span>
        </div>

        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-zinc-800/80 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <HoverCard>
          <HoverCardTrigger className="cursor-pointer block text-left">
            <div className="group rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 text-center transition-all duration-200 hover:border-amber-500/30 hover:bg-zinc-800/60">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 transition-colors group-hover:text-amber-400">
                Raised
              </span>
              <span className="mt-1 block truncate text-xs font-bold tabular-nums text-zinc-100 sm:text-sm">
                {formatAmount(sale.icpRaised)} ICP
              </span>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-64 space-y-1.5 text-xs shadow-xl">
            <p className="font-semibold text-foreground">
              {t("raised", { icp: formatAmount(sale.icpRaised) })}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t("liquidityInfo")}
            </p>
          </HoverCardContent>
        </HoverCard>

        <HoverCard>
          <HoverCardTrigger className="cursor-pointer block text-left">
            <div className="group rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 text-center transition-all duration-200 hover:border-amber-500/30 hover:bg-zinc-800/60">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 transition-colors group-hover:text-amber-400">
                Remaining
              </span>
              <span className="mt-1 block truncate text-xs font-bold tabular-nums text-zinc-100 sm:text-sm">
                {formatTokenAmount(sale.inventoryRemaining, ICP_DECIMALS, 0)}
              </span>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-64 space-y-1.5 text-xs shadow-xl">
            <p className="font-semibold text-foreground">
              {t("remaining", {
                amount: formatTokenAmount(sale.inventoryRemaining, ICP_DECIMALS, 0),
                symbol,
              })}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t("progressInfoTitle")}
            </p>
          </HoverCardContent>
        </HoverCard>

        <HoverCard>
          <HoverCardTrigger className="cursor-pointer block text-left">
            <div className="group rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 text-center transition-all duration-200 hover:border-amber-500/30 hover:bg-zinc-800/60">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 transition-colors group-hover:text-amber-400">
                Target Cap
              </span>
              <span className="mt-1 block truncate text-xs font-bold tabular-nums text-zinc-100 sm:text-sm">
                500 ICP
              </span>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-64 space-y-1.5 text-xs shadow-xl">
            <p className="font-semibold text-foreground">500 ICP Hard Cap</p>
            <p className="text-muted-foreground leading-relaxed">
              {t("heroSubtitle")}
            </p>
          </HoverCardContent>
        </HoverCard>
      </div>

      {!sale.active && (
        <Badge
          variant="outline"
          className="w-full justify-center border-amber-500/30 bg-amber-500/10 py-1.5 text-xs font-medium text-amber-400"
        >
          {inactiveLabel}
        </Badge>
      )}
    </div>
  )
}
