export const CAPACITY_TIERS_GB = [1, 5, 10, 25, 50, 100] as const

export const FILES_PAGE_SIZE = 20

export {
  BUCKET_CDN_ORIGIN,
  getBucketCdnBase,
  bucketCdnBaseUrl,
  bucketRawBaseUrl,
  bucketCdnFileUrl,
  bucketRawFileUrl,
  toCdnUrl,
  toRawCanisterUrl,
  resolvePublicFileUrl,
} from "@/lib/bucket/cdn"

export {
  BUCKET_MAX_FILE_BYTES,
  BUCKET_MAX_FILE_BYTES as MAX_FILE_BYTES,
} from "@/lib/bucket/uploadChunk"

import {
  FILE_ACCEPT,
  guessFileMime,
  fileTypeChip,
  normalizeUploadFile,
  isAllowedUpload as isAllowedByExtension,
} from "@/lib/bucket/allowedFiles"
import { BUCKET_MAX_FILE_BYTES } from "@/lib/bucket/uploadChunk"

export {
  FILE_ACCEPT,
  guessFileMime,
  fileTypeChip,
  normalizeUploadFile,
}

export const guessImageMime = guessFileMime

type BucketErrorKey =
  | "errInvalidFormat"
  | "errPhotoProcess"
  | "errScriptBlocked"
  | "errIngressTooLarge"
  | "invalidFile"
  | "errVideoBlocked"
  | "errStorageLimit"
  | "errBucketExpired"
  | "errPermissionDenied"
  | "errRateLimit"
  | "errNameTaken"

export function mapBucketError(
  err: string,
  t: (key: BucketErrorKey) => string
): string {
  if (err.includes("max 25 MB for video")) {
    return "Video too large — max 25 MB"
  }
  if (err.includes("max 10 MB")) {
    return t("invalidFile")
  }
  if (
    err.includes("too large") ||
    err.includes("2097152") ||
    err.includes("max allowed") ||
    err.includes("chunked upload") ||
    err.includes("Upload session") ||
    err.includes("Upload incomplete")
  ) {
    return t("errIngressTooLarge")
  }
  if (err.includes("Could not process this photo")) return t("errPhotoProcess")
  if (err.includes("File too large after compression")) return t("invalidFile")
  if (
    err.includes("Video uploads are not allowed") ||
    err.includes("video blocked")
  ) {
    return t("errVideoBlocked")
  }
  if (
    err.includes("File type not allowed") ||
    err.includes("not allowed or video blocked")
  ) {
    return t("errScriptBlocked")
  }
  if (err.includes("File too large")) return t("invalidFile")
  if (err.includes("Storage limit")) return t("errStorageLimit")
  if (err.includes("expired")) return t("errBucketExpired")
  if (err.includes("name already taken")) return t("errNameTaken")
  if (err.includes("Permission denied") || err.includes("Access denied")) {
    return t("errPermissionDenied")
  }
  if (err.includes("Rate limit") || err.includes("Too many")) return t("errRateLimit")
  return err
}

export type BucketVisibilityVariant =
  | { Public: null }
  | { Private: null }

export type BucketStatusVariant = { ACTIVE: null } | { EXPIRED: null }

export const BUCKET_GRACE_PERIOD_MS = 7 * 86_400 * 1000
export const BUCKET_FROZEN_PERIOD_MS = 14 * 86_400 * 1000
export const BUCKET_TOMBSTONE_DELAY_MS = 21 * 86_400 * 1000

export function isPublicVisibility(v: BucketVisibilityVariant): boolean {
  return "Public" in v
}

export function isBucketActive(status: BucketStatusVariant): boolean {
  return Boolean(status && "ACTIVE" in status)
}

export function isBucketFrozen(status: BucketStatusVariant, expiresAt: bigint | number, now = Date.now()): boolean {
  if (isBucketActive(status)) return false
  const expiresMs = expiresAtToMs(expiresAt)
  return now >= expiresMs + BUCKET_GRACE_PERIOD_MS && now < expiresMs + BUCKET_TOMBSTONE_DELAY_MS
}

export function isBucketTombstoned(status: BucketStatusVariant, expiresAt: bigint | number, now = Date.now()): boolean {
  if (isBucketActive(status)) return false
  const expiresMs = expiresAtToMs(expiresAt)
  return now >= expiresMs + BUCKET_TOMBSTONE_DELAY_MS
}

export function getBucketStatusLabel(
  status: BucketStatusVariant,
  expiresAt: bigint | number,
  now = Date.now()
): "Active" | "Expired" | "Frozen" | "Tombstoned" {
  if (isBucketActive(status)) return "Active"
  if (isBucketTombstoned(status, expiresAt, now)) return "Tombstoned"
  if (isBucketFrozen(status, expiresAt, now)) return "Frozen"
  return "Expired"
}

export function formatBytes(bytes: bigint | number): string {
  const n = typeof bytes === "bigint" ? Number(bytes) : bytes
  if (n <= 0) return "0 B"
  if (n >= 1_000_000_000 && n % 1_000_000_000 === 0) {
    return `${n / 1_000_000_000} GB`
  }
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`
  return `${Number((n / 1024 ** 3).toFixed(2))} GB`
}

export function formatUsageLabel(used: bigint, capacity: bigint): string {
  return `${formatBytes(used)} / ${formatBytes(capacity)}`
}

export function capacityGbFromBytes(capacity: bigint): number {
  return Number(capacity / 1_000_000_000n)
}

export function validateBucketName(name: string): string | null {
  const t = name.trim().toLowerCase()
  if (t.length < 3) return "Name must be at least 3 characters"
  if (t.length > 32) return "Name must be at most 32 characters"
  if (!/^[a-z0-9-]+$/.test(t)) {
    return "Use lowercase letters, digits, and hyphens only"
  }
  return null
}

export {
  sanitizeUploadFilename,
  uploadPathForFile,
  replacePathExtension,
  buildUploadPath,
} from "@/lib/bucket/uploadPath"

export function isImageUploadFile(file: File): boolean {
  return guessFileMime(file).startsWith("image/")
}

export const isRasterImageFile = isImageUploadFile

export function isAllowedUpload(file: File): boolean {
  return isAllowedByExtension(file, BUCKET_MAX_FILE_BYTES)
}

export const isAllowedImage = isAllowedUpload

export function expiresAtToMs(expiresAt: bigint | number): number {
  if (typeof expiresAt === "number") {
    if (expiresAt > 1e14) {
      return Math.floor(expiresAt / 1_000_000)
    }
    return expiresAt
  }
  return Number(expiresAt / 1_000_000n)
}

export function optionalText(value: [] | [string]): string | null {
  return value.length === 0 ? null : value[0]
}

export const imageTypeChip = fileTypeChip

export function middleTruncateFileName(name: string, maxLength = 34): string {
  if (name.length <= maxLength) return name
  const dotIdx = name.lastIndexOf(".")
  const hasExt = dotIdx > 0 && name.length - dotIdx <= 10
  const tail = hasExt
    ? name.slice(Math.max(1, dotIdx - 6))
    : name.slice(-10)
  const headLen = Math.max(6, maxLength - tail.length - 1)
  return `${name.slice(0, headLen)}…${tail}`
}
