"use client"

import { motion, AnimatePresence } from "motion/react"
import { Icon } from "@/components/ui/icon"
import { ChevronDownGlassIcon, ChevronUpGlassIcon, XGlassIcon, RefreshCwGlassIcon } from "@thesvg/ui-react"
import { Button } from "@/components/ui/button"
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
  const radius = 14
  const circumference = 2 * Math.PI * radius
  const isDone = pct >= 100

  return (
    <div className="relative flex size-9 shrink-0 items-center justify-center">
      <svg className="size-full -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-muted/40"
        />
        <motion.circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct / 100) }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={cn("transition-colors duration-300", isDone ? "text-success" : "text-primary")}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "text-[7.5px] font-semibold leading-none tabular-nums transition-colors duration-300",
            isDone ? "text-success" : "text-primary"
          )}
        >
          {pct}%
        </span>
      </div>
    </div>
  )
}

function ItemProgressBar({
  progress,
  status,
}: {
  progress: number
  status: BucketUploadItem["status"]
}) {
  const pct = Math.max(0, Math.min(100, progress))
  const isDone = status === "done" || pct >= 100

  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className={cn(
          "h-full rounded-full transition-colors duration-300",
          isDone ? "bg-success" : "bg-primary"
        )}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      />
      {status === "uploading" ? (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/25 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
        />
      ) : null}
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
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg"
      >
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
          <p
            className={cn(
              "ml-auto shrink-0 text-sm tabular-nums font-medium transition-colors duration-300",
              !busy && activeBatch.length > 0 ? "text-success" : "text-primary"
            )}
          >
            {uploadedLabel}
          </p>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onToggle}>
            <Icon
              icon={expanded ? ChevronDownGlassIcon : ChevronUpGlassIcon}
              className="size-4"
              strokeWidth={1.75}
            />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" disabled={busy} onClick={onDismiss}>
            <Icon icon={XGlassIcon} className="size-4" strokeWidth={1.75} />
          </Button>
        </div>

        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="max-h-56 space-y-2.5 overflow-y-auto border-t px-3 py-2.5"
            >
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
                          item.status === "error"
                            ? "text-destructive"
                            : item.status === "done" || item.progress >= 100
                              ? "text-success font-medium"
                              : "text-muted-foreground"
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
                          <Icon icon={RefreshCwGlassIcon} className="size-3" strokeWidth={1.75} />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  {item.status !== "error" ? (
                    <ItemProgressBar progress={item.progress} status={item.status} />
                  ) : null}
                </li>
              ))}
            </motion.ul>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
