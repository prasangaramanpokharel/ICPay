"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import useSWR from "swr"
import { HugeiconsIcon } from "@hugeicons/react"
import { Exchange01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { SuccessTick } from "@/components/ui/success-tick"
import { useAuth } from "@/components/auth/auth-provider"
import { useApplyInternalTransfer, tradeBalanceKey } from "@/hooks/trade/useTrade"
import { useTokenHolding } from "@/hooks/wallet/useWalletData"
import { maxTradeInput } from "@/lib/trade/fees"
import { tradePairPath } from "@/lib/market/pairSlug"
import { playSuccessChime } from "@/lib/ui/successChime"
import { formatTokenAmount, parseTokenAmount, toPlainTokenAmount } from "@/lib/wallet/utils"
import { depositForTrade, getTradingBalance, withdrawFromTrade } from "@/services/trade/trade"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

export function TradeWalletDialog({
  open,
  onOpenChange,
  snapshot,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  snapshot: TradePairSnapshot | null
}) {
  const t = useTranslations("marketTrade")
  const tc = useTranslations("common")
  const { identity, isAuthenticated } = useAuth()
  const applyTransfer = useApplyInternalTransfer()

  const tokens = useMemo(() => {
    if (!snapshot) return []
    const list = [snapshot.base, snapshot.quote]
    return list.filter((tok, i) => list.findIndex((x) => x.ledgerId === tok.ledgerId) === i)
  }, [snapshot])

  const [pickedLedger, setPickedLedger] = useState<string | null>(null)
  const [toWallet, setToWallet] = useState(true)
  const [amountText, setAmountText] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [doneAmount, setDoneAmount] = useState(0n)

  function handleOpenChange(next: boolean) {
    if (!next) {
      setPickedLedger(null)
      setToWallet(true)
      setAmountText("")
      setBusy(false)
      setError(null)
      setDone(false)
      setDoneAmount(0n)
    }
    onOpenChange(next)
  }

  const ledgerId =
    pickedLedger && tokens.some((tok) => tok.ledgerId === pickedLedger)
      ? pickedLedger
      : snapshot?.baseLedgerId ?? ""

  const token = tokens.find((tok) => tok.ledgerId === ledgerId) ?? tokens[0]
  const { token: holding } = useTokenHolding(token?.ledgerId ?? null)
  const { data: tradeBal } = useSWR(
    identity && token ? tradeBalanceKey(identity, token.ledgerId) : null,
    () => getTradingBalance(identity, token!.ledgerId),
    { revalidateOnFocus: false, dedupingInterval: 8_000 }
  )

  const available = toWallet ? (tradeBal ?? 0n) : (holding?.balance ?? 0n)
  const maxAmount = toWallet ? available : maxTradeInput(available, token?.fee ?? 0n)
  const amount = token ? parseTokenAmount(amountText, token.decimals) : null
  const loginHref = snapshot
    ? `/login?next=${encodeURIComponent(tradePairPath(snapshot.base.symbol))}`
    : "/login"

  async function submit() {
    if (!identity || !token || amount == null || amount <= 0n || amount > maxAmount) return
    setBusy(true)
    setError(null)
    const result = toWallet
      ? await withdrawFromTrade(identity, token.ledgerId, amount)
      : await depositForTrade(identity, token.ledgerId, amount)
    setBusy(false)
    if ("err" in result) {
      setError(result.err)
      return
    }
    applyTransfer({
      ledgerId: token.ledgerId,
      amount,
      toWallet,
      ledgerFee: token.fee,
      tradeBefore: tradeBal ?? 0n,
      walletBefore: holding?.balance ?? 0n,
    })
    setDoneAmount(amount)
    setDone(true)
    playSuccessChime()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!done}>
        {done && token ? (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <SuccessTick size="sm" />
            <DialogHeader className="items-center text-center">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                {t("transferSuccess")}
              </DialogTitle>
              <DialogDescription>
                {formatTokenAmount(doneAmount, token.decimals)} {token.symbol}
                {" · "}
                {toWallet ? t("tradingAccount") : t("mainWallet")} →{" "}
                {toWallet ? t("mainWallet") : t("tradingAccount")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="w-full sm:justify-center">
              <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
                {tc("done")}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("transfer")}</DialogTitle>
              <DialogDescription>{t("transferHint")}</DialogDescription>
            </DialogHeader>
            <FieldGroup className="gap-4">
              <div className="flex items-center gap-2">
                <AccountCard
                  label={t("from")}
                  value={toWallet ? t("tradingAccount") : t("mainWallet")}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="size-8 shrink-0 rounded-full border-border/80 bg-background shadow-xs hover:bg-muted"
                  onClick={() => {
                    setToWallet((v) => !v)
                    setAmountText("")
                    setError(null)
                  }}
                  aria-label="Switch transfer direction"
                >
                  <HugeiconsIcon
                    icon={Exchange01Icon}
                    className="size-4 text-muted-foreground"
                    strokeWidth={2}
                  />
                </Button>
                <AccountCard
                  label={t("to")}
                  value={toWallet ? t("mainWallet") : t("tradingAccount")}
                />
              </div>

              <div className="flex items-center gap-1.5">
                {tokens.map((tok) => {
                  const isSelected = tok.ledgerId === token?.ledgerId
                  return (
                    <Button
                      key={tok.ledgerId}
                      type="button"
                      size="sm"
                      variant={isSelected ? "default" : "secondary"}
                      className="rounded-full px-3 text-xs"
                      onClick={() => {
                        setPickedLedger(tok.ledgerId)
                        setAmountText("")
                        setError(null)
                      }}
                    >
                      {tok.symbol}
                    </Button>
                  )
                })}
              </div>

              <Field className="gap-2">
                <div className="flex min-h-6 items-center justify-between gap-2">
                  <FieldLabel htmlFor="transfer-amount">{t("amountLabel")}</FieldLabel>
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    className="h-auto p-0 text-xs font-semibold text-primary hover:no-underline"
                    disabled={maxAmount <= 0n || !token}
                    onClick={() =>
                      token && setAmountText(toPlainTokenAmount(maxAmount, token.decimals))
                    }
                  >
                    {tc("max")}
                  </Button>
                </div>
                <Input
                  id="transfer-amount"
                  inputMode="decimal"
                  placeholder="0"
                  value={amountText}
                  onChange={(e) => {
                    setAmountText(e.target.value)
                    setError(null)
                  }}
                />
                <FieldDescription>
                  {t("balance")}{" "}
                  <span className="font-medium text-foreground">
                    {token ? `${formatTokenAmount(available, token.decimals)} ${token.symbol}` : "—"}
                  </span>
                </FieldDescription>
                {error ? <FieldError>{error}</FieldError> : null}
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                {tc("cancel")}
              </DialogClose>
              {isAuthenticated ? (
                <Button
                  disabled={busy || !token || amount == null || amount <= 0n || amount > maxAmount}
                  onClick={() => void submit()}
                >
                  {busy ? <Spinner data-icon="inline-start" /> : null}
                  <span>{t("transfer")}</span>
                </Button>
              ) : (
                <Button render={<Link href={loginHref} />} className="w-full sm:w-auto">
                  {t("signIn")}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function AccountCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 rounded-2xl border border-border/70 bg-muted/30 px-3.5 py-2.5">
      <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <p className="truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
