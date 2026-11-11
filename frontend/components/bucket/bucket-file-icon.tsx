"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  CodeIcon,
  Csv01Icon,
  Doc01Icon,
  File01Icon,
  Folder02Icon,
  Image01Icon,
  MusicNote01Icon,
  Pdf01Icon,
  Ppt01Icon,
  TextFontIcon,
  Txt01Icon,
  Video01Icon,
  Xls01Icon,
  Xml01Icon,
  Zip01Icon,
} from "@hugeicons/core-free-icons"
import { pathExtension } from "@/lib/bucket/allowedFiles"
import { cn } from "@/lib/ui/utils"

export type FileCategory = "all" | "images" | "documents" | "media" | "archives" | "code"

export function getFileCategory(contentType = "", path = ""): FileCategory {
  const ext = path ? pathExtension(path).toLowerCase() : ""
  const type = contentType.toLowerCase()

  if (
    type.startsWith("image/") ||
    ["jpg", "jpeg", "png", "webp", "gif", "svg", "avif", "ico", "bmp", "tiff", "heic"].includes(ext)
  ) {
    return "images"
  }

  if (
    type.startsWith("video/") ||
    type.startsWith("audio/") ||
    [
      "mp4",
      "webm",
      "mov",
      "m4v",
      "ogv",
      "avi",
      "mkv",
      "3gp",
      "mpeg",
      "mpg",
      "mp3",
      "wav",
      "ogg",
      "flac",
      "m4a",
      "aac",
      "opus",
    ].includes(ext)
  ) {
    return "media"
  }

  if (
    type.includes("pdf") ||
    type.includes("word") ||
    type.includes("officedocument") ||
    type.includes("document") ||
    type.includes("sheet") ||
    type.includes("presentation") ||
    type.includes("epub") ||
    [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "csv",
      "tsv",
      "ppt",
      "pptx",
      "txt",
      "md",
      "mdx",
      "rst",
      "tex",
      "rtf",
      "odt",
      "ods",
      "odp",
      "epub",
    ].includes(ext)
  ) {
    return "documents"
  }

  if (
    type.includes("zip") ||
    type.includes("tar") ||
    type.includes("compressed") ||
    type.includes("archive") ||
    type.includes("gzip") ||
    type.includes("zstd") ||
    ["zip", "tar", "gz", "tgz", "bz2", "xz", "zst", "7z", "rar"].includes(ext)
  ) {
    return "archives"
  }

  if (
    type.includes("json") ||
    type.includes("xml") ||
    type.includes("javascript") ||
    type.includes("typescript") ||
    type.includes("yaml") ||
    type.includes("toml") ||
    type.includes("wasm") ||
    [
      "json",
      "jsonl",
      "ndjson",
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
      "wasm",
      "map",
    ].includes(ext)
  ) {
    return "code"
  }

  return "documents"
}

function iconForExtension(ext: string) {
  switch (ext) {
    case "jpg":
    case "jpeg":
    case "png":
    case "webp":
    case "gif":
    case "svg":
    case "avif":
    case "bmp":
    case "ico":
    case "tif":
    case "tiff":
    case "heic":
    case "heif":
      return Image01Icon
    case "pdf":
      return Pdf01Icon
    case "doc":
    case "docx":
    case "odt":
    case "rtf":
      return Doc01Icon
    case "xls":
    case "xlsx":
    case "ods":
      return Xls01Icon
    case "csv":
    case "tsv":
      return Csv01Icon
    case "ppt":
    case "pptx":
    case "odp":
      return Ppt01Icon
    case "txt":
    case "md":
    case "mdx":
    case "rst":
    case "tex":
    case "log":
      return Txt01Icon
    case "json":
    case "jsonl":
    case "ndjson":
    case "xml":
    case "yaml":
    case "yml":
    case "toml":
    case "ini":
    case "cfg":
    case "conf":
    case "lock":
    case "map":
      return Xml01Icon
    case "mo":
    case "did":
    case "rs":
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
    case "py":
    case "go":
    case "sol":
    case "java":
    case "kt":
    case "swift":
    case "cs":
    case "dart":
    case "cpp":
    case "c":
    case "h":
    case "hpp":
    case "rb":
    case "php":
    case "sql":
    case "graphql":
    case "gql":
    case "proto":
    case "prisma":
    case "css":
    case "scss":
    case "less":
    case "wasm":
      return CodeIcon
    case "zip":
    case "tar":
    case "gz":
    case "tgz":
    case "bz2":
    case "xz":
    case "zst":
    case "7z":
    case "rar":
      return Zip01Icon
    case "mp3":
    case "wav":
    case "ogg":
    case "flac":
    case "m4a":
    case "aac":
    case "opus":
      return MusicNote01Icon
    case "mp4":
    case "webm":
    case "mov":
    case "m4v":
    case "ogv":
    case "avi":
    case "mkv":
    case "3gp":
    case "mpeg":
    case "mpg":
      return Video01Icon
    case "ttf":
    case "otf":
    case "woff":
    case "woff2":
    case "eot":
      return TextFontIcon
    default:
      return File01Icon
  }
}

export function BucketFolderIcon({ className }: { className?: string }) {
  return (
    <HugeiconsIcon
      icon={Folder02Icon}
      className={cn("size-5 shrink-0 text-muted-foreground", className)}
      strokeWidth={1.75}
    />
  )
}

export function BucketFileIcon({
  path,
  className,
}: {
  path: string
  contentType?: string
  className?: string
}) {
  const ext = pathExtension(path).toLowerCase()
  const IconComponent = iconForExtension(ext)

  return (
    <HugeiconsIcon
      icon={IconComponent}
      className={cn("size-5 shrink-0 text-muted-foreground", className)}
      strokeWidth={1.75}
    />
  )
}

