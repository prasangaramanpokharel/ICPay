"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { ShineBorder } from "@/components/ui/shine-border"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/components/auth/auth-provider"
import { useLiveBalance } from "@/hooks/wallet/useWalletData"
import { purchaseCourse } from "@/services/academy/client"
import { formatAmount, ICP_FEE } from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"
import type { Course } from "./academy-data"

interface AcademyPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course
  onSuccess: () => void
}

export function AcademyPaymentModal({
  open,
  onOpenChange,
  course,
  onSuccess,
}: AcademyPaymentModalProps) {
  const { identity, isAuthenticated, login, isLoading: isAuthLoading } = useAuth()
  const liveBalance = useLiveBalance()

  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<"ready" | "processing" | "success" | "error">("ready")
  const [blockIndex, setBlockIndex] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const priceMatch = course.price.match(/([\d.]+)\s*ICP/i)
  const priceIcpNumber = priceMatch ? parseFloat(priceMatch[1]) : 2.0
  const priceE8s = BigInt(Math.floor(priceIcpNumber * 100_000_000))
  const totalRequiredE8s = priceE8s + ICP_FEE

  const userBalanceE8s = liveBalance ?? BigInt(0)
  const hasSufficientBalance = userBalanceE8s >= totalRequiredE8s

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setStep("ready")
        setErrorMessage(null)
        setBlockIndex(null)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open])

  const handleConfirmPayment = async () => {
    if (!identity || !isAuthenticated) {
      await login()
      return
    }

    setIsProcessing(true)
    setStep("processing")
    setErrorMessage(null)

    try {
      const result = await purchaseCourse(course.id, priceE8s, identity)
      setBlockIndex(result.blockIndex.toString())
      setStep("success")
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (err: unknown) {
      setStep("error")
      setErrorMessage(
        err instanceof Error ? err.message : "Payment processing failed. Please check your balance and retry."
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-lg p-6 overflow-hidden">
        <ShineBorder
          className="rounded-[inherit]"
          borderWidth={1.5}
          duration={10}
          shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
        />

        <div className="relative z-10 space-y-4">
          <DialogHeader>
            <DialogTitle>
              Confirm Payment
            </DialogTitle>
            <DialogDescription>
              Authorize one-time on-chain enrollment for {course.title}
            </DialogDescription>
          </DialogHeader>

          {step === "success" ? (
            <div className="space-y-4 py-4 text-center">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="mx-auto size-10 text-success"
                strokeWidth={1.75}
              />
              <div>
                <h3 className="text-base font-bold text-foreground">Course Unlocked</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Confirmed on ICP Ledger at Block #{blockIndex}. You have permanent lifetime access.
                </p>
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                onClick={() => {
                  onSuccess()
                  onOpenChange(false)
                }}
              >
                Start Learning Now
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl bg-muted/40 p-5 text-center">
                <p className="text-3xl font-bold tabular-nums text-foreground">
                  {formatAmount(priceE8s)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">ICP</p>
              </div>

              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription className="text-xs font-medium">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2.5 rounded-2xl border border-border p-4 bg-card/50">
                <PaymentRow label="Course" value={course.title} />
                <PaymentRow label="Access" value="Lifetime Permanent" />
                <PaymentRow label="Network Fee" value={`${formatAmount(ICP_FEE)} ICP`} />
                <PaymentRow
                  label="Wallet Balance"
                  value={isAuthenticated ? `${formatAmount(userBalanceE8s)} ICP` : "Not connected"}
                />
                <PaymentRow
                  label="Total Deducted"
                  value={`${formatAmount(totalRequiredE8s)} ICP`}
                  emphasis
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {!isAuthenticated ? (
                  <Button
                    type="button"
                    onClick={() => void login()}
                    disabled={isAuthLoading}
                    className="relative overflow-hidden w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-10"
                  >
                    <ShineBorder
                      className="rounded-[inherit]"
                      borderWidth={1.2}
                      duration={8}
                      shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                    />
                    <span className="relative z-10">Connect Wallet to Pay</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={isProcessing || !hasSufficientBalance}
                    className="relative overflow-hidden w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-10"
                  >
                    {hasSufficientBalance && !isProcessing && (
                      <ShineBorder
                        className="rounded-[inherit]"
                        borderWidth={1.2}
                        duration={8}
                        shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                      />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isProcessing && <Spinner data-icon="inline-start" />}
                      {isProcessing
                        ? "Sending…"
                        : !hasSufficientBalance
                          ? "Insufficient Balance"
                          : `Confirm & Pay ${formatAmount(priceE8s)} ICP`}
                    </span>
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isProcessing}
                  className="w-full border-border bg-card hover:bg-accent h-10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PaymentRow({
  label,
  value,
  emphasis,
}: {
  label: string
  value: React.ReactNode
  emphasis?: boolean
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "max-w-[65%] truncate text-right",
          emphasis ? "font-semibold text-foreground text-sm font-mono" : "text-foreground font-mono"
        )}
      >
        {value}
      </span>
    </div>
  )
}
