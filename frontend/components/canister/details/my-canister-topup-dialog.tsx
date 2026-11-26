"use client"

import { useEffect, useMemo, useState, useRef } from "react"
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
import { Input } from "@/components/ui/input"
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

  const [activeTab, setActiveTab] = useState<"icp" | "card">("icp")

  const [amountText, setAmountText] = useState("")
  const [rate, setRate] = useState<bigint | null>(null)
  const [iiBalance, setIiBalance] = useState<bigint | null>(null)
  const [fee, setFee] = useState(10_000n)
  const [submitting, setSubmitting] = useState(false)
  const [flowStep, setFlowStep] = useState<TopUpFlowStep | null>(null)
  const [success, setSuccess] = useState<{ cycles: string; amount: string } | null>(null)

  const [cardUsdText, setCardUsdText] = useState("25")
  const [cyclePayRate, setCyclePayRate] = useState<bigint | null>(null)
  const [rateFetchedAt, setRateFetchedAt] = useState<string>("")
  const [cardSubmitting, setCardSubmitting] = useState(false)
  const [cardOrderStatus, setCardOrderStatus] = useState<string | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
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

  const ratePerTrillionFormatted = useMemo(() => {
    const num = Number(effectiveCardRate) / 10000
    return num.toFixed(2)
  }, [effectiveCardRate])

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
          const now = new Date()
          const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          setRateFetchedAt(timeStr)
        }
      } catch {
        if (!cancelled) {
          setRate(null)
          setCyclePayRate(13450n)
          setRateFetchedAt("12:00")
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

    const checkoutWindow = typeof window !== "undefined" ? window.open("about:blank", "_blank") : null

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

      setCheckoutUrl(urlToOpen)
      if (checkoutWindow && !checkoutWindow.closed) {
        checkoutWindow.location.href = urlToOpen
      } else {
        window.open(urlToOpen, "_blank", "noopener,noreferrer")
      }
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
                amount: `$${parsedCardUsd.toFixed(2)}`,
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
      if (checkoutWindow && !checkoutWindow.closed) {
        checkoutWindow.close()
      }
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
              setCheckoutUrl(null)
              setActiveTab("icp")
            }
            onOpenChange(next)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="gap-1.5">
            <DialogTitle>{t("topUpTitle")}</DialogTitle>
            <DialogDescription>
              {activeTab === "card" ? t("cardTopUpHint") : t("topUpHint")}
            </DialogDescription>
          </DialogHeader>

          <div className="py-0.5">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Canister:</span>{" "}
              <span className="font-mono">{canisterId}</span>
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              if (!submitting && !cardSubmitting) {
                setActiveTab(val as "icp" | "card")
              }
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/60 p-1">
              <TabsTrigger
                value="icp"
                className="flex items-center justify-center rounded-lg py-1.5 text-xs font-medium cursor-pointer"
              >
                <span>{t("tabIcp")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="card"
                className="flex items-center justify-center rounded-lg py-1.5 text-xs font-medium cursor-pointer"
              >
                <span>{t("tabCard")}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="card" className="space-y-4 pt-3 outline-none">
              <div className="space-y-2">
                <span className="text-xs font-medium text-foreground">{t("amountLabel")}</span>

                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AMOUNTS.map((amt) => {
                    const isSelected = parsedCardUsd === amt
                    const presetFeeCents = calculateStripeFee(BigInt(amt * 100))
                    const presetFeePct = ((Number(presetFeeCents) / (amt * 100)) * 100).toFixed(1)
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCardUsdText(amt.toString())}
                        className={`flex flex-col items-center justify-center rounded-xl border py-2 text-center transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border/60 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground font-medium"
                        }`}
                      >
                        <span className="text-xs">${amt}</span>
                        <span className="text-[10px] opacity-75">{presetFeePct}% fee</span>
                      </button>
                    )
                  })}
                </div>

                <div className="relative mt-2">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={cardUsdText}
                    onChange={(e) => {
                      const val = e.target.value
                      if (/^\d*\.?\d{0,2}$/.test(val)) {
                        setCardUsdText(val)
                      }
                    }}
                    placeholder="25.00"
                    className="pr-12 text-sm font-medium"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none">
                    USD
                  </span>
                </div>

                {cardError && (
                  <FieldError className="text-xs">{cardError}</FieldError>
                )}
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/25 px-4 py-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("amountLabel")}</span>
                  <span className="font-mono tabular-nums text-foreground">{formatUsdCents(cardCents)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("cardFeeLabel")}</span>
                  <span className="font-mono tabular-nums text-muted-foreground">−{formatUsdCents(cardFee)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("convertedLabel")}</span>
                  <span className="font-mono tabular-nums text-foreground">{formatUsdCents(cardNetCents)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/50 pt-2 font-semibold">
                  <span className="text-foreground">{t("youReceiveLabel")}</span>
                  <span className="tabular-nums text-foreground">≈ {formatCycles(cardCyclesEstimated)} {tt("cyclesUnit")}</span>
                </div>
                <div className="border-t border-border/30 pt-2 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>Rate: 1 T cycles = ${ratePerTrillionFormatted}{rateFetchedAt ? ` · updated ${rateFetchedAt}` : ""}</span>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1 leading-normal">
                  {t("cardFeeExplanation")}
                </p>
              </div>

              {cardOrderStatus && (
                <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3.5">
                  <Spinner className="size-4 shrink-0 text-primary mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      {cardOrderStatus === "creating"
                        ? t("cardOpeningCheckout")
                        : t("cardProcessing")}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {t("cardAwaitingPayment")}
                    </p>
                    {checkoutUrl && (
                      <div className="mt-2 pt-2 border-t border-border/40">
                        <a
                          href={checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                        >
                          <span>{t("cardOpenCheckout")}</span>
                          <span aria-hidden="true">&rarr;</span>
                        </a>
                      </div>
                    )}
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
                      : t("payButton")}
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
                        ≈ {formatCycles(estimated)} {tt("cyclesUnit")}
                      </span>
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
