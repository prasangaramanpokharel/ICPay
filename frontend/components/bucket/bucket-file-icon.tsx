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
    ["mp4", "webm", "mov", "avi", "mkv", "mp3", "wav", "ogg", "flac", "m4a", "aac"].includes(ext)
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
    ["pdf", "doc", "docx", "xls", "xlsx", "csv", "ppt", "pptx", "txt", "md", "rtf", "odt", "ods"].includes(ext)
  ) {
    return "documents"
  }

  if (
    type.includes("zip") ||
    type.includes("tar") ||
    type.includes("compressed") ||
    type.includes("archive") ||
    ["zip", "tar", "gz", "bz2", "7z", "rar"].includes(ext)
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
    ["json", "xml", "yaml", "yml", "toml", "js", "ts", "jsx", "tsx", "py", "rs", "go", "sh", "sql", "css", "html"].includes(ext)
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
      return Csv01Icon
    case "ppt":
    case "pptx":
    case "odp":
      return Ppt01Icon
    case "txt":
    case "md":
      return Txt01Icon
    case "json":
    case "xml":
    case "yaml":
    case "yml":
    case "toml":
      return Xml01Icon
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "py":
    case "rs":
    case "go":
    case "sql":
    case "sh":
    case "html":
    case "css":
      return CodeIcon
    case "zip":
    case "tar":
    case "gz":
    case "bz2":
    case "7z":
    case "rar":
      return Zip01Icon
    case "mp3":
    case "wav":
    case "ogg":
    case "flac":
    case "m4a":
    case "aac":
      return MusicNote01Icon
    case "mp4":
    case "webm":
    case "mov":
    case "avi":
    case "mkv":
      return Video01Icon
    case "ttf":
    case "otf":
    case "woff":
    case "woff2":
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

