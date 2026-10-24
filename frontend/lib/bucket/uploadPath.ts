export function sanitizeUploadFilename(name: string): string {
  const safe = name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^\.+/, "")
    .toLowerCase()
  if (!safe) return `file-${Date.now()}`
  return safe
}

export function uploadPathForFile(file: File): string {
  return `/${sanitizeUploadFilename(file.name)}`
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
  targetExtOrAsWebp: boolean | string = false
): string {
  const base = uploadPathForFile(normalized)
  if (typeof targetExtOrAsWebp === "string") {
    return replacePathExtension(base, targetExtOrAsWebp)
  }
  return targetExtOrAsWebp ? replacePathExtension(base, ".webp") : base
}
