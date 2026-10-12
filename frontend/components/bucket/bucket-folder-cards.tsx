"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Folder02Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Card } from "@/components/ui/card"
import { formatFileSize } from "@/components/bucket/bucket-card"
import { folderTotals } from "@/lib/bucket/folderPath"
import type { FilePublic } from "@/services/bucket/types"

export function BucketFolderCards({
  files,
  prefix,
  folders,
  onOpenFolder,
}: {
  files: FilePublic[]
  prefix: string
  folders: { kind: "folder"; name: string }[]
  onOpenFolder: (name: string) => void
}) {
  if (folders.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
          Suggested Folders
        </h3>
        <span className="text-xs text-muted-foreground/80 tabular-nums">
          {folders.length} {folders.length === 1 ? "folder" : "folders"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {folders.map((folder) => {
          const totals = folderTotals(files, prefix, folder.name)
          return (
            <Card
              key={`card:folder:${folder.name}`}
              role="button"
              tabIndex={0}
              onClick={() => onOpenFolder(folder.name)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onOpenFolder(folder.name)
                }
              }}
              className="group relative flex cursor-pointer items-center justify-between gap-3 overflow-hidden border-border/80 bg-card/60 p-3.5 transition-all duration-150 hover:border-amber-500/40 hover:bg-card hover:shadow-xs active:scale-[0.99]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-400 transition-transform duration-150 group-hover:scale-105">
                  <HugeiconsIcon icon={Folder02Icon} className="size-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground group-hover:text-amber-300">
                    {folder.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground tabular-nums">
                    {formatFileSize(totals.bytes)} • {totals.count} {totals.count === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="size-4 shrink-0 text-muted-foreground/60 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground"
                strokeWidth={1.75}
              />
            </Card>
          )
        })}
      </div>
    </div>
  )
}
