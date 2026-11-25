"use client"

import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { TokenAvatar } from "@/components/public/market/trade/token-avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ShineBorder } from "@/components/ui/shine-border"
import { cn } from "@/lib/ui/utils"
import { changeClass, formatPct, formatUsd, priceLayers, sanePriceRange } from "@/lib/market/format"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

export function TradePairToolbar({
  snapshot,
  loading,
}: {
  snapshot: TradePairSnapshot | undefined
  loading?: boolean
}) {
  const t = useTranslations("marketTrade")

  if (loading && !snapshot) {
    return (
      <Card size="sm" className="m-1 flex flex-row flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3">
        <div className="flex items-center gap-3 pr-2">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="min-w-0 space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="min-w-0 space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="min-w-0 space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="min-w-0 space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="min-w-0 space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </Card>
    )
  }

  if (!snapshot) return null

  const stats = snapshot.stats
  const range = sanePriceRange(stats)
  const usd = priceLayers(stats?.priceUsd)
  const icp = priceLayers(snapshot.priceInIcp, snapshot.quote.symbol)

  return (
    <TooltipProvider delay={150}>
      <Card
        size="sm"
        className="relative m-1 flex flex-row flex-wrap items-start gap-x-8 gap-y-3 overflow-hidden px-4 py-3"
      >
        <ShineBorder
          borderWidth={1}
          duration={12}
          shineColor={["var(--primary)", "var(--success)", "var(--accent)"]}
          className="opacity-30 dark:opacity-40"
        />
        <div className="flex items-center gap-3 self-center pr-2">
        <TokenAvatar
          symbol={snapshot.base.symbol}
          ledgerId={snapshot.baseLedgerId}
          logoUrl={snapshot.base.logoUrl}
          className="size-10"
        />
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            {snapshot.base.symbol}/{snapshot.quote.symbol}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t("tokenPriceLine", { name: snapshot.base.name })}
          </p>
        </div>
      </div>

      <Metric
        label={t("priceUsd")}
        value={usd.main}
        detail={usd.sub}
        large
        valueClass={changeClass(stats?.priceChange24h)}
      />
      {snapshot.priceInIcp !== null && (
        <Metric
          label={t("priceIcp")}
          value={icp.main}
          detail={icp.sub}
        />
      )}
      <Metric
        label={t("change24h")}
        value={formatPct(stats?.priceChange24h)}
        valueClass={changeClass(stats?.priceChange24h)}
      />
      {range && (
        <>
          <Metric
            label={t("rangeHigh")}
            value={priceLayers(range.high).main}
            tooltip="24h highest price"
          />
          <Metric
            label={t("rangeLow")}
            value={priceLayers(range.low).main}
            tooltip="24h lowest price"
          />
        </>
      )}
      <Metric
        label={t("volume24h")}
        value={formatUsd(stats?.volume24hUsd)}
        tooltip="24h trading volume"
      />
      {snapshot.fdv && (
        <Metric
          label={t("fdv")}
          value={formatUsd(snapshot.fdv)}
          tooltip="Fully Diluted Valuation - market cap if max supply was in circulation"
        />
      )}
      {snapshot.holders !== undefined && (
        <Metric
          label={t("holders")}
          value={snapshot.holders.toLocaleString()}
          detail={snapshot.holdersChange24h !== undefined ? formatPct((snapshot.holdersChange24h / (snapshot.holders || 1)) * 100) : undefined}
          detailClass={changeClass(snapshot.holdersChange24h)}
          tooltip="Number of unique wallet addresses holding this token"
        />
      )}
      </Card>
    </TooltipProvider>
  )
}

function Metric({
  label,
  value,
  detail,
  large,
  valueClass,
  detailClass,
  tooltip,
}: {
  label: string
  value: string
  detail?: string
  large?: boolean
  valueClass?: string
  detailClass?: string
  tooltip?: string
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {tooltip ? (
          <Tooltip>
            <TooltipTrigger className="border-b border-dotted border-muted-foreground/60 cursor-help text-left uppercase">
              {label}
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          label
        )}
      </p>
      <p
        className={cn(
          "tabular-nums",
          large ? "text-xl font-semibold" : "text-sm font-medium",
          valueClass
        )}
      >
        {value}
      </p>
      {detail && detail !== value && (
        <p className={cn("text-[10px] tabular-nums", detailClass ?? "text-muted-foreground")}>{detail}</p>
      )}
    </div>
  )
}
