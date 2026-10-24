import { pathExtension } from "./allowedFiles"

export const RASTER_TO_WEBP = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "bmp",
  "tif",
  "tiff",
  "heic",
  "heif",
  "svg",
])

export const RASTER_SKIP = new Set(["gif", "ico"])

const RASTER_SKIP_MIMES = new Set([
  "image/gif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
])

const RASTER_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/svg+xml": "svg",
}

export function shouldConvertRasterToWebp(file: File): boolean {
  const ext = pathExtension(file.name)
  if (RASTER_SKIP.has(ext)) return false

  const mime = file.type.trim().toLowerCase()
  if (mime && RASTER_SKIP_MIMES.has(mime)) return false

  if (RASTER_TO_WEBP.has(ext)) return true
  if (mime === "image/heic" || mime === "image/heif") return true

  if (!ext && mime) {
    const inferred = RASTER_MIME_TO_EXT[mime]
    return inferred !== undefined && RASTER_TO_WEBP.has(inferred)
  }

  return false
}
