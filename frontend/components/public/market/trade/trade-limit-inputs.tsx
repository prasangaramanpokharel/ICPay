"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDataTransferHorizontalIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatUsd } from "@/lib/market/format"
import { TokenAvatar } from "./token-avatar"
import { TradePercentageSlider } from "./trade-percentage-slider"

export interface TradeLimitInputsProps {
  effectivePriceText: string
  onPriceChange: (val: string) => void
  limitPriceMode: "quote" | "usd"
  onTogglePriceMode: () => void
  convertedPriceSubtext: string | null
  quoteSymbol: string
  baseSymbol: string
  baseToken: { ledgerId: string; logoUrl?: string | null } | null | undefined
  quoteToken: { ledgerId: string; logoUrl?: string | null } | null | undefined
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
  convertedPriceSubtext,
  quoteSymbol,
  baseSymbol,
  baseToken,
  quoteToken,
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
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground">
            {t("limitPrice")}
          </span>
          <Input
            inputMode="decimal"
            placeholder="0.00"
            className="h-10 border-0 bg-transparent pl-20 pr-24 text-right text-sm tabular-nums shadow-none focus-visible:ring-0"
            value={effectivePriceText}
            onChange={(e) => onPriceChange(e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={onTogglePriceMode}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[11px] font-semibold text-foreground transition-all hover:bg-muted hover:border-border active:scale-95 cursor-pointer"
            title={limitPriceMode === "quote" ? t("switchToUsd") : t("switchToToken", { symbol: quoteSymbol })}
          >
            {limitPriceMode === "quote" && (
              <TokenAvatar
                symbol={quoteSymbol}
                ledgerId={quoteToken?.ledgerId}
                logoUrl={quoteToken?.logoUrl}
                className="size-3.5"
              />
            )}
            <span>{limitPriceMode === "quote" ? quoteSymbol : "USD"}</span>
            <HugeiconsIcon
              icon={ArrowDataTransferHorizontalIcon}
              className="size-3 text-muted-foreground"
              strokeWidth={2}
            />
          </Button>
        </div>
        {convertedPriceSubtext ? (
          <div className="flex items-center justify-between border-t border-border/40 px-3 py-1 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              {limitPriceMode === "quote" ? (
                "USD"
              ) : (
                <>
                  <TokenAvatar
                    symbol={quoteSymbol}
                    ledgerId={quoteToken?.ledgerId}
                    logoUrl={quoteToken?.logoUrl}
                    className="size-3"
                  />
                  <span>{quoteSymbol}</span>
                </>
              )}
            </span>
            <span className="tabular-nums font-medium text-foreground/80">
              {convertedPriceSubtext}
            </span>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-border/60 bg-background/80 transition-colors focus-within:border-ring">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground">
            {t("amountLabel")}
          </span>
          <Input
            inputMode="decimal"
            placeholder="0.00"
            className="h-10 border-0 bg-transparent pl-16 pr-22 text-right text-sm tabular-nums shadow-none focus-visible:ring-0"
            value={limitBaseAmountText}
            onChange={(e) => onBaseAmountChange(e.target.value)}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <TokenAvatar
              symbol={baseSymbol}
              ledgerId={baseToken?.ledgerId}
              logoUrl={baseToken?.logoUrl}
              className="size-4"
            />
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
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground">
            {t("total")}
          </span>
          <Input
            inputMode="decimal"
            placeholder="0.00"
            className="h-10 border-0 bg-transparent pl-14 pr-20 text-right text-sm tabular-nums shadow-none focus-visible:ring-0"
            value={limitTotalText}
            onChange={(e) => onTotalChange(e.target.value)}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <TokenAvatar
              symbol={quoteSymbol}
              ledgerId={quoteToken?.ledgerId}
              logoUrl={quoteToken?.logoUrl}
              className="size-4"
            />
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
