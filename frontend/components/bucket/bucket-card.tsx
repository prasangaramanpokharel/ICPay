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
import { Switch } from "@/components/ui/switch"
import { TableCell, TableRow } from "@/components/ui/table"
import { useAuth } from "@/components/auth/auth-provider"
import { updateBucket } from "@/services/bucket/bucket"
import { toast } from "sonner"
import { cn } from "@/lib/ui/utils"
import {
  expiresAtToMs,
  formatBytes,
  formatUsageLabel,
  isBucketActive,
  isBucketFrozen,
  isBucketTombstoned,
  isPublicVisibility,
} from "@/lib/bucket/bucket"
import type { BucketPublic, BucketVisibilityVariant } from "@/services/bucket/types"

export function BucketCard({
  bucket,
  onRefresh,
}: {
  bucket: BucketPublic
  onRefresh?: () => void
}) {
  const t = useTranslations("bucket")
  const { identity } = useAuth()
  const [toggling, setToggling] = useState(false)
  const [now] = useState(() => Date.now())
  const active = isBucketActive(bucket.status)
  const isFrozen = isBucketFrozen(bucket.status, bucket.expiresAt, now)
  const isTombstoned = isBucketTombstoned(bucket.status, bucket.expiresAt, now)
  const isPublic = isPublicVisibility(bucket.visibility)

  const handleToggle = async (nextPublic: boolean) => {
    if (toggling) return
    setToggling(true)
    try {
      const nextVisibility: BucketVisibilityVariant = nextPublic ? { Public: null } : { Private: null }
      const res = await updateBucket(identity, bucket.id, { visibility: nextVisibility })
      if ("ok" in res) {
        toast.success(
          nextPublic
            ? `Bucket "${bucket.name}" is now Public! Files accessible via CDN.`
            : `Bucket "${bucket.name}" is now Private. CDN public access disabled.`
        )
        onRefresh?.()
      } else {
        toast.error(res.err || "Failed to update bucket visibility")
      }
    } catch {
      toast.error("Failed to update bucket visibility")
    } finally {
      setToggling(false)
    }
  }

  const usagePct =
    bucket.capacity > 0n ? Math.min(100, Number((bucket.storageUsed * 100n) / bucket.capacity)) : 0

  const msRemaining = expiresAtToMs(bucket.expiresAt) - now
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)))

  return (
    <TableRow className="cursor-pointer">
      <TableCell>
        <Link
          href={`/bucket?id=${encodeURIComponent(bucket.id)}`}
          prefetch
          className="group flex items-center gap-2"
        >
          <HugeiconsIcon icon={Database01Icon} className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" strokeWidth={1.75} />
          <span className="truncate text-sm font-medium">{bucket.name}</span>
        </Link>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="h-4.5 gap-1 px-1.5 text-[10px] font-medium text-muted-foreground"
          >
            <HugeiconsIcon
              icon={isPublic ? Globe02Icon : LockIcon}
              className={cn("size-2.5", isPublic && "text-primary")}
            />
            <span>{isPublic ? t("public") : t("private")}</span>
          </Badge>
          <Switch
            size="sm"
            checked={isPublic}
            onCheckedChange={handleToggle}
            disabled={toggling || !active}
            title={isPublic ? "Switch to Private" : "Switch to Public CDN"}
          />
        </div>
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
              ? "border-warning/30 text-warning bg-warning/10"
              : isTombstoned
              ? "border-destructive/30 text-destructive bg-destructive/10"
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
          <span className={daysRemaining <= 7 ? "font-medium text-warning" : ""}>
            {t("daysLeft", { days: daysRemaining })}
          </span>
        ) : (
          <span className="font-medium text-destructive">
            {isTombstoned ? "Tombstoned" : isFrozen ? "Frozen" : t("expired")}
          </span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Link href={`/bucket?id=${encodeURIComponent(bucket.id)}`} prefetch aria-label={bucket.name}>
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
