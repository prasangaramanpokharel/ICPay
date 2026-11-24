"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BucketPriceLabel } from "@/components/bucket/bucket-price-label"
import { ShineBorder } from "@/components/ui/shine-border"
import { useBucketCycleStatus, useBucketPrice } from "@/hooks/bucket/useBucket"
import { useLiveBalance, useProPerkStatus } from "@/hooks/wallet/useWalletData"
import { CAPACITY_TIERS_GB, mapBucketError, validateBucketName } from "@/lib/bucket/bucket"
import { calculateListPriceE8s, calculateYearlyListPriceE8s } from "@/lib/bucket/pricing"
import { formatAmount, ICP_FEE } from "@/lib/wallet/utils"
import { MailGlassIcon } from "@thesvg/ui-react"
import { Icon } from "@/components/ui/icon"
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
  const searchParams = useSearchParams()
  const { cycleStatus } = useBucketCycleStatus()
  const balance = useLiveBalance()
  const { status: proPerkStatus, isEligibleFreePerk } = useProPerkStatus()

  const initialStorage = useMemo(() => {
    const raw = searchParams.get("storage")
    const parsed = raw ? Number(raw) : 1
    return (CAPACITY_TIERS_GB as readonly number[]).includes(parsed) ? parsed : 1
  }, [searchParams])

  const initialPeriod = useMemo<BucketBillingPeriod>(() => {
    return searchParams.get("storage") ? "yearly" : "monthly"
  }, [searchParams])

  const perkStorage = isEligibleFreePerk && proPerkStatus?.storageGb ? proPerkStatus.storageGb : null
  const [userCapacityGB, setUserCapacityGB] = useState<number | null>(null)
  const [userBillingPeriod, setUserBillingPeriod] = useState<BucketBillingPeriod | null>(null)

  const capacityGB = userCapacityGB ?? perkStorage ?? initialStorage
  const billingPeriod = userBillingPeriod ?? (perkStorage ? "yearly" : initialPeriod)
  const setCapacityGB = setUserCapacityGB
  const setBillingPeriod = setUserBillingPeriod

  const [name, setName] = useState("")
  const [visibility, setVisibility] = useState<BucketVisibilityVariant>({ Public: null })
  const [alertEmail, setAlertEmail] = useState("")
  const [alertEmailError, setAlertEmailError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPerkApplied = Boolean(
    isEligibleFreePerk &&
      billingPeriod === "yearly" &&
      capacityGB === (proPerkStatus?.storageGb ?? 0)
  )

  const { price, isLoading: priceLoading } = useBucketPrice(capacityGB, billingPeriod)
  const listPrice =
    billingPeriod === "yearly"
      ? calculateYearlyListPriceE8s(capacityGB)
      : calculateListPriceE8s(capacityGB)

  const nameError = useMemo(() => validateBucketName(name), [name])
  const canCreate = cycleStatus?.canAcceptNewBuckets !== false
  const totalCost = isPerkApplied ? 0n : price !== null ? price + ICP_FEE : null
  const insufficient =
    !isPerkApplied && totalCost !== null && balance !== undefined && balance < totalCost

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
        <Field className="space-y-2">
          <FieldLabel htmlFor="bucket-name" className="text-xs font-medium">
            {t("name")}
          </FieldLabel>
          <Input
            id="bucket-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="my-assets"
            autoComplete="off"
            className="h-10"
          />
          <FieldDescription className="text-xs text-muted-foreground">{t("nameHint")}</FieldDescription>
          {nameError && name.length > 0 && (
            <FieldError>{nameError}</FieldError>
          )}
        </Field>

        <Field className="space-y-2">
          <div className="flex min-h-6 items-center justify-between gap-2">
            <FieldLabel className="text-xs font-medium">{t("capacity")}</FieldLabel>
            <span className="text-[11px] text-muted-foreground">
              Dedicated EOP Canister
            </span>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {CAPACITY_TIERS_GB.map((gb) => {
              const active = capacityGB === gb
              const isPerkTier = isEligibleFreePerk && gb === proPerkStatus?.storageGb
              return (
                <Button
                  key={gb}
                  type="button"
                  size="xs"
                  variant={active ? "default" : "outline"}
                  className={cn(
                    "relative h-9 font-medium text-xs transition-all",
                    active && "ring-1 ring-primary shadow-xs font-semibold",
                    isPerkTier && !active && "border-success/60 text-success"
                  )}
                  onClick={() => setCapacityGB(gb)}
                >
                  {gb}G
                  {isPerkTier && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-success px-1 text-[8px] font-bold text-success-foreground">
                      FREE
                    </span>
                  )}
                </Button>
              )
            })}
          </div>
          {isEligibleFreePerk && (capacityGB !== proPerkStatus?.storageGb || billingPeriod !== "yearly") && (
            <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs">
              <span className="text-[11px] text-foreground">
                Your Pro username includes {proPerkStatus?.storageGb} GB Annual for Free!
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-0.5 text-[11px] font-semibold text-success hover:bg-success/20"
                onClick={() => {
                  if (proPerkStatus?.storageGb) setCapacityGB(proPerkStatus.storageGb)
                  setBillingPeriod("yearly")
                }}
              >
                Use {proPerkStatus?.storageGb} GB Free
              </Button>
            </div>
          )}
        </Field>

        <Field className="space-y-2">
          <FieldLabel className="text-xs font-medium">{t("visibility")}</FieldLabel>
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
        </Field>

        <Field className="space-y-2">
          <div className="flex min-h-6 items-center justify-between gap-2">
            <FieldLabel className="text-xs font-medium">Billing Cycle</FieldLabel>
            <span className="text-[11px] font-medium text-success">
              {billingPeriod === "yearly"
                ? "Save ~17% · 2 Months Free"
                : "Standard 30-day renewal"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-border/80 bg-muted/40 p-1">
            <Button
              type="button"
              variant={billingPeriod === "monthly" ? "secondary" : "ghost"}
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "h-auto flex-col gap-0.5 rounded-lg py-2 px-3 text-xs font-medium transition-all",
                billingPeriod === "monthly"
                  ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border hover:bg-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Monthly</span>
              <span className="text-[10px] font-normal text-muted-foreground">30-day cycle</span>
            </Button>
            <Button
              type="button"
              variant={billingPeriod === "yearly" ? "secondary" : "ghost"}
              onClick={() => setBillingPeriod("yearly")}
              className={cn(
                "relative h-auto flex-col gap-0.5 rounded-lg py-2 px-3 text-xs font-medium transition-all",
                billingPeriod === "yearly"
                  ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-primary/40 hover:bg-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-1.5">
                <span>Annual</span>
                <Badge variant="outline" className="border-transparent bg-success/15 px-1.5 py-0 text-[9px] font-bold text-success">
                  2 MO FREE
                </Badge>
              </span>
              <span className="text-[10px] font-normal text-muted-foreground">365-day cycle</span>
            </Button>
          </div>
        </Field>

        <Field className="space-y-1.5">
          <div className="flex min-h-6 items-center justify-between gap-2">
            <FieldLabel htmlFor="bucket-alert-email" className="text-xs font-medium">
              Expiry Alert Email <span className="text-muted-foreground font-normal">(Optional)</span>
            </FieldLabel>
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
            <Icon
              icon={MailGlassIcon}
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
          <FieldDescription className="text-[11px] text-muted-foreground">
            Receive automated warnings before your plan expires so your storage is never interrupted.
          </FieldDescription>
          {alertEmailError && (
            <FieldError>{alertEmailError}</FieldError>
          )}
        </Field>

        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-primary/10 via-background to-background p-4 shadow-sm">
          <ShineBorder
            className="rounded-2xl z-0"
            borderWidth={1.5}
            duration={10}
            shineColor={["var(--primary)", "var(--accent)", "var(--primary)"]}
          />
          <div className="relative z-10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {capacityGB} GB · {billingPeriod === "yearly" ? "Annual Plan" : "Monthly Plan"}
                </span>
                {isPerkApplied ? (
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                    PRO PERK · 100% OFF
                  </span>
                ) : billingPeriod === "yearly" ? (
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
              {isPerkApplied ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-muted-foreground line-through tabular-nums">
                    {formatAmount(listPrice)} ICP
                  </span>
                  <span className="font-semibold tabular-nums text-success">
                    0.00 ICP
                  </span>
                  <span className="text-xs text-muted-foreground">/ 1st year</span>
                </div>
              ) : priceLoading || price === null ? (
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
            (!isPerkApplied && priceLoading) ||
            insufficient
          }
          onClick={handleSubmit}
        >
          {submitting && <Spinner data-icon="inline-start" />}
          {submitting
            ? t("creating")
            : isPerkApplied
            ? `Create Free Perk Bucket · ${capacityGB} GB (1 Year Included)`
            : insufficient
            ? t("insufficientBalance")
            : `${t("create")} · ${capacityGB} GB (${billingPeriod === "yearly" ? "Annual" : "Monthly"})`}
        </Button>
      </div>
    </div>
  )
}
