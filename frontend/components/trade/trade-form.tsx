"use client"

import { useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { motion } from "motion/react"
import { Icon } from "@/components/ui/icon"
import { ReplaceGlassIcon } from "@thesvg/ui-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { TradeConfirmDrawer } from "@/components/trade/trade-confirm-drawer"
import { TradeTokenPicker } from "@/components/trade/trade-token-picker"
import { TradeAmountField } from "@/components/trade/trade-amount-field"
import { TradeFeeSummary } from "@/components/trade/trade-fee-summary"
import { useTradeQuote, useTradeTokens } from "@/hooks/trade/useTrade"
import { defaultSwapPair } from "@/lib/swap/tokens"
import {
  maxTradeInput,
  minAmountOut,
  minTradeInput,
  requiredWalletDebit,
  tradeRate,
} from "@/lib/trade/fees"
import { parseTokenAmount, toPlainTokenAmount, formatTokenAmount } from "@/lib/wallet/utils"
import type { TokenHolding } from "@/services/tokens"
import { runTrade, warmTradeSession } from "@/services/trade/trade"
import type { Identity } from "@icp-sdk/core/agent"

const PERCENTAGES = [25, 50, 75, 100] as const

export type TradeSuccess = {
  amountIn: bigint
  amountOut: bigint
  tokenIn: TokenHolding
  tokenOut: TokenHolding
  beforeIn: bigint
  beforeOut: bigint
}

function TradeFormSkeleton() {
  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <div className="overflow-hidden rounded-(--radius) border border-border/60 bg-card p-4 space-y-4 shadow-sm">
        <div className="space-y-2 rounded-(--radius) bg-muted/20 p-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-16 rounded-md" />
            <Skeleton className="h-3.5 w-24 rounded-md" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-8 w-32 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-(--radius)" />
          </div>
        </div>

        <div className="flex justify-center">
          <Skeleton className="size-10 rounded-(--radius)" />
        </div>

        <div className="space-y-2 rounded-(--radius) bg-muted/20 p-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-20 rounded-md" />
            <Skeleton className="h-3.5 w-20 rounded-md" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-8 w-32 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-(--radius)" />
          </div>
        </div>
      </div>
      <Skeleton className="h-12 w-full rounded-(--radius)" />
    </div>
  )
}

export function TradeForm({
  identity,
  initialTokenIn,
  initialTokenOut,
  onSuccess,
}: {
  identity: Identity | undefined
  initialTokenIn?: string | null
  initialTokenOut?: string | null
  onSuccess: (result: TradeSuccess) => void
}) {
  const t = useTranslations("trade")
  const { tokens, isLoading: tokensLoading } = useTradeTokens()

  const defaultPair = useMemo(() => {
    if (tokens.length < 2) return null
    const from = initialTokenIn ? tokens.find((x) => x.ledgerId === initialTokenIn) : undefined
    const to = initialTokenOut ? tokens.find((x) => x.ledgerId === initialTokenOut) : undefined
    if (from && to && from.ledgerId !== to.ledgerId) return { tokenIn: from, tokenOut: to }
    const pair = defaultSwapPair(tokens)
    if (!pair) return null
    return {
      tokenIn: from ?? pair.tokenIn,
      tokenOut: to ?? pair.tokenOut,
    }
  }, [tokens, initialTokenIn, initialTokenOut])

  const [pickedIn, setPickedIn] = useState<TokenHolding | null>(null)
  const [pickedOut, setPickedOut] = useState<TokenHolding | null>(null)
  const tokenIn = pickedIn ?? defaultPair?.tokenIn ?? null
  const tokenOut = pickedOut ?? defaultPair?.tokenOut ?? null
  const [amountText, setAmountText] = useState("")
  const [picker, setPicker] = useState<"in" | "out" | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trading, setTrading] = useState(false)
  const [flipDegree, setFlipDegree] = useState(0)
  const tradeLock = useRef(false)

  const pickIn = (token: TokenHolding) => {
    setPickedIn(token)
    const out = pickedOut ?? defaultPair?.tokenOut ?? null
    if (out?.ledgerId === token.ledgerId) {
      const alt = tokens.find((x) => x.ledgerId !== token.ledgerId)
      if (alt) setPickedOut(alt)
    }
  }

  const amountIn = tokenIn ? parseTokenAmount(amountText, tokenIn.decimals) : null
  const maxIn = tokenIn === null ? 0n : maxTradeInput(tokenIn.balance, tokenIn.fee)
  const totalDebit =
    amountIn !== null && tokenIn ? requiredWalletDebit(amountIn, tokenIn.fee) : null

  const insufficient =
    amountIn !== null && tokenIn !== null && totalDebit !== null && totalDebit > tokenIn.balance

  const belowMin =
    amountIn !== null && tokenIn !== null && amountIn > 0n && amountIn < minTradeInput(tokenIn.fee)

  const { quote, error: quoteError, isLoading: quoteLoading } = useTradeQuote(
    tokenIn?.ledgerId ?? null,
    tokenOut?.ledgerId ?? null,
    amountIn ?? 0n,
    {
      tokenInFee: tokenIn?.fee,
      tokenOutFee: tokenOut?.fee,
    }
  )

  const rate =
    amountIn !== null && quote && quote.amountOut > 0n && !quoteError
      ? tradeRate(amountIn, quote.amountOut)
      : null

  const quoteMessage = useMemo(() => {
    if (!quoteError) return null
    const msg = quoteError instanceof Error ? quoteError.message : String(quoteError)
    if (msg === "sameToken") return t("sameToken")
    if (msg === "unsupported") return t("unsupported")
    if (msg.includes("liquidity")) return t("noLiquidity")
    return msg
  }, [quoteError, t])

  const canReview =
    tokenIn &&
    tokenOut &&
    tokenIn.ledgerId !== tokenOut.ledgerId &&
    amountIn !== null &&
    amountIn > 0n &&
    !insufficient &&
    !belowMin &&
    quote &&
    quote.amountOut > 0n &&
    !quoteLoading &&
    !quoteError

  const flip = () => {
    if (!tokenIn || !tokenOut) return
    setFlipDegree((prev) => prev + 180)
    setPickedIn(tokenOut)
    setPickedOut(tokenIn)
    setAmountText("")
    setError(null)
  }

  const applyPercent = (pct: number) => {
    if (!tokenIn || maxIn === 0n) return
    const slice = (maxIn * BigInt(pct)) / 100n
    setAmountText(toPlainTokenAmount(slice > 0n ? slice : 0n, tokenIn.decimals))
  }

  const openReview = () => {
    void warmTradeSession(identity)
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    if (!tokenIn || !tokenOut || !amountIn || !quote) return
    if (tradeLock.current) return
    tradeLock.current = true
    setTrading(true)
    setError(null)
    const amountOutMin = minAmountOut(quote.amountOutRaw)
    try {
      const result = await runTrade(
        identity,
        tokenIn.ledgerId,
        tokenOut.ledgerId,
        amountIn,
        amountOutMin
      )
      if ("err" in result) {
        setConfirmOpen(false)
        setError(result.err)
        return
      }
      setConfirmOpen(false)
      onSuccess({
        amountIn,
        amountOut: result.ok.amountOut,
        tokenIn,
        tokenOut,
        beforeIn: tokenIn.balance,
        beforeOut: tokenOut.balance,
      })
    } finally {
      tradeLock.current = false
      setTrading(false)
    }
  }

  if (tokensLoading && tokens.length === 0) {
    return <TradeFormSkeleton />
  }

  if (tokens.length < 2) {
    return (
      <Alert>
        <AlertDescription>{t("needTwoTokens")}</AlertDescription>
      </Alert>
    )
  }

  const receiveText =
    quote && !quoteError && tokenOut
      ? formatTokenAmount(quote.amountOut, tokenOut.decimals)
      : quoteLoading
        ? "…"
        : "0"

  return (
    <>
      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="overflow-hidden rounded-(--radius) border border-border/60 bg-card shadow-sm">
          <TradeAmountField
            label={t("youPay")}
            token={tokenIn}
            amountText={amountText}
            fiatAmount={amountIn}
            onAmountChange={setAmountText}
            onPickToken={() => setPicker("in")}
            balance={tokenIn?.balance}
            maxHint={maxIn}
            onMax={() => applyPercent(100)}
            percentages={PERCENTAGES}
            onPercent={applyPercent}
          />

          <div className="relative border-y border-border/40 py-3">
            <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10 rounded-xl border-4 border-card bg-background shadow-sm hover:bg-muted"
                onClick={flip}
              >
                <motion.span
                  animate={{ rotate: flipDegree }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="flex items-center justify-center"
                >
                  <Icon icon={ReplaceGlassIcon} className="size-5" strokeWidth={2} />
                </motion.span>
                <span className="sr-only">{t("flip")}</span>
              </Button>
            </div>
          </div>

          <TradeAmountField
            label={t("youReceive")}
            token={tokenOut}
            readOnly
            fiatAmount={quote && !quoteError && quote.amountOut > 0n ? quote.amountOut : null}
            amountText={receiveText}
            onPickToken={() => setPicker("out")}
          />
        </div>

        {amountIn !== null && tokenIn && tokenOut && amountIn > 0n && (
          <TradeFeeSummary
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            serviceFee={quote?.serviceFee ?? null}
            poolFee={quote?.swapFee ?? null}
            depositFee={tokenIn.fee}
            totalDebit={totalDebit}
            rate={rate}
          />
        )}

        <div className="space-y-3">
          {belowMin && (
            <Alert variant="destructive">
              <AlertDescription>{t("amountTooSmall")}</AlertDescription>
            </Alert>
          )}
          {insufficient && (
            <Alert variant="destructive">
              <AlertDescription>{t("insufficientBalance")}</AlertDescription>
            </Alert>
          )}
          {quoteMessage && amountIn !== null && amountIn > 0n && (
            <Alert variant="destructive">
              <AlertDescription>{quoteMessage}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            className="h-12 w-full rounded-full text-base font-semibold"
            disabled={!canReview}
            onClick={openReview}
          >
            {quoteLoading ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-4" />
                <span>Quoting</span>
              </span>
            ) : (
              t("review")
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">{t("processHint")}</p>
        </div>
      </div>

      <TradeTokenPicker
        open={picker === "in"}
        onOpenChange={(o) => setPicker(o ? "in" : null)}
        tokens={tokens}
        selectedId={tokenIn?.ledgerId ?? null}
        onSelect={pickIn}
        title={t("selectPay")}
      />
      <TradeTokenPicker
        open={picker === "out"}
        onOpenChange={(o) => setPicker(o ? "out" : null)}
        tokens={tokens.filter((x) => x.ledgerId !== tokenIn?.ledgerId)}
        selectedId={tokenOut?.ledgerId ?? null}
        onSelect={(token) => setPickedOut(token)}
        title={t("selectReceive")}
      />

      <TradeConfirmDrawer
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        identity={identity}
        tokenIn={tokenIn}
        tokenOut={tokenOut}
        amountIn={amountIn}
        amountOut={quote?.amountOut ?? null}
        trading={trading}
        onConfirm={handleConfirm}
      />
    </>
  )
}
