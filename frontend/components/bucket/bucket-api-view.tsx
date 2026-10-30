"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import useSWR from "swr"
import { toast } from "sonner"
import {
  Add01Icon,
  ArrowRight01Icon,
  CodeIcon,
  Copy01Icon,
  Delete02Icon,
  EyeIcon,
  EyeOffIcon,
  InformationCircleIcon,
  Key01Icon,
  MoreHorizontalIcon,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AppPage } from "@/components/layout/dashboard/app-page"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { PremiumGateDialog } from "@/components/shared/premium-gate"
import { useAuth } from "@/components/auth/auth-provider"
import { useBucketList, BUCKET_QUERY } from "@/hooks/bucket/useBucket"
import { useOwnProfile } from "@/hooks/wallet/useWalletData"
import { isPremiumHandle } from "@/lib/verified/premiumTick"
import { mapBucketError } from "@/lib/bucket/bucket"
import { copyText } from "@/lib/wallet/utils"
import { createApiKey, listApiKeys, revokeApiKey } from "@/services/bucket/bucket"
import type {
  ApiKeyCreateResult,
  ApiKeyPermissions,
  ApiKeyPublic,
} from "@/services/bucket/types"

interface EnrichedApiKey extends ApiKeyPublic {
  bucketName?: string
}

function formatRelativeTime(ns: bigint): string {
  const ms = Number(ns / 1_000_000n)
  if (!ms || Number.isNaN(ms) || ms <= 0) return "—"
  const now = Date.now()
  const diffSec = Math.floor((now - ms) / 1000)
  if (diffSec < 60) return "1min ago"
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  if (diffSec < 86400 * 30) return `${Math.floor(diffSec / 86400)}d ago`
  if (diffSec < 86400 * 365) return `${Math.floor(diffSec / (86400 * 30))}mo ago`
  return `${Math.floor(diffSec / (86400 * 365))}y ago`
}

function formatFullDate(ns: bigint): string {
  const ms = Number(ns / 1_000_000n)
  if (!ms || Number.isNaN(ms) || ms <= 0) return ""
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function getPermissionLabel(perms: ApiKeyPermissions): string {
  if (perms.read && perms.write && perms.delete) return "Full access"
  if (perms.read && perms.write) return "Read & Write"
  if (perms.read) return "Read only"
  if (perms.write) return "Write only"
  if (perms.delete) return "Delete only"
  return "Custom"
}

export function BucketApiView() {
  const t = useTranslations("bucket")
  const tc = useTranslations("common")
  const searchParams = useSearchParams()
  const initialBucketParam = searchParams.get("bucket")

  const { identity } = useAuth()
  const { data: profile } = useOwnProfile()
  const username = profile?.username[0] ?? null
  const isPremium = isPremiumHandle(username)

  const { buckets, isLoading: bucketsLoading } = useBucketList()

  const [userSelectedBucketId, setUserSelectedBucketId] = useState<string | null>(null)
  const selectedBucketId =
    userSelectedBucketId ??
    (initialBucketParam && buckets.some((b) => b.id === initialBucketParam)
      ? initialBucketParam
      : "all")
  const [permissionFilter, setPermissionFilter] = useState<string>("all")
  const [query, setQuery] = useState("")

  const [createOpen, setCreateOpen] = useState(false)
  const [createBucketTarget, setCreateBucketTarget] = useState<string>("")
  const [createName, setCreateName] = useState("")
  const [permRead, setPermRead] = useState(true)
  const [permWrite, setPermWrite] = useState(true)
  const [permDelete, setPermDelete] = useState(false)
  const [createBusy, setCreateBusy] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [createdResult, setCreatedResult] = useState<ApiKeyCreateResult | null>(null)
  const [showCreatedSecret, setShowCreatedSecret] = useState(false)
  const [copiedCreatedSecret, setCopiedCreatedSecret] = useState(false)

  const [keyToRevoke, setKeyToRevoke] = useState<EnrichedApiKey | null>(null)
  const [revokeBusy, setRevokeBusy] = useState(false)

  const [codeSnippetKey, setCodeSnippetKey] = useState<EnrichedApiKey | null>(null)
  const [premiumGateOpen, setPremiumGateOpen] = useState(false)
  const [copiedKeyHintId, setCopiedKeyHintId] = useState<string | null>(null)

  useEffect(() => {
    document.title = "API Keys — ICPay Cloud"
  }, [])

  const bucketIdsKey = useMemo(() => {
    if (!identity || buckets.length === 0) return null
    const list = buckets.map((b) => b.id).sort().join(",")
    return `bucket-api-keys-all:${identity.getPrincipal().toText()}:${list}`
  }, [identity, buckets])

  const {
    data: allKeys,
    isLoading: keysLoading,
    mutate: refreshAllKeys,
  } = useSWR<EnrichedApiKey[]>(
    bucketIdsKey,
    async () => {
      const bucketMap = new Map(buckets.map((b) => [b.id, b.name]))
      const results = await Promise.all(
        buckets.map(async (b) => {
          try {
            const keys = await listApiKeys(identity, b.id)
            return keys.map((k) => ({
              ...k,
              bucketName: bucketMap.get(k.bucketId) || b.name,
            }))
          } catch {
            return []
          }
        })
      )
      return results.flat().sort((a, b) => Number(b.createdAt - a.createdAt))
    },
    { ...BUCKET_QUERY, keepPreviousData: true, dedupingInterval: 15_000 }
  )

  const filteredKeys = useMemo(() => {
    if (!allKeys) return []
    const needle = query.trim().toLowerCase()

    return allKeys.filter((key) => {
      if (key.revoked) return false

      if (selectedBucketId !== "all" && key.bucketId !== selectedBucketId) {
        return false
      }

      if (permissionFilter === "full") {
        if (!(key.permissions.read && key.permissions.write && key.permissions.delete)) {
          return false
        }
      } else if (permissionFilter === "read_write") {
        if (!key.permissions.read || !key.permissions.write) return false
      } else if (permissionFilter === "read_only") {
        if (!key.permissions.read || key.permissions.write || key.permissions.delete) {
          return false
        }
      }

      if (!needle) return true

      return (
        key.name.toLowerCase().includes(needle) ||
        key.keyHint.toLowerCase().includes(needle) ||
        (key.bucketName && key.bucketName.toLowerCase().includes(needle)) ||
        key.bucketId.toLowerCase().includes(needle)
      )
    })
  }, [allKeys, selectedBucketId, permissionFilter, query])

  const openCreateDialog = () => {
    if (!isPremium) {
      setPremiumGateOpen(true)
      return
    }
    const defaultBucket =
      selectedBucketId !== "all"
        ? selectedBucketId
        : buckets.length > 0
        ? buckets[0].id
        : ""
    setCreateBucketTarget(defaultBucket)
    setCreateName("")
    setPermRead(true)
    setPermWrite(true)
    setPermDelete(false)
    setCreateError(null)
    setCreateOpen(true)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createBucketTarget || !createName.trim()) return

    setCreateBusy(true)
    setCreateError(null)

    const res = await createApiKey(
      identity,
      createBucketTarget,
      createName.trim(),
      {
        read: permRead,
        write: permWrite,
        delete: permDelete,
      }
    )

    setCreateBusy(false)

    if ("err" in res) {
      setCreateError(mapBucketError(res.err, t))
      return
    }

    setCreateOpen(false)
    setCreatedResult(res.ok)
    setShowCreatedSecret(false)
    toast.success("API key generated successfully")
    await refreshAllKeys()
  }

  const handleCopySecret = async () => {
    if (!createdResult?.secret) return
    await copyText(createdResult.secret)
    setCopiedCreatedSecret(true)
    toast.success(tc("copied"))
    setTimeout(() => setCopiedCreatedSecret(false), 2000)
  }

  const handleCopyHint = async (key: EnrichedApiKey) => {
    await copyText(key.keyHint)
    setCopiedKeyHintId(key.id)
    toast.success(tc("copied"))
    setTimeout(() => setCopiedKeyHintId(null), 2000)
  }

  const handleConfirmRevoke = async () => {
    if (!keyToRevoke) return
    setRevokeBusy(true)
    const res = await revokeApiKey(identity, keyToRevoke.bucketId, keyToRevoke.id)
    setRevokeBusy(false)
    if ("err" in res) {
      toast.error(mapBucketError(res.err, t))
    } else {
      toast.success("API key revoked")
      setKeyToRevoke(null)
      await refreshAllKeys()
    }
  }

  const totalKeysCount = allKeys?.filter((k) => !k.revoked).length ?? 0

  return (
    <AppPage
      title={t("apiKeysTitle")}
      description="Manage programmatic access keys for S3 SDK integrations, CLI tools, and automated pipelines."
      back={
        <Breadcrumb className="mb-2">
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/bucket" />}>{t("title")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" strokeWidth={1.75} />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{t("apiKeysTitle")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/bucket/docs" />}
            className="gap-1.5"
          >
            <HugeiconsIcon icon={CodeIcon} className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
            <span>Docs</span>
          </Button>

          <Button
            size="sm"
            onClick={openCreateDialog}
            disabled={buckets.length === 0 || bucketsLoading}
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
            placeholder="Search..."
            className="pl-10"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {buckets.length > 1 && (
            <NativeSelect
              value={selectedBucketId}
              onChange={(e) => setUserSelectedBucketId(e.target.value)}
              className="text-xs"
            >
              <NativeSelectOption value="all">All buckets</NativeSelectOption>
              {buckets.map((b) => (
                <NativeSelectOption key={b.id} value={b.id}>
                  {b.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          )}

          <NativeSelect
            value={permissionFilter}
            onChange={(e) => setPermissionFilter(e.target.value)}
            className="text-xs"
          >
            <NativeSelectOption value="all">All permissions</NativeSelectOption>
            <NativeSelectOption value="full">Full access</NativeSelectOption>
            <NativeSelectOption value="read_write">Read & Write</NativeSelectOption>
            <NativeSelectOption value="read_only">Read only</NativeSelectOption>
          </NativeSelect>
        </div>
      </div>

      <Card size="sm" className="overflow-hidden border border-border bg-card p-0 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[30%]">Name</TableHead>
                <TableHead className="w-[25%]">Token</TableHead>
                <TableHead className="w-[18%]">Permission</TableHead>
                <TableHead className="w-[14%]">Last used</TableHead>
                <TableHead className="w-[13%]">Created</TableHead>
                <TableHead className="w-[40px] text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {bucketsLoading || keysLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="py-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Spinner className="size-4" />
                        <span>Loading API keys…</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : buckets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted/60 text-muted-foreground">
                        <HugeiconsIcon icon={Key01Icon} className="size-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">No buckets available</p>
                        <p className="text-xs text-muted-foreground">
                          Create an on-chain storage bucket first to generate secret API keys.
                        </p>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        nativeButton={false}
                        render={<Link href="/bucket" />}
                        className="mt-1"
                      >
                        Create bucket
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted/60 text-muted-foreground">
                        <HugeiconsIcon icon={Key01Icon} className="size-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {query ? "No matching API keys" : "No API keys created"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {query
                            ? "Try refining your search terms or filters."
                            : "Create your first API key for programmatic headless uploads."}
                        </p>
                      </div>
                      {!query && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={openCreateDialog}
                          className="mt-1 gap-1.5"
                        >
                          <HugeiconsIcon icon={Add01Icon} className="size-3.5" />
                          <span>Create API key</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredKeys.map((key) => {
                  const permLabel = getPermissionLabel(key.permissions)
                  const relativeDate = formatRelativeTime(key.createdAt)
                  const fullDate = formatFullDate(key.createdAt)

                  return (
                    <TableRow key={key.id} className="group transition-colors">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted/50 text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary">
                            <HugeiconsIcon icon={Key01Icon} className="size-3.5" strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium text-foreground" title={key.name}>
                                {key.name}
                              </span>
                              {selectedBucketId === "all" && key.bucketName && (
                                <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-normal">
                                  {key.bucketName}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                          <span className="truncate">{key.keyHint}</span>
                          <button
                            type="button"
                            onClick={() => void handleCopyHint(key)}
                            className="inline-flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                            aria-label="Copy key token prefix"
                            title={copiedKeyHintId === key.id ? tc("copied") : tc("copy")}
                          >
                            <HugeiconsIcon
                              icon={copiedKeyHintId === key.id ? Tick02Icon : Copy01Icon}
                              className="size-3.5"
                            />
                          </button>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <span className="text-xs text-muted-foreground">{permLabel}</span>
                      </TableCell>

                      <TableCell className="py-3">
                        <span className="text-xs text-muted-foreground">No activity</span>
                      </TableCell>

                      <TableCell className="py-3" title={fullDate}>
                        <span className="text-xs text-muted-foreground">{relativeDate}</span>
                      </TableCell>

                      <TableCell className="py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="size-7 text-muted-foreground hover:text-foreground"
                                aria-label="Key actions"
                              >
                                <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" strokeWidth={1.75} />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => void handleCopyHint(key)}
                              className="gap-2 text-xs cursor-pointer"
                            >
                              <HugeiconsIcon icon={Copy01Icon} className="size-3.5 text-muted-foreground" />
                              <span>Copy token prefix</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => setCodeSnippetKey(key)}
                              className="gap-2 text-xs cursor-pointer"
                            >
                              <HugeiconsIcon icon={CodeIcon} className="size-3.5 text-muted-foreground" />
                              <span>Quick connect</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => setKeyToRevoke(key)}
                              className="gap-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                            >
                              <HugeiconsIcon icon={Delete02Icon} className="size-3.5 text-destructive" />
                              <span>Delete API key</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>
          Page 1 - 1 of {filteredKeys.length} {filteredKeys.length === 1 ? "key" : "keys"} · {totalKeysCount} total
        </span>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/bucket/docs" />}
          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground hover:bg-transparent"
        >
          API reference
        </Button>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md gap-4" showCloseButton>
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription className="text-xs">
              Generate a secret token for automated S3 uploads, backup scripts, and CLI access.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => void handleCreateSubmit(e)}>
            <FieldGroup className="gap-4">
              {buckets.length > 1 && (
                <Field className="gap-2">
                  <FieldLabel htmlFor="create-bucket-select">Bucket</FieldLabel>
                  <NativeSelect
                    id="create-bucket-select"
                    value={createBucketTarget}
                    onChange={(e) => setCreateBucketTarget(e.target.value)}
                    className="w-full text-sm"
                  >
                    {buckets.map((b) => (
                      <NativeSelectOption key={b.id} value={b.id}>
                        {b.name} ({b.id})
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </Field>
              )}

              <Field className="gap-2">
                <FieldLabel htmlFor="api-key-name">Name</FieldLabel>
                <Input
                  id="api-key-name"
                  value={createName}
                  maxLength={32}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. icpay2, backup-cron, s3-uploader"
                  autoComplete="off"
                />
              </Field>

              <FieldSet className="gap-2">
                <FieldLegend variant="label">Permissions</FieldLegend>
                <FieldGroup className="gap-2">
                  <Field orientation="horizontal">
                    <Checkbox
                      id="perm-read"
                      checked={permRead}
                      onCheckedChange={(v) => setPermRead(Boolean(v))}
                    />
                    <FieldLabel htmlFor="perm-read" className="text-xs font-normal">
                      Read (download files, query stats, list objects)
                    </FieldLabel>
                  </Field>

                  <Field orientation="horizontal">
                    <Checkbox
                      id="perm-write"
                      checked={permWrite}
                      onCheckedChange={(v) => setPermWrite(Boolean(v))}
                    />
                    <FieldLabel htmlFor="perm-write" className="text-xs font-normal">
                      Write (upload files, multipart uploads)
                    </FieldLabel>
                  </Field>

                  <Field orientation="horizontal">
                    <Checkbox
                      id="perm-delete"
                      checked={permDelete}
                      onCheckedChange={(v) => setPermDelete(Boolean(v))}
                    />
                    <FieldLabel htmlFor="perm-delete" className="text-xs font-normal">
                      Delete (remove objects from bucket)
                    </FieldLabel>
                  </Field>
                </FieldGroup>
              </FieldSet>

              {createError && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-xs">{createError}</AlertDescription>
                </Alert>
              )}
            </FieldGroup>

            <DialogFooter className="mt-5 gap-2 sm:gap-2">
              <DialogClose
                render={
                  <Button variant="outline" type="button" disabled={createBusy}>
                    {tc("cancel")}
                  </Button>
                }
              />
              <Button
                type="submit"
                disabled={createBusy || !createName.trim() || (!permRead && !permWrite && !permDelete)}
              >
                {createBusy && <Spinner data-icon="inline-start" />}
                {createBusy ? "Creating…" : "Create API key"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createdResult != null}
        onOpenChange={(v) => {
          if (!v) {
            setCreatedResult(null)
            setShowCreatedSecret(false)
          }
        }}
      >
        <DialogContent className="max-w-md gap-4" showCloseButton>
          <DialogHeader className="gap-1">
            <DialogTitle className="text-base font-semibold">View API Key</DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-2 rounded-lg border border-info/30 bg-info/10 p-3 text-xs text-info">
            <HugeiconsIcon icon={InformationCircleIcon} className="size-4 shrink-0 text-info" />
            <span>You can only see this key once. Store it safely.</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">API Key</label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
              <input
                type={showCreatedSecret ? "text" : "password"}
                readOnly
                value={createdResult?.secret || ""}
                className="w-full bg-transparent font-mono text-xs text-foreground outline-none"
              />
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowCreatedSecret((v) => !v)}
                  className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                  aria-label={showCreatedSecret ? "Hide secret" : "Reveal secret"}
                  title={showCreatedSecret ? "Hide secret" : "Reveal secret"}
                >
                  <HugeiconsIcon icon={showCreatedSecret ? EyeOffIcon : EyeIcon} className="size-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopySecret()}
                  className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                  aria-label="Copy secret"
                  title={copiedCreatedSecret ? tc("copied") : tc("copy")}
                >
                  <HugeiconsIcon icon={copiedCreatedSecret ? Tick02Icon : Copy01Icon} className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-start">
            <Button
              type="button"
              variant="default"
              onClick={() => {
                setCreatedResult(null)
                setShowCreatedSecret(false)
              }}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={keyToRevoke != null}
        onOpenChange={(v) => {
          if (!v) setKeyToRevoke(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API key?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed">
              This will permanently revoke the API key{" "}
              <span className="font-semibold text-foreground">{keyToRevoke?.name}</span>. Any applications, scripts,
              or automated backups using this token prefix ({keyToRevoke?.keyHint}) will immediately lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeBusy}>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={revokeBusy}
              onClick={() => void handleConfirmRevoke()}
            >
              {revokeBusy && <Spinner data-icon="inline-start" />}
              Delete API key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={codeSnippetKey != null}
        onOpenChange={(v) => {
          if (!v) setCodeSnippetKey(null)
        }}
      >
        <DialogContent className="max-w-lg gap-4" showCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <HugeiconsIcon icon={CodeIcon} className="size-4 text-muted-foreground" />
              <span>Connect with {codeSnippetKey?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Install the official client SDK and initialize with your API key.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/30 p-2.5 font-mono text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Install SDK
                </span>
                <button
                  type="button"
                  onClick={() => {
                    void copyText("npm i icpay-bucket")
                    toast.success("Command copied")
                  }}
                  className="inline-flex items-center gap-1 text-[11px] hover:text-foreground cursor-pointer"
                >
                  <HugeiconsIcon icon={Copy01Icon} className="size-3" />
                  <span>Copy</span>
                </button>
              </div>
              <p className="mt-1 text-foreground select-all">npm i icpay-bucket</p>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs overflow-x-auto">
              <pre className="text-foreground text-[11px] leading-relaxed">
{`import { BucketClient } from "icpay-bucket";

const client = new BucketClient({
  apiKey: process.env.IC_API_KEY, // Use your secret token
});

// Upload to ${codeSnippetKey?.bucketName || codeSnippetKey?.bucketId}
const result = await client.uploadFile({
  bucketId: "${codeSnippetKey?.bucketId}",
  path: "/uploads/data.json",
  data: new TextEncoder().encode(JSON.stringify({ active: true })),
  contentType: "application/json",
});`}
              </pre>
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCodeSnippetKey(null)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PremiumGateDialog
        open={premiumGateOpen}
        onOpenChange={setPremiumGateOpen}
        title="Bucket API Key Access"
        description="Generating programmatic API keys for headless S3, SDK integrations, and automated backups is exclusive to ICPay Premium handles (1–4 characters). Upgrade your handle to generate scoped read, write, and delete keys."
        featureName="Bucket API Keys"
        actionText="Get Premium Handle"
        href="/username"
      />
    </AppPage>
  )
}
