import imageCompression from "browser-image-compression"
import { pathExtension } from "@/lib/bucket/allowedFiles"
import {
  blobHasJpegHeader,
  blobHasPngHeader,
  blobHasWebpHeader,
  validateJpegHeader,
  validatePngHeader,
  validateWebpHeader,
} from "@/lib/bucket/imageBytes"
import { sanitizeUploadFilename } from "@/lib/bucket/uploadPath"
import { shouldConvertRasterToWebp } from "@/lib/bucket/rasterFormats"
import { BUCKET_MAX_FILE_BYTES } from "@/lib/bucket/uploadChunk"

export const COMPRESSION_MAX_SIZE_MB = 0.65
export const COMPRESSION_MAX_EDGE = 4096
export const COMPRESSION_INITIAL_QUALITY = 0.85

export type RasterCompression = {
  file: File
  originalBytes: number
  compressedBytes: number
  originalExt: string
  targetExt: string
  targetMime: string
}

export type TargetRasterFormat = {
  mime: "image/webp" | "image/jpeg" | "image/png"
  ext: "webp" | "jpg" | "png"
}

let cachedCanvasWebpSupport: boolean | null = null

export function isCanvasWebpSupported(): boolean {
  if (cachedCanvasWebpSupport !== null) return cachedCanvasWebpSupport
  if (typeof document === "undefined") return false
  try {
    const canvas = document.createElement("canvas")
    canvas.width = 1
    canvas.height = 1
    cachedCanvasWebpSupport = canvas.toDataURL("image/webp").startsWith("data:image/webp")
  } catch {
    cachedCanvasWebpSupport = false
  }
  return cachedCanvasWebpSupport
}

export function resolveTargetFormat(file: File): TargetRasterFormat {
  if (isCanvasWebpSupported()) {
    return { mime: "image/webp", ext: "webp" }
  }
  const ext = pathExtension(file.name)
  if (ext === "png" || file.type === "image/png") {
    return { mime: "image/png", ext: "png" }
  }
  return { mime: "image/jpeg", ext: "jpg" }
}

async function blobMatchesTargetHeader(
  blob: Blob,
  target: TargetRasterFormat
): Promise<boolean> {
  if (target.mime === "image/webp") return blobHasWebpHeader(blob)
  if (target.mime === "image/jpeg") return blobHasJpegHeader(blob)
  return blobHasPngHeader(blob)
}

function bytesMatchTargetHeader(
  bytes: Uint8Array,
  target: TargetRasterFormat
): boolean {
  if (target.mime === "image/webp") return validateWebpHeader(bytes)
  if (target.mime === "image/jpeg") return validateJpegHeader(bytes)
  return validatePngHeader(bytes)
}

export class ImageConvertError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ImageConvertError"
  }
}

export function formatCompressionSummary(
  originalBytes: number,
  compressedBytes: number,
  formatLabel = "WebP"
): string {
  const fmt = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)} MB`
      : n >= 1000
        ? `${(n / 1000).toFixed(0)} KB`
        : `${n} B`
  const ratio =
    originalBytes > 0 ? Math.round((1 - compressedBytes / originalBytes) * 100) : 0
  return `${fmt(originalBytes)} → ${fmt(compressedBytes)} ${formatLabel} (−${ratio}%)`
}

function isSvgFile(file: File): boolean {
  const ext = pathExtension(file.name)
  const mime = file.type.trim().toLowerCase()
  return ext === "svg" || mime === "image/svg+xml"
}

async function rasterizeSvg(
  file: File,
  target: TargetRasterFormat
): Promise<Blob | null> {
  if (typeof document === "undefined") return null

  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error("svg load failed"))
      el.src = url
    })

    let w = img.naturalWidth || 2048
    let h = img.naturalHeight || 2048
    if (w <= 0 || h <= 0) {
      w = 2048
      h = 2048
    }
    const scale = Math.min(1, COMPRESSION_MAX_EDGE / Math.max(w, h))
    w = Math.max(1, Math.round(w * scale))
    h = Math.max(1, Math.round(h * scale))

    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, w, h)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, target.mime, COMPRESSION_INITIAL_QUALITY)
    })
    if (!blob || !(await blobMatchesTargetHeader(blob, target))) return null
    return blob
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function encodeRaster(
  file: File,
  target: TargetRasterFormat
): Promise<Blob | null> {
  if (isSvgFile(file)) {
    return rasterizeSvg(file, target)
  }

  const attempts = [
    { maxSizeMB: COMPRESSION_MAX_SIZE_MB, initialQuality: COMPRESSION_INITIAL_QUALITY },
    { maxSizeMB: 0.5, initialQuality: 0.75 },
    { maxSizeMB: 0.4, initialQuality: 0.65 },
  ]

  for (const attempt of attempts) {
    try {
      const blob = await imageCompression(file, {
        maxSizeMB: attempt.maxSizeMB,
        maxWidthOrHeight: COMPRESSION_MAX_EDGE,
        useWebWorker: true,
        fileType: target.mime,
        initialQuality: attempt.initialQuality,
      })
      if (await blobMatchesTargetHeader(blob, target)) return blob
    } catch {
    }
  }

  return null
}

function compressedFileFromBlob(
  source: File,
  blob: Blob,
  target: TargetRasterFormat
): File {
  const stem = sanitizeUploadFilename(
    source.name.replace(/\.[^.]+$/, "") || "photo"
  )
    .replace(/\.webp$/, "")
    .replace(/\.jpe?g$/, "")
    .replace(/\.png$/, "")
  return new File([blob], `${stem}.${target.ext}`, {
    type: target.mime,
    lastModified: source.lastModified,
  })
}

export async function compressRasterToWebp(file: File): Promise<RasterCompression> {
  if (!shouldConvertRasterToWebp(file)) {
    throw new ImageConvertError("Could not process this photo")
  }

  const target = resolveTargetFormat(file)
  const blob = await encodeRaster(file, target)

  if (!blob) {
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer())
    const ext = pathExtension(file.name)
    const isValidOrig =
      ((ext === "jpg" || ext === "jpeg") && validateJpegHeader(head)) ||
      (ext === "png" && validatePngHeader(head)) ||
      (ext === "webp" && validateWebpHeader(head))

    if (isValidOrig && file.size > 0 && file.size <= BUCKET_MAX_FILE_BYTES) {
      const origExt = ext === "jpeg" ? "jpg" : ext
      const origMime =
        file.type ||
        (ext === "png"
          ? "image/png"
          : ext === "webp"
            ? "image/webp"
            : "image/jpeg")
      return {
        file,
        originalBytes: file.size,
        compressedBytes: file.size,
        originalExt: ext || "image",
        targetExt: origExt,
        targetMime: origMime,
      }
    }

    throw new ImageConvertError("Could not process this photo")
  }

  const bytes = new Uint8Array(await blob.arrayBuffer())
  if (!bytesMatchTargetHeader(bytes, target)) {
    throw new ImageConvertError("Could not process this photo")
  }

  const out = compressedFileFromBlob(file, blob, target)
  if (out.size <= 0 || out.size > BUCKET_MAX_FILE_BYTES) {
    throw new ImageConvertError("File too large after compression")
  }

  return {
    file: out,
    originalBytes: file.size,
    compressedBytes: out.size,
    originalExt: pathExtension(file.name) || "image",
    targetExt: target.ext,
    targetMime: target.mime,
  }
}
