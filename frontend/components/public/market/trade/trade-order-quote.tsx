import { useTranslations } from "next-intl"
import { InfoGlassIcon, RefreshCwGlassIcon } from "@thesvg/ui-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { DEFAULT_SLIPPAGE_BPS } from "@/lib/trade/fees"
import { cn } from "@/lib/ui/utils"
import type { TradeQuoteResult } from "@/services/trade/types"

export function TradeOrderQuote({
  quote,
  quoting,
  paySymbol,
  receiveSymbol,
  payDecimals,
  outDecimals,
  slippageBps = DEFAULT_SLIPPAGE_BPS,
  onRefreshQuote,
}: {
  quote: TradeQuoteResult | undefined
  quoting: boolean
  paySymbol: string
  receiveSymbol: string
  payDecimals: number
  outDecimals: number
  slippageBps?: bigint
  onRefreshQuote?: () => void
}) {
  const t = useTranslations("marketTrade")
  const slippagePct = (Number(slippageBps) / 100).toFixed(Number(slippageBps) % 100 === 0 ? 0 : 1)

  return (
    <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2.5 mt-2">
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{t("youReceive")}</p>
        <div className="flex items-center gap-1.5 truncate text-sm font-semibold tabular-nums">
          {quoting ? (
            <Spinner className="size-3" />
          ) : quote ? (
            <>
              <span>{formatTokenAmount(quote.amountOut, outDecimals)}</span>
              <span className="text-xs font-semibold text-foreground">
                {receiveSymbol}
              </span>
            </>
          ) : (
            "—"
          )}
        </div>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        {quote && onRefreshQuote ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onRefreshQuote}
            disabled={quoting}
            aria-label="Refresh"
            className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RefreshCwGlassIcon className={cn("size-3.5", quoting && "animate-spin")} />
          </Button>
        ) : null}
        <Popover>
          <PopoverTrigger
            aria-label={t("youReceive")}
            className="inline-flex size-7 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          >
            <InfoGlassIcon className="size-4" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 gap-2 p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{t("takerFee")}</span>
              <span className="font-medium text-foreground">0.15% ({t("taker")})</span>
            </div>
            {quote ? (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">{t("poolFee")}</span>
                <span className="inline-flex items-center gap-1 tabular-nums font-medium text-foreground">
                  <span>{formatTokenAmount(quote.swapFee, payDecimals)}</span>
                  <span>{paySymbol}</span>
                </span>
              </div>
            ) : null}
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{t("slippage")}</span>
              <span className="font-medium text-foreground">{slippagePct}%</span>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
