"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useSWRConfig } from "swr"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  BellIcon,
  Book02Icon,
  Coins01Icon,
  Folder02Icon,
  Key01Icon,
  MoreVerticalIcon,
  Plug01Icon,
  RefreshIcon,
  Alert02Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AppPage } from "@/components/layout/dashboard/app-page"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { BucketFilesPanel } from "@/components/bucket/bucket-files-panel"
import { BucketFolderDialog } from "@/components/bucket/bucket-folder-dialog"
import { BucketUploadControl } from "@/components/bucket/bucket-upload-control"
import { BucketRenewDrawer } from "@/components/bucket/bucket-renew-drawer"
import { BucketApiKeysModal } from "@/components/bucket/bucket-api-keys-modal"
import { BucketConnectModal } from "@/components/bucket/bucket-connect-modal"
import { BucketNotificationModal } from "@/components/bucket/bucket-notification-modal"
import { BucketStatsHeader } from "@/components/bucket/bucket-stats-header"
import {
  useBucketStats,
  useInvalidateBucketCache,
} from "@/hooks/bucket/useBucket"
import { useAuth } from "@/components/auth/auth-provider"
import { useRefreshWallet } from "@/hooks/wallet/useWalletData"
import {
  deleteFile,
  bulkDeleteFiles,
  renewBucket,
  uploadFile,
  createFolder,
  deleteFolder,
} from "@/services/bucket/bucket"
import type { BucketBillingPeriod } from "@/services/bucket/types"
import { isBucketActive, isBucketFrozen, isBucketTombstoned } from "@/lib/bucket/bucket"
import { joinObjectPath, nestedPrefix, prefixSegments, apiListFolderPrefix } from "@/lib/bucket/folderPath"
import { clearLegacyBucketStorage } from "@/lib/bucket/legacyStorage"
import { useRewrittenLastSegment } from "@/lib/routing/rewrittenRoute"

export function BucketDetail({ bucketId: bucketIdProp }: { bucketId?: string } = {}) {
  const t = useTranslations("bucket")
  const tNav = useTranslations("settings.sections")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const invalidateBucketCache = useInvalidateBucketCache()
  const { mutate } = useSWRConfig()

  const rawLastSegment = useRewrittenLastSegment()
  const bucketId =
    bucketIdProp ||
    searchParams.get("id") ||
    (rawLastSegment && rawLastSegment !== "id" && rawLastSegment !== "bucket" ? rawLastSegment : "")

  const { stats, isLoading: statsLoading, refresh: refreshStats } = useBucketStats(bucketId || null)
  const [renewOpen, setRenewOpen] = useState(false)
  const [apiKeysOpen, setApiKeysOpen] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [prefix, setPrefix] = useState("")
  const [folderOpen, setFolderOpen] = useState(false)

  const active = stats ? isBucketActive(stats.status) : false
  const canWrite = active
  const crumbs = prefixSegments(prefix)

  useEffect(() => {
    clearLegacyBucketStorage()
  }, [])

  useEffect(() => {
    if (stats?.name) {
      document.title = `${stats.name} — ICPay Cloud`
    } else {
      document.title = "Bucket — ICPay Cloud"
    }
  }, [stats?.name])

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const refreshFolderListing = useCallback(async () => {
    if (!identity || !bucketId) return
    const folderPrefix = apiListFolderPrefix(prefix)
    const principal = identity.getPrincipal().toText()
    await mutate(
      (key) =>
        Array.isArray(key) &&
        key[0] === "bucket-files" &&
        key[1] === bucketId &&
        key[2] === folderPrefix &&
        key[key.length - 1] === principal
    )
    await refreshStats()
  }, [identity, bucketId, prefix, mutate, refreshStats])

  const scheduleRefreshAfterUpload = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    refreshTimerRef.current = setTimeout(() => {
      refreshTimerRef.current = null
      void refreshFolderListing()
    }, 300)
  }, [refreshFolderListing])

  const handleUpload = useCallback(
    async (
      file: File,
      path: string,
      contentType: string,
      onProgress?: (pct: number) => void
    ) => {
      const res = await uploadFile(identity, bucketId, path, file, onProgress, contentType)
      if ("err" in res) return res.err
      return null
    },
    [identity, bucketId]
  )

  const handleUploadSuccess = useCallback(() => {
    scheduleRefreshAfterUpload()
  }, [scheduleRefreshAfterUpload])

  const handleCreateFolder = useCallback(
    async (name: string) => {
      const path = joinObjectPath(prefix, `${name}/`)
      const res = await createFolder(identity, bucketId, path)
      if ("err" in res) throw new Error(res.err)
      setPrefix(nestedPrefix(prefix, name))
      void refreshFolderListing()
    },
    [identity, bucketId, prefix, refreshFolderListing]
  )

  const handleDelete = async (path: string) => {
    const res = await deleteFile(identity, bucketId, path)
    if ("err" in res) return res.err
    return null
  }

  const handleDeletePaths = async (paths: string[]) => {
    if (paths.length === 0) return null
    if (paths.length === 1) return handleDelete(paths[0])
    const res = await bulkDeleteFiles(identity, bucketId, paths)
    if ("err" in res) return res.err
    return null
  }

  const handleDeleteFolders = async (paths: string[]) => {
    for (const path of paths) {
      const res = await deleteFolder(identity, bucketId, path)
      if ("err" in res) return res.err
    }
    await invalidateBucketCache()
    return null
  }

  const handleRenew = async (period: BucketBillingPeriod = "monthly") => {
    const res = await renewBucket(identity, bucketId, period)
    if ("err" in res) return res.err
    refreshWallet()
    await Promise.all([refreshStats(), invalidateBucketCache()])
    return null
  }

  const sep = (
    <BreadcrumbSeparator>
      <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" strokeWidth={1.75} />
    </BreadcrumbSeparator>
  )

  const trail = (
    <Breadcrumb>
      <BreadcrumbList className="text-sm">
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/bucket" />}>{t("back")}</BreadcrumbLink>
        </BreadcrumbItem>
        {sep}
        <BreadcrumbItem>
          {crumbs.length === 0 ? (
            <BreadcrumbPage className="truncate">{stats?.name ?? t("files")}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink
              className="truncate"
              render={<button type="button" />}
              onClick={() => setPrefix("")}
            >
              {stats?.name ?? t("files")}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {crumbs.map((name, i) => {
          const last = i === crumbs.length - 1
          return (
            <span key={`${name}-${i}`} className="contents">
              {sep}
              <BreadcrumbItem>
                {last ? (
                  <BreadcrumbPage className="truncate">{name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="truncate"
                    render={<button type="button" />}
                    onClick={() => setPrefix(`${crumbs.slice(0, i + 1).join("/")}/`)}
                  >
                    {name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )

  const headerActions = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <ButtonGroup>
        {stats ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConnectOpen(true)}
            className="gap-1.5"
          >
            <HugeiconsIcon icon={Plug01Icon} className="size-4" strokeWidth={1.75} />
            <span>Connect</span>
          </Button>
        ) : null}
        {stats ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setNotifOpen(true)}
            className="gap-1.5"
            title="Configure expiry notification alerts"
          >
            <HugeiconsIcon icon={BellIcon} className="size-4" strokeWidth={1.75} />
            <span>Alerts</span>
          </Button>
        ) : null}
        {stats ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setApiKeysOpen(true)}
            className="gap-1.5"
          >
            <HugeiconsIcon icon={Key01Icon} className="size-4" strokeWidth={1.75} />
            <span>{t("apiKeysShort")}</span>
          </Button>
        ) : null}
        {canWrite ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFolderOpen(true)}
            className="gap-1.5"
          >
            <HugeiconsIcon icon={Folder02Icon} className="size-4" strokeWidth={1.75} />
            <span>{t("createFolder")}</span>
          </Button>
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={tNav("more")}
                title={tNav("more")}
                className="shrink-0"
              />
            }
          >
            <HugeiconsIcon icon={MoreVerticalIcon} className="size-4" strokeWidth={1.75} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push("/bucket/docs")} className="gap-2">
              <HugeiconsIcon
                icon={Book02Icon}
                className="size-4 text-muted-foreground"
                strokeWidth={1.75}
              />
              <span>{t("docs")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/bucket/pricing")} className="gap-2">
              <HugeiconsIcon
                icon={Coins01Icon}
                className="size-4 text-muted-foreground"
                strokeWidth={1.75}
              />
              <span>{t("pricingLink")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => void refreshStats()} className="gap-2">
              <HugeiconsIcon
                icon={RefreshIcon}
                className="size-4 text-muted-foreground"
                strokeWidth={1.75}
              />
              <span>{t("refresh")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>

      {canWrite ? (
        <BucketUploadControl
          disabled={!canWrite}
          pathPrefix={prefix}
          onUpload={handleUpload}
          onSuccess={handleUploadSuccess}
        />
      ) : null}
    </div>
  )

  if (!bucketId || (statsLoading && !stats)) {
    return (
      <AppPage>
        <div className="flex items-center justify-between gap-2">
          {trail}
          {headerActions}
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
      </AppPage>
    )
  }

  if (!stats) {
    return (
      <AppPage>
        <div className="flex items-center justify-between gap-2">
          {trail}
          {headerActions}
        </div>
        <Alert variant="destructive">
          <AlertDescription>{t("notFound")}</AlertDescription>
        </Alert>
      </AppPage>
    )
  }

  return (
    <AppPage>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {trail}
        {headerActions}
      </div>

      <BucketStatsHeader stats={stats} onRenew={() => setRenewOpen(true)} onRefresh={refreshStats} />

      {!canWrite && (() => {
        const frozen = isBucketFrozen(stats.status, stats.expiresAt)
        const tombstoned = isBucketTombstoned(stats.status, stats.expiresAt)
        if (tombstoned) {
          return (
            <Alert variant="destructive" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <HugeiconsIcon icon={Alert02Icon} className="size-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-semibold tracking-tight">Bucket Tombstoned (Day 31+)</div>
                  <AlertDescription className="text-xs">
                    This bucket has been deleted due to non-renewal. Data cannot be recovered.
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )
        }
        if (frozen) {
          return (
            <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-500 dark:text-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <HugeiconsIcon icon={Alert02Icon} className="size-5 shrink-0 text-amber-500 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-semibold tracking-tight text-amber-500 dark:text-amber-300">
                    Bucket Frozen (Day 8–30)
                  </div>
                  <AlertDescription className="text-xs text-foreground/85">
                    Grace period expired. All file downloads and uploads are frozen. Renew now before permanent deletion on Day 31.
                  </AlertDescription>
                </div>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setRenewOpen(true)}
                className="shrink-0 h-8 gap-1.5 text-xs font-semibold"
              >
                <HugeiconsIcon icon={RefreshIcon} className="size-3.5" />
                <span>Renew to Unfreeze</span>
              </Button>
            </Alert>
          )
        }
        return (
          <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-500 dark:text-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <HugeiconsIcon icon={Alert02Icon} className="size-5 shrink-0 text-amber-500 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-semibold tracking-tight text-amber-500 dark:text-amber-300">
                  Plan Expired · Read-Only Grace Period (Day 1–7)
                </div>
                <AlertDescription className="text-xs text-foreground/85">
                  Your bucket plan has expired. Files remain accessible on CDN, but new uploads are blocked. Renew to restore full upload capabilities.
                </AlertDescription>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setRenewOpen(true)}
              className="shrink-0 h-8 gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white"
            >
              <HugeiconsIcon icon={RefreshIcon} className="size-3.5" />
              <span>Renew Bucket</span>
            </Button>
          </Alert>
        )
      })()}

      <BucketFilesPanel
        bucketId={bucketId}
        bucketName={stats.name}
        canWrite={canWrite}
        prefix={prefix}
        onPrefixChange={setPrefix}
        onDelete={handleDelete}
        onDeletePaths={handleDeletePaths}
        onDeleteFolders={handleDeleteFolders}
        onCreateFolder={() => setFolderOpen(true)}
      />

      <BucketFolderDialog
        open={folderOpen}
        onOpenChange={setFolderOpen}
        onCreate={handleCreateFolder}
      />

      <BucketRenewDrawer
        bucketId={bucketId}
        open={renewOpen}
        onOpenChange={setRenewOpen}
        onRenew={handleRenew}
      />

      <BucketApiKeysModal
        bucketId={bucketId}
        open={apiKeysOpen}
        onOpenChange={setApiKeysOpen}
      />

      <BucketConnectModal
        bucketId={bucketId}
        stats={stats}
        open={connectOpen}
        onOpenChange={setConnectOpen}
        onOpenApiKeys={() => setApiKeysOpen(true)}
      />

      <BucketNotificationModal
        bucketId={bucketId}
        bucketName={stats?.name}
        open={notifOpen}
        onOpenChange={setNotifOpen}
      />
    </AppPage>
  )
}
