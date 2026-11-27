"use client"

import { useTranslations } from "next-intl"
import { useIcpayStats } from "@/hooks/icpay/useIcpayStats"
import { IcpayPresaleHero } from "@/components/icpay/icpay-presale-hero"
import { AppPage } from "@/components/layout/dashboard/app-page"

const ICPAY_SYMBOL = "ICPAY"

export function IcpayPresaleView() {
  const t = useTranslations("buyIcpay")
  const { stats, isLoading } = useIcpayStats()
  const symbol = stats?.symbol ?? ICPAY_SYMBOL

  return (
    <AppPage title={t("heroTitle")} description={t("endedSubtitle")}>
      <IcpayPresaleHero symbol={symbol} stats={stats} isLoading={isLoading} />
    </AppPage>
  )
}
