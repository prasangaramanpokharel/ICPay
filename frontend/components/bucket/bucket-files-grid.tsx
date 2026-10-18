"use client"

import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  BucketFileIcon,
  BucketFolderIcon,
} from "@/components/bucket/bucket-file-icon"
import {
  BucketFileRowActions,
  BucketFolderRowActions,
} from "@/components/bucket/bucket-file-row-actions"
import { BucketFileThumb } from "@/components/bucket/bucket-file-thumb"
import { formatFileSize } from "@/components/bucket/bucket-card"
import { fileTypeChip } from "@/lib/bucket/allowedFiles"
import { folderTotals, type FolderListEntry } from "@/lib/bucket/folderPath"
import { cn } from "@/lib/ui/utils"
import type { FilePublic } from "@/services/bucket/types"
import { entryKey } from "@/components/bucket/bucket-files-table"

export function BucketFilesGrid({
  bucketId,
  bucketName,
  files,
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
}: {
  bucketId?: string
  bucketName?: string
  files: FilePublic[]
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
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {visible.map((entry) => {
        const key = entryKey(entry)
        const isSelected = selected.has(key)

        if (entry.kind === "folder") {
          const totals = folderTotals(files, prefix, entry.name)
          return (
            <Card
              key={key}
              role="button"
              tabIndex={0}
              onClick={() => onOpenFolder(entry.name)}
              className={cn(
                "group relative flex flex-col justify-between overflow-hidden border-border/80 bg-card/60 p-3.5 transition-all duration-150 hover:border-border hover:bg-card hover:shadow-xs",
                isSelected && "border-primary bg-primary/5"
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
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0 font-mono text-[9px] text-muted-foreground uppercase"
                >
                  Folder
                </Badge>
                <span className="tabular-nums">{formatFileSize(totals.bytes)}</span>
              </div>
            </Card>
          )
        }

        const chip = fileTypeChip(entry.file.contentType, entry.file.path)
        const isImage = entry.file.contentType.startsWith("image/")

        return (
          <Card
            key={key}
            role="button"
            tabIndex={0}
            onClick={() => onOpenFile(entry.file)}
            className={cn(
              "group relative flex flex-col justify-between overflow-hidden border-border/80 bg-card/60 p-3.5 transition-all duration-150 hover:border-border hover:bg-card hover:shadow-xs",
              (isSelected || previewId === entry.file.id) && "border-primary bg-primary/5"
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
              <BucketFileRowActions
                bucketId={bucketId ?? ""}
                bucketName={bucketName}
                file={entry.file}
                canWrite={canWrite}
                onOpenFile={onOpenFile}
                onDeleteFile={(p) => (onDeleteFile ? onDeleteFile(p) : onOpenFile(entry.file))}
              />
            </div>

            <div className="my-2 flex flex-col items-center justify-center gap-2 py-1">
              {isImage && bucketId ? (
                <div className="relative size-16 overflow-hidden rounded-lg border border-border/60 bg-muted/30">
                  <BucketFileThumb
                    bucketId={bucketId}
                    file={entry.file}
                    size="md"
                  />
                </div>
              ) : (
                <BucketFileIcon
                  path={entry.file.path}
                  className="size-8"
                />
              )}
              <p
                className="max-w-full truncate text-center text-xs font-medium text-foreground group-hover:text-foreground"
                title={entry.file.path}
              >
                {entry.file.path.split("/").pop()}
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
        )
      })}
    </div>
  )
}
