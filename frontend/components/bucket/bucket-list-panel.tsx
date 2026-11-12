"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Book02Icon, CloudIcon, Key01Icon, PlayIcon, Search01Icon } from "@hugeicons/core-free-icons"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { BucketCard } from "@/components/bucket/bucket-card"
import { BucketCreateForm } from "@/components/bucket/bucket-create-form"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Card, CardContent } from "@/components/ui/card"
import { ShineBorder } from "@/components/ui/shine-border"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/components/auth/auth-provider"
import { useBucketList, useInvalidateBucketCache } from "@/hooks/bucket/useBucket"
import { clearLegacyBucketStorage } from "@/lib/bucket/legacyStorage"
import { useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { isBucketActive } from "@/lib/bucket/bucket"
import { createBucket } from "@/services/bucket/bucket"
import { registerBucketEmail } from "@/services/notifier/notifier"
import type { BucketBillingPeriod } from "@/services/bucket/types"

type FilterTab = "all" | "active" | "expired"

export function BucketListPanel() {
  const t = useTranslations("bucket")
  const tCommon = useTranslations("common")
  const tGov = useTranslations("governance")
  const tAnalytics = useTranslations("analytics")
  const router = useRouter()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const invalidateBucketCache = useInvalidateBucketCache()
  const { buckets, isLoading, refresh } = useBucketList()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<FilterTab>("all")
  const [createOpen, setCreateOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)

  useEffect(() => {
    clearLegacyBucketStorage()
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return buckets.filter((bucket) => {
      const active = isBucketActive(bucket.status)
      if (filter === "active" && !active) return false
      if (filter === "expired" && active) return false
      if (!needle) return true
      return bucket.name.toLowerCase().includes(needle) || bucket.id.toLowerCase().includes(needle)
    })
  }, [buckets, filter, query])

  const handleCreate = async (
    name: string,
    capacityGB: number,
    visibility: Parameters<typeof createBucket>[3],
    period: BucketBillingPeriod = "monthly",
    alertEmail?: string
  ): Promise<string | null> => {
    const result = await createBucket(identity, name, capacityGB, visibility, period)
    if ("err" in result) return result.err
    if (alertEmail && alertEmail.trim()) {
      void registerBucketEmail(identity, result.ok, alertEmail.trim())
    }
    refreshWallet()
    await Promise.all([refresh(), invalidateBucketCache()])
    setCreateOpen(false)
    router.push(`/bucket?id=${encodeURIComponent(result.ok)}`)
    return null
  }

  return (
    <AppPage
      title={t("title")}
      description={t("subtitle")}
      actions={
        <>
          <ButtonGroup>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-medium"
              nativeButton={false}
              render={<Link href="/bucket/api" />}
            >
              <HugeiconsIcon icon={Key01Icon} className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
              <span>API</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-medium"
              nativeButton={false}
              render={<Link href="/bucket/docs" />}
            >
              <HugeiconsIcon icon={Book02Icon} className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
              <span>Docs</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-medium"
              onClick={() => setGuideOpen(true)}
            >
              <HugeiconsIcon icon={PlayIcon} className="size-3.5 text-primary fill-primary/20" strokeWidth={1.75} />
              <span>{t("docs")}</span>
            </Button>
          </ButtonGroup>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
            <HugeiconsIcon icon={Add01Icon} className="size-4" strokeWidth={1.75} />
            {t("createCta")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tCommon("search")}
            className="pl-10"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <ButtonGroup>
          {(["all", "active", "expired"] as const).map((tab) => (
            <Button
              key={tab}
              type="button"
              size="sm"
              variant={filter === tab ? "secondary" : "outline"}
              onClick={() => setFilter(tab)}
            >
              {tab === "all" ? tGov("filter.all") : tab === "active" ? t("active") : t("expired")}
            </Button>
          ))}
        </ButtonGroup>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/bucket/pricing" />}>
          {t("pricingLink")}
        </Button>
      </div>

      {isLoading && buckets.length === 0 ? (
        <Card>
          <CardContent className="space-y-2 py-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Empty className="rounded-2xl border border-dashed py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={CloudIcon} className="size-6 text-muted-foreground" strokeWidth={1.75} />
            </EmptyMedia>
            <EmptyTitle>{t("empty")}</EmptyTitle>
            <EmptyDescription>{t("emptyHint")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
              <HugeiconsIcon icon={Add01Icon} className="size-4" strokeWidth={1.75} />
              {t("createCta")}
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("visibility")}</TableHead>
                <TableHead>{t("usage")}</TableHead>
                <TableHead>{tAnalytics("colStatus")}</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((bucket) => (
                <BucketCard key={bucket.id} bucket={bucket} onRefresh={refresh} />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <ShineBorder
            className="z-0 pointer-events-none"
            borderWidth={1.5}
            duration={12}
            shineColor={["var(--primary)", "var(--accent)", "var(--primary)"]}
          />
          <div className="relative z-10 flex flex-col gap-5">
            <DialogHeader>
              <DialogTitle>{t("formTitle")}</DialogTitle>
              <DialogDescription>{t("formSubtitle")}</DialogDescription>
            </DialogHeader>
            <BucketCreateForm onCreate={handleCreate} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="max-w-2xl sm:max-w-3xl overflow-hidden p-0">
          <DialogHeader className="p-4 pb-3 border-b border-border/60">
            <DialogTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={PlayIcon} className="size-4 text-primary fill-primary/20" strokeWidth={1.75} />
              How to create an icBucket
            </DialogTitle>
            <DialogDescription>
              Step-by-step video guide to launching on-chain S3-compatible cloud storage on the Internet Computer.
            </DialogDescription>
          </DialogHeader>
          <div className="relative aspect-video w-full bg-muted">
            <video
              src="https://res.cloudinary.com/dn2ycbmrc/video/upload/v1791783562/howtocreaticBucket_bxifwv.mp4"
              controls
              autoPlay
              playsInline
              className="h-full w-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </AppPage>
  )
}
