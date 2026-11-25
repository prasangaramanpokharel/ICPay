"use client"

import { useTranslations } from "next-intl"
import { ReplaceGlassIcon } from "@thesvg/ui-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatUsd } from "@/lib/market/format"
import { TradePercentageSlider } from "./trade-percentage-slider"

export interface TradeLimitInputsProps {
  effectivePriceText: string
  onPriceChange: (val: string) => void
  limitPriceMode: "quote" | "usd"
  onTogglePriceMode: () => void
  onSnapToMarket?: () => void
  convertedPriceSubtext: string | null
  quoteSymbol: string
  baseSymbol: string
  limitBaseAmountText: string
  onBaseAmountChange: (val: string) => void
  limitTotalText: string
  onTotalChange: (val: string) => void
  currentFillPercent: number
  onApplyFill: (pct: number) => void
  isAuthenticated: boolean
  tradingBal: bigint | null
  icpPriceUsd: number
}

export function TradeLimitInputs({
  effectivePriceText,
  onPriceChange,
  limitPriceMode,
  onTogglePriceMode,
  onSnapToMarket,
  convertedPriceSubtext,
  quoteSymbol,
  baseSymbol,
  limitBaseAmountText,
  onBaseAmountChange,
  limitTotalText,
  onTotalChange,
  currentFillPercent,
  onApplyFill,
  isAuthenticated,
  tradingBal,
  icpPriceUsd,
}: TradeLimitInputsProps) {
  const t = useTranslations("marketTrade")

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border border-border/60 bg-background/80 transition-colors focus-within:border-ring">
        <div className="relative">
          <label
            htmlFor="trade-limit-price-input"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground cursor-text"
          >
            {t("limitPrice")}
          </label>
          <Input
            id="trade-limit-price-input"
            aria-label={t("limitPrice")}
            inputMode="decimal"
            placeholder="0.00"
            className="h-10 border-0 bg-transparent pl-20 pr-32 text-right text-sm tabular-nums shadow-none focus-visible:ring-0"
            value={effectivePriceText}
            onChange={(e) => onPriceChange(e.target.value)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {onSnapToMarket ? (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={onSnapToMarket}
                className="h-6 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                Last
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={onTogglePriceMode}
              className="h-6 flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[11px] font-semibold text-foreground transition-all hover:bg-muted hover:border-border active:scale-95 cursor-pointer"
              title={limitPriceMode === "quote" ? t("switchToUsd") : t("switchToToken", { symbol: quoteSymbol })}
            >
              <span>{limitPriceMode === "quote" ? quoteSymbol : "USD"}</span>
              <ReplaceGlassIcon className="size-3 text-muted-foreground" />
            </Button>
          </div>
        </div>
        {convertedPriceSubtext ? (
          <div className="flex items-center justify-between border-t border-border/40 px-3 py-1 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span>{limitPriceMode === "quote" ? "USD" : quoteSymbol}</span>
            </span>
            <span className="tabular-nums font-medium text-foreground/80">
              {convertedPriceSubtext}
            </span>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-border/60 bg-background/80 transition-colors focus-within:border-ring">
        <div className="relative">
          <label
            htmlFor="trade-limit-amount-input"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground cursor-text"
          >
            {t("amountLabel")}
          </label>
          <Input
            id="trade-limit-amount-input"
            aria-label={t("amountLabel")}
            inputMode="decimal"
            placeholder="0.00"
            className="h-10 border-0 bg-transparent pl-16 pr-22 text-right text-sm tabular-nums shadow-none focus-visible:ring-0"
            value={limitBaseAmountText}
            onChange={(e) => onBaseAmountChange(e.target.value)}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <span>{baseSymbol}</span>
          </span>
        </div>
      </div>

      <div>
        <TradePercentageSlider
          value={currentFillPercent}
          onChange={onApplyFill}
          disabled={!isAuthenticated || !tradingBal || tradingBal <= 0n}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border/60 bg-background/80 transition-colors focus-within:border-ring">
        <div className="relative">
          <label
            htmlFor="trade-limit-total-input"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground cursor-text"
          >
            {t("total")}
          </label>
          <Input
            id="trade-limit-total-input"
            aria-label={t("total")}
            inputMode="decimal"
            placeholder="0.00"
            className="h-10 border-0 bg-transparent pl-14 pr-20 text-right text-sm tabular-nums shadow-none focus-visible:ring-0"
            value={limitTotalText}
            onChange={(e) => onTotalChange(e.target.value)}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <span>{quoteSymbol}</span>
          </span>
        </div>
        {limitTotalText && parseFloat(limitTotalText) > 0 && icpPriceUsd > 0 ? (
          <div className="flex items-center justify-between border-t border-border/40 px-3 py-1 text-[10px] text-muted-foreground">
            <span>USD</span>
            <span className="tabular-nums font-medium text-foreground/80">
              ≈ {formatUsd(parseFloat(limitTotalText) * icpPriceUsd, 2, { compact: false })}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
        <span>{t("makerFee")}</span>
        <span className="font-medium text-foreground">
          0.05% ({t("maker")})
        </span>
      </div>
    </div>
  )
}
