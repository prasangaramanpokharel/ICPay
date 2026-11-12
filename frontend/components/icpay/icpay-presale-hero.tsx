"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  InformationCircleIcon,
  Shield01Icon,
  Coins01Icon,
  FlashIcon,
  ArrowRight01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card"
import { ShineBorder } from "@/components/ui/shine-border"
import { useAuth } from "@/components/auth/auth-provider"
import { useIcpaySale } from "@/hooks/icpay/useIcpaySale"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import { BuyIcpayDrawer } from "@/components/icpay/buy-icpay-drawer"
import { PresaleStatsPanel } from "@/components/icpay/presale-stats-panel"
import { PresaleGuideDialog } from "@/components/icpay/presale-guide-dialog"
import { hasSeenPresaleGuide } from "@/lib/icpay/presaleGuide"
import { ICPAY_TOKEN_ICON } from "@/lib/ui/brand-images"

export function IcpayPresaleHero({ symbol }: { symbol: string }) {
  const t = useTranslations("buyIcpay")
  const { identity } = useAuth()
  const { sale, isLoading } = useIcpaySale()
  const { price } = useIcpPrice()
  const [buyOpen, setBuyOpen] = useState(false)
  const [manualGuideOpen, setManualGuideOpen] = useState(false)
  const [autoDismissed, setAutoDismissed] = useState(false)
  const unseenGuide = useSyncExternalStore(
    () => () => {},
    () => !hasSeenPresaleGuide(),
    () => false
  )
  const guideOpen =
    manualGuideOpen || (Boolean(sale?.active) && unseenGuide && !autoDismissed)

  const closeGuide = () => {
    setManualGuideOpen(false)
    setAutoDismissed(true)
  }

  const icpUsd = price?.usd
  const tokenUsd = icpUsd ? icpUsd / 20000 : null

  return (
    <section className="mx-auto w-full max-w-2xl space-y-4">
      <Card className="relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
        <ShineBorder
          borderWidth={1.2}
          duration={12}
          shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
        />

        <CardHeader className="relative flex flex-row items-start justify-between gap-4 pb-2">
          <div className="flex items-center gap-3.5">
            <Avatar size="lg" className="size-12 shrink-0 ring-1 ring-border/70 shadow-sm">
              <AvatarImage src={ICPAY_TOKEN_ICON} alt={symbol} />
              <AvatarFallback>{symbol.slice(0, 3)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl font-bold tracking-tight sm:text-2xl">
                  {t("heroTitle")}
                </CardTitle>
                {sale?.active ? (
                  <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-background px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                    {t("liveBadge")}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {t("soldOut")}
                  </span>
                )}
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                {t("heroSubtitle")}
              </CardDescription>
            </div>
          </div>

          <HoverCard>
            <HoverCardTrigger className="cursor-pointer">
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => setManualGuideOpen(true)}
                className="size-8 rounded-full border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={t("viewGuide")}
              >
                <HugeiconsIcon icon={InformationCircleIcon} className="size-4" strokeWidth={2} />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent align="end" className="w-80 space-y-3 p-4 text-xs shadow-xl">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <HugeiconsIcon icon={SparklesIcon} className="size-4 text-primary" />
                <span>{t("viewGuide")}</span>
              </div>
              <p className="leading-relaxed text-muted-foreground">
                {t("guideStep1Body")}
              </p>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="w-full text-xs"
                onClick={() => setManualGuideOpen(true)}
              >
                <span>{t("viewGuide")}</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
              </Button>
            </HoverCardContent>
          </HoverCard>
        </CardHeader>

        <CardContent className="relative space-y-5 pt-2">
          <div className="relative rounded-2xl border border-border/60 bg-muted/30 p-5 text-center">
            <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              {t("rateInfoTitle")}
            </span>
            <p className="mt-2 text-3xl font-black tracking-tight tabular-nums text-foreground sm:text-4xl">
              1 ICP = <span className="text-primary">20,000 ICPAY</span>
            </p>
            {icpUsd && tokenUsd ? (
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2 font-mono text-xs text-muted-foreground tabular-nums">
                <span>1 ICP ≈ ${icpUsd.toFixed(2)} USD</span>
                <span className="text-muted-foreground/40">·</span>
                <span>1 {symbol} ≈ ${tokenUsd.toFixed(6)} USD</span>
              </div>
            ) : null}
          </div>

          <PresaleStatsPanel
            sale={sale}
            symbol={symbol}
            isLoading={isLoading}
            inactiveLabel={t("soldOut")}
          />

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <HoverCard>
              <HoverCardTrigger className="cursor-pointer block">
                <div className="group flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 text-left transition-all duration-200 hover:border-border hover:bg-muted/40">
                  <HugeiconsIcon icon={Shield01Icon} className="size-5 shrink-0 text-primary transition-transform group-hover:scale-110" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
                      {t("heroFeatureLiquidity")}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {t("liquidityInfoTitle")}
                    </p>
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-72 space-y-1.5 text-xs shadow-xl">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <HugeiconsIcon icon={Shield01Icon} className="size-3.5 text-primary" />
                  <span>{t("heroFeatureLiquidity")}</span>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  {t("guideStep2Body")}
                </p>
              </HoverCardContent>
            </HoverCard>

            <HoverCard>
              <HoverCardTrigger className="cursor-pointer block">
                <div className="group flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 text-left transition-all duration-200 hover:border-border hover:bg-muted/40">
                  <HugeiconsIcon icon={Coins01Icon} className="size-5 shrink-0 text-primary transition-transform group-hover:scale-110" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
                      {t("heroFeatureRate")}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {t("rateInfoTitle")}
                    </p>
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-72 space-y-1.5 text-xs shadow-xl">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <HugeiconsIcon icon={Coins01Icon} className="size-3.5 text-primary" />
                  <span>{t("heroFeatureRate")}</span>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  {t("rateInfo")}
                </p>
              </HoverCardContent>
            </HoverCard>

            <HoverCard>
              <HoverCardTrigger className="cursor-pointer block">
                <div className="group flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 text-left transition-all duration-200 hover:border-border hover:bg-muted/40">
                  <HugeiconsIcon icon={FlashIcon} className="size-5 shrink-0 text-primary transition-transform group-hover:scale-110" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
                      {t("heroFeatureInstant")}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {symbol}
                    </p>
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-72 space-y-1.5 text-xs shadow-xl">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <HugeiconsIcon icon={FlashIcon} className="size-3.5 text-primary" />
                  <span>{t("heroFeatureInstant")}</span>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  {t("guideStep1Body")}
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>
        </CardContent>

        <CardFooter className="relative px-6 pt-1 pb-6">
          {identity ? (
            <Button
              size="lg"
              className="h-12 w-full gap-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
              disabled={!sale?.active}
              onClick={() => setBuyOpen(true)}
            >
              <span>{sale?.active ? t("openBuy") : t("soldOut")}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
            </Button>
          ) : (
            <Button
              size="lg"
              className="h-12 w-full gap-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              <span>{t("loginToBuy")}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
            </Button>
          )}
        </CardFooter>
      </Card>

      <PresaleGuideDialog
        open={guideOpen}
        onClose={closeGuide}
      />
      {buyOpen ? (
        <BuyIcpayDrawer open={buyOpen} onOpenChange={setBuyOpen} symbol={symbol} />
      ) : null}
    </section>
  )
}
