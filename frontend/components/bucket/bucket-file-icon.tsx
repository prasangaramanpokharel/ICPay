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

export function getCategoryStyle(category: FileCategory | "folder") {
  switch (category) {
    case "folder":
      return {
        icon: Folder02Icon,
        color: "text-amber-400",
        badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
        container: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      }
    case "images":
      return {
        icon: Image01Icon,
        color: "text-emerald-400",
        badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
        container: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      }
    case "media":
      return {
        icon: Video01Icon,
        color: "text-pink-400",
        badge: "bg-pink-500/10 text-pink-300 border-pink-500/20",
        container: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      }
    case "code":
      return {
        icon: CodeIcon,
        color: "text-sky-400",
        badge: "bg-sky-500/10 text-sky-300 border-sky-500/20",
        container: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      }
    case "archives":
      return {
        icon: Zip01Icon,
        color: "text-purple-400",
        badge: "bg-purple-500/10 text-purple-300 border-purple-500/20",
        container: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      }
    case "documents":
    default:
      return {
        icon: Doc01Icon,
        color: "text-blue-400",
        badge: "bg-blue-500/10 text-blue-300 border-blue-500/20",
        container: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      }
  }
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
    <div
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md border border-amber-500/20 bg-amber-500/10 text-amber-400 transition-colors",
        className
      )}
    >
      <HugeiconsIcon icon={Folder02Icon} className="size-4" strokeWidth={1.75} />
    </div>
  )
}

export function BucketFileIcon({
  path,
  contentType,
  className,
}: {
  path: string
  contentType?: string
  className?: string
}) {
  const ext = pathExtension(path).toLowerCase()
  const category = getFileCategory(contentType, path)
  const style = getCategoryStyle(category)
  const IconComponent = iconForExtension(ext)

  return (
    <div
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors",
        style.container,
        className
      )}
    >
      <HugeiconsIcon icon={IconComponent} className="size-4" strokeWidth={1.75} />
    </div>
  )
}

