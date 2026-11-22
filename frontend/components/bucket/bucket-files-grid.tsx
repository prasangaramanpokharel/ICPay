"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { GripVerticalIcon } from "@hugeicons/core-free-icons"
import { MotionList, MotionListItem } from "@/components/ui/motion-list"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
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
import { middleTruncateFileName } from "@/lib/bucket/bucket"
import { folderTotals, type FolderListEntry } from "@/lib/bucket/folderPath"
import { cn } from "@/lib/ui/utils"
import type { FilePublic } from "@/services/bucket/types"
import { entryKey } from "@/components/bucket/bucket-files-table"

export function BucketFilesGrid({
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
  onToggleKey,
  onOpenFolder,
  onOpenFile,
  onDeleteFile,
  onDeleteFolder,
  onDropFilesIntoFolder,
  movingToFolder,
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
  onToggleKey: (key: string, on: boolean) => void
  onOpenFolder: (name: string) => void
  onOpenFile: (file: FilePublic) => void
  onDeleteFile?: (path: string) => void
  onDeleteFolder?: (name: string) => void
  onDropFilesIntoFolder?: (paths: string[], folderName: string) => void
  movingToFolder?: string | null
}) {
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null)

  return (
    <MotionList
      key={`grid-${prefix}-${visible.length}`}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      {visible.map((entry) => {
        const key = entryKey(entry)
        const isSelected = selected.has(key)

        if (entry.kind === "folder") {
          const filesForTotals = allFiles && allFiles.length > 0 ? allFiles : files
          const totals = folderTotals(filesForTotals, prefix, entry.name)
          const sizeLabel =
            allFilesLoading && (!allFiles || allFiles.length === 0)
              ? "—"
              : formatFileSize(totals.bytes)
          const isOver = dragOverFolder === entry.name
          const isMoving = movingToFolder === entry.name

          return (
            <MotionListItem key={key}>
              <Card
                role="button"
                tabIndex={0}
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
              className={cn(
                "group relative flex flex-col justify-between overflow-hidden border-border/80 bg-card/60 p-3.5 transition-all duration-150 hover:border-border hover:bg-card hover:shadow-xs",
                isSelected && "border-primary bg-primary/5",
                isOver && "border-2 border-dashed border-primary/90 bg-primary/10 shadow-xs"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                {canWrite ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(v) => onToggleKey(key, v === true)}
                    />
                  </div>
                ) : (
                  <div />
                )}
                <BucketFolderRowActions
                  folderName={entry.name}
                  canWrite={canWrite}
                  onOpenFolder={onOpenFolder}
                  onDeleteFolder={onDeleteFolder}
                />
              </div>

              <div className="my-3 flex flex-col items-center justify-center gap-2 py-2">
                <BucketFolderIcon className="size-8" />
                <p className="max-w-full truncate text-center text-sm font-semibold text-foreground">
                  {entry.name}
                </p>
                {isMoving ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 text-[9px] font-medium text-primary animate-pulse">
                    <Spinner className="size-2.5" />
                    <span>Moving...</span>
                  </span>
                ) : null}
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0 font-mono text-[9px] text-muted-foreground uppercase"
                >
                  Folder
                </Badge>
                <span className="tabular-nums">{sizeLabel}</span>
              </div>
            </Card>
          </MotionListItem>
        )
      }

      const chip = fileTypeChip(entry.file.contentType, entry.file.path)

      return (
        <MotionListItem key={key}>
          <Card
            role="button"
            tabIndex={0}
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
            onClick={() => onOpenFile(entry.file)}
            className={cn(
              "group relative flex flex-col justify-between overflow-hidden border-border/80 bg-card/60 p-3.5 transition-all duration-150 hover:border-border hover:bg-card hover:shadow-xs",
              (isSelected || previewId === entry.file.id) && "border-primary bg-primary/5"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                {canWrite ? (
                  <>
                    <span
                      className="cursor-grab opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-active:opacity-100 text-muted-foreground/50 hover:text-foreground active:cursor-grabbing"
                      title="Drag to move"
                    >
                      <HugeiconsIcon icon={GripVerticalIcon} className="size-3.5 shrink-0" strokeWidth={1.75} />
                    </span>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(v) => onToggleKey(key, v === true)}
                    />
                  </>
                ) : null}
              </div>
              <BucketFileRowActions
                bucketId={bucketId ?? ""}
                bucketName={bucketName}
                file={entry.file}
                canWrite={canWrite}
                onOpenFile={onOpenFile}
                onDeleteFile={(p) => (onDeleteFile ? onDeleteFile(p) : onOpenFile(entry.file))}
              />
            </div>

            <div className="my-3 flex flex-col items-center justify-center gap-2 py-2">
              <BucketFileIcon
                path={entry.file.path}
                className="size-8"
              />
              <p
                className="max-w-full truncate text-center text-xs font-medium text-foreground group-hover:text-foreground"
                title={entry.file.path}
              >
                {middleTruncateFileName(entry.file.path.split("/").pop() ?? entry.file.path, 22)}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
              <Badge
                variant="secondary"
                className="px-1.5 py-0 font-mono text-[9px] text-muted-foreground uppercase"
              >
                {chip}
              </Badge>
              <span className="tabular-nums">{formatFileSize(entry.file.size)}</span>
            </div>
          </Card>
        </MotionListItem>
      )
    })}
  </MotionList>
)
}
