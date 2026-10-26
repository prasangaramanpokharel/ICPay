"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar01Icon,
  Database01Icon,
  Folder02Icon,
  Globe02Icon,
  LockIcon,
  RefreshIcon,
  Alert02Icon,
} from "@hugeicons/core-free-icons"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CopyIconIndicator } from "@/components/ui/copy-button"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/components/auth/auth-provider"
import { updateBucket } from "@/services/bucket/bucket"
import { cn } from "@/lib/ui/utils"
import {
  formatBytes,
  isBucketActive,
  isBucketFrozen,
  isBucketTombstoned,
  isPublicVisibility,
  expiresAtToMs,
  bucketCdnBaseUrl,
} from "@/lib/bucket/bucket"
import { copyText } from "@/lib/wallet/utils"
import { toast } from "sonner"
import type { BucketStats, BucketVisibilityVariant } from "@/services/bucket/types"

export function BucketStatsHeader({
  stats,
  onRenew,
  onRefresh,
}: {
  stats: BucketStats
  onRenew: () => void
  onRefresh?: () => void
}) {
  const { identity } = useAuth()
  const t = useTranslations("bucket")
  const [togglingVisibility, setTogglingVisibility] = useState(false)
  const [now] = useState(() => Date.now())
  const active = isBucketActive(stats.status)
  const isFrozen = isBucketFrozen(stats.status, stats.expiresAt, now)
  const isTombstoned = isBucketTombstoned(stats.status, stats.expiresAt, now)
  const isPublic = isPublicVisibility(stats.visibility)
  const [copied, setCopied] = useState(false)
  const [copiedBase, setCopiedBase] = useState(false)

  const cdnBase = bucketCdnBaseUrl(stats.name)

  const usedBytes = stats.storageUsed
  const capacityBytes = stats.capacity
  const usagePct =
    capacityBytes > 0n ? Math.min(100, Number((usedBytes * 100n) / capacityBytes)) : 0
  const usagePctLabel =
    usagePct > 0 ? `${usagePct}%` : usedBytes > 0n ? "< 1%" : "0%"

  const periodDays = Math.max(1, Number(stats.periodDays || 30n))
  const daysRemaining = Math.max(0, Number(stats.daysRemaining))
  const expiryPct = Math.min(100, Math.max(0, Math.round((daysRemaining / periodDays) * 100)))

  const expiryDate = new Date(expiresAtToMs(stats.expiresAt))
  const formattedExpiry = expiryDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const handleCopyId = async () => {
    await copyText(stats.id)
    setCopied(true)
    toast.success("Successfully copied")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyBaseUrl = async () => {
    await copyText(cdnBase)
    setCopiedBase(true)
    toast.success("Successfully copied")
    setTimeout(() => setCopiedBase(false), 2000)
  }

  const handleToggleVisibility = async (nextPublic: boolean) => {
    if (togglingVisibility) return
    setTogglingVisibility(true)
    try {
      const nextVisibility: BucketVisibilityVariant = nextPublic ? { Public: null } : { Private: null }
      const res = await updateBucket(identity, stats.id, { visibility: nextVisibility })
      if ("ok" in res) {
        toast.success(
          nextPublic
            ? `Bucket "${stats.name}" is now Public! Files accessible via CDN.`
            : `Bucket "${stats.name}" is now Private. CDN public access disabled.`
        )
        onRefresh?.()
      } else {
        toast.error(res.err || "Failed to update bucket visibility")
      }
    } catch {
      toast.error("Failed to update bucket visibility")
    } finally {
      setTogglingVisibility(false)
    }
  }

  const planBarColor =
    !active || daysRemaining <= 3
      ? "bg-destructive"
      : daysRemaining <= 7
        ? "bg-warning"
        : "bg-primary"

  return (
    <Card className="overflow-hidden border border-border/70 bg-gradient-to-b from-card/80 to-card/40 shadow-xs">
      <CardContent className="space-y-3 p-3.5 sm:p-4">
        {/* Top bar: Name, Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <HugeiconsIcon icon={Database01Icon} className="size-5 text-primary shrink-0" strokeWidth={1.75} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-foreground">
                  {stats.name}
                </span>
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
                    ? stats.isExpiringSoon
                      ? t("expiringSoon")
                      : t("active")
                    : isTombstoned
                    ? "Tombstoned"
                    : isFrozen
                    ? "Frozen"
                    : t("expired")}
                </Badge>
                <Badge
                  variant="secondary"
                  className="h-4.5 gap-1 px-1.5 text-[10px] font-medium text-muted-foreground"
                >
                  <HugeiconsIcon icon={isPublic ? Globe02Icon : LockIcon} className={cn("size-2.5", isPublic && "text-primary")} />
                  <span>{isPublic ? t("public") : t("private")}</span>
                </Badge>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                <span>
                  {Number(stats.fileCount)} {t("files").toLowerCase()}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <span>ID: <span className="font-mono text-foreground/80">{stats.id}</span></span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="inline-flex size-4 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label="Copy bucket ID"
                    title={copied ? "Copied!" : "Copy bucket ID"}
                  >
                    <CopyIconIndicator copied={copied} iconClassName="size-3" />
                  </button>
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/40 px-2 py-0.5 font-mono text-[11px] text-foreground/90">
                  <span className="font-sans font-medium text-[10.5px] text-muted-foreground">Base URL:</span>
                  <span className="font-mono text-[10.5px] text-foreground font-medium select-all truncate max-w-[200px] sm:max-w-xs">
                    {cdnBase}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyBaseUrl}
                    className="inline-flex size-4 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label="Copy CDN Base URL"
                    title={copiedBase ? "Copied CDN URL!" : "Copy CDN Base URL"}
                  >
                    <CopyIconIndicator copied={copiedBase} iconClassName="size-3" />
                  </button>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-2.5 py-1 text-xs">
              <HugeiconsIcon
                icon={isPublic ? Globe02Icon : LockIcon}
                className={cn("size-3.5", isPublic ? "text-primary" : "text-muted-foreground")}
                strokeWidth={1.75}
              />
              <span className="text-[11px] font-medium text-foreground">
                {isPublic ? "Public CDN" : "Private"}
              </span>
              <Switch
                size="sm"
                checked={isPublic}
                onCheckedChange={handleToggleVisibility}
                disabled={togglingVisibility || !active}
                title={isPublic ? "Switch to Private" : "Switch to Public CDN"}
              />
            </div>

            <Button
              type="button"
              variant={stats.isExpiringSoon || !active ? "default" : "outline"}
              size="sm"
              onClick={onRenew}
              className="h-8 shrink-0 gap-1.5 text-xs"
            >
              <HugeiconsIcon icon={RefreshIcon} className="size-3.5" strokeWidth={1.75} />
              <span>{t("renew")}</span>
            </Button>
          </div>
        </div>

        {/* Dual Progress Bars Grid */}
        <div className="grid grid-cols-1 gap-3 border-t border-border/50 pt-2.5 sm:grid-cols-2 sm:gap-6">
          {/* Storage Usage Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                <HugeiconsIcon icon={Folder02Icon} className="size-3.5 text-primary" />
                <span>{t("usage")}</span>
              </div>
              <span className="font-medium text-foreground tabular-nums">
                {formatBytes(usedBytes)}{" "}
                <span className="font-normal text-muted-foreground">
                  / {formatBytes(capacityBytes)} ({usagePctLabel})
                </span>
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: usagePct > 0 ? `${Math.max(2, usagePct)}%` : "0%" }}
              />
            </div>
          </div>

          {/* Expiry / Days Remaining Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                <HugeiconsIcon
                  icon={stats.isExpiringSoon || !active ? Alert02Icon : Calendar01Icon}
                  className={
                    stats.isExpiringSoon || !active
                      ? "size-3.5 text-warning"
                      : "size-3.5 text-primary"
                  }
                />
                <span>Plan Duration</span>
              </div>
              <span className="font-medium text-foreground tabular-nums">
                {active ? (
                  <>
                    <span
                      className={
                        daysRemaining <= 3
                          ? "font-semibold text-destructive"
                          : daysRemaining <= 7
                            ? "font-semibold text-warning"
                            : "text-foreground"
                      }
                    >
                      {t("daysLeft", { days: daysRemaining })}
                    </span>
                    <span className="font-normal text-muted-foreground"> ({formattedExpiry})</span>
                  </>
                ) : (
                  <span className="font-semibold text-destructive">{t("expired")}</span>
                )}
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full transition-all duration-300 ${planBarColor}`}
                style={{ width: `${Math.max(active ? 2 : 0, expiryPct)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
