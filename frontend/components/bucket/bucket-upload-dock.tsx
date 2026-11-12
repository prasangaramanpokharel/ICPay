"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatBytes } from "@/lib/bucket/bucket"
import { cn } from "@/lib/ui/utils"

export type BucketUploadItem = {
  id: string
  name: string
  size?: number
  progress: number
  status: "queued" | "uploading" | "done" | "error"
  speedLabel?: string
  etaLabel?: string
  error?: string
}

function CirclePct({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div
      className="relative flex size-9 shrink-0 items-center justify-center rounded-full p-[3px]"
      style={{
        background: `conic-gradient(var(--primary) ${pct}%, var(--muted) ${pct}% 100%)`,
      }}
    >
      <div className="flex size-full items-center justify-center rounded-full bg-popover">
        <span className="px-0.5 text-[7px] font-medium leading-none tabular-nums text-primary">
          {pct}%
        </span>
      </div>
    </div>
  )
}

export function BucketUploadDock({
  items,
  expanded,
  title,
  uploadedLabel,
  onToggle,
  onDismiss,
  onRetry,
}: {
  items: BucketUploadItem[]
  expanded: boolean
  title: string
  uploadedLabel: string
  onToggle: () => void
  onDismiss: () => void
  onRetry?: (id: string) => void
}) {
  if (items.length === 0) return null

  const busy = items.some((i) => i.status === "uploading" || i.status === "queued")
  const activeBatch = items.filter((i) => i.status !== "error")
  const totalBytes = activeBatch.reduce((acc, i) => acc + (i.size ?? 0), 0)
  const uploadedBytes = activeBatch.reduce(
    (acc, i) => acc + Math.round(((i.size ?? 0) * Math.max(0, Math.min(100, i.progress))) / 100),
    0
  )
  const overall =
    totalBytes > 0
      ? Math.round((uploadedBytes / totalBytes) * 100)
      : Math.round(items.reduce((s, i) => s + i.progress, 0) / items.length)

  return (
    <div className="pointer-events-none fixed right-4 bottom-20 z-50 w-[min(calc(100vw-2rem),24rem)] md:bottom-6">
      <div className="pointer-events-auto overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <CirclePct value={busy ? overall : 100} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{title}</p>
            {totalBytes > 0 ? (
              <p className="truncate font-mono text-[10px] text-muted-foreground tabular-nums">
                {busy
                  ? `${formatBytes(uploadedBytes)} / ${formatBytes(totalBytes)}`
                  : formatBytes(totalBytes)}
              </p>
            ) : null}
          </div>
          <span className="h-4 w-px shrink-0 bg-border" />
          <p className="ml-auto shrink-0 text-sm tabular-nums text-primary">{uploadedLabel}</p>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onToggle}>
            <HugeiconsIcon
              icon={expanded ? ArrowDown01Icon : ArrowUp01Icon}
              className="size-4"
              strokeWidth={1.75}
            />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" disabled={busy} onClick={onDismiss}>
            <HugeiconsIcon icon={Cancel01Icon} className="size-4" strokeWidth={1.75} />
          </Button>
        </div>

        {expanded ? (
          <ul className="max-h-56 space-y-2.5 overflow-y-auto border-t px-3 py-2.5">
            {items.map((item) => (
              <li key={item.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <p className="truncate text-xs font-medium" title={item.name}>
                      {item.name}
                    </p>
                    {item.size ? (
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground tabular-nums">
                        ({formatBytes(item.size)})
                      </span>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {item.status === "uploading" && (item.speedLabel || item.etaLabel) ? (
                      <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                        {[item.speedLabel, item.etaLabel].filter(Boolean).join(" · ")}
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "shrink-0 text-[10px] tabular-nums",
                        item.status === "error" ? "text-destructive" : "text-muted-foreground"
                      )}
                    >
                      {item.status === "error" ? item.error : `${item.progress}%`}
                    </span>
                    {item.status === "error" && onRetry ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onRetry(item.id)}
                        title="Retry upload"
                        className="size-5 text-muted-foreground hover:text-foreground"
                      >
                        <HugeiconsIcon icon={RefreshIcon} className="size-3" strokeWidth={1.75} />
                      </Button>
                    ) : null}
                  </div>
                </div>
                {item.status !== "error" ? <Progress value={item.progress} className="gap-0" /> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
