"use client"

import Link from "next/link"
import { Icon } from "@/components/ui/icon"
import { ArrowLeftGlassIcon, ArrowRightGlassIcon } from "@thesvg/ui-react"
import { cronDocHref } from "@/lib/cron/docs/nav"
import type { CronDocNavGroup } from "@/lib/cron/docs/types"

type CronDocsPaginationProps = {
  currentSlug: string
  navGroups: CronDocNavGroup[]
}

export function CronDocsPagination({ currentSlug, navGroups }: CronDocsPaginationProps) {
  const allItems = navGroups.flatMap((group) => group.items)
  const currentIndex = allItems.findIndex((item) => item.slug === currentSlug)

  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null
  const nextItem =
    currentIndex >= 0 && currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null

  if (!prevItem && !nextItem) return null

  const prevHref = prevItem ? cronDocHref(prevItem.slug) : null
  const nextHref = nextItem ? cronDocHref(nextItem.slug) : null

  return (
    <nav
      aria-label="Documentation pagination"
      className="mt-12 flex flex-col sm:flex-row items-stretch justify-between gap-4 border-t border-border/40 pt-6"
    >
      {prevItem && prevHref ? (
        <Link
          href={prevHref}
          className="group flex flex-1 flex-col items-start rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-border hover:bg-muted/30"
        >
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            <Icon
              icon={ArrowLeftGlassIcon}
              className="size-3.5 transition-transform group-hover:-translate-x-0.5"
            />
            Previous
          </span>
          <span className="mt-1.5 font-semibold text-sm text-foreground">
            {prevItem.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block flex-1" />
      )}

      {nextItem && nextHref ? (
        <Link
          href={nextHref}
          className="group flex flex-1 flex-col items-end rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-border hover:bg-muted/30 text-right"
        >
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Next
            <Icon
              icon={ArrowRightGlassIcon}
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
            />
          </span>
          <span className="mt-1.5 font-semibold text-sm text-foreground">
            {nextItem.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block flex-1" />
      )}
    </nav>
  )
}
