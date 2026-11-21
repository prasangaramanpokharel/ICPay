"use client"

import { useState } from "react"
import { toast } from "@/components/ui/toast"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/components/auth/auth-provider"
import {
  downloadSnapshotBundle,
  triggerFileDownload,
  formatManageError,
  type SnapshotDownloadProgress,
} from "@/services/canister/management"
import { formatBytes } from "@/lib/canister/format"

export function SnapshotDownloadDialog({
  open,
  onOpenChange,
  canisterId,
  snapshotId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  canisterId: string
  snapshotId: string
}) {
  const { identity } = useAuth()
  const [downloading, setDownloading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [progress, setProgress] = useState<SnapshotDownloadProgress>({
    phase: "metadata",
    bytesRead: 0,
    totalBytes: 1,
    percentage: 0,
  })

  const phaseLabel = (phase: SnapshotDownloadProgress["phase"]) => {
    switch (phase) {
      case "metadata":
        return "Reading metadata…"
      case "wasm_module":
        return "Streaming Wasm module…"
      case "wasm_memory":
        return "Streaming Wasm linear memory…"
      case "stable_memory":
        return "Streaming stable memory…"
      case "done":
        return "Download complete"
      default:
        return "Preparing…"
    }
  }

  const handleStartDownload = async () => {
    if (!identity || !canisterId || !snapshotId) return
    setDownloading(true)
    setCompleted(false)
    setProgress({
      phase: "metadata",
      bytesRead: 0,
      totalBytes: 1,
      percentage: 0,
    })

    try {
      const blob = await downloadSnapshotBundle(
        identity,
        canisterId,
        snapshotId,
        (p) => setProgress(p)
      )

      setCompleted(true)
      const filename = `${canisterId}-snapshot-${snapshotId.slice(0, 8)}.bin`
      triggerFileDownload(blob, filename)
      toast.success("Snapshot downloaded")
    } catch (err) {
      toast.error(formatManageError(err))
    } finally {
      setDownloading(false)
    }
  }

  const handleClose = () => {
    if (downloading) return
    setCompleted(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !downloading && onOpenChange(val)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Download01Icon} className="size-4 text-primary" strokeWidth={1.75} />
            <DialogTitle className="text-base font-semibold">Download Snapshot</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Export a full on-chain canister snapshot including Wasm module and memory state.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Canister</span>
              <span className="font-mono text-foreground">{canisterId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Snapshot ID</span>
              <span className="font-mono text-foreground break-all">{snapshotId}</span>
            </div>
          </div>

          {(downloading || completed) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  {downloading && <Spinner className="size-3.5" />}
                  {completed && (
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3.5 text-success" />
                  )}
                  {phaseLabel(progress.phase)}
                </span>
                <span className="font-mono text-muted-foreground">
                  {progress.percentage}%
                </span>
              </div>

              <Progress value={progress.percentage} />

              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>{formatBytes(BigInt(progress.bytesRead))}</span>
                <span>{formatBytes(BigInt(progress.totalBytes))}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={downloading}>
            {completed ? "Close" : "Cancel"}
          </Button>
          {!completed && (
            <Button
              size="sm"
              onClick={() => void handleStartDownload()}
              disabled={downloading}
            >
              {downloading && <Spinner className="size-4" />}
              <span>{downloading ? "Downloading…" : "Download"}</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
