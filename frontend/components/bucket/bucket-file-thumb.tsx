"use client"

import { useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BucketFileIcon } from "@/components/bucket/bucket-file-icon"
import { fileTypeChip } from "@/lib/bucket/bucket"
import {
  isAnyPreviewable,
  isPreviewableAudio,
  isPreviewableImage,
  isPreviewablePdf,
  isPreviewableText,
  isPreviewableVideo,
} from "@/lib/bucket/filePreview"
import {
  useBucketFilePreview,
  useBucketTextPreview,
} from "@/hooks/bucket/useBucketFilePreview"
import { copyText } from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"
import type { FilePublic } from "@/services/bucket/types"

export function BucketFileThumb({
  bucketId,
  file,
  size = "sm",
  onClick,
}: {
  bucketId: string
  file: FilePublic
  size?: "sm" | "md"
  onClick?: () => void
}) {
  const canThumb = isPreviewableImage(file.contentType)
  const { previewUrl, loading, handleImageError } = useBucketFilePreview(
    bucketId,
    canThumb ? file : null
  )
  const iconSize = size === "md" ? "icon-lg" : "icon-sm"

  const inner = previewUrl && canThumb ? (
    <Image
      src={previewUrl}
      alt=""
      fill
      unoptimized
      className="object-cover"
      onError={handleImageError}
    />
  ) : loading && canThumb ? (
    <Skeleton className="size-full rounded-lg" />
  ) : (
    <BucketFileIcon
      path={file.path}
      className={size === "md" ? "size-6" : "size-4"}
    />
  )

  const box = cn(
    "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg",
    size === "md" ? "size-11" : "size-8"
  )

  if (!onClick) {
    return <span className={box}>{inner}</span>
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={iconSize}
      onClick={onClick}
      className="relative shrink-0 overflow-hidden rounded-lg"
    >
      {inner}
    </Button>
  )
}

function TextContentPreview({
  bucketId,
  file,
}: {
  bucketId: string
  file: FilePublic
}) {
  const t = useTranslations("bucket")
  const { text, loading, error } = useBucketTextPreview(bucketId, file)
  const [copied, setCopied] = useState(false)
  const [wrapLines, setWrapLines] = useState(true)

  if (loading) {
    return <Skeleton className="h-full w-full rounded-xl" />
  }

  if (error || text === null) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {t("previewFailed")}
      </p>
    )
  }

  const lines = text.split("\n")
  const chip = fileTypeChip(file.contentType, file.path)

  const handleCopyContent = async () => {
    await copyText(text)
    setCopied(true)
    toast.success("Copied file content")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border/70 bg-muted/20">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-muted/40 px-3 py-1.5">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Badge variant="secondary" className="h-4.5 px-1.5 font-mono text-[10px] uppercase">
            {chip}
          </Badge>
          <span className="tabular-nums">
            {lines.length} {lines.length === 1 ? "line" : "lines"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setWrapLines((v) => !v)}
            className="h-6 rounded-md px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {wrapLines ? "No wrap" : "Wrap"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => void handleCopyContent()}
            className="h-6 gap-1 rounded-md px-2 text-[11px] font-medium cursor-pointer"
          >
            <HugeiconsIcon
              icon={copied ? Tick02Icon : Copy01Icon}
              className={cn("size-3", copied ? "text-success" : "text-muted-foreground")}
              strokeWidth={1.75}
            />
            <span>{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed select-text">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-muted/40">
                <td className="w-9 pr-3 text-right text-[10px] text-muted-foreground/50 select-none align-top tabular-nums">
                  {idx + 1}
                </td>
                <td
                  className={cn(
                    "text-foreground",
                    wrapLines ? "whitespace-pre-wrap break-all" : "whitespace-pre"
                  )}
                >
                  {line || " "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function BucketFilePreviewImage({
  bucketId,
  file,
  className,
}: {
  bucketId: string
  file: FilePublic
  className?: string
}) {
  const t = useTranslations("bucket")
  const previewable = isAnyPreviewable(file)
  const isText = isPreviewableText(file.contentType, file.path, file.size)
  const { previewUrl, loading, error, handleImageError } = useBucketFilePreview(
    bucketId,
    previewable && !isText ? file : null
  )

  if (!previewable) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/15 p-6">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-xs">
          <BucketFileIcon path={file.path} className="size-7" />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <Badge variant="secondary">{fileTypeChip(file.contentType, file.path)}</Badge>
          <p className="text-xs text-muted-foreground">{file.contentType}</p>
        </div>
      </div>
    )
  }

  if (isText) {
    return (
      <div className={cn("h-full w-full overflow-hidden", className)}>
        <TextContentPreview bucketId={bucketId} file={file} />
      </div>
    )
  }

  if (loading) {
    return <Skeleton className={cn("h-full w-full rounded-xl", className)} />
  }

  if (error || !previewUrl) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {t("previewFailed")}
      </p>
    )
  }

  if (isPreviewableImage(file.contentType)) {
    return (
      <div
        className={cn(
          "relative h-full w-full overflow-hidden rounded-xl bg-muted/20",
          className
        )}
      >
        <Image
          src={previewUrl}
          alt=""
          fill
          unoptimized
          className="object-contain"
          onError={handleImageError}
        />
      </div>
    )
  }

  if (isPreviewableVideo(file.contentType)) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-muted/20 p-2",
          className
        )}
      >
        <video
          src={previewUrl}
          controls
          preload="metadata"
          onError={handleImageError}
          className="max-h-full max-w-full rounded-lg"
        />
      </div>
    )
  }

  if (isPreviewableAudio(file.contentType)) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-4 rounded-xl border border-border/60 bg-muted/15 p-6",
          className
        )}
      >
        <div className="flex size-16 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-xs">
          <BucketFileIcon path={file.path} className="size-8" />
        </div>
        <Badge variant="secondary">{fileTypeChip(file.contentType, file.path)}</Badge>
        <audio
          src={previewUrl}
          controls
          preload="metadata"
          onError={handleImageError}
          className="w-full max-w-sm"
        />
      </div>
    )
  }

  if (isPreviewablePdf(file.contentType, file.path)) {
    return (
      <div
        className={cn(
          "relative h-full w-full overflow-hidden rounded-xl border border-border/60 bg-muted/20",
          className
        )}
      >
        <iframe
          src={previewUrl}
          title={file.path}
          className="h-full w-full border-0"
        />
      </div>
    )
  }

  return null
}
