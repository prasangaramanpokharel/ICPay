"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Copy01Icon,
  Delete02Icon,
  Download01Icon,
  FlashIcon,
  Globe02Icon,
  LinkSquare02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { ChevronDownIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/ui/utils"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { BucketFileDeleteDialog } from "@/components/bucket/bucket-file-delete-dialog"
import { BucketFilePreviewImage } from "@/components/bucket/bucket-file-thumb"
import { formatFileSize } from "@/components/bucket/bucket-card"
import {
  bucketCdnFileUrl,
  bucketRawFileUrl,
  mapBucketError,
  optionalText,
  toCdnUrl,
  toRawCanisterUrl,
} from "@/lib/bucket/bucket"
import { downloadBlob, fetchBucketFileBlob } from "@/lib/bucket/filePreview"
import { copyText } from "@/lib/wallet/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"
import type { FilePublic } from "@/services/bucket/types"

export function BucketFilePreviewPane({
  bucketId,
  bucketName,
  file,
  canWrite,
  onDelete,
  onDeleted,
}: {
  bucketId: string
  bucketName?: string
  file: FilePublic
  canWrite: boolean
  onDelete: (path: string) => Promise<string | null>
  onDeleted?: () => void
}) {
  const t = useTranslations("bucket")
  const { identity } = useAuth()
  const [copiedMode, setCopiedMode] = useState<"cdn" | "raw" | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const fileName = file.path.split("/").pop() ?? file.path
  const publicRaw = optionalText(file.publicUrl)
  const isPublic = publicRaw !== null

  const cdnUrl = bucketName
    ? bucketCdnFileUrl(bucketName, file.path)
    : publicRaw
      ? toCdnUrl(publicRaw)
      : null

  const rawUrl = bucketName
    ? bucketRawFileUrl(bucketName, file.path)
    : publicRaw
      ? toRawCanisterUrl(publicRaw)
      : null

  const handleCopy = async (url: string | null, mode: "cdn" | "raw") => {
    if (!url) return
    await copyText(url)
    setCopiedMode(mode)
    toast.success(mode === "cdn" ? "CDN link copied to clipboard!" : "Raw canister link copied!")
    setTimeout(() => setCopiedMode(null), 2000)
  }

  const handleOpen = () => {
    const targetUrl = cdnUrl ?? rawUrl
    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer")
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    setDownloadError(null)
    try {
      const blob = await fetchBucketFileBlob({
        publicUrl: rawUrl ?? cdnUrl,
        identity,
        bucketId,
        path: file.path,
        contentType: file.contentType,
      })
      downloadBlob(blob, fileName)
    } catch {
      setDownloadError(t("downloadFailed"))
    } finally {
      setDownloading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError(null)
    const err = await onDelete(file.path)
    setDeleting(false)
    if (err) {
      setDeleteError(mapBucketError(err, t))
      return
    }
    setDeleteOpen(false)
    onDeleted?.()
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <DrawerHeader className="border-b pb-4 text-left">
        <DrawerTitle className="truncate" title={fileName}>
          {fileName}
        </DrawerTitle>
        <DrawerDescription>
          {formatFileSize(file.size)} · {file.contentType}
          {isPublic ? ` · ${t("public")}` : ` · ${t("private")}`}
        </DrawerDescription>
      </DrawerHeader>

      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-3">
        <BucketFilePreviewImage
          bucketId={bucketId}
          file={file}
          className="h-full max-h-full w-full"
        />
      </div>

      {isPublic && cdnUrl ? (
        <div className="mx-4 mb-2 rounded-xl border border-border/70 bg-card/60 p-2.5 backdrop-blur-xs">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <span className="size-1.5 rounded-full bg-success animate-pulse" />
              <span>CDN Link</span>
              <span className="rounded bg-success/15 px-1 py-0.2 text-[9px] font-medium text-success">
                Fast & Cached
              </span>
            </span>
            <button
              type="button"
              onClick={() => handleCopy(cdnUrl, "cdn")}
              className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <HugeiconsIcon
                icon={copiedMode === "cdn" ? Tick02Icon : Copy01Icon}
                className="size-3 text-success"
              />
              <span>{copiedMode === "cdn" ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <p className="font-mono text-[10.5px] text-muted-foreground truncate select-all">{cdnUrl}</p>
        </div>
      ) : null}

      {deleteError && (
        <Alert variant="destructive" className="mx-4 mb-2">
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}
      {downloadError && (
        <Alert variant="destructive" className="mx-4 mb-2">
          <AlertDescription>{downloadError}</AlertDescription>
        </Alert>
      )}

      <DrawerFooter className="border-t pt-4">
        <div className="flex flex-col gap-2">
          <ButtonGroup className="w-full flex">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={downloading}
              onClick={handleDownload}
              className="flex-1 justify-center gap-1.5"
            >
              <HugeiconsIcon icon={Download01Icon} className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <span>{downloading ? "Downloading…" : t("download")}</span>
            </Button>

            {isPublic && (cdnUrl || rawUrl) ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 justify-center gap-1.5 cursor-pointer"
                    >
                      <HugeiconsIcon
                        icon={copiedMode ? Tick02Icon : Copy01Icon}
                        className={cn(
                          "size-4 shrink-0 transition-colors",
                          copiedMode ? "text-primary" : "text-muted-foreground"
                        )}
                        strokeWidth={1.75}
                      />
                      <span className="truncate">
                        {copiedMode === "cdn"
                          ? "Copied CDN!"
                          : copiedMode === "raw"
                            ? "Copied Raw!"
                            : t("copyUrl")}
                      </span>
                      <ChevronDownIcon className="size-3 shrink-0 text-muted-foreground opacity-70" />
                    </Button>
                  }
                />
                <DropdownMenuContent
                  align="end"
                  className="w-72 p-1.5 rounded-2xl border-border/70 bg-popover/95 backdrop-blur-md shadow-2xl"
                >
                  <DropdownMenuItem
                    onClick={() => handleCopy(cdnUrl, "cdn")}
                    className="flex items-start gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-accent/80 transition-colors"
                  >
                    <HugeiconsIcon icon={FlashIcon} className="size-4 shrink-0 mt-0.5 text-success" strokeWidth={1.75} />
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-foreground">Copy CDN Link</span>
                        <span className="rounded bg-success/15 px-1 py-0.2 text-[9px] font-medium text-success">
                          Recommended
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">Fast edge cache · cdn.icpay.app</span>
                      <span className="mt-1 font-mono text-[10px] text-foreground/80 truncate">{cdnUrl}</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuItem
                    onClick={() => handleCopy(rawUrl, "raw")}
                    className="flex items-start gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-accent/80 transition-colors"
                  >
                    <HugeiconsIcon icon={Globe02Icon} className="size-4 shrink-0 mt-0.5 text-primary" strokeWidth={1.75} />
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-foreground">Copy Raw Canister Link</span>
                        <span className="rounded bg-muted px-1 py-0.2 text-[9px] font-medium text-muted-foreground">
                          On-Chain
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">Direct canister · raw.icp0.io</span>
                      <span className="mt-1 font-mono text-[10px] text-muted-foreground truncate">{rawUrl}</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </ButtonGroup>

          <ButtonGroup className="w-full flex">
            {isPublic && (cdnUrl || rawUrl) ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpen}
                className="flex-1 justify-center gap-1.5"
              >
                <HugeiconsIcon icon={LinkSquare02Icon} className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span>{t("openInNewTab")}</span>
              </Button>
            ) : null}

            {canWrite ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={deleting}
                onClick={() => setDeleteOpen(true)}
                className="flex-1 justify-center gap-1.5"
              >
                <HugeiconsIcon icon={Delete02Icon} className="size-4 shrink-0 text-destructive" strokeWidth={1.75} />
                <span>{t("delete")}</span>
              </Button>
            ) : null}
          </ButtonGroup>
        </div>
      </DrawerFooter>

      <BucketFileDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        fileName={fileName}
        deleting={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}

