"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { mutate } from "swr"
import { toast } from "@/components/ui/sonner"
import { Icon } from "@/components/ui/icon"
import { FolderGlassIcon, DownloadGlassIcon, UploadGlassIcon, SearchGlassIcon, InfoGlassIcon, CopyGlassIcon, DeleteGlassIcon, EllipsisGlassIcon, FolderTreeGlassIcon, SpreadsheetGlassIcon } from "@thesvg/ui-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/ui/copy-button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/components/auth/auth-provider"
import { useAssetCanister } from "@/hooks/canister/useAssetCanister"
import {
  downloadCanisterAsset,
  deleteCanisterAsset,
  fetchCanisterAssetText,
} from "@/services/canister/assetExplorer"
import { AssetUploadDialog } from "@/components/canister/details/asset-upload-dialog"
import { AssetsExplorer, type AssetEntry } from "@/components/canister/assets-explorer"

function formatRelativeTime(nanos: bigint): string {
  if (!nanos || nanos === 0n) return "—"
  const ms = Number(nanos / 1_000_000n)
  const diffSec = Math.floor((Date.now() - ms) / 1000)
  if (diffSec < 0) return "just now"
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 4) return `${diffWeeks}w ago`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths}mo ago`
  const diffYears = Math.floor(diffDays / 365)
  return `${diffYears}y ago`
}

export function AssetExplorerCard({
  canisterId,
  isController,
}: {
  canisterId: string
  isController: boolean
}) {
  const t = useTranslations("myCanisters")
  const { identity, isAuthenticated } = useAuth()
  const { state, refresh } = useAssetCanister(
    identity,
    canisterId,
    Boolean(isAuthenticated)
  )

  const [viewMode, setViewMode] = useState<"table" | "tree">("table")
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const allFiles = useMemo(() => {
    return state.kind === "ok" ? state.files : []
  }, [state])

  const assetEntries: AssetEntry[] = useMemo(() => {
    return allFiles.map((file) => ({
      key: file.key,
      content_type: file.contentType,
      encodings: [
        {
          content_encoding: file.encoding,
          sha256Hex: file.sha256Hex,
          length: file.sizeBytes,
          modified: file.modifiedNanos,
        },
      ],
    }))
  }, [allFiles])

  const filteredFiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return allFiles
    return allFiles.filter(
      (f) =>
        f.key.toLowerCase().includes(q) ||
        f.contentType.toLowerCase().includes(q) ||
        f.encoding.toLowerCase().includes(q)
    )
  }, [allFiles, searchQuery])

  const handleDownload = async (key: string) => {
    if (!identity || !canisterId) return
    setDownloadingKey(key)
    try {
      await downloadCanisterAsset(identity, canisterId, key)
      toast.success(t("assetDownloaded"))
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg.length > 100 ? `${msg.slice(0, 100)}…` : msg)
    } finally {
      setDownloadingKey(null)
    }
  }

  const handleDelete = async () => {
    if (!identity || !canisterId || !deleteTarget) return
    setDeleting(true)
    try {
      await deleteCanisterAsset(identity, canisterId, deleteTarget)
      toast.success(t("assetDeleted"))
      setDeleteTarget(null)
      void mutate(["asset-canister-files", canisterId])
      refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg.length > 100 ? `${msg.slice(0, 100)}…` : msg)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Card className="rounded-xl border border-border/40 bg-card p-6 gap-4">
        <CardHeader className="flex flex-col gap-4 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between p-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Icon icon={FolderGlassIcon} className="size-4 text-muted-foreground" strokeWidth={1.5} />
              <CardTitle className="text-base font-semibold text-foreground">
                {t("assetsTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              {t("assetsSubtitle")}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={viewMode === "tree" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setViewMode(viewMode === "tree" ? "table" : "tree")}
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              <Icon
                icon={viewMode === "tree" ? SpreadsheetGlassIcon : FolderTreeGlassIcon}
                className="size-3.5"
              />
              <span>{viewMode === "tree" ? t("table") : t("playground")}</span>
            </Button>
            {isController && state.kind === "ok" && (
              <Button
                type="button"
                size="sm"
                onClick={() => setUploadOpen(true)}
                className="h-8 gap-1.5 text-xs cursor-pointer"
              >
                <Icon icon={UploadGlassIcon} className="size-3.5" />
                <span>Upload</span>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-0">
          {state.kind === "unsupported" && (
            <div className="rounded-lg border border-border/40 bg-muted/20 p-8 text-center space-y-2">
              <Icon icon={InfoGlassIcon} className="size-5 text-muted-foreground mx-auto" />
              <p className="text-xs font-medium text-foreground">{t("standardCanister")}</p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {t("unsupportedAssets")}
              </p>
            </div>
          )}

          {state.kind !== "unsupported" && (
            <>
              {viewMode === "tree" ? (
                <AssetsExplorer
                  assets={assetEntries}
                  onDelete={(key) => setDeleteTarget(key)}
                  onFetchPreview={(key) => {
                    if (!identity || !canisterId) {
                      return Promise.resolve({ isBinary: true })
                    }
                    return fetchCanisterAssetText(identity, canisterId, key)
                  }}
                  labels={{
                    search: t("searchFiles"),
                    tree: t("tree"),
                    empty: t("noFiles"),
                    noSelection: t("noFileSelection"),
                    type: t("colType"),
                    encoding: t("colEncoding"),
                    size: t("colSize"),
                    modified: t("colModified"),
                    hash: t("colHash"),
                    download: t("download"),
                    delete: t("clear"),
                    hints: {
                      navigate: t("treeNavigate"),
                      expand: t("treeExpand"),
                      open: t("treeOpen"),
                    },
                  }}
                />
              ) : (
                <>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-sm">
                  <Icon
                    icon={SearchGlassIcon}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <Input
                    type="search"
                    placeholder={t("searchFiles")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs rounded-md bg-muted/20 border-border/60"
                  />
                </div>

                <div className="text-xs text-muted-foreground tabular-nums shrink-0">
                  {allFiles.length > 0
                    ? t("showingFiles", { count: filteredFiles.length, total: allFiles.length })
                    : "0 files"}
                </div>
              </div>

              <div className="rounded-lg border border-border/40 overflow-hidden">
                <div className="max-h-[600px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow className="border-b border-border/40 hover:bg-transparent">
                        <TableHead className="font-mono text-xs">{t("colPath")}</TableHead>
                        <TableHead className="text-xs">{t("colType")}</TableHead>
                        <TableHead className="text-xs">{t("colEncoding")}</TableHead>
                        <TableHead className="text-xs text-right">{t("colSize")}</TableHead>
                        <TableHead className="text-xs">{t("colModified")}</TableHead>
                        <TableHead className="font-mono text-xs">{t("colHash")}</TableHead>
                        <TableHead className="w-10 text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {state.kind === "loading" ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-6 ml-auto" /></TableCell>
                          </TableRow>
                        ))
                      ) : state.kind === "error" ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center text-xs text-destructive">
                            {state.error}
                          </TableCell>
                        </TableRow>
                      ) : filteredFiles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                            {t("noFiles")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredFiles.map((file) => {
                          const isDownloading = downloadingKey === file.key
                          return (
                            <TableRow key={file.key} className="border-b border-border/20 transition-colors">
                              <TableCell className="font-mono text-xs text-foreground break-all font-medium align-middle">
                                {file.key}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground whitespace-nowrap align-middle">
                                {file.contentType}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground whitespace-nowrap align-middle">
                                {file.encoding}
                              </TableCell>
                              <TableCell className="text-xs text-foreground font-mono tabular-nums text-right whitespace-nowrap align-middle">
                                {file.sizeLabel}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground whitespace-nowrap align-middle">
                                <Tooltip>
                                  <TooltipTrigger className="cursor-help">
                                    {formatRelativeTime(file.modifiedNanos)}
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    {file.modifiedFormatted}
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap align-middle">
                                {file.sha256Hex && file.sha256Hex !== "—" ? (
                                  <div className="inline-flex items-center gap-1.5">
                                    <span>{file.sha256Hex.slice(0, 8)}…</span>
                                    <CopyButton
                                      value={file.sha256Hex}
                                      aria-label={t("copyHash")}
                                      className="size-4 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                      iconClassName="size-2.5"
                                    />
                                  </div>
                                ) : (
                                  "—"
                                )}
                              </TableCell>
                              <TableCell className="text-right align-middle">
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    render={
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-xs"
                                        className="size-7 cursor-pointer text-muted-foreground hover:text-foreground"
                                        aria-label="Actions"
                                      >
                                        <Icon icon={EllipsisGlassIcon} className="size-3.5" />
                                      </Button>
                                    }
                                  />
                                  <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem
                                      onClick={() => void handleDownload(file.key)}
                                      disabled={isDownloading || deleting}
                                      className="cursor-pointer gap-2 text-xs"
                                    >
                                      <Icon icon={DownloadGlassIcon} className="size-3.5" />
                                      <span>{t("download")}</span>
                                    </DropdownMenuItem>
                                    {file.sha256Hex && file.sha256Hex !== "—" && (
                                      <DropdownMenuItem
                                        onClick={() => {
                                          void navigator.clipboard.writeText(file.sha256Hex)
                                          toast.success(t("copyHash"))
                                        }}
                                        className="cursor-pointer gap-2 text-xs"
                                      >
                                        <Icon icon={CopyGlassIcon} className="size-3.5" />
                                        <span>{t("copyHash")}</span>
                                      </DropdownMenuItem>
                                    )}
                                    {isController && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => setDeleteTarget(file.key)}
                                          disabled={isDownloading || deleting}
                                          className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
                                        >
                                          <Icon icon={DeleteGlassIcon} className="size-3.5" />
                                          <span>{t("clear")}</span>
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </>
      )}
        </CardContent>
      </Card>

      <AssetUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        canisterId={canisterId}
        onSuccess={refresh}
      />

      <AlertDialog
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteFile")}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-1.5 text-xs text-muted-foreground">
              <p>{t("deleteFileConfirm")}</p>
              <p className="font-mono text-foreground break-all">{deleteTarget}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              {deleting ? "Deleting…" : t("clear")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
