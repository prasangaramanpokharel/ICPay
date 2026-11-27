"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/components/auth/auth-provider"
import { useTradingBalance } from "@/hooks/trade/useTrade"
import { useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { withdrawFromTrade } from "@/services/trade/trade"

export function TradeRecoveryCard({
  ledgerId,
  symbol,
  decimals,
  fee = 0n,
  pendingSwapHint = false,
}: {
  ledgerId: string
  symbol: string
  decimals: number
  fee?: bigint
  pendingSwapHint?: boolean
}) {
  const t = useTranslations("trade")
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const { balance, isLoading, refresh } = useTradingBalance(ledgerId, Boolean(identity))
  const [withdrawing, setWithdrawing] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [recovered, setRecovered] = useState(false)

  const withdrawable = balance > fee

  if (isLoading && !pendingSwapHint) return null
  if (!withdrawable && !pendingSwapHint && !recovered) return null

  const handleWithdraw = async () => {
    if (!identity || !withdrawable || withdrawing) return
    setWithdrawing(true)
    setErr(null)
    try {
      const res = await withdrawFromTrade(identity, ledgerId, balance)
      if ("err" in res) {
        setErr(res.err)
        return
      }
      setRecovered(true)
      await Promise.all([refresh(), refreshWallet()])
    } finally {
      setWithdrawing(false)
    }
  }

  if (recovered) {
    return (
      <Alert className="border-success/40 bg-success/10 text-foreground">
        <AlertDescription>{t("recoverSuccess", { symbol })}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-3 rounded-xl border border-warning/40 bg-warning/5 p-3.5 text-xs">
      <div className="space-y-1">
        <AlertTitle className="text-xs font-semibold text-foreground">
          {withdrawable ? t("recoverAvailableTitle") : t("pendingSwapTitle")}
        </AlertTitle>
        <AlertDescription className="text-xs leading-relaxed text-muted-foreground">
          {withdrawable
            ? t("recoverAvailableBody", {
                amount: formatTokenAmount(balance, decimals),
                symbol,
              })
            : t("pendingSwapBody")}
        </AlertDescription>
      </div>

      {err && <p className="text-xs font-medium text-destructive">{err}</p>}

      {withdrawable && (
        <Button
          size="sm"
          variant="secondary"
          className="h-9 w-full font-semibold"
          disabled={withdrawing}
          onClick={handleWithdraw}
        >
          {withdrawing && <Spinner data-icon="inline-start" />}
          {withdrawing
            ? t("withdrawingTrade")
            : t("withdrawToWallet", {
                amount: formatTokenAmount(balance, decimals),
                symbol,
              })}
        </Button>
      )}
    </div>
  )
}
