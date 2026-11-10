"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useSWRConfig } from "swr"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { AppPage } from "@/components/layout/dashboard/app-page"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  useBucketList,
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
  moveFile,
  bulkMoveFiles,
} from "@/services/bucket/bucket"
import type { BucketBillingPeriod, FilePathOp } from "@/services/bucket/types"
import { formatBytes, isBucketActive, isBucketFrozen, isBucketTombstoned } from "@/lib/bucket/bucket"
import { joinObjectPath, nestedPrefix, prefixSegments, apiListFolderPrefix } from "@/lib/bucket/folderPath"
import { clearLegacyBucketStorage } from "@/lib/bucket/legacyStorage"
import { useRewrittenLastSegment } from "@/lib/routing/rewrittenRoute"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/ui/utils"

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

  const { stats, isLoading: statsLoading, isValidating: statsValidating, refresh: refreshStats } = useBucketStats(bucketId || null)
  const { buckets, isLoading: bucketsLoading, isValidating: bucketsValidating, refresh: refreshBuckets } = useBucketList()
  const listBucket = buckets.find((b) => b.id === bucketId || b.name === bucketId)
  const isTombstoned = listBucket ? isBucketTombstoned(listBucket.status, listBucket.expiresAt) : false
  const [isManualRefreshing, setIsManualRefreshing] = useState(false)
  const [renewOpen, setRenewOpen] = useState(false)
  const [apiKeysOpen, setApiKeysOpen] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [prefix, setPrefix] = useState("")
  const [folderOpen, setFolderOpen] = useState(false)

  const isCheckingCanister = isManualRefreshing || statsValidating || bucketsValidating

  const handleManualRefresh = useCallback(async () => {
    setIsManualRefreshing(true)
    try {
      await Promise.all([refreshStats(), refreshBuckets()])
    } finally {
      setIsManualRefreshing(false)
    }
  }, [refreshStats, refreshBuckets])

  useEffect(() => {
    if (!bucketId || stats) return
    const timer = setInterval(() => {
      void refreshStats()
      void refreshBuckets()
    }, 10_000)
    return () => clearInterval(timer)
  }, [bucketId, stats, refreshStats, refreshBuckets])

  const active = stats ? isBucketActive(stats.status) : false
  const canWrite = active
  const crumbs = prefixSegments(prefix)

  useEffect(() => {
    clearLegacyBucketStorage()
  }, [])

  useEffect(() => {
    if (stats?.name) {
      document.title = `${stats.name} — ICPay Cloud`
    } else if (listBucket?.name) {
      document.title = `${listBucket.name} — ICPay Cloud`
    } else {
      document.title = "Bucket — ICPay Cloud"
    }
  }, [stats?.name, listBucket?.name])

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const refreshFolderListing = useCallback(async () => {
    if (!identity || !bucketId) return
    const folderPrefix = apiListFolderPrefix(prefix)
    const principal = identity.getPrincipal().toText()
    await mutate(
      (key) =>
        Array.isArray(key) &&
        ((key[0] === "bucket-files" && key[2] === folderPrefix) || key[0] === "bucket-all-files") &&
        key[1] === bucketId &&
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

  const handleMoveFile = async (sourcePath: string, destinationPath: string) => {
    const res = await moveFile(identity, bucketId, sourcePath, destinationPath)
    if ("err" in res) return res.err
    void refreshFolderListing()
    return null
  }

  const handleBulkMoveFiles = async (operations: FilePathOp[]) => {
    if (operations.length === 0) return null
    if (operations.length === 1) {
      return handleMoveFile(operations[0].source, operations[0].destination)
    }
    const res = await bulkMoveFiles(identity, bucketId, operations)
    if ("err" in res) return res.err
    void refreshFolderListing()
    return null
  }

  const [dragOverPrefix, setDragOverPrefix] = useState<string | null>(null)

  const handleDropToPrefix = async (e: React.DragEvent, targetPrefix: string) => {
    e.preventDefault()
    setDragOverPrefix(null)
    if (!canWrite) return

    try {
      const raw = e.dataTransfer.getData("application/json")
      if (!raw) return
      const data = JSON.parse(raw) as { paths: string[] }
      if (!data.paths || data.paths.length === 0) return

      const operations: FilePathOp[] = []
      for (const sourcePath of data.paths) {
        const fileName = sourcePath.split("/").pop() ?? sourcePath
        const destinationPath = joinObjectPath(targetPrefix, fileName)
        if (sourcePath !== destinationPath) {
          operations.push({ source: sourcePath, destination: destinationPath })
        }
      }

      if (operations.length === 0) return

      const err = await handleBulkMoveFiles(operations)
      if (err) {
        toast.error(err)
      } else {
        const destName =
          targetPrefix === ""
            ? (bucketDisplayName ?? "root")
            : targetPrefix.replace(/\/$/, "").split("/").pop() ?? targetPrefix
        const label =
          operations.length === 1
            ? `Moved ${operations[0].source.split("/").pop()} to ${destName}`
            : `Moved ${operations.length} items to ${destName}`
        toast.success(label)
        void refreshFolderListing()
      }
    } catch {
      // fallback
    }
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

  const bucketDisplayName = stats?.name ?? listBucket?.name

  const trail = (
    <Breadcrumb>
      <BreadcrumbList className="text-sm">
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/bucket" />}>{t("back")}</BreadcrumbLink>
        </BreadcrumbItem>
        {sep}
        <BreadcrumbItem>
          {crumbs.length === 0 ? (
            <BreadcrumbPage className="truncate">
              {bucketDisplayName ?? (isTombstoned ? "Tombstoned" : t("notFound"))}
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink
              className={cn(
                "truncate transition-all",
                dragOverPrefix === "" && "rounded bg-primary/10 px-1.5 ring-2 ring-primary/80"
              )}
              render={<button type="button" />}
              onClick={() => setPrefix("")}
              onDragOver={(e) => {
                if (!canWrite) return
                e.preventDefault()
                e.dataTransfer.dropEffect = "move"
                if (dragOverPrefix !== "") setDragOverPrefix("")
              }}
              onDragLeave={(e) => {
                if (e.currentTarget.contains(e.relatedTarget as Node)) return
                if (dragOverPrefix === "") setDragOverPrefix(null)
              }}
              onDrop={(e) => void handleDropToPrefix(e, "")}
            >
              {bucketDisplayName ?? t("files")}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {crumbs.map((name, i) => {
          const last = i === crumbs.length - 1
          const targetPrefix = `${crumbs.slice(0, i + 1).join("/")}/`
          return (
            <span key={`${name}-${i}`} className="contents">
              {sep}
              <BreadcrumbItem>
                {last ? (
                  <BreadcrumbPage className="truncate">{name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className={cn(
                      "truncate transition-all",
                      dragOverPrefix === targetPrefix && "rounded bg-primary/10 px-1.5 ring-2 ring-primary/80"
                    )}
                    render={<button type="button" />}
                    onClick={() => setPrefix(targetPrefix)}
                    onDragOver={(e) => {
                      if (!canWrite) return
                      e.preventDefault()
                      e.dataTransfer.dropEffect = "move"
                      if (dragOverPrefix !== targetPrefix) setDragOverPrefix(targetPrefix)
                    }}
                    onDragLeave={(e) => {
                      if (e.currentTarget.contains(e.relatedTarget as Node)) return
                      if (dragOverPrefix === targetPrefix) setDragOverPrefix(null)
                    }}
                    onDrop={(e) => void handleDropToPrefix(e, targetPrefix)}
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
          <DropdownMenuContent align="end" className="w-44">
            {stats ? (
              <>
                <DropdownMenuItem onClick={() => setNotifOpen(true)} className="gap-2">
                  <HugeiconsIcon icon={BellIcon} className="size-4 text-muted-foreground" strokeWidth={1.75} />
                  <span>Alerts</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/bucket/api?bucket=${encodeURIComponent(bucketId)}`)} className="gap-2">
                  <HugeiconsIcon icon={Key01Icon} className="size-4 text-muted-foreground" strokeWidth={1.75} />
                  <span>{t("apiKeysShort")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            ) : null}
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
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void handleManualRefresh()} className="gap-2">
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

  if (!bucketId || statsLoading || (bucketsLoading && !listBucket && !stats)) {
    return (
      <AppPage>
        <div className="flex items-center justify-between gap-2">
          {trail}
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
      </AppPage>
    )
  }

  if (!stats) {
    if (isTombstoned && listBucket) {
      return (
        <AppPage>
          <div className="flex items-center justify-between gap-2">
            {trail}
          </div>
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="font-mono text-[10px] tracking-wider uppercase">
                  Tombstoned
                </Badge>
                <span className="text-xs text-muted-foreground">Day 21+ Past Expiry</span>
              </div>
              <CardTitle className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
                <HugeiconsIcon icon={Alert02Icon} className="size-5 text-destructive shrink-0" strokeWidth={1.75} />
                <span>{listBucket.name} — Bucket Permanently Purged</span>
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                This bucket reached Day 21+ without renewal. In strict compliance with Internet Computer canister storage and cycle conservation policy, all associated files and data chunks were permanently erased from canister memory and cannot be recovered.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs">
                <div>
                  <div className="text-muted-foreground">Bucket Name</div>
                  <div className="font-medium text-foreground mt-0.5">{listBucket.name}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Allocated Plan</div>
                  <div className="font-medium text-foreground mt-0.5">{formatBytes(listBucket.capacity)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Identifier</div>
                  <div className="font-mono text-foreground mt-0.5 truncate" title={listBucket.id}>{listBucket.id}</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center gap-2.5 border-t border-border/40 pt-4">
              <Button nativeButton={false} render={<Link href="/bucket" />}>
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 mr-1.5" strokeWidth={1.75} />
                <span>Back to Buckets</span>
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => void handleManualRefresh()}
                disabled={isCheckingCanister}
                className="gap-1.5"
              >
                {isCheckingCanister ? (
                  <Spinner className="size-4" />
                ) : (
                  <HugeiconsIcon icon={RefreshIcon} className="size-4" strokeWidth={1.75} />
                )}
                <span>{isCheckingCanister ? "Checking Canister..." : "Check Live Status"}</span>
              </Button>
              <Button variant="outline" nativeButton={false} render={<Link href="/bucket/pricing" />}>
                <span>View Storage Plans</span>
              </Button>
            </CardFooter>
          </Card>
        </AppPage>
      )
    }

    return (
      <AppPage>
        <div className="flex items-center justify-between gap-2">
          {trail}
        </div>
        <Card className="border-border/80 bg-card/60">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center sm:p-12">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <HugeiconsIcon icon={Alert02Icon} className="size-6" strokeWidth={1.75} />
            </div>
            <CardTitle className="text-lg font-semibold text-foreground">{t("notFound")}</CardTitle>
            <CardDescription className="mt-1.5 max-w-md text-sm text-muted-foreground">
              The requested bucket could not be found or loaded. It may have been permanently deleted, or you might not have read permission for this bucket.
            </CardDescription>
            {bucketId ? (
              <div className="mt-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-1 font-mono text-xs text-muted-foreground">
                ID: {bucketId}
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <Button nativeButton={false} render={<Link href="/bucket" />}>
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 mr-1.5" strokeWidth={1.75} />
                <span>Back to Buckets</span>
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => void handleManualRefresh()}
                disabled={isCheckingCanister}
                className="gap-1.5"
              >
                {isCheckingCanister ? (
                  <Spinner className="size-4" />
                ) : (
                  <HugeiconsIcon icon={RefreshIcon} className="size-4" strokeWidth={1.75} />
                )}
                <span>{isCheckingCanister ? "Checking Canister..." : "Check Live Status"}</span>
              </Button>
              <Button variant="outline" nativeButton={false} render={<Link href="/bucket/pricing" />}>
                <span>View Storage Plans</span>
              </Button>
            </div>
          </CardContent>
        </Card>
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
            <Alert className="border-warning/40 bg-warning/10 text-warning flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <HugeiconsIcon icon={Alert02Icon} className="size-5 shrink-0 text-warning mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-semibold tracking-tight text-warning">
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
          <Alert className="border-warning/30 bg-warning/10 text-warning flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <HugeiconsIcon icon={Alert02Icon} className="size-5 shrink-0 text-warning mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-semibold tracking-tight text-warning">
                  Plan Expired · Read-Only Grace Period (Day 1–7)
                </div>
                <AlertDescription className="text-xs text-foreground/85">
                  Your bucket plan has expired. Files remain accessible on CDN, but new uploads are blocked. Renew to restore full upload capabilities.
                </AlertDescription>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRenewOpen(true)}
              className="shrink-0 h-8 gap-1.5 text-xs font-semibold"
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
        onMoveFile={handleMoveFile}
        onBulkMoveFiles={handleBulkMoveFiles}
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
