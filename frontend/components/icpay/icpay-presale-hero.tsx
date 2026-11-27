"use client"

import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatUsdPrecise } from "@/lib/market/icpPrice"
import { ICPAY_TOKEN_ICON } from "@/lib/ui/brand-images"
import type { IcpayStats } from "@/services/icpay/icpay"
import { ICP_LEDGER_ID, ICPAY_LEDGER_ID } from "@/services/tokens"

const TRADE_ICPAY_HREF = `/trade?from=${ICP_LEDGER_ID}&to=${ICPAY_LEDGER_ID}`

export function IcpayPresaleHero({
  symbol,
  stats,
  isLoading,
}: {
  symbol: string
  stats: IcpayStats | undefined
  isLoading: boolean
}) {
  const t = useTranslations("buyIcpay")
  const market = stats?.market ?? null
  const change = market?.priceChange24h ?? 0

  return (
    <section className="mx-auto w-full max-w-lg">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3.5 border-b border-border/60 pb-5">
          <span className="relative flex size-12 shrink-0 overflow-hidden rounded-full border border-border">
            <Image
              src={ICPAY_TOKEN_ICON}
              alt={symbol}
              width={48}
              height={48}
              unoptimized
              priority
              className="size-full object-cover"
            />
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg font-semibold tracking-tight">
                {t("heroTitle")}
              </CardTitle>
              <Badge variant="secondary">{t("endedBadge")}</Badge>
            </div>
            <CardDescription>{t("endedSubtitle")}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 py-6">
          <div className="space-y-1.5 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("currentPriceTitle")}
            </p>
            {isLoading && !stats ? (
              <Skeleton className="mx-auto h-9 w-40 rounded-md" />
            ) : (
              <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
                {market ? formatUsdPrecise(market.priceUsd) : "—"}
              </p>
            )}
            {market && (
              <p
                className={`text-xs font-medium tabular-nums ${
                  change > 0
                    ? "text-success"
                    : change < 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
              >
                {change > 0 ? "+" : ""}
                {change.toFixed(2)}% (24h)
              </p>
            )}
          </div>

          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            {t("endedNotice", { symbol })}
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <Button
            size="lg"
            className="w-full font-semibold"
            nativeButton={false}
            render={<Link href={TRADE_ICPAY_HREF} />}
          >
            {t("tradeAction")}
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}
