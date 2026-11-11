"use client"

import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { formatUsd } from "@/lib/market/format"
import { TradePercentageSlider } from "./trade-percentage-slider"
import { TradeOrderQuote } from "./trade-order-quote"
import type { TradeQuoteResult } from "@/services/trade/types"

export interface TradeMarketInputsProps {
  marketAmountText: string
  onMarketAmountChange: (val: string) => void
  paySymbol: string
  receiveSymbol: string
  tokenIn: { ledgerId: string; decimals: number; logoUrl?: string | null } | null | undefined
  tokenOut: { ledgerId: string; decimals: number; logoUrl?: string | null } | null | undefined
  hasAmount: boolean
  payUsd: number | null
  currentFillPercent: number
  onApplyFill: (pct: number) => void
  isAuthenticated: boolean
  tradingBal: bigint | null
  canQuote: boolean
  quote: TradeQuoteResult | undefined
  quoting: boolean
}

export function TradeMarketInputs({
  marketAmountText,
  onMarketAmountChange,
  paySymbol,
  receiveSymbol,
  tokenIn,
  tokenOut,
  hasAmount,
  payUsd,
  currentFillPercent,
  onApplyFill,
  isAuthenticated,
  tradingBal,
  canQuote,
  quote,
  quoting,
}: TradeMarketInputsProps) {
  const t = useTranslations("marketTrade")

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border border-border/60 bg-background/80 transition-colors focus-within:border-ring">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground">
            {t("amountLabel")}
          </span>
          <Input
            inputMode="decimal"
            placeholder="0.00"
            className="h-10 border-0 bg-transparent pl-16 pr-20 text-right text-sm tabular-nums shadow-none focus-visible:ring-0"
            value={marketAmountText}
            onChange={(e) => onMarketAmountChange(e.target.value)}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <span>{paySymbol}</span>
          </span>
        </div>
        {hasAmount ? (
          <div className="flex items-center justify-between border-t border-border/40 px-3 py-1.5 text-[11px]">
            <span className="text-muted-foreground">{t("total")}</span>
            <span className="tabular-nums font-medium text-foreground/80">
              {payUsd !== null ? formatUsd(payUsd, 2) : "—"}
            </span>
          </div>
        ) : null}
      </div>

      <div>
        <TradePercentageSlider
          value={currentFillPercent}
          onChange={onApplyFill}
          disabled={!isAuthenticated || !tradingBal || tradingBal <= 0n}
        />
      </div>

      {hasAmount && tokenIn && tokenOut && canQuote ? (
        <TradeOrderQuote
          quote={quote}
          quoting={quoting}
          paySymbol={paySymbol}
          receiveSymbol={receiveSymbol}
          payDecimals={tokenIn.decimals}
          outDecimals={tokenOut.decimals}
        />
      ) : null}
    </div>
  )
}
