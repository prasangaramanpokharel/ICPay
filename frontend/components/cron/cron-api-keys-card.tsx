"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
import { Key01Icon, Copy01Icon, Delete02Icon, CancelCircleIcon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/components/auth/auth-provider"
import { createApiKey, deleteApiKey, listApiKeys, revokeApiKey } from "@/services/cron/client"
import type { RemoteApiKeySummary } from "@/services/cron/types"

interface CronApiKeysCardProps {
  projectId: bigint
}

export function CronApiKeysCard({ projectId }: CronApiKeysCardProps) {
  const { identity } = useAuth()
  const [keys, setKeys] = React.useState<RemoteApiKeySummary[]>([])
  const [loading, setLoading] = React.useState(false)
  const [newKeyLabel, setNewKeyLabel] = React.useState("")
  const [generating, setGenerating] = React.useState(false)

  const [generatedKey, setGeneratedKey] = React.useState<string | null>(null)
  const [keyModalOpen, setKeyModalOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!identity) return
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
  }, [projectId, identity])

  const refreshKeys = () => {
    if (!identity) return
    listApiKeys(projectId, identity)
      .then((data) => setKeys(data))
      .catch(() => setKeys([]))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyLabel.trim()) return
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
      <Card className="border border-border/80 bg-card text-card-foreground shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={Key01Icon} className="size-5 text-primary" />
              Project API Keys
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={handleCreate} className="flex flex-wrap items-center gap-3">
            <Input
              value={newKeyLabel}
              onChange={(e) => setNewKeyLabel(e.target.value)}
              placeholder="e.g. CI/CD Webhook Trigger..."
              className="max-w-sm text-sm"
              required
            />
            <Button
              type="submit"
              disabled={generating}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {generating ? <Spinner className="size-3.5" /> : "Generate API Key"}
            </Button>
          </form>

          {loading ? (
            <div className="flex h-24 items-center justify-center">
              <Spinner className="size-5 text-primary" />
            </div>
          ) : keys.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground border border-dashed border-border rounded-md text-center">
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
                    className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-md border border-border bg-background text-sm"
                  >
                    <div className="flex items-center gap-3">
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
        </CardContent>
      </Card>

      <Dialog open={keyModalOpen} onOpenChange={setKeyModalOpen}>
        <DialogContent className="sm:max-w-md bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              New API Key Generated
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Make sure to copy your API key now. You will not be able to see it again!
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

            <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground flex flex-col gap-1">
              <span className="font-semibold text-foreground">Trigger via curl:</span>
              <code className="font-mono text-[11px] break-all bg-background p-2 rounded border border-border">
                curl -X POST https://icpay.app/api/cron/trigger -H &quot;Authorization: Bearer {generatedKey}&quot;
              </code>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
