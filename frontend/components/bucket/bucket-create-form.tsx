"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BucketPriceLabel } from "@/components/bucket/bucket-price-label"
import { ShineBorder } from "@/components/ui/shine-border"
import { useBucketCycleStatus, useBucketPrice } from "@/hooks/bucket/useBucket"
import { useLiveBalance } from "@/hooks/wallet/useWalletData"
import { CAPACITY_TIERS_GB, mapBucketError, validateBucketName } from "@/lib/bucket/bucket"
import { calculateListPriceE8s, calculateYearlyListPriceE8s } from "@/lib/bucket/pricing"
import { ICP_FEE } from "@/lib/wallet/utils"
import { Mail01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/ui/utils"
import type { BucketBillingPeriod, BucketVisibilityVariant } from "@/services/bucket/types"

export function BucketCreateForm({
  onCreate,
}: {
  onCreate: (
    name: string,
    capacityGB: number,
    visibility: BucketVisibilityVariant,
    period: BucketBillingPeriod,
    alertEmail?: string
  ) => Promise<string | null>
}) {
  const t = useTranslations("bucket")
  const { cycleStatus } = useBucketCycleStatus()
  const balance = useLiveBalance()

  const [name, setName] = useState("")
  const [capacityGB, setCapacityGB] = useState<number>(1)
  const [billingPeriod, setBillingPeriod] = useState<BucketBillingPeriod>("monthly")
  const [visibility, setVisibility] = useState<BucketVisibilityVariant>({ Public: null })
  const [alertEmail, setAlertEmail] = useState("")
  const [alertEmailError, setAlertEmailError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { price, isLoading: priceLoading } = useBucketPrice(capacityGB, billingPeriod)
  const listPrice =
    billingPeriod === "yearly"
      ? calculateYearlyListPriceE8s(capacityGB)
      : calculateListPriceE8s(capacityGB)

  const nameError = useMemo(() => validateBucketName(name), [name])
  const canCreate = cycleStatus?.canAcceptNewBuckets !== false
  const totalCost = price !== null ? price + ICP_FEE : null
  const insufficient =
    totalCost !== null && balance !== undefined && balance < totalCost

  const handleSubmit = async () => {
    if (nameError || !canCreate) return
    const trimmedEmail = alertEmail.trim()
    if (trimmedEmail) {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
      if (!isValid) {
        setAlertEmailError("Please enter a valid email address (or leave blank)")
        return
      }
    }
    setAlertEmailError(null)
    setSubmitting(true)
    setError(null)
    const err = await onCreate(
      name.trim().toLowerCase(),
      capacityGB,
      visibility,
      billingPeriod,
      trimmedEmail || undefined
    )
    if (err) setError(mapBucketError(err, t))
    setSubmitting(false)
  }

  return (
    <div className="space-y-4">
      {!canCreate && (
        <Alert variant="destructive">
          <AlertDescription>{t("serviceUnavailable")}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="bucket-name" className="text-xs font-medium">
            {t("name")}
          </Label>
          <Input
            id="bucket-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="my-assets"
            autoComplete="off"
            className="h-10"
          />
          <p className="text-xs text-muted-foreground">{t("nameHint")}</p>
          {nameError && name.length > 0 && (
            <p className="text-xs text-destructive">{nameError}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">{t("capacity")}</Label>
            <span className="text-[11px] text-muted-foreground">
              Dedicated EOP Canister
            </span>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {CAPACITY_TIERS_GB.map((gb) => {
              const active = capacityGB === gb
              return (
                <Button
                  key={gb}
                  type="button"
                  size="xs"
                  variant={active ? "default" : "outline"}
                  className={cn(
                    "h-9 font-medium text-xs transition-all",
                    active && "ring-1 ring-primary shadow-xs font-semibold"
                  )}
                  onClick={() => setCapacityGB(gb)}
                >
                  {gb}G
                </Button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">{t("visibility")}</Label>
          <RadioGroup
            value={"Public" in visibility ? "public" : "private"}
            onValueChange={(value) => {
              if (value === "public") setVisibility({ Public: null })
              if (value === "private") setVisibility({ Private: null })
            }}
            className="grid gap-2 sm:grid-cols-2"
          >
            <FieldLabel htmlFor="bucket-visibility-public" className="cursor-pointer">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>{t("public")}</FieldTitle>
                  <FieldDescription>{t("publicHint")}</FieldDescription>
                </FieldContent>
                <RadioGroupItem value="public" id="bucket-visibility-public" />
              </Field>
            </FieldLabel>
            <FieldLabel htmlFor="bucket-visibility-private" className="cursor-pointer">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>{t("private")}</FieldTitle>
                  <FieldDescription>{t("privateHint")}</FieldDescription>
                </FieldContent>
                <RadioGroupItem value="private" id="bucket-visibility-private" />
              </Field>
            </FieldLabel>
          </RadioGroup>
        </div>

        {/* Billing Period Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Billing Cycle</Label>
            <span className="text-[11px] font-medium text-success">
              {billingPeriod === "yearly"
                ? "Save ~17% · 2 Months Free"
                : "Standard 30-day renewal"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-border/80 bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-lg py-2 px-3 text-xs font-medium transition-all",
                billingPeriod === "monthly"
                  ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Monthly</span>
              <span className="text-[10px] font-normal text-muted-foreground">30-day cycle</span>
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("yearly")}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 rounded-lg py-2 px-3 text-xs font-medium transition-all",
                billingPeriod === "yearly"
                  ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-primary/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-1.5">
                <span>Annual</span>
                <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[9px] font-bold text-success">
                  2 MO FREE
                </span>
              </span>
              <span className="text-[10px] font-normal text-muted-foreground">365-day cycle</span>
            </button>
          </div>
        </div>

        {/* Expiry Alert Email (Optional) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="bucket-alert-email" className="text-xs font-medium">
              Expiry Alert Email <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <span className="text-[11px] text-muted-foreground">3-day warning</span>
          </div>
          <div className="relative">
            <Input
              id="bucket-alert-email"
              type="email"
              value={alertEmail}
              onChange={(e) => {
                setAlertEmail(e.target.value)
                if (alertEmailError) setAlertEmailError(null)
              }}
              placeholder="alerts@company.com"
              autoComplete="email"
              className="h-10 pr-9 text-xs font-mono"
            />
            <HugeiconsIcon
              icon={Mail01Icon}
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Receive automated warnings before your plan expires so your storage is never interrupted.
          </p>
          {alertEmailError && (
            <p className="text-xs text-destructive">{alertEmailError}</p>
          )}
        </div>

        {/* Pricing Card with ShineBorder */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-primary/10 via-background to-background p-4 shadow-sm">
          <ShineBorder
            className="rounded-2xl z-0"
            borderWidth={1.5}
            duration={10}
            shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
          />
          <div className="relative z-10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {capacityGB} GB · {billingPeriod === "yearly" ? "Annual Plan" : "Monthly Plan"}
                </span>
                {billingPeriod === "yearly" ? (
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                    2 MONTHS FREE
                  </span>
                ) : (
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                    50% OFF
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {billingPeriod === "yearly" ? "365-day cycle" : "30-day cycle"}
              </span>
            </div>

            <div className="flex items-baseline justify-between border-t border-border/50 pt-2.5">
              <span className="text-xs text-muted-foreground">{t("price")}</span>
              {priceLoading || price === null ? (
                <span className="font-semibold tabular-nums text-foreground">…</span>
              ) : (
                <BucketPriceLabel
                  priceE8s={price}
                  listPriceE8s={listPrice}
                  perMonth={billingPeriod === "yearly" ? "/ year" : t("perMonth")}
                  showUsd={true}
                />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" />
              <span>Dedicated 400 GB EOP Canister · Instant Boundary CDN</span>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          className="w-full h-11 text-sm font-semibold shadow-sm transition-all"
          disabled={
            submitting ||
            !canCreate ||
            Boolean(nameError) ||
            name.trim().length === 0 ||
            priceLoading ||
            insufficient
          }
          onClick={handleSubmit}
        >
          {submitting && <Spinner data-icon="inline-start" />}
          {submitting
            ? t("creating")
            : insufficient
            ? t("insufficientBalance")
            : `${t("create")} · ${capacityGB} GB (${billingPeriod === "yearly" ? "Annual" : "Monthly"})`}
        </Button>
      </div>
    </div>
  )
}
