"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import type { BucketDocNavGroup } from "@/lib/bucket/docs/types"

type BucketDocsPaginationProps = {
  currentSlug: string
  navGroups: BucketDocNavGroup[]
}

export function BucketDocsPagination({ currentSlug, navGroups }: BucketDocsPaginationProps) {
  // Flatten all navigation items in sidebar display order
  const allItems = navGroups.flatMap((group) => group.items)
  const currentIndex = allItems.findIndex((item) => item.slug === currentSlug)

  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null
  const nextItem =
    currentIndex >= 0 && currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null

  if (!prevItem && !nextItem) return null

  const prevHref = prevItem ? (prevItem.slug ? `/bucket/docs/${prevItem.slug}` : "/bucket/docs") : null
  const nextHref = nextItem ? (nextItem.slug ? `/bucket/docs/${nextItem.slug}` : "/bucket/docs") : null

  return (
    <nav
      aria-label="Documentation pagination"
      className="mt-12 flex flex-col sm:flex-row items-stretch justify-between gap-4 border-t border-border/60 pt-6"
    >
      {prevItem && prevHref ? (
        <Link
          href={prevHref}
          className="group flex flex-1 flex-col items-start rounded-xl border border-border/60 bg-card/60 p-4 transition-all hover:border-primary/40 hover:bg-card/90 active:scale-[0.99]"
        >
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="size-3.5 transition-transform group-hover:-translate-x-0.5"
              strokeWidth={1.75}
            />
            Previous
          </span>
          <span className="mt-1.5 font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
            {prevItem.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block flex-1" />
      )}

      {nextItem && nextHref ? (
        <Link
          href={nextHref}
          className="group flex flex-1 flex-col items-end text-right rounded-xl border border-border/60 bg-card/60 p-4 transition-all hover:border-primary/40 hover:bg-card/90 active:scale-[0.99]"
        >
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
            Next
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              strokeWidth={1.75}
            />
          </span>
          <span className="mt-1.5 font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
            {nextItem.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block flex-1" />
      )}
    </nav>
  )
}
