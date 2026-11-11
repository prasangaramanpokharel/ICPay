"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  CancelCircleIcon,
  Copy01Icon,
  Delete02Icon,
  Key01Icon,
  Search01Icon,
  Tick02Icon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { useAuth } from "@/components/auth/auth-provider"
import { copyText } from "@/lib/wallet/utils"
import {
  createApiKey,
  deleteApiKey,
  listApiKeys,
  listProjects,
  revokeApiKey,
} from "@/services/cron/client"
import type { RemoteApiKeySummary, RemoteProjectRecord } from "@/services/cron/types"
import { formatProjectId, parseProjectId } from "./cron-types"

interface EnrichedApiKey extends RemoteApiKeySummary {
  projectName: string
}

function hexFromBytes(bytes: Uint8Array | number[]): string {
  return Array.from(bytes)
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function formatDate(timestamp: bigint): string {
  const n = Number(timestamp)
  if (!n || Number.isNaN(n) || n <= 0) return "—"
  const ms = timestamp < 1_000_000_000_000n ? n * 1000 : Number(timestamp / 1_000_000n)
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function CronApiView() {
  const searchParams = useSearchParams()
  const initialProjectParam = searchParams.get("projectId")
  const { identity } = useAuth()

  const [projects, setProjects] = React.useState<RemoteProjectRecord[]>([])
  const [loadingProjects, setLoadingProjects] = React.useState(true)
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>(
    initialProjectParam ?? "all"
  )
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [query, setQuery] = React.useState("")

  const [keys, setKeys] = React.useState<EnrichedApiKey[]>([])
  const [loadingKeys, setLoadingKeys] = React.useState(true)

  const [createOpen, setCreateOpen] = React.useState(false)
  const [targetProjectId, setTargetProjectId] = React.useState<string>("")
  const [newKeyLabel, setNewKeyLabel] = React.useState("")
  const [creatingKey, setCreatingKey] = React.useState(false)

  const [generatedResult, setGeneratedResult] = React.useState<string | null>(null)
  const [resultModalOpen, setResultModalOpen] = React.useState(false)
  const [copiedSecret, setCopiedSecret] = React.useState(false)
  const [actionInProgress, setActionInProgress] = React.useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = React.useState<Record<string, boolean>>({})
  const [copiedHex, setCopiedHex] = React.useState<string | null>(null)

  const handleCopyKey = async (keyText: string, hex: string) => {
    await copyText(keyText)
    setCopiedHex(hex)
    toast.success("API key copied to clipboard")
    setTimeout(() => {
      setCopiedHex((cur) => (cur === hex ? null : cur))
    }, 2000)
  }

  const loadData = React.useCallback(async (callerIdentity: typeof identity) => {
    if (!callerIdentity) {
      setProjects([])
      setKeys([])
      setLoadingProjects(false)
      setLoadingKeys(false)
      return
    }

    try {
      const projList = await listProjects(callerIdentity)
      setProjects(projList)
      if (projList.length > 0) {
        setTargetProjectId((prev) => prev || projList[0].id.toString())
      }

      const allKeyPromises = projList.map(async (p) => {
        try {
          const projectKeys = await listApiKeys(p.id, callerIdentity)
          return projectKeys.map((k) => ({
            ...k,
            projectName: p.name,
          }))
        } catch {
          return []
        }
      })

      const nested = await Promise.all(allKeyPromises)
      const flat = nested.flat().sort((a, b) => Number(b.created_at - a.created_at))
      setKeys(flat)
    } catch {
      setProjects([])
      setKeys([])
    } finally {
      setLoadingProjects(false)
      setLoadingKeys(false)
    }
  }, [])

  React.useEffect(() => {
    let active = true
    if (!identity) {
      return () => {
        active = false
      }
    }

    listProjects(identity)
      .then(async (projList) => {
        if (!active) return
        setProjects(projList)
        if (projList.length > 0) {
          setTargetProjectId((prev) => prev || projList[0].id.toString())
        }

        const allKeyPromises = projList.map(async (p) => {
          try {
            const projectKeys = await listApiKeys(p.id, identity)
            return projectKeys.map((k) => ({
              ...k,
              projectName: p.name,
            }))
          } catch {
            return []
          }
        })

        const nested = await Promise.all(allKeyPromises)
        if (!active) return
        const flat = nested.flat().sort((a, b) => Number(b.created_at - a.created_at))
        setKeys(flat)
      })
      .catch(() => {
        if (!active) return
        setProjects([])
        setKeys([])
      })
      .finally(() => {
        if (!active) return
        setLoadingProjects(false)
        setLoadingKeys(false)
      })

    return () => {
      active = false
    }
  }, [identity])

  const filteredKeys = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    return keys.filter((key) => {
      if (selectedProjectId !== "all" && key.project_id.toString() !== selectedProjectId) {
        return false
      }
      if (statusFilter === "active" && key.revoked) return false
      if (statusFilter === "revoked" && !key.revoked) return false

      if (!needle) return true
      const hex = hexFromBytes(key.key_hash).toLowerCase()
      return (
        key.label.toLowerCase().includes(needle) ||
        key.projectName.toLowerCase().includes(needle) ||
        hex.includes(needle)
      )
    })
  }, [keys, selectedProjectId, statusFilter, query])

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetProjectId || !newKeyLabel.trim()) return
    if (!identity) {
      toast.error("Please sign in with Internet Identity first.")
      return
    }

    setCreatingKey(true)
    try {
      const projId = parseProjectId(targetProjectId)
      const rawKey = await createApiKey(projId, newKeyLabel.trim(), identity)
      setGeneratedResult(rawKey)
      setCopiedSecret(false)
      setCreateOpen(false)
      setResultModalOpen(true)
      setNewKeyLabel("")
      toast.success("API key generated successfully.")
      await loadData(identity)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate API key.")
    } finally {
      setCreatingKey(false)
    }
  }

  const handleRevoke = async (key: EnrichedApiKey) => {
    if (!confirm(`Are you sure you want to revoke API key "${key.label}"?`)) return
    if (!identity) {
      toast.error("Please sign in with Internet Identity first.")
      return
    }
    const hex = hexFromBytes(key.key_hash)
    setActionInProgress(`revoke-${hex}`)
    try {
      await revokeApiKey(key.key_hash, identity)
      toast.success(`API key "${key.label}" revoked successfully.`)
      await loadData(identity)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke API key.")
    } finally {
      setActionInProgress(null)
    }
  }

  const handleDelete = async (key: EnrichedApiKey) => {
    if (!confirm(`Are you sure you want to permanently delete API key "${key.label}"?`)) return
    if (!identity) {
      toast.error("Please sign in with Internet Identity first.")
      return
    }
    const hex = hexFromBytes(key.key_hash)
    setActionInProgress(`delete-${hex}`)
    try {
      await deleteApiKey(key.key_hash, identity)
      toast.success(`API key "${key.label}" deleted successfully.`)
      await loadData(identity)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete API key.")
    } finally {
      setActionInProgress(null)
    }
  }

  const handleCopySecret = async () => {
    if (!generatedResult) return
    await copyText(generatedResult)
    setCopiedSecret(true)
    toast.success("API key copied to clipboard.")
    setTimeout(() => setCopiedSecret(false), 2000)
  }

  return (
    <AppPage
      title="API Keys"
      description="Manage programmatic trigger API keys and webhook endpoints for icCron."
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              if (projects.length > 0 && !targetProjectId) {
                setTargetProjectId(projects[0].id.toString())
              }
              setCreateOpen(true)
            }}
            disabled={projects.length === 0 || loadingProjects}
            className="gap-1.5"
          >
            <HugeiconsIcon icon={Add01Icon} className="size-4" strokeWidth={1.75} />
            <span>Create API key</span>
          </Button>
        </div>
      }
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keys by label, project, or hash..."
            className="pl-10"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {projects.length > 0 && (
            <NativeSelect
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="text-xs"
            >
              <NativeSelectOption value="all">All projects</NativeSelectOption>
              {projects.map((p) => (
                <NativeSelectOption key={p.id.toString()} value={p.id.toString()}>
                  {p.name} ({formatProjectId(p.id)})
                </NativeSelectOption>
              ))}
            </NativeSelect>
          )}

          <NativeSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs"
          >
            <NativeSelectOption value="all">All statuses</NativeSelectOption>
            <NativeSelectOption value="active">Active only</NativeSelectOption>
            <NativeSelectOption value="revoked">Revoked only</NativeSelectOption>
          </NativeSelect>
        </div>
      </div>

      <Card size="sm" className="overflow-hidden border border-border bg-card p-0 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[24%]">Label</TableHead>
                <TableHead className="w-[26%]">API Key</TableHead>
                <TableHead className="w-[14%]">Project</TableHead>
                <TableHead className="w-[10%]">Status</TableHead>
                <TableHead className="w-[12%]">Created</TableHead>
                <TableHead className="w-[14%] text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingKeys ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <Spinner className="size-6 text-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0 text-center">
                    <Empty className="py-12 border-0">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <HugeiconsIcon icon={Key01Icon} className="size-6 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyTitle>No API keys found</EmptyTitle>
                        <EmptyDescription>
                          Create an API key to trigger your cron jobs programmatically from GitHub Actions, Vercel, or cURL.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                filteredKeys.map((key) => {
                  const hex = hexFromBytes(key.key_hash)
                  const isRevoking = actionInProgress === `revoke-${hex}`
                  const isDeleting = actionInProgress === `delete-${hex}`

                  return (
                    <TableRow key={hex} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={Key01Icon} className="size-4 text-muted-foreground" />
                          <span>{key.label}</span>
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="font-mono text-xs select-all truncate max-w-44 sm:max-w-64">
                            {key.raw_key
                              ? visibleKeys[hex]
                                ? key.raw_key
                                : `${key.raw_key.slice(0, 12)}••••••••••••`
                              : `icp_cron_${hex}...`}
                          </Badge>
                          {key.raw_key && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              className="size-6 text-muted-foreground hover:text-foreground shrink-0"
                              onClick={() =>
                                setVisibleKeys((prev) => ({
                                  ...prev,
                                  [hex]: !prev[hex],
                                }))
                              }
                              aria-label={visibleKeys[hex] ? "Hide API key" : "Show API key"}
                            >
                              <HugeiconsIcon
                                icon={visibleKeys[hex] ? ViewOffIcon : ViewIcon}
                                className="size-3"
                              />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="size-6 text-muted-foreground hover:text-foreground shrink-0"
                            onClick={() => void handleCopyKey(key.raw_key || `icp_cron_${hex}...`, hex)}
                            aria-label="Copy API key"
                          >
                            <HugeiconsIcon
                              icon={copiedHex === hex ? Tick02Icon : Copy01Icon}
                              className="size-3"
                            />
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-foreground">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{key.projectName}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{formatProjectId(key.project_id)}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={key.revoked ? "destructive" : "default"}
                          className="text-[10px] py-0 px-1.5"
                        >
                          {key.revoked ? "Revoked" : "Active"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(key.created_at)}
                      </TableCell>

                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          {!key.revoked && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevoke(key)}
                              disabled={isRevoking || isDeleting}
                              className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                            >
                              {isRevoking ? (
                                <Spinner className="size-3" />
                              ) : (
                                <HugeiconsIcon icon={CancelCircleIcon} className="size-3 mr-1" />
                              )}
                              Revoke
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(key)}
                            disabled={isRevoking || isDeleting}
                            className="text-xs h-7 px-2 text-destructive hover:bg-destructive/10 border-border"
                          >
                            {isDeleting ? (
                              <Spinner className="size-3" />
                            ) : (
                              <HugeiconsIcon icon={Delete02Icon} className="size-3 mr-1" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Create an API Key
            </DialogTitle>
            <DialogDescription>
              Generate an authentication key to trigger cron jobs programmatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 py-2">
            {projects.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label>Target Project</Label>
                <NativeSelect
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full text-sm"
                  required
                >
                  {projects.map((p) => (
                    <NativeSelectOption key={p.id.toString()} value={p.id.toString()}>
                      {p.name} ({formatProjectId(p.id)})
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label>Key Label</Label>
              <Input
                value={newKeyLabel}
                onChange={(e) => setNewKeyLabel(e.target.value)}
                placeholder="e.g. GitHub Actions, Vercel Deploy Hook"
                className="text-sm"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={creatingKey || !targetProjectId || !newKeyLabel.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {creatingKey ? <Spinner className="size-3.5" /> : "Generate Key"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={resultModalOpen} onOpenChange={setResultModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              API Key Generated
            </DialogTitle>
            <DialogDescription>
              Copy this key immediately. For security, it will never be displayed again.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={generatedResult ?? ""}
                className="font-mono text-xs bg-muted/60"
              />
              <Button
                size="sm"
                onClick={handleCopySecret}
                className="shrink-0 gap-1.5 bg-primary text-primary-foreground"
              >
                <HugeiconsIcon
                  icon={copiedSecret ? Tick02Icon : Copy01Icon}
                  className="size-3.5"
                />
                {copiedSecret ? "Copied" : "Copy"}
              </Button>
            </div>

            <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-warning-foreground">
              Please save this key securely. If lost, you will need to generate a new key and revoke this one.
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResultModalOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppPage>
  )
}
