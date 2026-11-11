"use client"

import { useEffect, useRef, useState } from "react"
import type { ScopedMutator } from "swr"
import { useTranslations } from "next-intl"
import type { Identity } from "@icp-sdk/core/agent"
import { toast } from "@/components/ui/toast"
import { meetsMinTrade, MIN_TRADE_ICP } from "@/lib/market/minTradeUsd"
import { minAmountOut } from "@/lib/trade/fees"
import { isSwapBlocked } from "@/lib/swap/config"
import { parseTokenAmount } from "@/lib/wallet/utils"
import { tradeBalanceKey } from "@/hooks/trade/useTrade"
import {
  classifyTradeExecError,
  extractRateLimitWaitSeconds,
  formatTradeErrorMessage,
} from "@/lib/market/tradeQuoteError"
import {
  addTradeFill,
  patchTradeFill,
  setTradeFillNotice,
} from "@/lib/market/tradeFillStore"
import { placeLimitOrder, runTrade } from "@/services/trade/trade"
import type { TradeQuoteResult } from "@/services/trade/types"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

export type TradeStatus = "idle" | "error" | "placing_limit"

export interface UseTradeOrderSubmitProps {
  identity: Identity | undefined
  snapshot: TradePairSnapshot | undefined
  tokenIn: { ledgerId: string; decimals: number; symbol?: string; fee: bigint } | null | undefined
  tokenOut: { ledgerId: string; decimals: number; symbol?: string; fee: bigint } | null | undefined
  side: "buy" | "sell"
  orderType: "limit" | "market"
  tradingBal: bigint | null
  quote: TradeQuoteResult | undefined
  applyBalances: (b: { tokenInId: string; tokenOutId: string; amountIn: bigint; amountOut: bigint }) => void
  refreshTradeBalances: (ledgerId: string) => Promise<unknown>
  refreshWallet: () => void
  mutate: ScopedMutator
}

export function useTradeOrderSubmit({
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
}: UseTradeOrderSubmitProps) {
  const t = useTranslations("marketTrade")
  const [status, setStatus] = useState<TradeStatus>("idle")
  const [tradeError, setTradeError] = useState<string | null>(null)
  const [rateLimitCooldown, setRateLimitCooldown] = useState<number>(0)
  const lastClick = useRef(0)

  useEffect(() => {
    if (rateLimitCooldown <= 0) return
    const timer = setInterval(() => {
      setRateLimitCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [rateLimitCooldown])

  async function handlePlaceLimitOrder(opts: {
    effectivePriceText: string
    limitBaseAmountText: string
    limitTotalText: string
    baseToken: { decimals: number; ledgerId: string } | null | undefined
    quoteToken: { decimals: number; ledgerId: string } | null | undefined
    onSuccess: () => void
  }) {
    const { effectivePriceText, limitBaseAmountText, limitTotalText, baseToken, quoteToken, onSuccess } = opts
    if (!baseToken || !quoteToken || !identity) return

    const priceNum = parseFloat(effectivePriceText.replace(/,/g, ""))
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      setStatus("error")
      setTradeError(t("limitPrice") + " must be greater than 0")
      return
    }

    let calculatedAmountIn: bigint | null = null
    let calculatedMinAmountOut: bigint | null = null

    if (side === "buy") {
      calculatedAmountIn = parseTokenAmount(limitTotalText, quoteToken.decimals)
      calculatedMinAmountOut = parseTokenAmount(limitBaseAmountText, baseToken.decimals)
    } else {
      calculatedAmountIn = parseTokenAmount(limitBaseAmountText, baseToken.decimals)
      calculatedMinAmountOut = parseTokenAmount(limitTotalText, quoteToken.decimals)
    }

    if (!calculatedAmountIn || calculatedAmountIn <= 0n) {
      setStatus("error")
      setTradeError(t("amountLabel") + " is required")
      return
    }

    if (!calculatedMinAmountOut || calculatedMinAmountOut <= 0n) {
      setStatus("error")
      setTradeError(t("minReceive") + " is required")
      return
    }

    if (tradingBal === null || calculatedAmountIn > tradingBal) {
      setStatus("error")
      setTradeError(t("notEnough"))
      return
    }

    setStatus("placing_limit")
    setTradeError(null)

    try {
      const inId = side === "buy" ? quoteToken.ledgerId : baseToken.ledgerId
      const outId = side === "buy" ? baseToken.ledgerId : quoteToken.ledgerId
      const res = await placeLimitOrder(identity, inId, outId, calculatedAmountIn, calculatedMinAmountOut)

      if ("ok" in res) {
        setStatus("idle")
        onSuccess()
        toast.add({
          title: t("orderPlaced"),
          type: "success",
        })
        await refreshTradeBalances(inId)
      } else {
        const rawErr = "err" in res ? res.err : "Failed to place limit order"
        const errMessage = formatTradeErrorMessage(rawErr)
        const wait = extractRateLimitWaitSeconds(rawErr)
        if (wait || classifyTradeExecError(rawErr) === "rate_limit") {
          setRateLimitCooldown(wait ?? 5)
        }
        setStatus("error")
        setTradeError(errMessage)
        toast.add({
          title: t("fillFailed"),
          description: errMessage,
          type: "error",
        })
      }
    } catch (e) {
      const errMessage = formatTradeErrorMessage(e)
      const wait = extractRateLimitWaitSeconds(e)
      if (wait || classifyTradeExecError(e) === "rate_limit") {
        setRateLimitCooldown(wait ?? 5)
      }
      setStatus("error")
      setTradeError(errMessage)
      toast.add({
        title: t("fillFailed"),
        description: errMessage,
        type: "error",
      })
    }
  }

  async function handleMarketTrade(amountIn: bigint | null, now: number) {
    if (orderType === "limit") return

    if (now - lastClick.current < 1000) return
    lastClick.current = now

    if (!quote || !tokenIn || !tokenOut || !amountIn || !identity || !snapshot) return
    if (isSwapBlocked(tokenIn.ledgerId) || isSwapBlocked(tokenOut.ledgerId)) return

    const baseMinIcp = side === "sell" ? MIN_TRADE_ICP : MIN_TRADE_ICP / 2
    if (!meetsMinTrade({
      side,
      amountIn,
      tokenInDecimals: tokenIn.decimals,
      priceInIcp: snapshot.priceInIcp,
      quoteOutRaw: quote.amountOutRaw,
      minIcpE8s: BigInt(Math.round(baseMinIcp * 100_000_000)),
    })) {
      return
    }

    const minOut = minAmountOut(quote.amountOut)
    const fillAmount = side === "buy" ? quote.amountOut : amountIn
    const clientId = `trade-${now}-${Math.random().toString(36).slice(2, 8)}`

    setStatus("idle")
    setTradeError(null)

    addTradeFill({
      id: clientId,
      ledgerId: snapshot.baseLedgerId,
      symbol: snapshot.base.symbol,
      isBuy: side === "buy",
      amount: fillAmount,
      decimals: snapshot.base.decimals,
      status: "filling",
      at: now,
    })
    applyBalances({
      tokenInId: tokenIn.ledgerId,
      tokenOutId: tokenOut.ledgerId,
      amountIn,
      amountOut: quote.amountOut,
    })

    try {
      const result = await runTrade(
        identity,
        tokenIn.ledgerId,
        tokenOut.ledgerId,
        amountIn,
        minOut
      )

      if ("err" in result) {
        applyBalances({
          tokenInId: tokenOut.ledgerId,
          tokenOutId: tokenIn.ledgerId,
          amountIn: quote.amountOut,
          amountOut: amountIn,
        })
        patchTradeFill(clientId, { status: "failed" })
        setTradeFillNotice({
          kind: "failed",
          id: clientId,
          isBuy: side === "buy",
          symbol: snapshot.base.symbol,
          amount: fillAmount,
          decimals: snapshot.base.decimals,
          at: now,
        })
        const formattedErr = formatTradeErrorMessage(result.err)
        const wait = extractRateLimitWaitSeconds(result.err)
        if (wait || classifyTradeExecError(result.err) === "rate_limit") {
          setRateLimitCooldown(wait ?? 5)
        }
        setStatus("error")
        setTradeError(formattedErr)
        toast.add({
          title: t("fillFailed"),
          description: formattedErr,
          type: "error",
        })
        return
      }

      const inKey = tradeBalanceKey(identity, tokenIn.ledgerId)
      const outKey = tradeBalanceKey(identity, tokenOut.ledgerId)
      if (inKey) void mutate(inKey)
      if (outKey) void mutate(outKey)
      refreshWallet()
      patchTradeFill(clientId, {
        id: result.ok.txId || clientId,
        amount: side === "buy" ? result.ok.amountOut : result.ok.amountIn,
        status: "filled",
        blockIndex: result.ok.blockIndex,
      })
      setTradeFillNotice({
        kind: "filled",
        id: result.ok.txId || clientId,
        isBuy: side === "buy",
        symbol: snapshot.base.symbol,
        amount: side === "buy" ? result.ok.amountOut : result.ok.amountIn,
        decimals: snapshot.base.decimals,
        at: now,
      })
    } catch (e) {
      applyBalances({
        tokenInId: tokenOut.ledgerId,
        tokenOutId: tokenIn.ledgerId,
        amountIn: quote.amountOut,
        amountOut: amountIn,
      })
      patchTradeFill(clientId, { status: "failed" })
      setTradeFillNotice({
        kind: "failed",
        id: clientId,
        isBuy: side === "buy",
        symbol: snapshot.base.symbol,
        amount: fillAmount,
        decimals: snapshot.base.decimals,
        at: now,
      })
      const formattedErr = formatTradeErrorMessage(e)
      const wait = extractRateLimitWaitSeconds(e)
      if (wait || classifyTradeExecError(e) === "rate_limit") {
        setRateLimitCooldown(wait ?? 5)
      }
      setStatus("error")
      setTradeError(formattedErr)
      toast.add({
        title: t("fillFailed"),
        description: formattedErr,
        type: "error",
      })
    }
  }

  return {
    status,
    setStatus,
    tradeError,
    setTradeError,
    rateLimitCooldown,
    handlePlaceLimitOrder,
    handleMarketTrade,
  }
}
