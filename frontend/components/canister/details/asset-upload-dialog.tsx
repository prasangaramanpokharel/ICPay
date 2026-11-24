"use client"

import { useState } from "react"
import { mutate } from "swr"
import { toast } from "@/components/ui/toast"
import { Icon } from "@/components/ui/icon"
import { UploadGlassIcon, CircleCheckGlassIcon } from "@thesvg/ui-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/components/auth/auth-provider"
import { uploadCanisterAsset } from "@/services/canister/assetExplorer"
import { formatBytes } from "@/lib/canister/format"

export function AssetUploadDialog({
  open,
  onOpenChange,
  canisterId,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  canisterId: string
  onSuccess?: () => void
}) {
  const { identity } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [targetPath, setTargetPath] = useState("/")
  const [uploading, setUploading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 1, percent: 0 })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setSelectedFile(file)
    if (file && targetPath === "/") {
      setTargetPath(`/${file.name}`)
    }
  }

  const handleUpload = async () => {
    if (!identity || !canisterId || !selectedFile) return
    setUploading(true)
    setCompleted(false)
    setProgress({ current: 0, total: selectedFile.size, percent: 0 })

    try {
      await uploadCanisterAsset(
        identity,
        canisterId,
        selectedFile,
        targetPath,
        ({ current, total }) => {
          const percent = total > 0 ? Math.min(99, Math.round((current / total) * 100)) : 0
          setProgress({ current, total, percent })
        }
      )

      setCompleted(true)
      setProgress((p) => ({ ...p, percent: 100 }))
      toast.success("Asset uploaded")
      void mutate(["asset-canister-files", canisterId])
      onSuccess?.()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg.length > 120 ? `${msg.slice(0, 120)}…` : msg)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (uploading) return
    setSelectedFile(null)
    setTargetPath("/")
    setCompleted(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !uploading && onOpenChange(val)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Icon icon={UploadGlassIcon} className="size-4 text-primary" strokeWidth={1.75} />
            <DialogTitle className="text-base font-semibold">Upload Asset</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Deploy a static file directly to the canister storage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="asset-file" className="text-xs font-medium">Select File</Label>
            <Input
              id="asset-file"
              type="file"
              disabled={uploading}
              onChange={handleFileChange}
              className="text-xs cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="asset-path" className="text-xs font-medium">Canister Path</Label>
            <Input
              id="asset-path"
              type="text"
              value={targetPath}
              disabled={uploading}
              onChange={(e) => setTargetPath(e.target.value)}
              placeholder="/index.html"
              className="text-xs font-mono"
            />
          </div>

          {(uploading || completed) && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  {uploading && <Spinner className="size-3.5" />}
                  {completed && (
                    <Icon icon={CircleCheckGlassIcon} className="size-3.5 text-success" />
                  )}
                  <span>{completed ? "Upload complete" : "Uploading chunks…"}</span>
                </span>
                <span className="font-mono text-muted-foreground">{progress.percent}%</span>
              </div>
              <Progress value={progress.percent} />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>{formatBytes(BigInt(progress.current))}</span>
                <span>{formatBytes(BigInt(progress.total))}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={uploading}>
            {completed ? "Close" : "Cancel"}
          </Button>
          {!completed && (
            <Button
              size="sm"
              disabled={uploading || !selectedFile}
              onClick={() => void handleUpload()}
            >
              {uploading && <Spinner className="size-4" />}
              <span>{uploading ? "Uploading…" : "Upload"}</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
