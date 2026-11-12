import { sanitizeFolderName } from "@/lib/bucket/folderPath"

export function sanitizeUploadFilename(name: string): string {
  const safe = name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^\.+/, "")
    .toLowerCase()
  if (!safe) return `file-${Date.now()}`
  return safe
}

export function sanitizeRelativeFolderSegments(relativePath?: string): string[] {
  if (!relativePath) return []
  const parts = relativePath.replace(/\\/g, "/").split("/").filter(Boolean)
  if (parts.length <= 1) return []
  return parts
    .slice(0, -1)
    .map((segment) => sanitizeFolderName(segment))
    .filter(Boolean)
}

export function uploadPathForFile(file: File, relativePath?: string): string {
  const folderSegments = sanitizeRelativeFolderSegments(
    relativePath ?? file.webkitRelativePath
  )
  const fileName = sanitizeUploadFilename(file.name)
  if (folderSegments.length === 0) {
    return `/${fileName}`
  }
  return `/${folderSegments.join("/")}/${fileName}`
}

export function replacePathExtension(path: string, ext: string): string {
  const slash = path.lastIndexOf("/")
  const base = slash >= 0 ? path.slice(slash + 1) : path
  const dot = base.lastIndexOf(".")
  const stem = dot >= 0 ? path.slice(0, slash + 1 + dot) : path
  return `${stem}${ext.startsWith(".") ? ext : `.${ext}`}`
}

export function buildUploadPath(
  normalized: File,
  targetExtOrAsWebp: boolean | string = false,
  relativePath?: string
): string {
  const base = uploadPathForFile(normalized, relativePath)
  if (typeof targetExtOrAsWebp === "string") {
    return replacePathExtension(base, targetExtOrAsWebp)
  }
  return targetExtOrAsWebp ? replacePathExtension(base, ".webp") : base
}
