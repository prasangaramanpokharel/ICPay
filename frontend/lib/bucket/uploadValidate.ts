import { BUCKET_MAX_FILE_BYTES } from "./uploadChunk"
import {
  EXECUTABLE_BLOCKED_EXTENSIONS,
  mimeFromExtension,
  normalizeUploadFile,
  pathExtension,
  VIDEO_BLOCKED_EXTENSIONS,
} from "./allowedFiles"
import { shouldConvertRasterToWebp } from "./rasterFormats"

export const BUCKET_MAX_RAW_RASTER_BYTES = 50_000_000

export type UploadValidationError = "size" | "video" | "blocked" | "format"

export function uploadValidationError(file: File): UploadValidationError | null {
  const normalized = normalizeUploadFile(file)
  const ext = pathExtension(normalized.name)

  if (ext && VIDEO_BLOCKED_EXTENSIONS.has(ext)) {
    return "video"
  }
  if (shouldConvertRasterToWebp(normalized)) {
    if (normalized.size <= 0 || normalized.size > BUCKET_MAX_RAW_RASTER_BYTES) {
      return "size"
    }
    return null
  }
  if (ext && EXECUTABLE_BLOCKED_EXTENSIONS.has(ext)) {
    return "blocked"
  }
  if (!ext || !mimeFromExtension(ext)) {
    return "format"
  }

  if (normalized.size <= 0 || normalized.size > BUCKET_MAX_FILE_BYTES) {
    return "size"
  }

  return null
}
