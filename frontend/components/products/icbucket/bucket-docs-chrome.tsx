"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { BucketDocsMobileNav, BucketDocsMobileNavFallback } from "@/components/products/icbucket/bucket-docs-sidebar"
import { Gitlab } from "@dev.icons/react"
import type { BucketDocNavGroup } from "@/lib/bucket/docs/types"

export function BucketDocsChrome({
  navGroups,
}: {
  navGroups: BucketDocNavGroup[]
  backHref?: string
}) {
  const t = useTranslations("bucket")

  return (
    <div className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              ICBucket
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("docsTitle")}</h1>
            <p className="text-base leading-relaxed text-muted-foreground">{t("docsSubtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button nativeButton={false} render={<Link href="/bucket" />} className="rounded-full">
              {t("createCta")}
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/icbucket" />}
              className="rounded-full"
            >
              {t("pricingLink")}
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <Link
                  href="https://gitlab.com/prasangapokharel/icbucket"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              className="rounded-full gap-2 cursor-pointer"
            >
              <Gitlab size={15} />
              <span>GitLab</span>
            </Button>
          </div>
        </div>
        <div className="mt-6">
          <Suspense fallback={<BucketDocsMobileNavFallback groups={navGroups} />}>
            <BucketDocsMobileNav groups={navGroups} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
