"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { sweepToCustody, withdrawFromPrincipal } from "@/services/sweep/sweep"
import { syncDeposits } from "@/services/deposit/deposit"
import { useAuth } from "@/components/auth/auth-provider"
import { useDepositAddress, useLedgerSupported, useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { useBalanceVisibility } from "@/components/wallet/balance-visibility-provider"
import type { TokenHolding } from "@/services/tokens"

export function SelfCustodyCard({
  token,
  balance,
}: {
  token: TokenHolding
  balance: bigint
}) {
  const t = useTranslations("token")
  const tc = useTranslations("common")
  const { identity } = useAuth()
  const { data: deposit } = useDepositAddress()
  const refreshWallet = useRefreshWallet()
  const { supported, isLoading: checkingSupport } = useLedgerSupported(token.ledgerId)
  const { hidden } = useBalanceVisibility()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<"moved" | "withdrawn" | null>(null)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [destination, setDestination] = useState("")

  const net = balance > token.fee ? balance - token.fee : 0n
  const full = (v: bigint) => formatTokenAmount(v, token.decimals, token.decimals)
  const displayAmount = (v: bigint) => (hidden ? "••••••" : full(v))
  const canMove = supported === true && net > 0n
  const externalOnly = supported === false && net > 0n
  const withdrawFormOpen = externalOnly || showWithdraw

  const handleSweep = async () => {
    if (!deposit || !canMove || loading) return
    setLoading(true)
    setError(null)

    const result = await sweepToCustody(identity, token.ledgerId, deposit.address.owner, net)

    if ("err" in result) {
      setError(result.err)
      setLoading(false)
      return
    }

    await syncDeposits(identity, token.ledgerId)

    setDone("moved")
    setLoading(false)
    refreshWallet()
  }

  const handleWithdraw = async () => {
    if (net <= 0n || loading) return
    setLoading(true)
    setError(null)

    const result = await withdrawFromPrincipal(identity, token.ledgerId, destination, net)

    if ("err" in result) {
      setError(result.err)
      setLoading(false)
      return
    }

    setDone("withdrawn")
    setLoading(false)
    refreshWallet()
  }

  if (done) {
    return (
      <Alert className="border-success/40 bg-success/10">
        <AlertDescription>
          {done === "moved"
            ? t("selfCustodyMoved")
            : t("selfCustodyWithdrawn", { amount: displayAmount(net), symbol: token.symbol })}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div
      className={`space-y-3 rounded-2xl border p-4 ${
        net > 0n ? "border-warning/40 bg-warning/5" : "bg-muted/30"
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-semibold">{t("selfCustodyTitle")}</h3>
          <span className="shrink-0 text-sm tabular-nums">
            {displayAmount(balance)} {token.symbol}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {balance === 0n
            ? t("selfCustodyEmpty")
            : t("selfCustodyBody", { amount: displayAmount(balance), symbol: token.symbol })}
        </p>
      </div>

      {net > 0n ? (
        <>
          <div className="space-y-1.5 rounded-xl bg-background/60 p-3">
            <Row label={tc("fee")} value={`${full(token.fee)} ${token.symbol}`} />
            <Row
              label={t("selfCustodyNet")}
              value={`${displayAmount(net)} ${token.symbol}`}
              emphasis
            />
          </div>

          {supported === false && (
            <Alert>
              <AlertDescription>{t("selfCustodyUnsupported")}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {canMove && !withdrawFormOpen && (
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={handleSweep}
                disabled={loading || !deposit || checkingSupport}
              >
                {loading && <Spinner data-icon="inline-start" />}
                <span>{loading ? t("selfCustodyMoving") : t("selfCustodyMove")}</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setError(null)
                  setShowWithdraw(true)
                }}
              >
                {t("selfCustodyOrExternal")}
              </Button>
            </div>
          )}

          {withdrawFormOpen && (
            <div className="space-y-2.5">
              <div className="space-y-1.5">
                <Label htmlFor={`self-custody-dest-${token.ledgerId}`} className="text-xs">
                  {t("selfCustodyDestLabel")}
                </Label>
                <Input
                  id={`self-custody-dest-${token.ledgerId}`}
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value)
                    setError(null)
                  }}
                  placeholder={t("selfCustodyDestPlaceholder")}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="font-mono text-xs"
                />
              </div>

              <div className="flex gap-2">
                {canMove && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setError(null)
                      setShowWithdraw(false)
                    }}
                    disabled={loading}
                  >
                    {tc("cancel")}
                  </Button>
                )}
                <Button
                  className="flex-1"
                  onClick={handleWithdraw}
                  disabled={loading || !destination.trim()}
                >
                  {loading && <Spinner data-icon="inline-start" />}
                  <span>{loading ? t("selfCustodyWithdrawing") : t("selfCustodyWithdraw")}</span>
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        balance > 0n && (
          <p className="text-xs text-muted-foreground">
            {t("selfCustodyDust", { symbol: token.symbol })}
          </p>
        )
      )}
    </div>
  )
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className={`break-all text-right ${emphasis ? "font-semibold tabular-nums" : "tabular-nums"}`}>
        {value}
      </span>
    </div>
  )
}
