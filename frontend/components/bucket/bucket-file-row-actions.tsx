"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "@/components/ui/toast"
import { Icon } from "@/components/ui/icon"
import { CopyGlassIcon, DeleteGlassIcon, DownloadGlassIcon, FolderGlassIcon, ExternalLinkGlassIcon, EllipsisVerticalGlassIcon, EyeGlassIcon } from "@thesvg/ui-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  bucketCdnFileUrl,
  bucketRawFileUrl,
  optionalText,
  toCdnUrl,
  toRawCanisterUrl,
} from "@/lib/bucket/bucket"
import { downloadBlob, fetchBucketFileBlob } from "@/lib/bucket/filePreview"
import { copyText } from "@/lib/wallet/utils"
import { useAuth } from "@/components/auth/auth-provider"
import type { FilePublic } from "@/services/bucket/types"

export function BucketFileRowActions({
  bucketId,
  bucketName,
  file,
  canWrite,
  onOpenFile,
  onDeleteFile,
}: {
  bucketId: string
  bucketName?: string
  file: FilePublic
  canWrite: boolean
  onOpenFile: (file: FilePublic) => void
  onDeleteFile: (path: string) => void
}) {
  const t = useTranslations("bucket")
  const { identity } = useAuth()
  const [downloading, setDownloading] = useState(false)

  const fileName = file.path.split("/").pop() ?? file.path
  const publicRaw = optionalText(file.publicUrl)

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

  const handleCopy = async (url: string | null) => {
    if (!url) return
    await copyText(url)
    toast.success("Successfully copied")
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await fetchBucketFileBlob({
        publicUrl: rawUrl ?? cdnUrl,
        identity,
        bucketId,
        path: file.path,
        contentType: file.contentType,
      })
      downloadBlob(blob, fileName)
      toast.success("Download started")
    } catch {
      toast.error(t("downloadFailed"))
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-7 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="File actions"
            />
          }
        >
          <Icon icon={EllipsisVerticalGlassIcon} className="size-4" strokeWidth={1.75} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onOpenFile(file)} className="gap-2 text-xs">
            <Icon icon={EyeGlassIcon} className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
            <span>Preview & Details</span>
          </DropdownMenuItem>

          {cdnUrl ? (
            <DropdownMenuItem onClick={() => void handleCopy(cdnUrl)} className="gap-2 text-xs">
              <Icon icon={CopyGlassIcon} className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
              <span>Copy CDN Link</span>
            </DropdownMenuItem>
          ) : null}

          {rawUrl ? (
            <DropdownMenuItem onClick={() => void handleCopy(rawUrl)} className="gap-2 text-xs">
              <Icon icon={ExternalLinkGlassIcon} className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
              <span>Copy Raw Link</span>
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuItem
            onClick={() => void handleDownload()}
            disabled={downloading}
            className="gap-2 text-xs"
          >
            <Icon icon={DownloadGlassIcon} className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
            <span>{downloading ? "Downloading..." : "Download"}</span>
          </DropdownMenuItem>

          {canWrite ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteFile(file.path)}
                className="gap-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <Icon icon={DeleteGlassIcon} className="size-3.5 text-destructive" strokeWidth={1.75} />
                <span>Delete</span>
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function BucketFolderRowActions({
  folderName,
  canWrite,
  onOpenFolder,
  onDeleteFolder,
}: {
  folderName: string
  canWrite: boolean
  onOpenFolder: (name: string) => void
  onDeleteFolder?: (name: string) => void
}) {
  return (
    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-7 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Folder actions"
            />
          }
        >
          <Icon icon={EllipsisVerticalGlassIcon} className="size-4" strokeWidth={1.75} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => onOpenFolder(folderName)} className="gap-2 text-xs">
            <Icon icon={FolderGlassIcon} className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
            <span>Open Folder</span>
          </DropdownMenuItem>
          {canWrite && onDeleteFolder ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteFolder(folderName)}
                className="gap-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <Icon icon={DeleteGlassIcon} className="size-3.5 text-destructive" strokeWidth={1.75} />
                <span>Delete Folder</span>
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
