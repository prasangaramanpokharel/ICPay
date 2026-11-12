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
        <div className="flex items-center justify-between text-xs font-medium tabular-nums">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="font-bold text-foreground">
              {formatTokenAmount(sale.icpaySold, ICP_DECIMALS, 0)}
            </span>
            <span>/</span>
            <span>{formatTokenAmount(sale.inventoryCap, ICP_DECIMALS, 0)}</span>
            <span className="font-medium text-foreground">{symbol}</span>
          </div>
          <Badge
            variant="outline"
            className="border-primary/25 bg-primary/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-primary tabular-nums shadow-xs"
          >
            {percentLabel}%
          </Badge>
        </div>

        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/60 p-0.5 ring-1 ring-border/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary/80 via-primary to-primary shadow-xs transition-all duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <HoverCard>
          <HoverCardTrigger className="cursor-pointer block text-left">
            <div className="group rounded-2xl border border-border/70 bg-muted/20 p-3.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/40 hover:shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                Raised
              </span>
              <span className="mt-1 block truncate text-xs font-bold tabular-nums text-foreground sm:text-sm">
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
            <div className="group rounded-2xl border border-border/70 bg-muted/20 p-3.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/40 hover:shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                Remaining
              </span>
              <span className="mt-1 block truncate text-xs font-bold tabular-nums text-foreground sm:text-sm">
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
            <div className="group rounded-2xl border border-border/70 bg-muted/20 p-3.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/40 hover:shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                Target Cap
              </span>
              <span className="mt-1 block truncate text-xs font-bold tabular-nums text-foreground sm:text-sm">
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
          className="w-full justify-center border-warning/40 bg-warning/10 py-1.5 text-xs font-medium text-warning"
        >
          {inactiveLabel}
        </Badge>
      )}
    </div>
  )
}
