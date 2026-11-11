"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { useTranslations } from "next-intl"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ShineBorder } from "@/components/ui/shine-border"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useAuth } from "@/components/auth/auth-provider"
import { useDebounced } from "@/hooks/ui/useDebounced"
import {
  useApplyTradeBalances,
  useRefreshTradeBalances,
  useTradeTokens,
  useTradingBalance,
} from "@/hooks/trade/useTrade"
import { useRefreshWallet, useTokenHolding } from "@/hooks/wallet/useWalletData"
import { parseTokenAmount } from "@/lib/wallet/utils"
import {
  tradeOrderAlert,
  tradeOrderBlock,
  tradeImpactAlert,
  canSubmitTrade,
} from "@/lib/market/tradeOrderBlock"
import {
  classifyTradeQuoteError,
  shouldRetryTradeQuote,
} from "@/lib/market/tradeQuoteError"
import {
  estimatePriceImpactPct,
  isTradeTokenSafe,
  priceImpactBand,
  shouldQuoteTrade,
} from "@/lib/market/tradePreflight"
import { isSwapBlocked } from "@/lib/swap/config"
import { tradeCta } from "@/lib/market/tradeAuthUi"
import { maxTradeInput } from "@/lib/trade/fees"
import { meetsMinTrade, MIN_TRADE_ICP, tokenAmountUsd } from "@/lib/market/minTradeUsd"
import { mergePositionBalances } from "@/lib/market/availableAssets"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import { fetchTradeQuoteChecked, warmTradeSession } from "@/services/trade/trade"
import type { TerminalPairRow, TradePairSnapshot } from "@/services/market/tradePairSnapshot"
import { useLimitOrderForm } from "@/hooks/trade/useLimitOrderForm"
import { useTradeOrderSubmit } from "@/hooks/trade/useTradeOrderSubmit"
import { TradeAvailableAssets } from "./trade-available-assets"
import { TradeDepositDrawer } from "./trade-deposit-drawer"
import { TradeOrderBalanceBar } from "./trade-order-balance-bar"
import { TradeLimitInputs } from "./trade-limit-inputs"
import { TradeMarketInputs } from "./trade-market-inputs"
import { TradeOrderAlerts } from "./trade-order-alerts"
import { TradeSubmitButton } from "./trade-submit-button"

export function TradeOrderPanel({
  snapshot,
  loading,
  rows,
  activeBaseId,
  listLoading,
  onSelectPair,
  onOpenWalletTrade,
}: {
  snapshot: TradePairSnapshot | undefined
  loading?: boolean
  rows: TerminalPairRow[]
  activeBaseId: string
  listLoading?: boolean
  onSelectPair: (baseLedgerId: string) => void
  onOpenWalletTrade: () => void
}) {
  const t = useTranslations("marketTrade")
  const { isAuthenticated, isLoading: authLoading, identity } = useAuth()
  const applyBalances = useApplyTradeBalances()
  const refreshTradeBalances = useRefreshTradeBalances()
  const refreshWallet = useRefreshWallet()
  const { mutate } = useSWRConfig()
  const { price: icpPrice } = useIcpPrice()
  const { swapHoldings, tradeBalances } = useTradeTokens()

  const positionBalances = useMemo(
    () => mergePositionBalances(swapHoldings, tradeBalances),
    [swapHoldings, tradeBalances]
  )

  const availableAssets = (
    <TradeAvailableAssets
      rows={rows}
      balances={positionBalances}
      activeBaseId={activeBaseId}
      loading={listLoading}
      onSelect={onSelectPair}
    />
  )

  useEffect(() => {
    void warmTradeSession(identity)
  }, [identity])

  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [orderType, setOrderType] = useState<"limit" | "market">("limit")
  const [impactConfirmed, setImpactConfirmed] = useState(false)
  const [depositDrawerOpen, setDepositDrawerOpen] = useState(false)
  const [marketAmountText, setMarketAmountText] = useState("")

  const { price: icpPriceData } = useIcpPrice()
  const icpPriceUsd = useMemo(() => {
    if (icpPriceData?.usd && icpPriceData.usd > 0) return icpPriceData.usd
    if (snapshot?.stats?.priceUsd && snapshot?.priceInIcp && snapshot.priceInIcp > 0) {
      return snapshot.stats.priceUsd / snapshot.priceInIcp
    }
    return 0
  }, [icpPriceData, snapshot])

  const baseSymbol = snapshot?.base.symbol ?? ""
  const quoteSymbol = snapshot?.quote.symbol ?? "ICP"
  const baseToken = snapshot?.base
  const quoteToken = snapshot?.quote
  const tokenIn = side === "buy" ? quoteToken : baseToken
  const tokenOut = side === "buy" ? baseToken : quoteToken

  const tradingBal = useTradingBalance(tokenIn?.ledgerId ?? null)
  const { token: walletToken } = useTokenHolding(isAuthenticated ? (tokenIn?.ledgerId ?? null) : null)
  const walletBal = walletToken?.balance ?? 0n

  const limitForm = useLimitOrderForm({
    side,
    snapshot,
    baseToken,
    quoteToken,
    icpPriceUsd,
    onResetStatus: () => {
      submitState.setStatus("idle")
      submitState.setTradeError(null)
    },
  })

  const amountIn = useMemo(() => {
    if (orderType === "market") {
      if (!marketAmountText.trim() || !tokenIn) return null
      return parseTokenAmount(marketAmountText, tokenIn.decimals)
    }
    if (side === "buy") {
      if (!limitForm.limitTotalText.trim() || !quoteToken) return null
      return parseTokenAmount(limitForm.limitTotalText, quoteToken.decimals)
    }
    if (!limitForm.limitBaseAmountText.trim() || !baseToken) return null
    return parseTokenAmount(limitForm.limitBaseAmountText, baseToken.decimals)
  }, [baseToken, limitForm.limitBaseAmountText, limitForm.limitTotalText, marketAmountText, orderType, quoteToken, side, tokenIn])

  const debouncedIn = useDebounced(amountIn, 400)
  const tokenBlocked = Boolean(
    tokenIn &&
      tokenOut &&
      (isSwapBlocked(tokenIn.ledgerId) ||
        isSwapBlocked(tokenOut.ledgerId) ||
        !isTradeTokenSafe(tokenIn) ||
        !isTradeTokenSafe(tokenOut))
  )
  const hasPool = Boolean(snapshot?.pool)

  const payUsdNow = (() => {
    if (!amountIn || !tokenIn || !snapshot) return null
    if (side === "buy") return tokenAmountUsd(amountIn, tokenIn.decimals, icpPrice?.usd ?? 0)
    const tokenUsd =
      snapshot.stats?.priceUsd && snapshot.stats.priceUsd > 0
        ? snapshot.stats.priceUsd
        : snapshot.priceInIcp && icpPrice?.usd
          ? snapshot.priceInIcp * icpPrice.usd
          : 0
    return tokenAmountUsd(amountIn, tokenIn.decimals, tokenUsd)
  })()

  const impactPct = estimatePriceImpactPct(payUsdNow, snapshot?.stats?.tvlUsd ?? null)
  const impactBand = priceImpactBand(impactPct)
  const canQuote = shouldQuoteTrade({
    hasPool,
    blocked: tokenBlocked,
    amountIn: debouncedIn,
    impactBand,
  })

  const { data: quote, error: quoteErr, isLoading: quoting } = useSWR(
    orderType === "market" && canQuote
      ? ["terminal-quote", side, snapshot!.baseLedgerId, debouncedIn!.toString()]
      : null,
    () =>
      fetchTradeQuoteChecked(
        identity,
        tokenIn!.ledgerId,
        tokenOut!.ledgerId,
        debouncedIn!,
        { skipAllowlistCheck: true, tokenInFee: tokenIn!.fee, tokenOutFee: tokenOut!.fee }
      ),
    {
      revalidateOnFocus: false,
      dedupingInterval: 15_000,
      shouldRetryOnError: shouldRetryTradeQuote,
      errorRetryCount: 1,
    }
  )
  const quoteError = quoteErr ? classifyTradeQuoteError(quoteErr) : null

  const submitState = useTradeOrderSubmit({
    identity,
    snapshot,
    tokenIn,
    tokenOut,
    side,
    orderType,
    tradingBal,
    quote,
    applyBalances,
    refreshTradeBalances,
    refreshWallet,
    mutate,
  })

  const currentFillPercent = useMemo(() => {
    if (!tradingBal || !tokenIn) return 0
    const maxIn = maxTradeInput(tradingBal, tokenIn.fee)
    if (maxIn <= 0n) return 0

    let currentIn: bigint | null = null
    if (orderType === "market") {
      currentIn = marketAmountText.trim() ? parseTokenAmount(marketAmountText, tokenIn.decimals) : null
    } else {
      if (side === "buy") {
        currentIn = limitForm.limitTotalText.trim() && quoteToken ? parseTokenAmount(limitForm.limitTotalText, quoteToken.decimals) : null
      } else {
        currentIn = limitForm.limitBaseAmountText.trim() && baseToken ? parseTokenAmount(limitForm.limitBaseAmountText, baseToken.decimals) : null
      }
    }

    if (!currentIn || currentIn <= 0n) return 0
    const pct = Number((currentIn * 10000n) / maxIn) / 100
    return Math.min(100, Math.max(0, Math.round(pct)))
  }, [baseToken, limitForm.limitBaseAmountText, limitForm.limitTotalText, marketAmountText, orderType, quoteToken, side, tokenIn, tradingBal])

  function applyFill(pct: number) {
    if (!tradingBal || !tokenIn) return
    setImpactConfirmed(false)
    if (pct <= 0) {
      if (orderType === "market") {
        setMarketAmountText("")
      } else {
        limitForm.clearLimitAmounts()
      }
      return
    }
    const maxIn = maxTradeInput(tradingBal, tokenIn.fee)
    const raw = (maxIn * BigInt(pct)) / 100n

    if (orderType === "market") {
      setMarketAmountText(raw > 0n ? (Number(raw) / 10 ** tokenIn.decimals).toString() : "")
      return
    }

    limitForm.applyLimitFill(raw, tokenIn.decimals)
  }

  if (loading && !snapshot) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center p-8">
        <Spinner className="size-7 text-muted-foreground/60" />
      </div>
    )
  }

  if (!snapshot) {
    return isAuthenticated ? (
      <div className="flex h-full min-h-0 flex-col">{availableAssets}</div>
    ) : null
  }

  const paySymbol = tokenIn?.symbol ?? ""
  const receiveSymbol = tokenOut?.symbol ?? ""
  const hasAmount = Boolean(amountIn && amountIn > 0n)
  const maxIn = tradingBal !== null && tokenIn ? maxTradeInput(tradingBal, tokenIn.fee) : 0n
  const payUsd = payUsdNow

  const aboveMinIcp = meetsMinTrade({
    side,
    amountIn,
    tokenInDecimals: tokenIn?.decimals ?? 8,
    priceInIcp: snapshot.priceInIcp,
    quoteOutRaw: quote?.amountOutRaw,
  })

  const block = tradeOrderBlock({
    tradingBal: tradingBal ?? 0n,
    amountIn,
    maxIn,
    aboveMinIcp,
    hasQuote: !!quote,
    blocked: tokenBlocked,
    hasPool,
    quoting,
    quoteError,
    impactBand,
  })

  const guard =
    tradeOrderAlert(block, MIN_TRADE_ICP, quoteError) ??
    (canSubmitTrade(block) ? tradeImpactAlert(impactBand, impactPct) : null)
  const needsImpactConfirm = impactBand === "confirm" && !impactConfirmed
  const cta = tradeCta(authLoading, isAuthenticated)

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto pb-1">
      <Card size="sm" className="relative m-1 shrink-0 gap-0 overflow-hidden py-0">
        <ShineBorder
          borderWidth={1}
          duration={14}
          shineColor={
            side === "buy"
              ? ["var(--success)", "var(--primary)", "var(--accent)"]
              : ["var(--destructive)", "var(--warning)", "var(--destructive)"]
          }
          className="opacity-30 dark:opacity-40"
        />
        <div className="relative z-10 flex min-h-0 flex-col">
          <div className="p-2 pb-1.5">
            <ToggleGroup
              value={[side]}
              onValueChange={(val) => {
                const s = val[0] as "buy" | "sell" | undefined
                if (!s) return
                setSide(s)
                setMarketAmountText("")
                submitState.setStatus("idle")
                submitState.setTradeError(null)
                setImpactConfirmed(false)
              }}
              className="grid w-full grid-cols-2 gap-1.5 rounded-xl bg-muted/40 p-1"
            >
              <ToggleGroupItem
                value="buy"
                className="h-8 rounded-lg font-bold transition-all data-[state=on]:bg-success data-[state=on]:text-success-foreground data-[state=on]:shadow-xs hover:bg-muted"
              >
                {t("buy")} {baseSymbol}
              </ToggleGroupItem>
              <ToggleGroupItem
                value="sell"
                className="h-8 rounded-lg font-bold transition-all data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground data-[state=on]:shadow-xs hover:bg-muted"
              >
                {t("sell")} {baseSymbol}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex min-h-0 flex-col gap-2.5 overflow-y-auto px-4 pb-3 pt-0">
            <TradeOrderBalanceBar
              orderType={orderType}
              onOrderTypeChange={(mode) => {
                setOrderType(mode)
                submitState.setTradeError(null)
              }}
              isAuthenticated={isAuthenticated}
              tokenIn={tokenIn}
              tradingBal={tradingBal}
              walletBal={walletBal}
              paySymbol={paySymbol}
              onOpenDeposit={() => setDepositDrawerOpen(true)}
              onOpenTransfer={onOpenWalletTrade}
            />

            {orderType === "limit" ? (
              <TradeLimitInputs
                effectivePriceText={limitForm.effectivePriceText}
                onPriceChange={limitForm.handlePriceChange}
                limitPriceMode={limitForm.limitPriceMode}
                onTogglePriceMode={limitForm.togglePriceMode}
                convertedPriceSubtext={limitForm.convertedPriceSubtext}
                quoteSymbol={quoteSymbol}
                baseSymbol={baseSymbol}
                limitBaseAmountText={limitForm.limitBaseAmountText}
                onBaseAmountChange={limitForm.handleBaseAmountChange}
                limitTotalText={limitForm.limitTotalText}
                onTotalChange={limitForm.handleTotalChange}
                currentFillPercent={currentFillPercent}
                onApplyFill={applyFill}
                isAuthenticated={isAuthenticated}
                tradingBal={tradingBal}
                icpPriceUsd={icpPriceUsd}
              />
            ) : (
              <TradeMarketInputs
                marketAmountText={marketAmountText}
                onMarketAmountChange={(val) => {
                  setMarketAmountText(val)
                  submitState.setStatus("idle")
                  submitState.setTradeError(null)
                  setImpactConfirmed(false)
                }}
                paySymbol={paySymbol}
                receiveSymbol={receiveSymbol}
                tokenIn={tokenIn}
                tokenOut={tokenOut}
                hasAmount={hasAmount}
                payUsd={payUsd}
                currentFillPercent={currentFillPercent}
                onApplyFill={applyFill}
                isAuthenticated={isAuthenticated}
                tradingBal={tradingBal}
                canQuote={canQuote}
                quote={quote}
                quoting={quoting}
              />
            )}

            <TradeOrderAlerts
              orderType={orderType}
              guard={guard}
              status={submitState.status}
              tradeError={submitState.tradeError}
              onDismissError={() => submitState.setTradeError(null)}
              onOpenDeposit={() => setDepositDrawerOpen(true)}
            />

            <TradeSubmitButton
              cta={cta}
              side={side}
              orderType={orderType}
              status={submitState.status}
              rateLimitCooldown={submitState.rateLimitCooldown}
              baseSymbol={baseSymbol}
              block={block}
              needsImpactConfirm={needsImpactConfirm}
              effectivePriceText={limitForm.effectivePriceText}
              limitBaseAmountText={limitForm.limitBaseAmountText}
              limitTotalText={limitForm.limitTotalText}
              onSubmitLimitOrder={() =>
                void submitState.handlePlaceLimitOrder({
                  effectivePriceText: limitForm.effectivePriceText,
                  limitBaseAmountText: limitForm.limitBaseAmountText,
                  limitTotalText: limitForm.limitTotalText,
                  baseToken,
                  quoteToken,
                  onSuccess: limitForm.clearLimitAmounts,
                })
              }
              onOpenWalletTrade={onOpenWalletTrade}
              onConfirmImpact={() => setImpactConfirmed(true)}
              onSubmitTrade={() => void submitState.handleMarketTrade(amountIn, Date.now())}
            />

            <p className="text-center text-[10px] leading-snug text-muted-foreground/50">
              {t("orderDisclaimer")}
            </p>
          </div>
        </div>
      </Card>

      {isAuthenticated ? (
        <div className="flex min-h-0 flex-1 flex-col">{availableAssets}</div>
      ) : null}

      <TradeDepositDrawer
        open={depositDrawerOpen}
        onOpenChange={setDepositDrawerOpen}
        onOpenTransfer={onOpenWalletTrade}
      />
    </div>
  )
}
