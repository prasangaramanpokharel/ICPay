"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { GripVerticalIcon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BucketFileIcon,
  BucketFolderIcon,
} from "@/components/bucket/bucket-file-icon"
import {
  BucketFileRowActions,
  BucketFolderRowActions,
} from "@/components/bucket/bucket-file-row-actions"
import { formatFileSize } from "@/components/bucket/bucket-card"
import { fileTypeChip } from "@/lib/bucket/allowedFiles"
import { folderTotals, type FolderListEntry } from "@/lib/bucket/folderPath"
import { cn } from "@/lib/ui/utils"
import type { FilePublic } from "@/services/bucket/types"

export function entryKey(entry: FolderListEntry<FilePublic>): string {
  return entry.kind === "folder" ? `folder:${entry.name}` : `file:${entry.file.path}`
}

function formatFileDate(ns: bigint): string {
  const ms = Number(ns / 1_000_000n)
  if (!ms || Number.isNaN(ms) || ms <= 0) return "—"
  const date = new Date(ms)
  const now = Date.now()
  const diffSec = Math.floor((now - ms) / 1000)
  if (diffSec < 60) return "Just now"
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}d ago`
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() !== new Date().getFullYear() ? { year: "numeric" as const } : {}),
  })
}

export function BucketFilesTable({
  bucketId,
  bucketName,
  files,
  allFiles,
  allFilesLoading,
  prefix,
  visible,
  selected,
  previewId,
  canWrite,
  allSelected,
  onToggleAll,
  onToggleKey,
  onOpenFolder,
  onOpenFile,
  onDeleteFile,
  onDeleteFolder,
  onDropFilesIntoFolder,
}: {
  bucketId?: string
  bucketName?: string
  files: FilePublic[]
  allFiles?: FilePublic[]
  allFilesLoading?: boolean
  prefix: string
  visible: FolderListEntry<FilePublic>[]
  selected: Set<string>
  previewId?: string
  canWrite: boolean
  allSelected: boolean
  onToggleAll: (on: boolean) => void
  onToggleKey: (key: string, on: boolean) => void
  onOpenFolder: (name: string) => void
  onOpenFile: (file: FilePublic) => void
  onDeleteFile?: (path: string) => void
  onDeleteFolder?: (name: string) => void
  onDropFilesIntoFolder?: (paths: string[], folderName: string) => void
}) {
  const t = useTranslations("bucket")
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null)

  return (
    <Card className="overflow-hidden border-border/80 bg-card/60 py-0 shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            {canWrite ? (
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(v) => onToggleAll(v === true)}
                  aria-label={t("selectedCount", { count: String(visible.length) })}
                />
              </TableHead>
            ) : null}
            <TableHead className="min-w-[200px]">{t("name")}</TableHead>
            <TableHead className="w-24 text-center">Type</TableHead>
            <TableHead className="w-28 text-right">{t("fileSize")}</TableHead>
            <TableHead className="w-32 text-right">Modified</TableHead>
            <TableHead className="w-12 text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((entry) => {
            const key = entryKey(entry)
            if (entry.kind === "folder") {
              const filesForTotals = allFiles && allFiles.length > 0 ? allFiles : files
              const totals = folderTotals(filesForTotals, prefix, entry.name)
              const sizeLabel =
                allFilesLoading && (!allFiles || allFiles.length === 0)
                  ? "—"
                  : formatFileSize(totals.bytes)
              const isOver = dragOverFolder === entry.name

              return (
                <TableRow
                  key={key}
                  className={cn(
                    "group cursor-pointer border-border/40 transition-all hover:bg-muted/40 [content-visibility:auto] [contain-intrinsic-size:auto_52px]",
                    isOver && "border-primary/50 bg-primary/10 ring-2 ring-primary/80"
                  )}
                  data-state={selected.has(key) ? "selected" : undefined}
                  onClick={() => onOpenFolder(entry.name)}
                  onDragOver={(e) => {
                    if (!canWrite) return
                    e.preventDefault()
                    e.dataTransfer.dropEffect = "move"
                    if (dragOverFolder !== entry.name) {
                      setDragOverFolder(entry.name)
                    }
                  }}
                  onDragLeave={(e) => {
                    if (e.currentTarget.contains(e.relatedTarget as Node)) return
                    if (dragOverFolder === entry.name) {
                      setDragOverFolder(null)
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOverFolder(null)
                    if (!canWrite || !onDropFilesIntoFolder) return
                    try {
                      const raw = e.dataTransfer.getData("application/json")
                      if (!raw) return
                      const data = JSON.parse(raw) as { paths: string[] }
                      if (data.paths && data.paths.length > 0) {
                        onDropFilesIntoFolder(data.paths, entry.name)
                      }
                    } catch {
                      const text = e.dataTransfer.getData("text/plain")
                      if (text) onDropFilesIntoFolder([text], entry.name)
                    }
                  }}
                >
                  {canWrite ? (
                    <TableCell onClick={(e) => e.stopPropagation()} className="w-10">
                      <Checkbox
                        checked={selected.has(key)}
                        onCheckedChange={(v) => onToggleKey(key, v === true)}
                      />
                    </TableCell>
                  ) : null}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <BucketFolderIcon />
                      <div className="min-w-0">
                        <span className="truncate text-sm font-medium text-foreground">
                          {entry.name}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase"
                    >
                      Folder
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground tabular-nums">
                    {sizeLabel}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground/70 tabular-nums">
                    —
                  </TableCell>
                  <TableCell className="text-right">
                    <BucketFolderRowActions
                      folderName={entry.name}
                      canWrite={canWrite}
                      onOpenFolder={onOpenFolder}
                      onDeleteFolder={onDeleteFolder}
                    />
                  </TableCell>
                </TableRow>
              )
            }

            const chip = fileTypeChip(entry.file.contentType, entry.file.path)

            return (
              <TableRow
                key={key}
                draggable={canWrite}
                onDragStart={(e) => {
                  if (!canWrite) return
                  const isChecked = selected.has(key)
                  const pathsToMove: string[] = []

                  if (isChecked) {
                    for (const k of selected) {
                      if (k.startsWith("file:")) pathsToMove.push(k.slice(5))
                    }
                  }
                  if (!pathsToMove.includes(entry.file.path)) {
                    pathsToMove.push(entry.file.path)
                  }

                  e.dataTransfer.setData("application/json", JSON.stringify({ paths: pathsToMove }))
                  e.dataTransfer.setData("text/plain", entry.file.path)
                  e.dataTransfer.effectAllowed = "move"

                  const fileName = entry.file.path.split("/").pop() ?? entry.file.path
                  const ghost = document.createElement("div")
                  ghost.style.position = "absolute"
                  ghost.style.top = "-9999px"
                  ghost.style.left = "-9999px"
                  ghost.style.padding = "4px 8px"
                  ghost.style.borderRadius = "8px"
                  ghost.style.backgroundColor = "var(--card)"
                  ghost.style.color = "var(--foreground)"
                  ghost.style.border = "1px solid var(--border)"
                  ghost.style.fontSize = "12px"
                  ghost.style.fontWeight = "500"
                  ghost.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"
                  ghost.innerText = pathsToMove.length > 1 ? `${pathsToMove.length} files` : fileName
                  document.body.appendChild(ghost)
                  e.dataTransfer.setDragImage(ghost, 12, 12)
                  setTimeout(() => document.body.removeChild(ghost), 0)
                }}
                className="group cursor-pointer border-border/40 transition-colors hover:bg-muted/40 [content-visibility:auto] [contain-intrinsic-size:auto_52px]"
                data-state={
                  selected.has(key) || previewId === entry.file.id ? "selected" : undefined
                }
                onClick={() => onOpenFile(entry.file)}
              >
                {canWrite ? (
                  <TableCell onClick={(e) => e.stopPropagation()} className="w-10">
                    <Checkbox
                      checked={selected.has(key)}
                      onCheckedChange={(v) => onToggleKey(key, v === true)}
                    />
                  </TableCell>
                ) : null}
                <TableCell>
                  <div className="flex min-w-0 items-center gap-2.5">
                    {canWrite ? (
                      <span
                        className="inline-flex shrink-0 cursor-grab text-muted-foreground/50 transition-colors hover:text-foreground active:cursor-grabbing"
                        title="Drag to move"
                      >
                        <HugeiconsIcon icon={GripVerticalIcon} className="size-4 shrink-0" strokeWidth={1.75} />
                      </span>
                    ) : null}
                    <BucketFileIcon path={entry.file.path} />
                    <span
                      className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-foreground"
                      title={entry.file.path}
                    >
                      {entry.file.path.split("/").pop()}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="secondary"
                    className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase"
                  >
                    {chip}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground tabular-nums">
                  {formatFileSize(entry.file.size)}
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground tabular-nums">
                  {formatFileDate(entry.file.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <BucketFileRowActions
                    bucketId={bucketId ?? ""}
                    bucketName={bucketName}
                    file={entry.file}
                    canWrite={canWrite}
                    onOpenFile={onOpenFile}
                    onDeleteFile={(p) => (onDeleteFile ? onDeleteFile(p) : onOpenFile(entry.file))}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
