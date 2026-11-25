"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { BucketUploadItem } from "@/components/bucket/bucket-upload-dock"
import { prepareUploadFile, uploadValidationError } from "@/lib/bucket/prepareUpload"
import { shouldEmitUploadProgress } from "@/lib/bucket/uploadProgress"

const FILE_CONCURRENCY = 2

function nextUploadId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function formatUploadRate(bytesPerSec: number): string {
  if (!Number.isFinite(bytesPerSec) || bytesPerSec <= 0) return ""
  if (bytesPerSec >= 1024 * 1024) {
    return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`
  }
  return `${Math.max(1, Math.round(bytesPerSec / 1024))} KB/s`
}

function formatEta(remainingSec: number): string {
  if (!Number.isFinite(remainingSec) || remainingSec <= 0) return ""
  const sec = Math.ceil(remainingSec)
  if (sec < 60) return `${sec}s`
  return `${Math.floor(sec / 60)}m ${sec % 60}s`
}

type UploadJob = { id: string; file: File; relativePath?: string }
export type UploadInputItem = File | { file: File; relativePath?: string }
type ProgressSnapshot = { progress: number; speedLabel?: string; etaLabel?: string }

const IGNORED_OS_FILENAMES = new Set([".ds_store", "thumbs.db", "desktop.ini"])
const IGNORED_FOLDER_SEGMENTS = new Set([".git", "node_modules", "__macosx"])

export function isIgnoredSystemEntry(file: File, relativePath?: string): boolean {
  const baseName = file.name.trim()
  const lowerName = baseName.toLowerCase()
  if (!baseName || IGNORED_OS_FILENAMES.has(lowerName) || baseName.startsWith("._")) {
    return true
  }
  const rel = (relativePath ?? file.webkitRelativePath ?? "").replace(/\\/g, "/")
  if (!rel) return false
  const segments = rel.split("/").filter(Boolean)
  for (let i = 0; i < segments.length - 1; i += 1) {
    const seg = segments[i].toLowerCase()
    if (IGNORED_FOLDER_SEGMENTS.has(seg) || seg.startsWith(".")) {
      return true
    }
  }
  return false
}

function displayLabelForUpload(fileName: string, relativePath?: string): string {
  if (!relativePath) return fileName
  const parts = relativePath.replace(/\\/g, "/").split("/").filter(Boolean)
  if (parts.length <= 1) return fileName
  return [...parts.slice(0, -1), fileName].join("/")
}

export function useBucketUpload({
  pathPrefix,
  remainingBytes,
  onUpload,
  onSuccess,
  labels,
  mapApiError,
}: {
  pathPrefix: string
  remainingBytes?: bigint
  onUpload: (
    file: File,
    path: string,
    contentType: string,
    onProgress?: (pct: number) => void
  ) => Promise<string | null>
  onSuccess?: () => void
  labels: {
    size: string
    video: string
    blocked: string
    format: string
    failed: string
    storageLimit?: string
  }
  mapApiError: (message: string) => string
}) {
  const [items, setItems] = useState<BucketUploadItem[]>([])
  const [expanded, setExpanded] = useState(true)
  const queueRef = useRef<UploadJob[]>([])
  const fileMapRef = useRef<Map<string, File>>(new Map())
  const relativePathMapRef = useRef<Map<string, string | undefined>>(new Map())
  const startTimeRef = useRef<Map<string, number>>(new Map())
  const reservedBytesRef = useRef<bigint>(0n)
  const activeRef = useRef(0)
  const progressRef = useRef<Map<string, number>>(new Map())
  const pendingProgressRef = useRef<Map<string, ProgressSnapshot>>(new Map())
  const rafRef = useRef<number | null>(null)

  const flushProgress = useCallback(() => {
    if (rafRef.current != null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const pending = pendingProgressRef.current
      if (pending.size === 0) return
      setItems((prev) =>
        prev.map((item) => {
          const snap = pending.get(item.id)
          return snap != null ? { ...item, ...snap } : item
        })
      )
      pending.clear()
    })
  }, [])

  const patch = useCallback((id: string, partial: Partial<BucketUploadItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...partial } : item)))
  }, [])

  const patchProgress = useCallback(
    (id: string, progress: number) => {
      const prev = progressRef.current.get(id) ?? 0
      if (!shouldEmitUploadProgress(prev, progress)) return
      progressRef.current.set(id, progress)

      const file = fileMapRef.current.get(id)
      const startedAt = startTimeRef.current.get(id)
      let speedLabel: string | undefined
      let etaLabel: string | undefined
      if (file && startedAt && progress > 12 && progress < 100) {
        const elapsedSec = (Date.now() - startedAt) / 1000
        if (elapsedSec > 0.25) {
          const uploadedBytes = (file.size * progress) / 100
          const rate = uploadedBytes / elapsedSec
          speedLabel = formatUploadRate(rate)
          const remainingBytes = Math.max(0, file.size - uploadedBytes)
          etaLabel = formatEta(remainingBytes / rate)
        }
      }

      pendingProgressRef.current.set(id, { progress, speedLabel, etaLabel })
      flushProgress()
    },
    [flushProgress]
  )

  const validationMessage = useCallback(
    (code: NonNullable<ReturnType<typeof uploadValidationError>>) => {
      if (code === "size") return labels.size
      if (code === "video") return labels.video
      if (code === "blocked") return labels.blocked
      return labels.format
    },
    [labels]
  )

  const runJob = useCallback(
    async (job: UploadJob) => {
      const { id, file, relativePath } = job
      const invalid = uploadValidationError(file)
      if (invalid) {
        patch(id, { status: "error", progress: 0, error: validationMessage(invalid) })
        return
      }

      startTimeRef.current.set(id, Date.now())
      patch(id, { status: "uploading", progress: 8, error: undefined, speedLabel: undefined, etaLabel: undefined })

      let claimedBytes = 0n
      try {
        const prepared = await prepareUploadFile(file, pathPrefix, relativePath)
        const finalBytes = BigInt(prepared.file.size)
        if (
          remainingBytes !== undefined &&
          reservedBytesRef.current + finalBytes > remainingBytes
        ) {
          patch(id, {
            status: "error",
            progress: 0,
            error: labels.storageLimit ?? mapApiError("Storage limit reached"),
            speedLabel: undefined,
            etaLabel: undefined,
          })
          return
        }
        reservedBytesRef.current += finalBytes
        claimedBytes = finalBytes

        fileMapRef.current.set(id, prepared.file)
        patch(id, {
          name: displayLabelForUpload(prepared.file.name, relativePath),
          size: prepared.file.size,
          progress: 12,
        })

        const err = await onUpload(
          prepared.file,
          prepared.path,
          prepared.contentType,
          (pct) => patchProgress(id, pct)
        )
        if (err) {
          if (reservedBytesRef.current >= claimedBytes) {
            reservedBytesRef.current -= claimedBytes
          }
          claimedBytes = 0n
          patch(id, { status: "error", error: mapApiError(err), speedLabel: undefined, etaLabel: undefined })
          return
        }

        progressRef.current.set(id, 100)
        patch(id, { status: "done", progress: 100, speedLabel: undefined, etaLabel: undefined })
        onSuccess?.()
      } catch (e) {
        if (claimedBytes > 0n && reservedBytesRef.current >= claimedBytes) {
          reservedBytesRef.current -= claimedBytes
        }
        const msg = e instanceof Error ? e.message : ""
        patch(id, {
          status: "error",
          error: msg ? mapApiError(msg) : labels.failed,
          speedLabel: undefined,
          etaLabel: undefined,
        })
      } finally {
        progressRef.current.delete(id)
        pendingProgressRef.current.delete(id)
        startTimeRef.current.delete(id)
      }
    },
    [labels.failed, labels.storageLimit, mapApiError, onSuccess, onUpload, patch, patchProgress, pathPrefix, remainingBytes, validationMessage]
  )

  const scheduleWork = useCallback(() => {
    const launch = () => {
      while (activeRef.current < FILE_CONCURRENCY && queueRef.current.length > 0) {
        const job = queueRef.current.shift()
        if (!job) break
        activeRef.current += 1
        void runJob(job).finally(() => {
          activeRef.current -= 1
          launch()
        })
      }
    }
    launch()
  }, [runJob])

  const enqueue = useCallback(
    (list: FileList | UploadInputItem[]) => {
      const jobs: UploadJob[] = []
      const added: BucketUploadItem[] = []
      const rawItems = Array.from(list as Iterable<UploadInputItem>)
      for (const item of rawItems) {
        const file = item instanceof File ? item : item.file
        const relativePath =
          (item instanceof File ? undefined : item.relativePath) ??
          (file.webkitRelativePath || undefined)
        if (isIgnoredSystemEntry(file, relativePath)) {
          continue
        }
        const id = nextUploadId()
        fileMapRef.current.set(id, file)
        relativePathMapRef.current.set(id, relativePath)
        jobs.push({ id, file, relativePath })
        added.push({
          id,
          name: displayLabelForUpload(file.name, relativePath),
          size: file.size,
          progress: 0,
          status: "queued",
        })
      }
      if (jobs.length === 0) return
      if (activeRef.current === 0 && queueRef.current.length === 0) {
        reservedBytesRef.current = 0n
        setItems(added)
      } else {
        setItems((prev) => [...prev, ...added])
      }
      queueRef.current.push(...jobs)
      setExpanded(true)
      scheduleWork()
    },
    [scheduleWork]
  )

  const retry = useCallback(
    (id: string) => {
      const file = fileMapRef.current.get(id)
      if (!file) return
      const relativePath = relativePathMapRef.current.get(id)
      patch(id, { status: "queued", progress: 0, error: undefined, speedLabel: undefined, etaLabel: undefined })
      queueRef.current.push({ id, file, relativePath })
      scheduleWork()
    },
    [patch, scheduleWork]
  )

  const retryAllFailed = useCallback(() => {
    const failedItems = items.filter((item) => item.status === "error")
    if (failedItems.length === 0) return
    for (const item of failedItems) {
      const file = fileMapRef.current.get(item.id)
      if (!file) continue
      const relativePath = relativePathMapRef.current.get(item.id)
      patch(item.id, {
        status: "queued",
        progress: 0,
        error: undefined,
        speedLabel: undefined,
        etaLabel: undefined,
      })
      queueRef.current.push({ id: item.id, file, relativePath })
    }
    setExpanded(true)
    scheduleWork()
  }, [items, patch, scheduleWork])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (activeRef.current > 0 || queueRef.current.length > 0) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  const dismiss = useCallback(() => {
    const busy = items.some((item) => item.status === "queued" || item.status === "uploading")
    if (busy) return
    queueRef.current = []
    fileMapRef.current.clear()
    relativePathMapRef.current.clear()
    startTimeRef.current.clear()
    progressRef.current.clear()
    pendingProgressRef.current.clear()
    reservedBytesRef.current = 0n
    setItems([])
  }, [items])

  const busy = items.some((item) => item.status === "queued" || item.status === "uploading")
  const doneCount = items.filter((item) => item.status === "done").length

  return {
    items,
    expanded,
    busy,
    doneCount,
    enqueue,
    retry,
    retryAllFailed,
    dismiss,
    setExpanded,
  }
}
