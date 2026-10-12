"use client"

import { useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Upload01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { FILE_ACCEPT, mapBucketError } from "@/lib/bucket/bucket"
import { clearLegacyBucketStorage } from "@/lib/bucket/legacyStorage"
import { useBucketUpload } from "@/hooks/bucket/useBucketUpload"
import {
  BucketUploadDesktopTrigger,
  useBucketUploadDesktopOnly,
} from "@/components/bucket/bucket-upload-desktop-gate"
import { BucketUploadDock } from "@/components/bucket/bucket-upload-dock"

export function BucketUploadControl({
  disabled,
  pathPrefix,
  onUpload,
  onSuccess,
}: {
  disabled: boolean
  pathPrefix: string
  onUpload: (
    file: File,
    path: string,
    contentType: string,
    onProgress?: (pct: number) => void
  ) => Promise<string | null>
  onSuccess?: () => void
}) {
  const t = useTranslations("bucket")
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const { desktopOnly } = useBucketUploadDesktopOnly()
  const blocked = disabled || desktopOnly
  const [isDragging, setIsDragging] = useState(false)
  const dragCounterRef = useRef(0)

  useEffect(() => {
    clearLegacyBucketStorage()
  }, [])

  const { items, expanded, busy, doneCount, enqueue, dismiss, setExpanded } = useBucketUpload({
    pathPrefix,
    onUpload,
    onSuccess,
    labels: {
      size: t("invalidFile"),
      video: t("errVideoBlocked"),
      blocked: t("errScriptBlocked"),
      format: t("errInvalidFormat"),
      failed: t("uploadFailed"),
    },
    mapApiError: (err) => mapBucketError(err, t),
  })

  useEffect(() => {
    if (blocked) return

    const handleDragEnter = (e: DragEvent) => {
      if (!e.dataTransfer || !e.dataTransfer.types.includes("Files")) return
      e.preventDefault()
      dragCounterRef.current += 1
      if (dragCounterRef.current === 1) {
        setIsDragging(true)
      }
    }

    const handleDragOver = (e: DragEvent) => {
      if (!e.dataTransfer || !e.dataTransfer.types.includes("Files")) return
      e.preventDefault()
      e.dataTransfer.dropEffect = "copy"
    }

    const handleDragLeave = (e: DragEvent) => {
      if (!e.dataTransfer || !e.dataTransfer.types.includes("Files")) return
      e.preventDefault()
      dragCounterRef.current -= 1
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0
        setIsDragging(false)
      }
    }

    const handleDrop = (e: DragEvent) => {
      if (!e.dataTransfer || !e.dataTransfer.types.includes("Files")) return
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current = 0
      setIsDragging(false)
      const droppedFiles = e.dataTransfer.files
      if (droppedFiles && droppedFiles.length > 0) {
        enqueue(droppedFiles)
      }
    }

    window.addEventListener("dragenter", handleDragEnter)
    window.addEventListener("dragover", handleDragOver)
    window.addEventListener("dragleave", handleDragLeave)
    window.addEventListener("drop", handleDrop)

    return () => {
      window.removeEventListener("dragenter", handleDragEnter)
      window.removeEventListener("dragover", handleDragOver)
      window.removeEventListener("dragleave", handleDragLeave)
      window.removeEventListener("drop", handleDrop)
    }
  }, [blocked, enqueue])

  const dock =
    items.length > 0 ? (
      <BucketUploadDock
        items={items}
        expanded={expanded}
        title={busy ? t("uploading") : t("uploadSuccess")}
        uploadedLabel={t("uploadedCount", { count: String(doneCount) })}
        onToggle={() => setExpanded((v) => !v)}
        onDismiss={dismiss}
      />
    ) : null

  return (
    <>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={FILE_ACCEPT}
        multiple
        className="sr-only"
        disabled={blocked}
        onChange={(e) => {
          const list = e.target.files
          if (list?.length) enqueue(list)
          if (inputRef.current) inputRef.current.value = ""
        }}
      />

      <BucketUploadDesktopTrigger>
        <Button
          type="button"
          size="sm"
          disabled={blocked}
          onClick={() => inputRef.current?.click()}
        >
          <HugeiconsIcon icon={Upload01Icon} className="size-4" strokeWidth={1.75} />
          {t("upload")}
        </Button>
      </BucketUploadDesktopTrigger>

      {dock && typeof document !== "undefined" ? createPortal(dock, document.body) : null}

      {isDragging && !blocked && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-md transition-all duration-150"
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                dragCounterRef.current = 0
                setIsDragging(false)
                if (e.dataTransfer.files?.length) {
                  enqueue(e.dataTransfer.files)
                }
              }}
            >
              <div className="relative flex flex-col items-center justify-center w-full max-w-lg p-10 text-center border-2 border-dashed rounded-3xl border-primary bg-card/95 shadow-2xl pointer-events-none">
                <div className="flex items-center justify-center size-16 mb-4 rounded-2xl border border-primary/20 bg-primary/10 text-primary animate-bounce shadow-sm">
                  <HugeiconsIcon icon={Upload01Icon} className="size-8" strokeWidth={1.75} />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Drop files to upload
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Release anywhere to instantly upload to your bucket
                </p>
                {pathPrefix ? (
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-mono text-muted-foreground">
                    <span>Target Folder:</span>
                    <span className="font-semibold text-foreground">/{pathPrefix}</span>
                  </div>
                ) : null}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}
