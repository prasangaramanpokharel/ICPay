import { resolvePublicFileUrl, toRawCanisterUrl } from "@/lib/bucket/cdn"
import { downloadFileBlob } from "@/services/bucket/bucket"
import type { FilePublic } from "@/services/bucket/types"
import type { Identity } from "@icp-sdk/core/agent"

const TEXT_EXTENSIONS = new Set([
  "txt",
  "md",
  "mdx",
  "rst",
  "tex",
  "json",
  "jsonl",
  "ndjson",
  "csv",
  "tsv",
  "xml",
  "yaml",
  "yml",
  "toml",
  "ini",
  "cfg",
  "conf",
  "lock",
  "log",
  "mo",
  "did",
  "rs",
  "ts",
  "tsx",
  "js",
  "jsx",
  "mjs",
  "cjs",
  "py",
  "go",
  "sol",
  "java",
  "kt",
  "swift",
  "cs",
  "dart",
  "cpp",
  "c",
  "h",
  "hpp",
  "rb",
  "php",
  "sql",
  "graphql",
  "gql",
  "proto",
  "prisma",
  "css",
  "scss",
  "less",
  "map",
  "gltf",
])

export const MAX_TEXT_PREVIEW_BYTES = 512 * 1024

export function isPreviewableImage(contentType: string): boolean {
  return contentType.startsWith("image/")
}

export function isPreviewableVideo(contentType: string): boolean {
  return contentType.startsWith("video/")
}

export function isPreviewableAudio(contentType: string): boolean {
  return contentType.startsWith("audio/")
}

export function isPreviewablePdf(contentType: string, path: string): boolean {
  return contentType === "application/pdf" || path.toLowerCase().endsWith(".pdf")
}

export function isPreviewableText(contentType: string, path: string, size: bigint): boolean {
  if (size > BigInt(MAX_TEXT_PREVIEW_BYTES)) return false
  const ct = contentType.toLowerCase()
  if (
    ct.startsWith("text/") ||
    ct === "application/json" ||
    ct === "application/ld+json" ||
    ct === "application/xml" ||
    ct === "application/javascript" ||
    ct === "application/typescript" ||
    ct === "application/x-yaml" ||
    ct === "application/toml"
  ) {
    return true
  }
  const ext = path.split(".").pop()?.toLowerCase() ?? ""
  return TEXT_EXTENSIONS.has(ext)
}

export function isAnyPreviewable(file: FilePublic): boolean {
  return (
    isPreviewableImage(file.contentType) ||
    isPreviewableVideo(file.contentType) ||
    isPreviewableAudio(file.contentType) ||
    isPreviewablePdf(file.contentType, file.path) ||
    isPreviewableText(file.contentType, file.path, file.size)
  )
}

export function normalizePublicFileUrl(url: string): string {
  return resolvePublicFileUrl(url, "raw")
}

export async function fetchBucketFileBlob(opts: {
  publicUrl: string | null
  identity: Identity | undefined
  bucketId: string
  path: string
  contentType: string
}): Promise<Blob> {
  const { publicUrl, identity, bucketId, path, contentType } = opts

  if (publicUrl) {
    const candidates = [
      toRawCanisterUrl(publicUrl),
      resolvePublicFileUrl(publicUrl, "cdn"),
    ]
    for (const url of candidates) {
      try {
        const res = await fetch(url)
        if (res.ok) {
          const blob = await res.blob()
          if (blob.size > 0) return blob
        }
      } catch {
      }
    }
  }

  if (!identity) throw new Error("Download failed")
  const bytes = await downloadFileBlob(identity, bucketId, path)
  return new Blob([new Uint8Array(bytes)], { type: contentType })
}

export function bytesToObjectUrl(bytes: Uint8Array, contentType: string): string {
  const copy = new Uint8Array(bytes)
  const blob = new Blob([copy], { type: contentType || "application/octet-stream" })
  return URL.createObjectURL(blob)
}

export function revokeObjectUrl(url: string | null | undefined) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url)
}

export function isSvgContentType(contentType: string): boolean {
  return contentType.includes("svg")
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
