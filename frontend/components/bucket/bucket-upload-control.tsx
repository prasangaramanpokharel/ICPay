"use client"

import { useCallback, useEffect, useRef, useState, type InputHTMLAttributes } from "react"
import { createPortal } from "react-dom"
import { useTranslations } from "next-intl"
import { Icon } from "@/components/ui/icon"
import { ArrowDownGlassIcon, FileDropzoneGlassIcon, FolderGlassIcon, UploadGlassIcon } from "@thesvg/ui-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FILE_ACCEPT, mapBucketError } from "@/lib/bucket/bucket"
import { clearLegacyBucketStorage } from "@/lib/bucket/legacyStorage"
import { useBucketUpload, type UploadInputItem } from "@/hooks/bucket/useBucketUpload"
import {
  BucketUploadDesktopTrigger,
  useBucketUploadDesktopOnly,
} from "@/components/bucket/bucket-upload-desktop-gate"
import { BucketUploadDock } from "@/components/bucket/bucket-upload-dock"

type WebkitEntry = {
  isFile: boolean
  isDirectory: boolean
  name: string
  fullPath?: string
  file?: (success: (file: File) => void, error?: (err: unknown) => void) => void
  createReader?: () => {
    readEntries: (
      success: (entries: WebkitEntry[]) => void,
      error?: (err: unknown) => void
    ) => void
  }
}

async function readAllDirectoryEntries(entry: WebkitEntry): Promise<WebkitEntry[]> {
  if (!entry.createReader) return []
  const reader = entry.createReader()
  const collected: WebkitEntry[] = []
  while (true) {
    const batch = await new Promise<WebkitEntry[]>((resolve) => {
      reader.readEntries(
        (entries) => resolve(entries ?? []),
        () => resolve([])
      )
    })
    if (batch.length === 0) break
    collected.push(...batch)
  }
  return collected
}

async function traverseWebkitEntry(
  entry: WebkitEntry,
  parentPath = ""
): Promise<UploadInputItem[]> {
  const currentRelative = parentPath ? `${parentPath}/${entry.name}` : entry.name
  if (entry.isFile && entry.file) {
    const file = await new Promise<File | null>((resolve) => {
      entry.file?.(
        (f) => resolve(f),
        () => resolve(null)
      )
    })
    if (!file) return []
    return [{ file, relativePath: parentPath ? currentRelative : undefined }]
  }
  if (entry.isDirectory) {
    const children = await readAllDirectoryEntries(entry)
    const nested = await Promise.all(
      children.map((child) => traverseWebkitEntry(child, currentRelative))
    )
    return nested.flat()
  }
  return []
}

async function extractDroppedUploadItems(dataTransfer: DataTransfer): Promise<UploadInputItem[]> {
  const itemList = dataTransfer.items ? Array.from(dataTransfer.items) : []
  const webkitEntries: WebkitEntry[] = []
  for (const item of itemList) {
    if (item.kind !== "file") continue
    const getter = (item as DataTransferItem & { webkitGetAsEntry?: () => WebkitEntry | null })
      .webkitGetAsEntry
    const entry = getter ? getter.call(item) : null
    if (entry) {
      webkitEntries.push(entry)
    }
  }

  if (webkitEntries.length > 0) {
    const results = await Promise.all(webkitEntries.map((entry) => traverseWebkitEntry(entry)))
    const flattened = results.flat()
    if (flattened.length > 0) return flattened
  }

  return dataTransfer.files ? Array.from(dataTransfer.files) : []
}

const folderInputProps: InputHTMLAttributes<HTMLInputElement> & {
  webkitdirectory?: string
  directory?: string
} = {
  webkitdirectory: "",
  directory: "",
}

export function BucketUploadControl({
  disabled,
  pathPrefix,
  remainingBytes,
  onUpload,
  onSuccess,
}: {
  disabled: boolean
  pathPrefix: string
  remainingBytes?: bigint
  onUpload: (
    file: File,
    path: string,
    contentType: string,
    onProgress?: (pct: number) => void
  ) => Promise<string | null>
  onSuccess?: () => void
}) {
  const t = useTranslations("bucket")
  const inputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const { desktopOnly } = useBucketUploadDesktopOnly()
  const blocked = disabled || desktopOnly
  const [isDragging, setIsDragging] = useState(false)
  const dragCounterRef = useRef(0)

  useEffect(() => {
    clearLegacyBucketStorage()
  }, [])

  const {
    items,
    expanded,
    busy,
    doneCount,
    enqueue,
    retry,
    retryAllFailed,
    dismiss,
    setExpanded,
  } = useBucketUpload({
    pathPrefix,
    remainingBytes,
    onUpload,
    onSuccess,
    labels: {
      size: t("invalidFile"),
      video: t("errVideoBlocked"),
      blocked: t("errScriptBlocked"),
      format: t("errInvalidFormat"),
      failed: t("uploadFailed"),
      storageLimit: t("errStorageLimit"),
    },
    mapApiError: (err) => mapBucketError(err, t),
  })

  const handleDataTransferDrop = useCallback(
    async (dataTransfer: DataTransfer) => {
      const extracted = await extractDroppedUploadItems(dataTransfer)
      if (extracted.length > 0) {
        enqueue(extracted)
      }
    },
    [enqueue]
  )

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
      void handleDataTransferDrop(e.dataTransfer)
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
  }, [blocked, handleDataTransferDrop])

  const dock =
    items.length > 0 ? (
      <BucketUploadDock
        items={items}
        expanded={expanded}
        title={busy ? t("uploading") : t("uploadSuccess")}
        uploadedLabel={t("uploadedCount", { count: String(doneCount) })}
        onToggle={() => setExpanded((v) => !v)}
        onDismiss={dismiss}
        onRetry={retry}
        onRetryAllFailed={retryAllFailed}
      />
    ) : null

  return (
    <>
      <input
        ref={inputRef}
        id="bucket-upload-input"
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

      <input
        ref={folderInputRef}
        id="bucket-upload-folder-input"
        type="file"
        multiple
        className="sr-only"
        disabled={blocked}
        {...folderInputProps}
        onChange={(e) => {
          const list = e.target.files
          if (list?.length) enqueue(list)
          if (folderInputRef.current) folderInputRef.current.value = ""
        }}
      />

      <BucketUploadDesktopTrigger>
        <ButtonGroup>
          <Button
            type="button"
            size="sm"
            disabled={blocked}
            onClick={() => inputRef.current?.click()}
            className="gap-1.5"
          >
            <Icon icon={UploadGlassIcon} className="size-4" strokeWidth={1.75} />
            <span>{t("upload")}</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  size="icon-sm"
                  disabled={blocked}
                  aria-label="Upload options"
                  className="border-l border-primary-foreground/20 px-1.5"
                />
              }
            >
              <Icon icon={ArrowDownGlassIcon} className="size-3.5" strokeWidth={2} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => inputRef.current?.click()}
                className="gap-2"
              >
                <Icon
                  icon={UploadGlassIcon}
                  className="size-4 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <span>Upload files</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => folderInputRef.current?.click()}
                className="gap-2"
              >
                <Icon
                  icon={FolderGlassIcon}
                  className="size-4 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <span>Upload folder</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
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
                if (e.dataTransfer) {
                  void handleDataTransferDrop(e.dataTransfer)
                }
              }}
            >
              <div className="relative flex flex-col items-center justify-center w-full max-w-lg p-10 text-center border-2 border-dashed rounded-3xl border-primary bg-card/95 shadow-2xl pointer-events-none">
                <div className="flex items-center justify-center size-16 mb-4 rounded-2xl border border-primary/20 bg-primary/10 text-primary animate-bounce shadow-sm">
                  <Icon icon={FileDropzoneGlassIcon} className="size-8" strokeWidth={1.75} />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Drop files or folders to upload
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Release anywhere to upload files and nested folders to your bucket
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
