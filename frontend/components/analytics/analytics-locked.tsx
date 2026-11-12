"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShoppingBag01Icon } from "@hugeicons/core-free-icons"

export function AnalyticsLocked() {
  const t = useTranslations("analytics")

  return (
    <Empty className="rounded-2xl border border-dashed py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={ShoppingBag01Icon} className="size-6 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>{t("lockedTitle")}</EmptyTitle>
        <EmptyDescription>{t("lockedBody")}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button nativeButton={false} render={<Link href="/username" />}>
          {t("lockedAction")}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
