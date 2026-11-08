"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Key01Icon,
  Copy01Icon,
  Delete02Icon,
  CancelCircleIcon,
  PlusSignIcon,
  CodeIcon,
} from "@hugeicons/core-free-icons"
import { useAuth } from "@/components/auth/auth-provider"
import { createApiKey, deleteApiKey, listApiKeys, revokeApiKey } from "@/services/cron/client"
import type { RemoteApiKeySummary } from "@/services/cron/types"

interface CronApiDrawerProps {
  projectId: bigint | null
  projectName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CronApiDrawer({
  projectId,
  projectName,
  open,
  onOpenChange,
}: CronApiDrawerProps) {
  const { identity } = useAuth()
  const [keys, setKeys] = React.useState<RemoteApiKeySummary[]>([])
  const [loading, setLoading] = React.useState(false)
  const [newKeyLabel, setNewKeyLabel] = React.useState("")
  const [generating, setGenerating] = React.useState(false)

  const [generatedKey, setGeneratedKey] = React.useState<string | null>(null)
  const [keyModalOpen, setKeyModalOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const refreshKeys = React.useCallback(async () => {
    if (!identity || !projectId) return
    setLoading(true)
    try {
      const data = await listApiKeys(projectId, identity)
      setKeys(data)
    } catch {
      setKeys([])
    } finally {
      setLoading(false)
    }
  }, [projectId, identity])

  React.useEffect(() => {
    if (!open || !identity || !projectId) return
    let active = true
    listApiKeys(projectId, identity)
      .then((data) => {
        if (active) setKeys(data)
      })
      .catch(() => {
        if (active) setKeys([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [open, projectId, identity])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyLabel.trim() || !projectId) return
    if (!identity) {
      toast.error("Please sign in with Internet Identity first.")
      return
    }
    setGenerating(true)
    try {
      const rawKey = await createApiKey(projectId, newKeyLabel.trim(), identity)
      setGeneratedKey(rawKey)
      setKeyModalOpen(true)
      setNewKeyLabel("")
      refreshKeys()
      toast.success("API key generated successfully.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate API key.")
    } finally {
      setGenerating(false)
    }
  }

  const handleRevoke = async (keyHash: Uint8Array) => {
    if (!confirm("Are you sure you want to revoke this API key?")) return
    if (!identity) {
      toast.error("Please sign in with Internet Identity first.")
      return
    }
    try {
      await revokeApiKey(keyHash, identity)
      refreshKeys()
      toast.success("API key revoked successfully.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke API key.")
    }
  }

  const handleDelete = async (keyHash: Uint8Array) => {
    if (!confirm("Are you sure you want to permanently delete this API key?")) return
    if (!identity) {
      toast.error("Please sign in with Internet Identity first.")
      return
    }
    try {
      await deleteApiKey(keyHash, identity)
      refreshKeys()
      toast.success("API key deleted successfully.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete API key.")
    }
  }

  const handleCopy = () => {
    if (!generatedKey) return
    navigator.clipboard.writeText(generatedKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl md:max-w-2xl bg-card text-card-foreground border-l border-border flex flex-col p-6 overflow-y-auto"
        >
          <SheetHeader className="pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Key01Icon} className="size-5 text-primary" />
              <SheetTitle className="text-lg font-semibold text-foreground">
                API Keys & Webhooks
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs text-muted-foreground mt-1">
              {projectName
                ? `Manage external trigger keys for "${projectName}".`
                : "Manage external trigger keys for this project."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-6 py-4">
            <form onSubmit={handleCreate} className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-foreground">Generate New API Key</span>
              <div className="flex items-center gap-2">
                <Input
                  value={newKeyLabel}
                  onChange={(e) => setNewKeyLabel(e.target.value)}
                  placeholder="e.g. GitHub Actions, Vercel Webhook..."
                  className="text-sm bg-background"
                  required
                />
                <Button
                  type="submit"
                  disabled={generating || !projectId}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 gap-1.5"
                >
                  {generating ? (
                    <Spinner className="size-3.5" />
                  ) : (
                    <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
                  )}
                  Generate
                </Button>
              </div>
            </form>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-foreground">Active Keys</span>
              {loading ? (
                <div className="flex h-24 items-center justify-center">
                  <Spinner className="size-5 text-primary" />
                </div>
              ) : keys.length === 0 ? (
                <div className="p-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg text-center">
                  No API keys generated yet for this project.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {keys.map((k, idx) => {
                    const hexPrefix = Array.from(k.key_hash)
                      .slice(0, 6)
                      .map((b) => b.toString(16).padStart(2, "0"))
                      .join("")

                    return (
                      <div
                        key={idx}
                        className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border bg-background text-sm"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-foreground">{k.label}</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            hash: {hexPrefix}...
                          </span>
                          <Badge
                            variant={k.revoked ? "destructive" : "outline"}
                            className="text-[10px] py-0 px-1.5"
                          >
                            {k.revoked ? "Revoked" : "Active"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          {!k.revoked && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevoke(k.key_hash)}
                              className="text-xs h-7 px-2.5 text-muted-foreground hover:text-foreground"
                            >
                              <HugeiconsIcon icon={CancelCircleIcon} className="size-3 mr-1" />
                              Revoke
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(k.key_hash)}
                            className="text-xs h-7 px-2 text-destructive hover:bg-destructive/10"
                          >
                            <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4 flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={CodeIcon} className="size-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  Webhook Dispatch Example
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Trigger any job immediately over HTTPS from external servers or scripts:
              </p>
              <pre className="font-mono text-[11px] bg-background p-3 rounded-md border border-border overflow-x-auto text-foreground whitespace-pre-wrap break-all">
{`curl -X POST https://icpay.app/api/cron/trigger \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{"job_id": 1}'`}
              </pre>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={keyModalOpen} onOpenChange={setKeyModalOpen}>
        <DialogContent className="sm:max-w-md bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              New API Key Generated
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Make sure to copy your API key now. It is hashed on-chain with SHA-256 and will not be displayed again.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={generatedKey || ""}
                className="font-mono text-xs bg-muted/50 text-foreground"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5 shrink-0"
              >
                <HugeiconsIcon icon={Copy01Icon} className="size-3.5" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
