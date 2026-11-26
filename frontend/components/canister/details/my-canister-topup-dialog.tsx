"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Icon } from "@/components/ui/icon"
import { CreditCardIcon, WalletBalanceIcon } from "@thesvg/ui-react"
import { AmountInput } from "@/components/shared/amount-input"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { CanisterSuccessDialog } from "@/components/canister/canister-success-dialog"
import { useAuth } from "@/components/auth/auth-provider"
import { useLiveBalance, useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { formatAmount, parseIcp } from "@/lib/wallet/utils"
import { rememberCanister } from "@/lib/canister/savedCanisters"
import { invalidateCanisterStatus } from "@/lib/swr/keys"
import {
  estimateCyclesFromE8s,
  fetchCmcXdrPermyriad,
  fetchIcpTransferFee,
  fetchPrincipalIcpBalance,
  formatCycles,
  formatTopUpError,
  maxTopUpAmount,
  MAX_TOPUP_E8S,
  MIN_TOPUP_E8S,
  topUpFromWallet,
  walletCostForTopUp,
  walletShortfall,
  type TopUpFlowStep,
} from "@/services/cycles/topUp"
import {
  calculateStripeFee,
  estimateCardCycles,
  fetchCyclePayXdrRate,
  formatUsdCents,
  createCyclePayCardOrder,
  pollCyclePayOrderStatus,
  getCyclePayGuestUrl,
} from "@/services/cycles/cyclepay"

const PRESET_AMOUNTS = [10, 25, 50, 100]

export function MyCanisterTopupDialog({
  open,
  onOpenChange,
  canisterId,
  onDone,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  canisterId: string
  onDone?: () => void
}) {
  const t = useTranslations("myCanisters")
  const tt = useTranslations("cyclesTopUp")
  const { identity, isAuthenticated } = useAuth()
  const walletBalance = useLiveBalance()
  const refreshWallet = useRefreshWallet()

  const [activeTab, setActiveTab] = useState<"card" | "icp">("card")

  const [amountText, setAmountText] = useState("")
  const [rate, setRate] = useState<bigint | null>(null)
  const [iiBalance, setIiBalance] = useState<bigint | null>(null)
  const [fee, setFee] = useState(10_000n)
  const [submitting, setSubmitting] = useState(false)
  const [flowStep, setFlowStep] = useState<TopUpFlowStep | null>(null)
  const [success, setSuccess] = useState<{ cycles: string; amount: string } | null>(null)

  const [cardUsdText, setCardUsdText] = useState("25")
  const [cyclePayRate, setCyclePayRate] = useState<bigint | null>(null)
  const [cardSubmitting, setCardSubmitting] = useState(false)
  const [cardOrderStatus, setCardOrderStatus] = useState<string | null>(null)
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null)

  const amountE8s = useMemo(() => parseIcp(amountText), [amountText])
  const iiBal = iiBalance ?? 0n
  const shortfall = amountE8s != null ? walletShortfall(amountE8s, iiBal, fee) : 0n
  const walletCost = amountE8s != null ? walletCostForTopUp(amountE8s, iiBal, fee) : 0n
  const maxSpend =
    walletBalance != null ? maxTopUpAmount(walletBalance, iiBal, fee) : 0n
  const estimated =
    amountE8s != null && rate != null ? estimateCyclesFromE8s(amountE8s, rate) : null

  const amountError = useMemo(() => {
    if (!amountText.trim()) return null
    if (amountE8s == null) return tt("invalidAmount")
    if (amountE8s < MIN_TOPUP_E8S) return tt("minAmount")
    if (amountE8s > MAX_TOPUP_E8S) return tt("maxAmount")
    if (walletBalance != null && walletCost > walletBalance) return tt("insufficient")
    return null
  }, [amountText, amountE8s, walletBalance, walletCost, tt])

  const parsedCardUsd = useMemo(() => {
    const num = Number.parseFloat(cardUsdText)
    return Number.isFinite(num) && num > 0 ? num : 0
  }, [cardUsdText])

  const cardCents = useMemo(() => {
    return BigInt(Math.round(parsedCardUsd * 100))
  }, [parsedCardUsd])

  const cardFee = useMemo(() => {
    return calculateStripeFee(cardCents)
  }, [cardCents])

  const cardNetCents = useMemo(() => {
    return cardCents > cardFee ? cardCents - cardFee : 0n
  }, [cardCents, cardFee])

  const effectiveCardRate = cyclePayRate ?? 13450n
  const cardCyclesEstimated = useMemo(() => {
    return estimateCardCycles(cardCents, effectiveCardRate)
  }, [cardCents, effectiveCardRate])

  const cardError = useMemo(() => {
    if (!cardUsdText.trim()) return null
    if (parsedCardUsd < 1) return t("cardMinMax")
    if (parsedCardUsd > 200) return t("cardMinMax")
    return null
  }, [cardUsdText, parsedCardUsd, t])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    void (async () => {
      try {
        const [r, f, cRate] = await Promise.all([
          fetchCmcXdrPermyriad(identity),
          fetchIcpTransferFee(identity),
          fetchCyclePayXdrRate(identity).catch(() => ({ ratePermyriad: 13450n, usdPerXdr: 1.345, stale: false })),
        ])
        if (!cancelled) {
          setRate(r)
          setFee(f)
          setCyclePayRate(cRate.ratePermyriad)
        }
      } catch {
        if (!cancelled) {
          setRate(null)
          setCyclePayRate(13450n)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, identity])

  useEffect(() => {
    if (!open || !identity || !isAuthenticated) return
    let cancelled = false
    void (async () => {
      try {
        const bal = await fetchPrincipalIcpBalance(identity)
        if (!cancelled) setIiBalance(bal)
      } catch {
        if (!cancelled) setIiBalance(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, identity, isAuthenticated])

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }
  }, [])

  const onConfirmIcp = async () => {
    if (!identity || amountE8s == null) return
    setSubmitting(true)
    setFlowStep(shortfall > 0n ? "send" : "mint")
    try {
      const result = await topUpFromWallet(identity, canisterId, amountE8s, setFlowStep)
      rememberCanister(identity.getPrincipal().toText(), result.canisterId)
      refreshWallet()
      setIiBalance(await fetchPrincipalIcpBalance(identity))
      setSuccess({
        cycles: formatCycles(result.cycles),
        amount: formatAmount(amountE8s),
      })
      void invalidateCanisterStatus(canisterId)
      onDone?.()
    } catch (e) {
      toast.error(formatTopUpError(e) || tt("failed"))
    } finally {
      setSubmitting(false)
      setFlowStep(null)
    }
  }

  const onStartCardPayment = async () => {
    if (parsedCardUsd < 1 || parsedCardUsd > 200) return
    setCardSubmitting(true)
    setCardOrderStatus("creating")

    try {
      let urlToOpen: string
      let orderId: string | null = null

      try {
        const order = await createCyclePayCardOrder(canisterId, cardCents, identity)
        orderId = order.orderId
        urlToOpen = order.paymentUrl
      } catch {
        urlToOpen = getCyclePayGuestUrl(canisterId, parsedCardUsd)
      }

      window.open(urlToOpen, "_blank", "noopener,noreferrer")
      setCardOrderStatus("awaiting_payment")

      if (orderId) {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current)
        pollTimerRef.current = setInterval(async () => {
          try {
            const status = await pollCyclePayOrderStatus(orderId, identity)
            if (status.status === "Delivered") {
              if (pollTimerRef.current) clearInterval(pollTimerRef.current)
              setCardSubmitting(false)
              setCardOrderStatus(null)
              void invalidateCanisterStatus(canisterId)
              setSuccess({
                cycles: formatCycles(status.cyclesDelivered ?? cardCyclesEstimated),
                amount: `$${parsedCardUsd}`,
              })
              onDone?.()
            } else if (status.status === "Refunded" || status.status === "Refunding") {
              if (pollTimerRef.current) clearInterval(pollTimerRef.current)
              setCardSubmitting(false)
              setCardOrderStatus(null)
              toast.error("Payment refunded")
            }
          } catch {}
        }, 3000)
      }
    } catch (err) {
      setCardSubmitting(false)
      setCardOrderStatus(null)
      toast.error(err instanceof Error ? err.message : "Failed to initiate payment")
    }
  }

  return (
    <>
      <Dialog
        open={open && success == null}
        onOpenChange={(next) => {
          if (!submitting && !cardSubmitting) {
            if (pollTimerRef.current) {
              clearInterval(pollTimerRef.current)
              pollTimerRef.current = null
            }
            if (!next) {
              setAmountText("")
              setSuccess(null)
              setFlowStep(null)
              setCardOrderStatus(null)
            }
            onOpenChange(next)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="gap-1.5">
            <DialogTitle className="flex items-center gap-2">
              <Image
                src="/images/pages/canister/icon/tcycle.svg"
                alt="Cycles"
                width={20}
                height={20}
                className="size-5 shrink-0 rounded-full select-none"
              />
              <span>{t("topUpTitle")}</span>
            </DialogTitle>
            <DialogDescription>
              {t("topUpHint")}
            </DialogDescription>
          </DialogHeader>

          <div className="py-1">
            <p className="break-all font-mono text-xs text-muted-foreground">{canisterId}</p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              if (!submitting && !cardSubmitting) {
                setActiveTab(val as "card" | "icp")
              }
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/60 p-1">
              <TabsTrigger
                value="card"
                className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium cursor-pointer"
              >
                <Icon icon={CreditCardIcon} className="size-3.5" />
                <span>{t("topUpTabCard")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="icp"
                className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium cursor-pointer"
              >
                <Icon icon={WalletBalanceIcon} className="size-3.5" />
                <span>{t("topUpTabIcp")}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="card" className="space-y-4 pt-3 outline-none">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{t("cardAmountLabel")}</span>
                  <Badge variant="outline" className="text-[10px] font-semibold text-primary border-primary/30">
                    {t("cardZeroMarkup")}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AMOUNTS.map((amt) => {
                    const isSelected = parsedCardUsd === amt
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCardUsdText(amt.toString())}
                        className={`rounded-xl border py-2 text-center text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/60 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground"
                        }`}
                      >
                        ${amt}
                      </button>
                    )
                  })}
                </div>

                <div className="relative mt-2">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    min="1"
                    max="200"
                    step="1"
                    value={cardUsdText}
                    onChange={(e) => setCardUsdText(e.target.value)}
                    placeholder="25"
                    className="pl-8 text-sm font-medium"
                  />
                </div>

                {cardError && (
                  <FieldError className="text-xs">{cardError}</FieldError>
                )}
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/25 px-4 py-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("topUpEstimateLabel")}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <span>≈ {formatCycles(cardCyclesEstimated)}</span>
                    <Image
                      src="/images/pages/canister/icon/tcycle.svg"
                      alt="TC"
                      width={18}
                      height={18}
                      className="size-4 shrink-0 rounded-full select-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                  <span>Net after Stripe fee ({formatUsdCents(cardFee)})</span>
                  <span className="font-mono tabular-nums text-foreground">{formatUsdCents(cardNetCents)}</span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-normal">
                  {t("cardAmountHint")}
                </p>
              </div>

              {cardOrderStatus && (
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3.5">
                  <Spinner className="size-4 shrink-0 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      {cardOrderStatus === "creating"
                        ? t("cardOpeningCheckout")
                        : t("cardProcessing")}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {t("cardAwaitingPayment")}
                    </p>
                  </div>
                </div>
              )}

              <DialogFooter className="mt-2 gap-2 sm:gap-2">
                <DialogClose
                  render={
                    <Button variant="outline" disabled={cardSubmitting}>
                      {t("topUpCancel")}
                    </Button>
                  }
                />
                <Button
                  type="button"
                  disabled={cardSubmitting || parsedCardUsd < 1 || parsedCardUsd > 200 || cardError != null}
                  onClick={() => void onStartCardPayment()}
                  className="cursor-pointer"
                >
                  {cardSubmitting && <Spinner data-icon="inline-start" />}
                  <span>
                    {cardSubmitting
                      ? cardOrderStatus === "creating"
                        ? t("cardOpeningCheckout")
                        : t("cardProcessing")
                      : t("cardPayButton")}
                  </span>
                </Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="icp" className="space-y-4 pt-3 outline-none">
              <FieldGroup className="gap-4">
                <AmountInput
                  id="mine-topup-amount"
                  label={tt("amount")}
                  value={amountText}
                  onChange={setAmountText}
                  balance={walletBalance}
                  maxE8s={maxSpend}
                  size="xl"
                />
                {amountError ? (
                  <FieldError className="text-xs">{amountError}</FieldError>
                ) : estimated != null ? (
                  <div className="rounded-2xl border border-border/60 bg-muted/25 px-4 py-3.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("topUpEstimateLabel")}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-2xl font-bold tracking-tight tabular-nums text-foreground sm:text-3xl">
                        ≈ {formatCycles(estimated)}
                      </span>
                      <Image
                        src="/images/pages/canister/icon/tcycle.svg"
                        alt="TC"
                        width={24}
                        height={24}
                        className="size-5 sm:size-6 shrink-0 rounded-full select-none"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{t("topUpEstimateHint")}</p>
                  </div>
                ) : null}
              </FieldGroup>

              <DialogFooter className="mt-2 gap-2 sm:gap-2">
                <DialogClose
                  render={
                    <Button variant="outline" disabled={submitting}>
                      {t("topUpCancel")}
                    </Button>
                  }
                />
                <Button
                  type="button"
                  disabled={
                    !isAuthenticated ||
                    submitting ||
                    amountE8s == null ||
                    amountError != null
                  }
                  onClick={() => void onConfirmIcp()}
                  className="cursor-pointer"
                >
                  {submitting && <Spinner data-icon="inline-start" />}
                  <span>
                    {submitting
                      ? flowStep === "send"
                        ? tt("sending")
                        : tt("toppingUp")
                      : t("topUpConfirm")}
                  </span>
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <CanisterSuccessDialog
        open={success != null}
        onClose={() => {
          setSuccess(null)
          onOpenChange(false)
        }}
        title={tt("successTitle")}
        highlight={
          success ? (
            <div className="mt-1 mb-2 flex items-center justify-center gap-2">
              <span className="text-3xl font-bold tracking-tight tabular-nums">
                {success.cycles}
              </span>
              <Image
                src="/images/pages/canister/icon/tcycle.svg"
                alt="TC"
                width={24}
                height={24}
                className="size-5 shrink-0 rounded-full select-none"
              />
              <span className="text-lg font-semibold text-muted-foreground">
                {tt("cyclesUnit")}
              </span>
            </div>
          ) : null
        }
        monoId={canisterId}
        detail={
          success ? (
            <p className="text-sm text-muted-foreground">
              {tt("amountPaid")}: {success.amount}
            </p>
          ) : null
        }
      />
    </>
  )
}
