"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth/auth-provider"
import { useRefreshTradeBalances, useTradingBalance } from "@/hooks/trade/useTrade"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import { formatTokenAmount, parseTokenAmount } from "@/lib/wallet/utils"
import { formatUsd } from "@/lib/market/format"
import { placeLimitOrder } from "@/services/trade/trade"
import { cn } from "@/lib/ui/utils"
import { MIN_TRADE_ICP } from "@/lib/market/minTradeUsd"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"
import { CheckCircle2, AlertCircle, Wallet } from "lucide-react"

function formatCalculatedAmount(num: number, maxDecimals: number = 8): string {
  if (!Number.isFinite(num) || num <= 0) return ""
  const precision = num < 0.0001 ? Math.min(maxDecimals, 8) : Math.min(maxDecimals, 6)
  const str = num.toFixed(precision)
  return str.includes(".") ? str.replace(/\.?0+$/, "") : str
}

export function TradeChartLimitDialog({
  open,
  onOpenChange,
  snapshot,
  initialPriceUsd,
  initialIsAbove,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  snapshot: TradePairSnapshot | undefined
  initialPriceUsd: number
  initialIsAbove: boolean
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <TradeChartLimitDialogContent
          snapshot={snapshot}
          initialPriceUsd={initialPriceUsd}
          initialIsAbove={initialIsAbove}
          onClose={() => onOpenChange(false)}
        />
      )}
    </AlertDialog>
  )
}

function TradeChartLimitDialogContent({
  snapshot,
  initialPriceUsd,
  initialIsAbove,
  onClose,
}: {
  snapshot: TradePairSnapshot | undefined
  initialPriceUsd: number
  initialIsAbove: boolean
  onClose: () => void
}) {
  const t = useTranslations("marketTrade")
  const { isAuthenticated, identity, login } = useAuth()
  const refreshTradeBalances = useRefreshTradeBalances()
  const { price: icpPriceData } = useIcpPrice()

  const [side, setSide] = useState<"buy" | "sell">(initialIsAbove ? "sell" : "buy")
  const [priceUsdText, setPriceUsdText] = useState(() =>
    initialPriceUsd < 0.0001
      ? initialPriceUsd.toFixed(8)
      : initialPriceUsd < 1
        ? initialPriceUsd.toFixed(6)
        : initialPriceUsd.toFixed(4)
  )
  const [baseAmountText, setBaseAmountText] = useState("")
  const [totalQuoteText, setTotalQuoteText] = useState("")
  const [status, setStatus] = useState<"idle" | "placing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const baseToken = snapshot?.base
  const quoteToken = snapshot?.quote
  const baseSymbol = baseToken?.symbol ?? "TOKEN"
  const quoteSymbol = quoteToken?.symbol ?? "ICP"

  // Derive ICP price in USD
  const icpPriceUsd = useMemo(() => {
    if (icpPriceData?.usd && icpPriceData.usd > 0) return icpPriceData.usd
    if (snapshot?.stats?.priceUsd && snapshot?.priceInIcp && snapshot.priceInIcp > 0) {
      return snapshot.stats.priceUsd / snapshot.priceInIcp
    }
    return 5.0
  }, [icpPriceData, snapshot])

  // Current market price in USD
  const currentPriceUsd = snapshot?.stats?.priceUsd ?? 0

  // Parsed target price in USD & ICP
  const parsedPriceUsd = useMemo(() => {
    const num = parseFloat(priceUsdText.replace(/,/g, ""))
    return Number.isFinite(num) && num > 0 ? num : initialPriceUsd
  }, [priceUsdText, initialPriceUsd])

  const targetPriceInIcp = useMemo(() => {
    if (icpPriceUsd <= 0) return 0
    return parsedPriceUsd / icpPriceUsd
  }, [parsedPriceUsd, icpPriceUsd])

  // Delta vs current market price
  const diffPct = useMemo(() => {
    if (currentPriceUsd <= 0 || parsedPriceUsd <= 0) return 0
    return ((parsedPriceUsd - currentPriceUsd) / currentPriceUsd) * 100
  }, [currentPriceUsd, parsedPriceUsd])

  // Active in/out tokens based on side
  const tokenIn = side === "buy" ? quoteToken : baseToken
  const tokenOut = side === "buy" ? baseToken : quoteToken

  // Trading balance for the asset being spent
  const tradingBal = useTradingBalance(tokenIn?.ledgerId ?? null)
  const tradingBalFormatted = useMemo(() => {
    if (tradingBal === null || !tokenIn) return "0.00"
    return formatTokenAmount(tradingBal, tokenIn.decimals)
  }, [tradingBal, tokenIn])

  // Handle Base Amount input change
  function handleBaseAmountChange(val: string) {
    setBaseAmountText(val)
    setErrorMessage(null)
    const num = parseFloat(val)
    if (Number.isFinite(num) && num > 0 && targetPriceInIcp > 0) {
      const totalIcp = num * targetPriceInIcp
      setTotalQuoteText(formatCalculatedAmount(totalIcp, quoteToken?.decimals ?? 8))
    } else {
      setTotalQuoteText("")
    }
  }

  // Handle Total ICP input change
  function handleTotalQuoteChange(val: string) {
    setTotalQuoteText(val)
    setErrorMessage(null)
    const num = parseFloat(val)
    if (Number.isFinite(num) && num > 0 && targetPriceInIcp > 0) {
      const baseAmt = num / targetPriceInIcp
      setBaseAmountText(formatCalculatedAmount(baseAmt, baseToken?.decimals ?? 8))
    } else {
      setBaseAmountText("")
    }
  }

  // Percentage quick buttons (25%, 50%, 75%, 100%)
  function handlePercent(pct: number) {
    if (tradingBal === null || tradingBal <= 0n || !tokenIn) return
    const targetIn = (tradingBal * BigInt(pct)) / 100n
    if (targetIn <= 0n) return

    const inStr = formatTokenAmount(targetIn, tokenIn.decimals)
    if (side === "buy") {
      setTotalQuoteText(inStr)
      if (targetPriceInIcp > 0) {
        const baseAmt = Number(inStr) / targetPriceInIcp
        setBaseAmountText(formatCalculatedAmount(baseAmt, baseToken?.decimals ?? 8))
      }
    } else {
      setBaseAmountText(inStr)
      if (targetPriceInIcp > 0) {
        const totalIcp = Number(inStr) * targetPriceInIcp
        setTotalQuoteText(formatCalculatedAmount(totalIcp, quoteToken?.decimals ?? 8))
      }
    }
    setErrorMessage(null)
  }

  // Validation
  const calculatedAmountIn = useMemo(() => {
    if (!tokenIn) return null
    const text = side === "buy" ? totalQuoteText : baseAmountText
    return text.trim() ? parseTokenAmount(text, tokenIn.decimals) : null
  }, [baseAmountText, side, tokenIn, totalQuoteText])

  const calculatedMinAmountOut = useMemo(() => {
    if (!tokenOut) return null
    const text = side === "buy" ? baseAmountText : totalQuoteText
    return text.trim() ? parseTokenAmount(text, tokenOut.decimals) : null
  }, [baseAmountText, side, tokenOut, totalQuoteText])

  const isInsufficient = useMemo(() => {
    if (tradingBal === null || !calculatedAmountIn) return false
    return calculatedAmountIn > tradingBal
  }, [calculatedAmountIn, tradingBal])

  const isBelowMinTrade = useMemo(() => {
    if (!totalQuoteText) return false
    const totalNum = parseFloat(totalQuoteText)
    return Number.isFinite(totalNum) && totalNum < MIN_TRADE_ICP
  }, [totalQuoteText])

  // Place Limit Order handler
  async function handleSubmit() {
    if (!isAuthenticated) {
      void login()
      return
    }

    if (!baseToken || !quoteToken || !identity) return

    if (!calculatedAmountIn || calculatedAmountIn <= 0n) {
      setErrorMessage(t("amountLabel") + " is required")
      return
    }

    if (!calculatedMinAmountOut || calculatedMinAmountOut <= 0n) {
      setErrorMessage(t("minReceive") + " is required")
      return
    }

    if (isInsufficient) {
      setErrorMessage(t("notEnough"))
      return
    }

    if (isBelowMinTrade) {
      setErrorMessage(`Minimum trade is ${MIN_TRADE_ICP} ICP`)
      return
    }

    setStatus("placing")
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const inId = side === "buy" ? quoteToken.ledgerId : baseToken.ledgerId
      const outId = side === "buy" ? baseToken.ledgerId : quoteToken.ledgerId

      const res = await placeLimitOrder(
        identity,
        inId,
        outId,
        calculatedAmountIn,
        calculatedMinAmountOut
      )

      if ("ok" in res && res.ok) {
        setStatus("success")
        setSuccessMessage(`Limit order placed at ${formatUsd(parsedPriceUsd, 4)}`)
        await refreshTradeBalances(inId)
        setTimeout(() => {
          onClose()
        }, 1200)
      } else {
        setStatus("error")
        setErrorMessage("err" in res ? res.err : "Failed to place limit order")
      }
    } catch (e) {
      setStatus("error")
      setErrorMessage(e instanceof Error ? e.message : "Failed to place limit order")
    }
  }

  return (
    <AlertDialogContent className="sm:max-w-md gap-4 p-5 bg-card/98 backdrop-blur-xl border border-border shadow-2xl">
      <AlertDialogHeader className="gap-1 text-left">
        <div className="flex items-center justify-between w-full">
          <AlertDialogTitle className="flex items-center gap-2 text-base font-bold">
            <span>{t("placeLimitOrder")}</span>
            <Badge variant="outline" className="font-mono text-[11px] px-2 py-0 border-border/80">
              {baseSymbol} / {quoteSymbol}
            </Badge>
          </AlertDialogTitle>
        </div>
        <AlertDialogDescription className="text-xs text-muted-foreground">
          Execute an automated limit order when {baseSymbol} reaches your target price on the chart.
        </AlertDialogDescription>
      </AlertDialogHeader>

      {/* Side Selector (Buy / Sell) */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/60">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={cn(
            "py-1.5 text-xs font-semibold rounded-lg transition-all text-center cursor-pointer",
            side === "buy"
              ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Buy {baseSymbol}
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={cn(
            "py-1.5 text-xs font-semibold rounded-lg transition-all text-center cursor-pointer",
            side === "sell"
              ? "bg-rose-500/15 border border-rose-500/40 text-rose-400 shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Sell {baseSymbol}
        </button>
      </div>

      {/* Target Limit Price Input */}
      <div className="space-y-1.5 rounded-xl border border-border/80 bg-muted/20 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">{t("limitPrice")}</span>
          <span
            className={cn(
              "font-mono text-[11px] font-semibold",
              diffPct >= 0 ? "text-emerald-500" : "text-rose-500"
            )}
          >
            {diffPct >= 0 ? "+" : ""}
            {diffPct.toFixed(2)}% vs market
          </span>
        </div>

        <div className="relative flex items-center">
          <span className="absolute left-3 text-xs text-muted-foreground font-mono">$</span>
          <Input
            type="text"
            inputMode="decimal"
            value={priceUsdText}
            onChange={(e) => {
              setPriceUsdText(e.target.value)
              setErrorMessage(null)
            }}
            className="pl-7 pr-16 font-mono text-sm h-9 bg-background/80"
            placeholder="0.00"
          />
          <span className="absolute right-3 text-xs text-muted-foreground font-mono">USD</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono px-0.5">
          <span>Equivalent:</span>
          <span className="text-foreground font-medium">
            ≈ {targetPriceInIcp.toFixed(6)} {quoteSymbol}
          </span>
        </div>
      </div>

      {/* Order Amount & Quick Percentages */}
      <div className="space-y-2">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">
              {side === "buy" ? `Amount to Buy (${baseSymbol})` : `Amount to Sell (${baseSymbol})`}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Wallet className="size-3" />
              <span className="font-mono">
                {tradingBalFormatted} {tokenIn?.symbol}
              </span>
            </div>
          </div>

          <div className="relative flex items-center">
            <Input
              type="text"
              inputMode="decimal"
              value={baseAmountText}
              onChange={(e) => handleBaseAmountChange(e.target.value)}
              placeholder="0.0"
              className="pr-16 font-mono text-sm h-9 bg-background/80"
            />
            <span className="absolute right-3 text-xs text-muted-foreground font-mono font-medium">
              {baseSymbol}
            </span>
          </div>
        </div>

        {/* Quick Percent Pills */}
        <div className="grid grid-cols-4 gap-1.5">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => handlePercent(pct)}
              className="rounded-md border border-border/60 bg-muted/40 py-1 text-[11px] font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              {pct === 100 ? "MAX" : `${pct}%`}
            </button>
          ))}
        </div>

        {/* Total Quote Value */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">
              {side === "buy" ? `Total Spend (${quoteSymbol})` : `Total Receive (${quoteSymbol})`}
            </span>
          </div>
          <div className="relative flex items-center">
            <Input
              type="text"
              inputMode="decimal"
              value={totalQuoteText}
              onChange={(e) => handleTotalQuoteChange(e.target.value)}
              placeholder="0.0"
              className="pr-16 font-mono text-sm h-9 bg-background/80"
            />
            <span className="absolute right-3 text-xs text-muted-foreground font-mono font-medium">
              {quoteSymbol}
            </span>
          </div>
        </div>
      </div>

      {/* Order Fee & Status Summary */}
      <div className="rounded-xl border border-border/60 bg-muted/15 p-2.5 space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>{t("makerFee")}</span>
          <span className="font-mono text-foreground font-medium">0.10%</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Order Validity</span>
          <span className="text-foreground">Good &apos;til Cancelled (GTC)</span>
        </div>
      </div>

      {/* Alerts / Error feedback */}
      {errorMessage && (
        <Alert variant="destructive" className="py-2 px-3 text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="py-2 px-3 text-xs flex items-center gap-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
          <AlertDescription className="text-xs">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <AlertDialogFooter className="flex sm:justify-between items-center gap-2 pt-2 border-t border-border/50">
        <AlertDialogCancel className="h-9 px-4 text-xs cursor-pointer">
          {t("cancelOrder")}
        </AlertDialogCancel>

        {!isAuthenticated ? (
          <Button
            type="button"
            onClick={() => void login()}
            className="h-9 px-4 text-xs font-semibold cursor-pointer"
          >
            {t("signInToTrade")}
          </Button>
        ) : (
          <Button
            type="button"
            disabled={
              status === "placing" ||
              status === "success" ||
              !calculatedAmountIn ||
              isInsufficient
            }
            onClick={() => void handleSubmit()}
            className={cn(
              "h-9 px-5 text-xs font-semibold cursor-pointer transition-all",
              side === "buy"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-rose-600 hover:bg-rose-500 text-white"
            )}
          >
            {status === "placing" ? (
              <>
                <Spinner className="size-3.5 mr-1.5" />
                {t("placingOrder")}
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle2 className="size-3.5 mr-1.5" />
                {t("orderPlaced")}
              </>
            ) : isInsufficient ? (
              t("notEnough")
            ) : (
              `${side === "buy" ? "Place Buy Limit" : "Place Sell Limit"}`
            )}
          </Button>
        )}
      </AlertDialogFooter>
    </AlertDialogContent>
  )
}
