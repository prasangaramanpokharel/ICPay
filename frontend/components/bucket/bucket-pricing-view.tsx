"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BucketBackButton } from "@/components/bucket/bucket-back-button"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { useBucketPricingTiers } from "@/hooks/bucket/useBucket"
import { CAPACITY_TIERS_GB } from "@/lib/bucket/bucket"
import { BUCKET_POPULAR_TIER_GB } from "@/lib/bucket/pricing"
import { BucketPriceLabel } from "@/components/bucket/bucket-price-label"
import { cn } from "@/lib/ui/utils"
import type { BucketBillingPeriod } from "@/services/bucket/types"

const FEATURE_KEYS = [
  "pricingFeaturePublic",
  "pricingFeatureEncrypted",
  "pricingFeatureCdn",
  "pricingFeatureWebp",
  "pricingFeatureFormats",
  "pricingFeatureReadOnly",
  "pricingFeatureRenew",
] as const

export function BucketPricingView() {
  const t = useTranslations("bucket")
  const [billingPeriod, setBillingPeriod] = useState<BucketBillingPeriod>("monthly")
  const { tiers, isLoading } = useBucketPricingTiers(billingPeriod)

  const tierRows = CAPACITY_TIERS_GB.map((gb) => {
    const tier = tiers.find((row) => row.gb === gb)
    return { gb, tier, popular: gb === BUCKET_POPULAR_TIER_GB }
  })

  return (
    <AppPage
      title={t("pricingTitle")}
      description={t("pricingSubtitle")}
      back={<BucketBackButton href="/bucket" />}
      className="mx-auto max-w-2xl pb-8"
    >
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-xl border border-border/80 bg-muted/40 p-1">
          <Button
            type="button"
            variant={billingPeriod === "monthly" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setBillingPeriod("monthly")}
            className={cn(
              "h-8 gap-2 rounded-lg px-4 text-xs font-medium transition-all",
              billingPeriod === "monthly"
                ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border hover:bg-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Monthly (30 days)</span>
          </Button>
          <Button
            type="button"
            variant={billingPeriod === "yearly" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setBillingPeriod("yearly")}
            className={cn(
              "h-8 gap-2 rounded-lg px-4 text-xs font-medium transition-all",
              billingPeriod === "yearly"
                ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-primary/40 hover:bg-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Annual (365 days)</span>
            <Badge variant="outline" className="border-transparent bg-success/15 px-1.5 py-0 text-[9px] font-bold text-success">
              2 MO FREE
            </Badge>
          </Button>
        </div>
      </div>

      <Card size="sm" className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>{t("pricingColTier")}</TableHead>
                <TableHead className="text-right">{t("pricingColPrice")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tierRows.map(({ gb, tier, popular }) => (
                <TableRow
                  key={gb}
                  className={cn(popular && "bg-primary/5 hover:bg-primary/5")}
                >
                  <TableCell>
                    <span className="inline-flex items-center gap-2 font-medium">
                      {gb} GB
                      {popular && <Badge variant="secondary">{t("pricingPopular")}</Badge>}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {isLoading && !tier ? (
                      <Skeleton className="ml-auto inline-block h-5 w-24" />
                    ) : tier ? (
                      <BucketPriceLabel
                        priceE8s={tier.priceE8s}
                        listPriceE8s={tier.listPriceE8s}
                        perMonth={billingPeriod === "yearly" ? "/ year" : t("perMonth")}
                      />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="border-t">
          <CardDescription className="text-xs leading-relaxed">
            {billingPeriod === "yearly"
              ? "Annual plans include 12 months (365 days) of continuous storage for the price of 10 months. Save ~17% with 2 months free."
              : t("pricingBreakdownNote")}
          </CardDescription>
        </CardFooter>
      </Card>

      <Card size="sm">
        <CardHeader className="gap-1">
          <CardTitle className="text-sm">{t("pricingAllPlansTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {FEATURE_KEYS.map((key) => (
              <li key={key}>· {t(key)}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="text-xs leading-relaxed text-muted-foreground">{t("pricingFooter")}</p>

      <Button size="sm" nativeButton={false} render={<Link href="/bucket" />}>
        {t("createCta")}
      </Button>
    </AppPage>
  )
}
