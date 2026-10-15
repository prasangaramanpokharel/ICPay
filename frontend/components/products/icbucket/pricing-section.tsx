"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ShineBorder } from "@/components/ui/shine-border"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  Layers01Icon,
  Key01Icon,
  Clock01Icon,
  Coins01Icon,
} from "@hugeicons/core-free-icons"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import {
  BUCKET_POPULAR_TIER_GB,
  calculateListPriceE8s,
  calculatePriceE8s,
  calculateYearlyListPriceE8s,
  calculateYearlyPriceE8s,
} from "@/lib/bucket/pricing"
import { formatUsd } from "@/lib/market/icpPrice"
import { formatAmount } from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"

type PriceCurrency = "icp" | "usd"
type BillingCycle = "monthly" | "yearly"
type ViewFilter = "all" | "featured" | "highCapacity" | "table"

type PlanDefinition = {
  id: string
  capacityGb: number
  name: string
  tagline: string
  popular?: boolean
  badge?: string
  features: string[]
}

const ALL_PLANS: PlanDefinition[] = [
  {
    id: "starter",
    capacityGb: 1,
    name: "Starter",
    tagline: "Personal backups, avatars & developer sandboxes",
    features: [
      "1 GB reserved on-chain capacity",
      "Public & private buckets",
      "API key authentication",
      "Chunked parallel uploads",
      "Global CDN edge URLs (<150ms)",
      "Encrypted at rest in stable memory",
      "Renew anytime — unused time stacks",
    ],
  },
  {
    id: "pro",
    capacityGb: 5,
    name: "Pro",
    tagline: "Most popular for growing apps, media & user vaults",
    popular: true,
    badge: "Most Popular · Best Value",
    features: [
      "5 GB reserved on-chain capacity",
      "Multiple API keys with scoped access",
      "File metadata, custom headers & tags",
      "Search & folder tree listing",
      "Bulk copy, move & delete operations",
      "Official TypeScript, Python & Go SDKs",
      "Renew anytime — unused time stacks",
    ],
  },
  {
    id: "business",
    capacityGb: 10,
    name: "Business",
    tagline: "Production web applications & digital asset libraries",
    features: [
      "10 GB reserved on-chain capacity",
      "Multiple isolated buckets",
      "Team API keys with audit trail",
      "High-throughput chunk pipelines",
      "On-chain cryptographic audit proof",
      "Direct HTTPS boundary streaming",
      "Renew anytime — unused time stacks",
    ],
  },
  {
    id: "growth",
    capacityGb: 25,
    name: "Growth",
    tagline: "Fast-scaling SaaS, media catalogs & document archives",
    features: [
      "25 GB reserved on-chain capacity",
      "Up to 25 scoped API keys",
      "Automated lease expiry alert webhooks",
      "Dedicated canister partition backing",
      "Parallel multi-part upload streaming",
      "Zero egress bandwidth surcharges",
      "Renew anytime — unused time stacks",
    ],
  },
  {
    id: "scale",
    capacityGb: 50,
    name: "Scale",
    tagline: "Heavy production dApps, NFT collections & high-volume media",
    features: [
      "50 GB reserved on-chain capacity",
      "Dedicated 400 GB canister allocation",
      "High-throughput concurrent writes",
      "Priority global CDN boundary routing",
      "Multi-principal consensus controller support",
      "Zero egress bandwidth surcharges",
      "Renew anytime — unused time stacks",
    ],
  },
  {
    id: "enterprise",
    capacityGb: 100,
    name: "Enterprise",
    tagline: "Maximum single-bucket capacity with institutional sovereignty",
    badge: "Maximum Sovereign Scale",
    features: [
      "100 GB reserved on-chain capacity",
      "Maximum single-canister storage tier",
      "Sovereign threshold cryptography",
      "Unrestricted API throughput limits",
      "DAO / multi-sig governance integration",
      "Zero egress bandwidth surcharges",
      "Renew anytime — unused time stacks",
    ],
  },
]

function icpFromE8s(e8s: bigint): number {
  return Number(e8s) / 1e8
}

function formatIcp(e8s: bigint): string {
  return `${formatAmount(e8s)} ICP`
}

function formatPlanPrice(
  e8s: bigint,
  currency: PriceCurrency,
  usdPerIcp: number | undefined
): string {
  if (currency === "icp") return formatIcp(e8s)
  if (usdPerIcp === undefined) return "…"
  return formatUsd(icpFromE8s(e8s) * usdPerIcp)
}

function formatMonthlyEquiv(
  yearlyE8s: bigint,
  currency: PriceCurrency,
  usdPerIcp: number | undefined
): string {
  const monthlyE8s = yearlyE8s / 12n
  if (currency === "icp") {
    return `${(Number(monthlyE8s) / 1e8).toFixed(2)} ICP`
  }
  if (usdPerIcp === undefined) return "…"
  return formatUsd((Number(monthlyE8s) / 1e8) * usdPerIcp)
}

export function PricingSection() {
  const t = useTranslations("publicSite.icbucket.pricing") as (
    key: string,
    values?: Record<string, string | number>
  ) => string
  const [currency, setCurrency] = useState<PriceCurrency>("icp")
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly")
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all")
  const { price, loading } = useIcpPrice()
  const usdPerIcp = price?.usd

  const isYearly = billingCycle === "yearly"

  const filteredPlans =
    viewFilter === "featured"
      ? ALL_PLANS.slice(0, 3)
      : viewFilter === "highCapacity"
        ? ALL_PLANS.slice(3, 6)
        : ALL_PLANS

  return (
    <section className="border-b border-border/60 bg-background relative overflow-hidden" id="pricing">

      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 relative z-10">
        {/* Section Header */}
        <div className="mb-12 space-y-4 text-center">


          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
            {t("title") || "Storage Economics"}
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Pay upfront in ICP from your ICPay balance — no credit cards, no foreign bank holds, and zero surprise egress bandwidth bills. Bound directly to your Internet Identity Principal.
          </p>

          {/* Primary Controls Bar: Billing Cycle & Currency Switchers */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            {/* Billing Cycle Switcher: Monthly vs Annual */}
            <div className="inline-flex rounded-xl border border-border/70 bg-muted/40 p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg py-2 px-4 text-xs font-medium transition-all cursor-pointer",
                  !isYearly
                    ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>Monthly (30 days)</span>
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={cn(
                  "flex items-center gap-2 rounded-lg py-2 px-4 text-xs font-medium transition-all cursor-pointer",
                  isYearly
                    ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-primary/40"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>Annual (365 days)</span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-500 animate-pulse">
                  2 MO FREE · SAVE 17%
                </span>
              </button>
            </div>

            {/* Currency Switcher: ICP vs USD */}
            <Tabs
              value={currency}
              onValueChange={(value) => setCurrency((value as PriceCurrency) ?? "icp")}
              className="inline-flex"
            >
              <TabsList className="h-10 rounded-xl p-1 border border-border/60 bg-muted/40">
                <TabsTrigger value="icp" className="min-w-14 rounded-lg px-3 py-1.5 text-xs cursor-pointer">
                  {t("currencyIcp") || "ICP"}
                </TabsTrigger>
                <TabsTrigger value="usd" className="min-w-14 rounded-lg px-3 py-1.5 text-xs cursor-pointer">
                  {t("currencyUsd") || "USD"}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {currency === "usd" ? (
            <p className="text-xs text-muted-foreground tabular-nums">
              {loading || !price
                ? t("loadingPrice") || "Loading live ICP price…"
                : t("priceHint", { price: formatUsd(price.usd) }) || `USD estimates use CoinGecko · 1 ICP ≈ ${formatUsd(price.usd)}`}
            </p>
          ) : null}

          {/* View Filter Switcher: All 6 Plans / Core / High-Capacity / Table */}
          <div className="flex justify-center pt-3">
            <div className="inline-flex flex-wrap items-center justify-center rounded-xl border border-border/50 bg-muted/20 p-1 text-xs gap-1">
              <button
                type="button"
                onClick={() => setViewFilter("all")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium transition-all cursor-pointer",
                  viewFilter === "all"
                    ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <HugeiconsIcon icon={Layers01Icon} className="size-3.5" />
                <span>All 6 Plans (1G – 100G)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewFilter("featured")}
                className={cn(
                  "flex items-center rounded-lg px-3.5 py-1.5 font-medium transition-all cursor-pointer",
                  viewFilter === "featured"
                    ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>Core (1G – 10G)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewFilter("highCapacity")}
                className={cn(
                  "flex items-center rounded-lg px-3.5 py-1.5 font-medium transition-all cursor-pointer",
                  viewFilter === "highCapacity"
                    ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>High-Capacity (25G – 100G)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewFilter("table")}
                className={cn(
                  "flex items-center rounded-lg px-3.5 py-1.5 font-medium transition-all cursor-pointer",
                  viewFilter === "table"
                    ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>Compare Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 1: Cards Grid (All Plans / Filtered) */}
        {viewFilter !== "table" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlans.map((plan) => {
              const priceE8s = isYearly
                ? calculateYearlyPriceE8s(plan.capacityGb)
                : calculatePriceE8s(plan.capacityGb)
              const listPriceE8s = isYearly
                ? calculateYearlyListPriceE8s(plan.capacityGb)
                : calculateListPriceE8s(plan.capacityGb)
              const showDiscount = listPriceE8s > priceE8s
              const popular = plan.popular ?? plan.capacityGb === BUCKET_POPULAR_TIER_GB

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "relative overflow-visible border-border/70 bg-card rounded-2xl shadow-sm transition-all duration-200 hover:border-border flex flex-col justify-between",
                    popular && "border-primary/50 shadow-md ring-1 ring-primary/30"
                  )}
                >
                  {popular && (
                    <>
                      <ShineBorder
                        className="rounded-2xl z-0"
                        borderWidth={1.5}
                        duration={12}
                        shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                      />
                      <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap">
                        <div className="rounded-full bg-primary px-3.5 py-1 text-xs font-bold text-primary-foreground shadow-xs">
                          {plan.badge || t("mostPopular") || "Most Popular · Best Value"}
                        </div>
                      </div>
                    </>
                  )}

                  {!popular && plan.badge && (
                    <div className="absolute -top-3 right-4 z-10 whitespace-nowrap">
                      <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-[10px] font-bold text-primary shadow-xs">
                        {plan.badge}
                      </div>
                    </div>
                  )}

                  <div>
                    <CardHeader className="space-y-3 pb-5 pt-7">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold tracking-tight">{plan.name}</CardTitle>
                        <Badge variant="secondary" className="font-mono text-xs font-semibold px-2.5 py-1">
                          {plan.capacityGb} GB
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground min-h-[32px] leading-relaxed">
                        {plan.tagline}
                      </p>

                      <div className="space-y-1 pt-1">
                        {showDiscount ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground line-through tabular-nums">
                              {formatPlanPrice(listPriceE8s, currency, usdPerIcp)}
                            </span>
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                              {isYearly ? "SAVE 17% (2 MO FREE)" : "SAVE 50%"}
                            </span>
                          </div>
                        ) : null}

                        <div className="flex items-baseline gap-1.5">
                          <span className="text-4xl font-extrabold text-foreground tabular-nums tracking-tight">
                            {formatPlanPrice(priceE8s, currency, usdPerIcp)}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground">
                            {isYearly ? "/ year" : "/ 30 days"}
                          </span>
                        </div>

                        {isYearly && (
                          <p className="text-[11px] text-emerald-500 font-medium tabular-nums">
                            ≈ {formatMonthlyEquiv(priceE8s, currency, usdPerIcp)} / month
                          </p>
                        )}
                      </div>

                      {/* Cryptographic Principal Sovereignty Pill */}
                      <div className="pt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                        <HugeiconsIcon icon={Key01Icon} className="size-3.5 text-primary shrink-0" />
                        <span className="truncate">Principal-Gated · Zero Egress Fees</span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                      <div className="border-t border-border/50 pt-4">
                        <ul className="space-y-2.5">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <HugeiconsIcon
                                icon={CheckmarkCircle02Icon}
                                className="mt-0.5 size-4 shrink-0 text-primary"
                              />
                              <span className="text-xs text-muted-foreground leading-normal">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-6 pt-0">
                    <Button
                      className={cn(
                        "w-full rounded-xl cursor-pointer h-11 font-semibold gap-2",
                        popular ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" : ""
                      )}
                      variant={popular ? "default" : "outline"}
                      size="lg"
                      nativeButton={false}
                      render={<Link href="/bucket" />}
                    >
                      <span>{t("getStarted") || "Get Started"}</span>
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* VIEW 2: Full Comparison & All 6 Tiers Table */}
        {viewFilter === "table" && (
          <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/40 font-semibold text-foreground">
                    <th className="py-3.5 px-4 sm:px-6">Capacity Tier</th>
                    <th className="py-3.5 px-4">30-Day Monthly Price</th>
                    <th className="py-3.5 px-4">Annual Plan (2 Mo Free)</th>
                    <th className="py-3.5 px-4">Bandwidth Egress</th>
                    <th className="py-3.5 px-4">Ownership Authority</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {ALL_PLANS.map((plan) => {
                    const monthlyE8s = calculatePriceE8s(plan.capacityGb)
                    const yearlyE8s = calculateYearlyPriceE8s(plan.capacityGb)
                    const isPopular = plan.capacityGb === BUCKET_POPULAR_TIER_GB

                    return (
                      <tr
                        key={plan.id}
                        className={cn(
                          "transition-colors hover:bg-muted/20",
                          isPopular && "bg-primary/5 hover:bg-primary/10"
                        )}
                      >
                        <td className="py-4 px-4 sm:px-6 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{plan.name}</span>
                            <Badge
                              variant={isPopular ? "default" : "outline"}
                              className="text-[10px] font-mono px-2"
                            >
                              {plan.capacityGb} GB
                            </Badge>
                            {isPopular && (
                              <span className="rounded-full bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5">
                                Best Value
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 hidden sm:block">
                            {plan.tagline}
                          </p>
                        </td>

                        <td className="py-4 px-4 tabular-nums">
                          <div className="font-semibold text-foreground text-sm">
                            {formatPlanPrice(monthlyE8s, currency, usdPerIcp)}
                          </div>
                          <span className="text-[10px] text-muted-foreground">per 30 days</span>
                        </td>

                        <td className="py-4 px-4 tabular-nums">
                          <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                            <span>{formatPlanPrice(yearlyE8s, currency, usdPerIcp)}</span>
                            <span className="rounded bg-emerald-500/15 text-emerald-500 text-[9px] font-bold px-1.5 py-0.5">
                              SAVE 17%
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            ≈ {formatMonthlyEquiv(yearlyE8s, currency, usdPerIcp)} / mo
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-bold text-emerald-500">$0.00</span>
                          <span className="text-[10px] text-muted-foreground block">Zero egress taxes</span>
                        </td>

                        <td className="py-4 px-4 text-muted-foreground">
                          <span className="font-medium text-foreground">Cryptographic Principal</span>
                          <span className="text-[10px] block text-muted-foreground/75">Internet Identity sovereign control</span>
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-right">
                          <Button
                            size="sm"
                            variant={isPopular ? "default" : "outline"}
                            className="rounded-lg cursor-pointer text-xs"
                            nativeButton={false}
                            render={<Link href="/bucket" />}
                          >
                            <span>Deploy</span>
                            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3 Core Sovereign Guarantees Rooted in Cryptographic Principal */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <HugeiconsIcon icon={Key01Icon} className="size-4 text-primary" />
              <span>Sovereign Principal Ownership</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every bucket is cryptographically anchored to your Internet Identity Principal. No root admin, centralized bot flag, or foreign entity can freeze or tamper with your storage canister.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <HugeiconsIcon icon={Clock01Icon} className="size-4 text-primary" />
              <span>Autonomous Time Stacking</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Renew anytime without losing a single second. Unused lease days stack directly onto your canister expiry. Choose annual upfront for 2 months free (~17% savings).
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <HugeiconsIcon icon={Coins01Icon} className="size-4 text-primary" />
              <span>Zero Egress Bandwidth Taxes</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Say goodbye to surprise cloud invoices. Public CDN delivery and direct canister streaming are 100% included in the base lease price with zero per-gigabyte egress fees.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
