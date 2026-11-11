export const VIDEO_BLOCKED_EXTENSIONS = new Set<string>([
  "mp4",
  "webm",
  "mov",
  "avi",
  "mkv",
  "m4v",
  "flv",
  "wmv",
  "mpeg",
  "mpg",
  "3gp",
  "3g2",
  "mts",
  "m2ts",
  "ogv",
  "vob",
])

export function isVideoExtension(ext: string): boolean {
  return VIDEO_BLOCKED_EXTENSIONS.has(ext.toLowerCase())
}

export const EXECUTABLE_BLOCKED_EXTENSIONS = new Set<string>([
  "html",
  "htm",
  "xhtml",
  "shtml",
  "js",
  "mjs",
  "cjs",
  "ts",
  "tsx",
  "jsx",
  "wasm",
  "php",
  "rb",
  "py",
  "go",
  "rs",
  "java",
  "kt",
  "swift",
  "cs",
  "dart",
  "cpp",
  "c",
  "h",
  "hpp",
  "sql",
  "css",
  "scss",
  "less",
  "svg",
  "exe",
  "msi",
  "msp",
  "dll",
  "so",
  "dylib",
  "com",
  "scr",
  "pif",
  "apk",
  "ipa",
  "app",
  "dmg",
  "pkg",
  "deb",
  "rpm",
  "run",
  "cpl",
  "bin",
  "dat",
  "iso",
  "img",
  "bat",
  "cmd",
  "ps1",
  "vbs",
  "vbe",
  "wsf",
  "wsh",
  "jse",
  "reg",
  "lnk",
  "inf",
  "sh",
  "bash",
  "zsh",
  "csh",
  "ksh",
  "pem",
  "key",
  "p12",
  "pfx",
  "env",
  "npmrc",
  "netrc",
])

export const BLOCKED_EXTENSIONS = new Set<string>([
  ...VIDEO_BLOCKED_EXTENSIONS,
  ...EXECUTABLE_BLOCKED_EXTENSIONS,
])

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  avif: "image/avif",
  bmp: "image/bmp",
  ico: "image/x-icon",
  tif: "image/tiff",
  tiff: "image/tiff",
  heic: "image/heic",
  heif: "image/heif",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  flac: "audio/flac",
  m4a: "audio/mp4",
  aac: "audio/aac",
  opus: "audio/opus",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  md: "text/markdown",
  mdx: "text/markdown",
  rst: "text/plain",
  tex: "text/plain",
  csv: "text/csv",
  tsv: "text/tab-separated-values",
  rtf: "application/rtf",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odp: "application/vnd.oasis.opendocument.presentation",
  epub: "application/epub+zip",
  json: "application/json",
  jsonl: "application/jsonl",
  ndjson: "application/x-ndjson",
  xml: "application/xml",
  yaml: "text/yaml",
  yml: "text/yaml",
  toml: "application/toml",
  ini: "text/plain",
  cfg: "text/plain",
  conf: "text/plain",
  lock: "text/plain",
  log: "text/plain",
  mo: "text/plain",
  did: "text/plain",
  rs: "text/plain",
  ts: "text/plain",
  tsx: "text/plain",
  js: "text/plain",
  jsx: "text/plain",
  mjs: "text/plain",
  cjs: "text/plain",
  py: "text/plain",
  go: "text/plain",
  sol: "text/plain",
  java: "text/plain",
  kt: "text/plain",
  swift: "text/plain",
  cs: "text/plain",
  dart: "text/plain",
  cpp: "text/plain",
  c: "text/plain",
  h: "text/plain",
  hpp: "text/plain",
  rb: "text/plain",
  php: "text/plain",
  sql: "text/plain",
  graphql: "text/plain",
  gql: "text/plain",
  proto: "text/plain",
  prisma: "text/plain",
  css: "text/css",
  scss: "text/plain",
  less: "text/plain",
  wasm: "application/wasm",
  map: "application/json",
  zip: "application/zip",
  tar: "application/x-tar",
  gz: "application/gzip",
  tgz: "application/gzip",
  bz2: "application/x-bzip2",
  xz: "application/x-xz",
  zst: "application/zstd",
  "7z": "application/x-7z-compressed",
  rar: "application/vnd.rar",
  ttf: "font/ttf",
  otf: "font/otf",
  woff: "font/woff",
  woff2: "font/woff2",
  eot: "application/vnd.ms-fontobject",
  glb: "model/gltf-binary",
  gltf: "model/gltf+json",
  obj: "model/obj",
  stl: "model/stl",
  usdz: "model/vnd.usdz+zip",
}

export function pathExtension(pathOrName: string): string {
  const base = pathOrName.split("/").pop() ?? pathOrName
  const dot = base.lastIndexOf(".")
  if (dot < 0) return ""
  return base.slice(dot + 1).toLowerCase()
}

export function isBlockedExtension(ext: string): boolean {
  return BLOCKED_EXTENSIONS.has(ext.toLowerCase())
}

export function mimeFromExtension(ext: string): string | null {
  const e = ext.toLowerCase()
  if (!e || isBlockedExtension(e)) return null
  return EXT_TO_MIME[e] ?? null
}

export const FILE_ACCEPT = Object.entries(EXT_TO_MIME)
  .flatMap(([ext, mime]) => [`.${ext}`, mime])
  .join(",")

const MIME_TO_EXT: Record<string, string> = {
  "image/heic": "heic",
  "image/heif": "heif",
  "image/jpeg": "jpeg",
  "image/jpg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  "image/svg+xml": "svg",
}

export function inferExtensionFromMime(mime: string): string | null {
  const type = mime.trim().toLowerCase()
  if (MIME_TO_EXT[type]) return MIME_TO_EXT[type]
  if (type.startsWith("image/")) {
    const sub = type.slice("image/".length)
    if (sub && !sub.includes("/")) return sub
  }
  return null
}

export function normalizeUploadFile(file: File): File {
  const ext = pathExtension(file.name)
  const inferred = !ext ? inferExtensionFromMime(file.type) : null

  if (!ext && inferred) {
    const stem = file.name.replace(/\.$/, "") || "photo"
    return new File([file], `${stem}.${inferred}`, {
      type: file.type || mimeFromExtension(inferred) || "application/octet-stream",
      lastModified: file.lastModified,
    })
  }

  if (
    (file.type === "image/heic" || file.type === "image/heif") &&
    ext !== "heic" &&
    ext !== "heif"
  ) {
    const stem = file.name.replace(/\.[^.]+$/, "") || "photo"
    const fixed = file.type === "image/heif" ? "heif" : "heic"
    return new File([file], `${stem}.${fixed}`, {
      type: file.type,
      lastModified: file.lastModified,
    })
  }

  return file
}

export function isUploadCandidate(file: File, maxBytes: number): boolean {
  if (!file || file.size <= 0 || file.size > maxBytes) return false

  const ext = pathExtension(file.name)
  if (ext && isBlockedExtension(ext)) return false

  return true
}

export function guessFileMime(file: File): string {
  const ext = pathExtension(file.name)
  const fromExt = ext ? mimeFromExtension(ext) : null
  if (fromExt) return fromExt

  const type = file.type.trim().toLowerCase()
  if (type === "image/x-png") return "image/png"
  if (type === "image/jpg") return "image/jpeg"
  if (type.startsWith("image/")) return type
  if (type === "text/x-python" || type === "application/x-python-code") {
    return "text/x-python"
  }
  if (type === "application/x-zip-compressed") return "application/zip"
  if (type === "text/plain" || type === "application/zip") return type
  return type || "application/octet-stream"
}

export function isAllowedUpload(file: File, maxBytes: number): boolean {
  return isUploadCandidate(file, maxBytes)
}

export function fileTypeChip(contentType: string, path?: string): string {
  const ext = path ? pathExtension(path) : ""
  if (ext) return ext.toUpperCase().slice(0, 8)
  if (contentType.includes("webp")) return "WEBP"
  if (contentType.includes("png")) return "PNG"
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "JPG"
  if (contentType.includes("gif")) return "GIF"
  if (contentType.includes("svg")) return "SVG"
  if (contentType.includes("pdf")) return "PDF"
  if (contentType.includes("python") || contentType.endsWith("py")) return "PY"
  if (contentType.includes("zip")) return "ZIP"
  if (contentType.includes("plain") || contentType.includes("text")) return "TXT"
  if (contentType.startsWith("image/")) return "IMG"
  if (contentType.startsWith("video/") || contentType.includes("mp4")) return "MP4"
  if (contentType.startsWith("audio/")) return "AUDIO"
  if (contentType.startsWith("font/")) return "FONT"
  return "FILE"
}
