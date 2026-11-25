"use client"

import { useMemo, useRef, useState } from "react"
import { formatUsd } from "@/lib/market/format"
import { toPlainTokenAmount } from "@/lib/wallet/utils"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

function formatCalculatedAmount(num: number, maxDecimals = 8): string {
  if (!Number.isFinite(num) || num <= 0) return ""
  const precision = num < 0.0001 ? Math.min(maxDecimals, 8) : Math.min(maxDecimals, 6)
  const str = num.toFixed(precision)
  return str.includes(".") ? str.replace(/\.?0+$/, "") : str
}

export interface UseLimitOrderFormProps {
  side: "buy" | "sell"
  snapshot: TradePairSnapshot | undefined
  baseToken: { decimals: number; symbol?: string; ledgerId: string } | null | undefined
  quoteToken: { decimals: number; symbol?: string; ledgerId: string } | null | undefined
  icpPriceUsd: number
  onResetStatus: () => void
}

export function useLimitOrderForm({
  side,
  snapshot,
  baseToken,
  quoteToken,
  icpPriceUsd,
  onResetStatus,
}: UseLimitOrderFormProps) {
  const [limitPriceMode, setLimitPriceMode] = useState<"quote" | "usd">("quote")
  const [limitPriceText, setLimitPriceText] = useState("")
  const [limitBaseAmountText, setLimitBaseAmountText] = useState("")
  const [limitTotalText, setLimitTotalText] = useState("")
  const lastEditedField = useRef<"amount" | "total">("total")

  const quoteSymbol = snapshot?.quote.symbol ?? "ICP"

  const marketDefaultPrice = useMemo(() => {
    if (limitPriceMode === "usd") {
      const usdVal =
        snapshot?.stats?.priceUsd ??
        (snapshot?.priceInIcp && icpPriceUsd > 0 ? snapshot.priceInIcp * icpPriceUsd : null)
      if (!usdVal || usdVal <= 0) return ""
      return usdVal < 0.0001
        ? usdVal.toFixed(8)
        : usdVal < 1
          ? usdVal.toFixed(6)
          : usdVal >= 1000
            ? usdVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : usdVal.toFixed(2)
    }
    if (!snapshot?.priceInIcp || snapshot.priceInIcp <= 0) return ""
    const icp = snapshot.priceInIcp
    return icp < 0.0001
      ? icp.toFixed(8)
      : icp < 1
        ? icp.toFixed(6)
        : icp >= 1000
          ? icp.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })
          : icp.toFixed(4)
  }, [icpPriceUsd, limitPriceMode, snapshot])

  const effectivePriceText = limitPriceText || marketDefaultPrice

  const effectivePriceInIcp = useMemo(() => {
    const raw = parseFloat(effectivePriceText.replace(/,/g, ""))
    if (Number.isNaN(raw) || raw <= 0) return 0
    if (limitPriceMode === "usd") {
      return icpPriceUsd > 0 ? raw / icpPriceUsd : 0
    }
    return raw
  }, [effectivePriceText, icpPriceUsd, limitPriceMode])

  const convertedPriceSubtext = useMemo(() => {
    const rawNum = parseFloat(effectivePriceText.replace(/,/g, ""))
    if (Number.isNaN(rawNum) || rawNum <= 0) return null
    if (limitPriceMode === "quote") {
      if (icpPriceUsd > 0) {
        return `≈ ${formatUsd(rawNum * icpPriceUsd, 2, { compact: false })}`
      }
    } else {
      if (icpPriceUsd > 0) {
        const inIcp = rawNum / icpPriceUsd
        const formatted =
          inIcp < 0.0001
            ? inIcp.toFixed(8)
            : inIcp < 1
              ? inIcp.toFixed(6)
              : inIcp.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })
        return `≈ ${formatted} ${quoteSymbol}`
      }
    }
    return null
  }, [effectivePriceText, icpPriceUsd, limitPriceMode, quoteSymbol])

  function togglePriceMode() {
    const rawNum = parseFloat(effectivePriceText.replace(/,/g, ""))
    if (limitPriceMode === "quote") {
      if (!Number.isNaN(rawNum) && rawNum > 0 && icpPriceUsd > 0) {
        const inUsd = rawNum * icpPriceUsd
        setLimitPriceText(
          inUsd < 0.0001
            ? inUsd.toFixed(8)
            : inUsd < 1
              ? inUsd.toFixed(6)
              : inUsd >= 1000
                ? inUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : inUsd.toFixed(2)
        )
      } else if (snapshot?.stats?.priceUsd) {
        const usd = snapshot.stats.priceUsd
        setLimitPriceText(
          usd >= 1000
            ? usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : usd.toFixed(2)
        )
      } else {
        setLimitPriceText("")
      }
      setLimitPriceMode("usd")
    } else {
      if (!Number.isNaN(rawNum) && rawNum > 0 && icpPriceUsd > 0) {
        const inIcp = rawNum / icpPriceUsd
        setLimitPriceText(
          inIcp < 0.0001
            ? inIcp.toFixed(8)
            : inIcp < 1
              ? inIcp.toFixed(6)
              : inIcp >= 1000
                ? inIcp.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })
                : inIcp.toFixed(4)
        )
      } else if (snapshot?.priceInIcp) {
        const icp = snapshot.priceInIcp
        setLimitPriceText(
          icp >= 1000
            ? icp.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })
            : icp.toFixed(4)
        )
      } else {
        setLimitPriceText("")
      }
      setLimitPriceMode("quote")
    }
  }

  function handlePriceChange(val: string) {
    setLimitPriceText(val)
    onResetStatus()
    const p = parseFloat(val.replace(/,/g, ""))
    if (!Number.isNaN(p) && p > 0) {
      const pInIcp = limitPriceMode === "usd" ? (icpPriceUsd > 0 ? p / icpPriceUsd : 0) : p
      if (pInIcp > 0) {
        if (lastEditedField.current === "total" || (side === "buy" && limitTotalText)) {
          const tot = parseFloat(limitTotalText.replace(/,/g, ""))
          if (!Number.isNaN(tot) && tot > 0) {
            setLimitBaseAmountText(formatCalculatedAmount(tot / pInIcp, baseToken?.decimals ?? 8))
          } else if (limitBaseAmountText) {
            const amt = parseFloat(limitBaseAmountText.replace(/,/g, ""))
            if (!Number.isNaN(amt) && amt > 0) {
              setLimitTotalText(formatCalculatedAmount(amt * pInIcp, quoteToken?.decimals ?? 8))
            }
          }
        } else {
          const amt = parseFloat(limitBaseAmountText.replace(/,/g, ""))
          if (!Number.isNaN(amt) && amt > 0) {
            setLimitTotalText(formatCalculatedAmount(amt * pInIcp, quoteToken?.decimals ?? 8))
          } else if (limitTotalText) {
            const tot = parseFloat(limitTotalText.replace(/,/g, ""))
            if (!Number.isNaN(tot) && tot > 0) {
              setLimitBaseAmountText(formatCalculatedAmount(tot / pInIcp, baseToken?.decimals ?? 8))
            }
          }
        }
      }
    }
  }

  function handleBaseAmountChange(val: string) {
    lastEditedField.current = "amount"
    setLimitBaseAmountText(val)
    onResetStatus()
    const amt = parseFloat(val.replace(/,/g, ""))
    const p = effectivePriceInIcp
    if (!Number.isNaN(amt) && p > 0) {
      setLimitTotalText(formatCalculatedAmount(amt * p, quoteToken?.decimals ?? 8))
    }
  }

  function handleTotalChange(val: string) {
    lastEditedField.current = "total"
    setLimitTotalText(val)
    onResetStatus()
    const tot = parseFloat(val.replace(/,/g, ""))
    const p = effectivePriceInIcp
    if (!Number.isNaN(tot) && p > 0) {
      setLimitBaseAmountText(formatCalculatedAmount(tot / p, baseToken?.decimals ?? 8))
    }
  }

  function applyLimitFill(rawAmount: bigint, decimals: number) {
    const p = effectivePriceInIcp
    if (side === "buy") {
      lastEditedField.current = "total"
      const totStr = toPlainTokenAmount(rawAmount, decimals)
      setLimitTotalText(totStr)
      if (p > 0) {
        const totNum = parseFloat(totStr.replace(/,/g, ""))
        setLimitBaseAmountText(formatCalculatedAmount(totNum / p, baseToken?.decimals ?? 8))
      }
    } else {
      lastEditedField.current = "amount"
      const amtStr = toPlainTokenAmount(rawAmount, decimals)
      setLimitBaseAmountText(amtStr)
      if (p > 0) {
        const amtNum = parseFloat(amtStr.replace(/,/g, ""))
        setLimitTotalText(formatCalculatedAmount(amtNum * p, quoteToken?.decimals ?? 8))
      }
    }
  }

  function clearLimitAmounts() {
    setLimitBaseAmountText("")
    setLimitTotalText("")
  }

  function snapToMarket() {
    setLimitPriceText("")
    onResetStatus()
    if (!marketDefaultPrice) return
    const p = parseFloat(marketDefaultPrice.replace(/,/g, ""))
    if (Number.isNaN(p) || p <= 0) return
    const pInIcp = limitPriceMode === "usd" ? (icpPriceUsd > 0 ? p / icpPriceUsd : 0) : p
    if (pInIcp <= 0) return
    if (lastEditedField.current === "total" && limitTotalText) {
      const tot = parseFloat(limitTotalText.replace(/,/g, ""))
      if (!Number.isNaN(tot) && tot > 0) {
        setLimitBaseAmountText(formatCalculatedAmount(tot / pInIcp, baseToken?.decimals ?? 8))
      }
    } else if (limitBaseAmountText) {
      const amt = parseFloat(limitBaseAmountText.replace(/,/g, ""))
      if (!Number.isNaN(amt) && amt > 0) {
        setLimitTotalText(formatCalculatedAmount(amt * pInIcp, quoteToken?.decimals ?? 8))
      }
    }
  }

  return {
    limitPriceMode,
    limitPriceText,
    limitBaseAmountText,
    limitTotalText,
    effectivePriceText,
    effectivePriceInIcp,
    convertedPriceSubtext,
    togglePriceMode,
    handlePriceChange,
    handleBaseAmountChange,
    handleTotalChange,
    setLimitBaseAmountText,
    setLimitTotalText,
    applyLimitFill,
    clearLimitAmounts,
    snapToMarket,
  }
}
