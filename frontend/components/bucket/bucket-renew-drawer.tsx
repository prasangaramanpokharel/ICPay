"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Spinner } from "@/components/ui/spinner"
import { useRenewQuote } from "@/hooks/bucket/useBucket"
import { formatAmount } from "@/lib/wallet/utils"
import { expiresAtToMs } from "@/lib/bucket/bucket"
import { cn } from "@/lib/ui/utils"
import type { BucketBillingPeriod } from "@/services/bucket/types"

export function BucketRenewDrawer({
  bucketId,
  open,
  onOpenChange,
  onRenew,
}: {
  bucketId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onRenew: (period: BucketBillingPeriod) => Promise<string | null>
}) {
  const t = useTranslations("bucket")
  const tc = useTranslations("common")
  const [period, setPeriod] = useState<BucketBillingPeriod>("monthly")
  const { quote, isLoading } = useRenewQuote(bucketId, open, period)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRenew = async () => {
    setSubmitting(true)
    setError(null)
    const err = await onRenew(period)
    if (err) {
      setError(err)
      setSubmitting(false)
      return
    }
    setSubmitting(false)
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("renewTitle")}</DrawerTitle>
          <DrawerDescription>{t("renewBody")}</DrawerDescription>
        </DrawerHeader>
        <div className="space-y-3 px-4 pb-2 text-sm">
          <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-border/80 bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setPeriod("monthly")}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 px-3 text-xs font-medium transition-all",
                period === "monthly"
                  ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>+30 Days</span>
              <span className="text-[10px] font-normal text-muted-foreground">Monthly cycle</span>
            </button>
            <button
              type="button"
              onClick={() => setPeriod("yearly")}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 px-3 text-xs font-medium transition-all",
                period === "yearly"
                  ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-primary/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-1.5">
                <span>+365 Days</span>
                <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-500">
                  2 MO FREE
                </span>
              </span>
              <span className="text-[10px] font-normal text-muted-foreground">Annual renewal</span>
            </button>
          </div>

          {isLoading || !quote ? (
            <div className="flex justify-center py-4">
              <Spinner className="size-5 text-muted-foreground" />
            </div>
          ) : (
            <>
              <Card size="sm">
                <CardContent className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">{tc("fee")}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {period === "yearly" ? "365 days extension (10x rate)" : "30 days extension"}
                    </span>
                  </div>
                  <span className="font-semibold tabular-nums text-foreground">
                    {formatAmount(quote.priceE8s)} ICP
                  </span>
                </CardContent>
              </Card>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("newExpiry")}</span>
                <span>{new Date(expiresAtToMs(quote.newExpiresAt)).toLocaleDateString()}</span>
              </div>
            </>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DrawerFooter>
          <Button size="sm" disabled={submitting || isLoading || !quote} onClick={handleRenew}>
            {submitting ? t("renewing") : t("renewConfirm", { price: quote ? formatAmount(quote.priceE8s) : "—" })}
          </Button>
          <DrawerClose render={<Button variant="outline" size="sm">{tc("cancel")}</Button>} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
