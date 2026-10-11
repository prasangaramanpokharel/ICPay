"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Database01Icon,
  Globe02Icon,
  LockIcon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  expiresAtToMs,
  formatBytes,
  formatUsageLabel,
  isBucketActive,
  isBucketFrozen,
  isBucketTombstoned,
  isPublicVisibility,
} from "@/lib/bucket/bucket"
import type { BucketPublic } from "@/services/bucket/types"

export function BucketCard({ bucket }: { bucket: BucketPublic }) {
  const t = useTranslations("bucket")
  const [now] = useState(() => Date.now())
  const active = isBucketActive(bucket.status)
  const isFrozen = isBucketFrozen(bucket.status, bucket.expiresAt, now)
  const isTombstoned = isBucketTombstoned(bucket.status, bucket.expiresAt, now)
  const isPublic = isPublicVisibility(bucket.visibility)

  const usagePct =
    bucket.capacity > 0n ? Math.min(100, Number((bucket.storageUsed * 100n) / bucket.capacity)) : 0

  const msRemaining = expiresAtToMs(bucket.expiresAt) - now
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)))

  return (
    <TableRow className="cursor-pointer">
      <TableCell>
        <Link
          href={`/bucket/${encodeURIComponent(bucket.id)}`}
          prefetch
          className="flex items-center gap-2.5"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <HugeiconsIcon icon={Database01Icon} className="size-3.5" strokeWidth={1.75} />
          </div>
          <span className="truncate text-sm font-medium">{bucket.name}</span>
        </Link>
      </TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className="h-4.5 gap-1 px-1.5 text-[10px] font-medium text-muted-foreground"
        >
          <HugeiconsIcon icon={isPublic ? Globe02Icon : LockIcon} className="size-2.5" />
          <span>{isPublic ? t("public") : t("private")}</span>
        </Badge>
      </TableCell>
      <TableCell>
        <div className="space-y-1 max-w-[140px]">
          <div className="text-xs text-muted-foreground tabular-nums">
            {formatUsageLabel(bucket.storageUsed, bucket.capacity)}
          </div>
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: usagePct > 0 ? `${Math.max(2, usagePct)}%` : "0%" }}
            />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant={active ? "outline" : "destructive"}
          className={`h-4.5 px-1.5 text-[10px] font-medium ${
            isFrozen
              ? "border-amber-500/30 text-amber-500 bg-amber-500/10"
              : isTombstoned
              ? "border-red-500/30 text-red-500 bg-red-500/10"
              : ""
          }`}
        >
          {active
            ? t("active")
            : isTombstoned
            ? "Tombstoned"
            : isFrozen
            ? "Frozen"
            : t("expired")}
        </Badge>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground tabular-nums">
        {active ? (
          <span className={daysRemaining <= 7 ? "font-medium text-amber-500" : ""}>
            {t("daysLeft", { days: daysRemaining })}
          </span>
        ) : (
          <span className="font-medium text-destructive">
            {isTombstoned ? "Tombstoned" : isFrozen ? "Frozen" : t("expired")}
          </span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Link href={`/bucket/${encodeURIComponent(bucket.id)}`} prefetch aria-label={bucket.name}>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="size-4 text-muted-foreground"
            strokeWidth={1.75}
          />
        </Link>
      </TableCell>
    </TableRow>
  )
}

export function BucketUsageBar({
  used,
  capacity,
  percent,
}: {
  used: bigint
  capacity: bigint
  percent: bigint
}) {
  const pct = Math.min(100, Number(percent))
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground tabular-nums">
        {formatUsageLabel(used, capacity)}
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: pct > 0 ? `${Math.max(2, pct)}%` : "0%" }}
        />
      </div>
    </div>
  )
}

export function formatFileSize(size: bigint): string {
  return formatBytes(size)
}
