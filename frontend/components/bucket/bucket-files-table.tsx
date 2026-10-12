"use client"

import { useTranslations } from "next-intl"
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
  getCategoryStyle,
  getFileCategory,
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
}: {
  bucketId?: string
  bucketName?: string
  files: FilePublic[]
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
}) {
  const t = useTranslations("bucket")

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
              const totals = folderTotals(files, prefix, entry.name)
              return (
                <TableRow
                  key={key}
                  className="group cursor-pointer border-border/40 transition-colors hover:bg-muted/40"
                  data-state={selected.has(key) ? "selected" : undefined}
                  onClick={() => onOpenFolder(entry.name)}
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
                        <span className="truncate text-sm font-medium text-foreground group-hover:text-amber-300">
                          {entry.name}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className="border-amber-500/25 bg-amber-500/10 font-mono text-[10px] font-semibold tracking-wider text-amber-300 uppercase"
                    >
                      Folder
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground tabular-nums">
                    {formatFileSize(totals.bytes)}
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

            const cat = getFileCategory(entry.file.contentType, entry.file.path)
            const style = getCategoryStyle(cat)
            const chip = fileTypeChip(entry.file.contentType, entry.file.path)

            return (
              <TableRow
                key={key}
                className="group cursor-pointer border-border/40 transition-colors hover:bg-muted/40"
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
                  <div className="flex min-w-0 items-center gap-3">
                    <BucketFileIcon path={entry.file.path} contentType={entry.file.contentType} />
                    <span
                      className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary"
                      title={entry.file.path}
                    >
                      {entry.file.path.split("/").pop()}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-[10px] font-semibold tracking-wider uppercase",
                      style.badge
                    )}
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

