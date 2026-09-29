"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Copy01Icon, Delete02Icon, Key01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { mapBucketError } from "@/lib/bucket/bucket"
import { copyText } from "@/lib/wallet/utils"
import { useBucketApiKeys } from "@/hooks/bucket/useBucketApiKeys"
import { useOwnProfile } from "@/hooks/wallet/useWalletData"
import { isPremiumHandle } from "@/lib/verified/premiumTick"
import { PremiumGateDialog } from "@/components/shared/premium-gate"
import type { ApiKeyCreateResult, ApiKeyPublic } from "@/services/bucket/types"

export function BucketApiKeysModal({
  bucketId,
  open,
  onOpenChange,
}: {
  bucketId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations("bucket")
  const tc = useTranslations("common")
  const { data: profile } = useOwnProfile()
  const username = profile?.username[0] ?? null
  const isPremium = isPremiumHandle(username)

  const { keys, isLoading, createKey, revokeKey, refresh } = useBucketApiKeys(
    bucketId,
    open
  )
  const [createOpen, setCreateOpen] = useState(false)
  const [premiumGateOpen, setPremiumGateOpen] = useState(false)
  const [name, setName] = useState("")
  const [read, setRead] = useState(true)
  const [write, setWrite] = useState(true)
  const [del, setDel] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<ApiKeyCreateResult | null>(null)
  const [copied, setCopied] = useState(false)

  const resetForm = () => {
    setName("")
    setRead(true)
    setWrite(true)
    setDel(false)
    setError(null)
  }

  const handleCreate = async () => {
    setBusy(true)
    setError(null)
    const res = await createKey(name.trim(), { read, write, delete: del })
    setBusy(false)
    if ("err" in res) {
      setError(mapBucketError(res.err, t))
      return
    }
    setCreateOpen(false)
    setCreated(res.ok)
    resetForm()
    await refresh()
  }

  const handleRevoke = async (keyId: string) => {
    setError(null)
    const res = await revokeKey(keyId)
    if ("err" in res) setError(mapBucketError(res.err, t))
    else await refresh()
  }

  const handleCopySecret = async () => {
    if (!created) return
    await copyText(created.secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const [copiedHintId, setCopiedHintId] = useState<string | null>(null)

  const handleCopyHint = async (key: ApiKeyPublic) => {
    await copyText(key.keyHint)
    setCopiedHintId(key.id)
    setTimeout(() => setCopiedHintId(null), 2000)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md gap-3 sm:max-w-lg" showCloseButton>
          <DialogHeader className="gap-1">
            <DialogTitle className="flex items-center gap-2 text-base">
              <HugeiconsIcon icon={Key01Icon} className="size-4 text-muted-foreground" strokeWidth={1.75} />
              {t("apiKeysTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              {t("apiKeysHint")}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <Card size="sm" className="max-h-[min(45vh,320px)] overflow-y-auto p-0 py-0">
            <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner className="size-5 text-muted-foreground" />
              </div>
            ) : keys.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                {t("apiKeysEmpty")}
              </p>
            ) : (
              <ul className="divide-y divide-border/60 pb-1">
                {keys.map((key) => (
                  <li
                    key={key.id}
                    className={`flex min-w-0 items-center gap-2 px-3 py-2.5 transition-opacity ${
                      key.revoked ? "opacity-50" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium" title={key.name}>
                          {key.name}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(Number(key.createdAt / 1_000_000n)).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        <span className="truncate">{key.keyHint}</span>
                        <button
                          type="button"
                          onClick={() => void handleCopyHint(key)}
                          className="inline-flex size-3.5 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Copy key prefix"
                          title={copiedHintId === key.id ? "Copied!" : "Copy key prefix"}
                        >
                          <HugeiconsIcon
                            icon={copiedHintId === key.id ? Tick02Icon : Copy01Icon}
                            className="size-3"
                          />
                        </button>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        {key.permissions.read ? (
                          <Badge variant="outline" className="h-4 px-1 text-[9px] font-normal text-muted-foreground">
                            {t("apiKeyPermRead")}
                          </Badge>
                        ) : null}
                        {key.permissions.write ? (
                          <Badge variant="outline" className="h-4 px-1 text-[9px] font-normal text-muted-foreground">
                            {t("apiKeyPermWrite")}
                          </Badge>
                        ) : null}
                        {key.permissions.delete ? (
                          <Badge
                            variant="outline"
                            className="h-4 border-destructive/30 px-1 text-[9px] font-normal text-destructive/80"
                          >
                            {t("apiKeyPermDelete")}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    {key.revoked ? (
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {t("apiKeyRevoked")}
                      </Badge>
                    ) : (
                      <ButtonGroup className="shrink-0">
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon-sm"
                                aria-label={t("apiKeyRevoke")}
                              >
                                <HugeiconsIcon icon={Delete02Icon} className="size-4" strokeWidth={1.75} />
                              </Button>
                            }
                          />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("apiKeyRevoke")}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently revoke this API key. Any applications, scripts, or backups using this key will immediately lose access.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() => void handleRevoke(key.id)}
                              >
                                {t("apiKeyRevoke")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </ButtonGroup>
                    )}
                  </li>
                ))}
              </ul>
            )}
            </CardContent>
          </Card>

          <Button
            type="button"
            variant="default"
            size="sm"
            className="w-full"
            onClick={() => {
              if (!isPremium) {
                setPremiumGateOpen(true)
                return
              }
              resetForm()
              setCreateOpen(true)
            }}
          >
            {t("apiKeyCreate")}
          </Button>
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm gap-4" showCloseButton>
          <DialogHeader>
            <DialogTitle>{t("apiKeyCreate")}</DialogTitle>
            <DialogDescription className="text-xs">{t("apiKeyCreateHint")}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void handleCreate()
            }}
          >
            <FieldGroup className="gap-4">
              <Field className="gap-2">
                <FieldLabel htmlFor="api-key-name">{t("apiKeyName")}</FieldLabel>
                <Input
                  id="api-key-name"
                  value={name}
                  maxLength={32}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("apiKeyNamePlaceholder")}
                />
              </Field>

              <FieldSet className="gap-2">
                <FieldLegend variant="label">{t("apiKeyPermissions")}</FieldLegend>
                <FieldGroup className="gap-2">
                  <Field orientation="horizontal">
                    <Checkbox
                      id="perm-read"
                      checked={read}
                      onCheckedChange={(v) => setRead(Boolean(v))}
                    />
                    <FieldLabel htmlFor="perm-read" className="font-normal text-xs">
                      {t("apiKeyPermRead")}
                    </FieldLabel>
                  </Field>
                  <Field orientation="horizontal">
                    <Checkbox
                      id="perm-write"
                      checked={write}
                      onCheckedChange={(v) => setWrite(Boolean(v))}
                    />
                    <FieldLabel htmlFor="perm-write" className="font-normal text-xs">
                      {t("apiKeyPermWrite")}
                    </FieldLabel>
                  </Field>
                  <Field orientation="horizontal">
                    <Checkbox
                      id="perm-del"
                      checked={del}
                      onCheckedChange={(v) => setDel(Boolean(v))}
                    />
                    <FieldLabel htmlFor="perm-del" className="font-normal text-xs">
                      {t("apiKeyPermDelete")}
                    </FieldLabel>
                  </Field>
                </FieldGroup>
              </FieldSet>

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}
            </FieldGroup>

            <DialogFooter className="mt-4 gap-2 sm:gap-2">
              <DialogClose
                render={
                  <Button variant="outline" type="button" disabled={busy}>
                    {tc("cancel")}
                  </Button>
                }
              />
              <Button
                type="submit"
                disabled={busy || !name.trim() || (!read && !write && !del)}
              >
                {busy && <Spinner className="size-3.5" />}
                {busy ? t("apiKeyCreating") : t("apiKeyCreate")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={created != null} onOpenChange={(v) => !v && setCreated(null)}>
        <DialogContent className="max-w-sm gap-4" showCloseButton>
          <DialogHeader>
            <DialogTitle>{t("apiKeyCreatedTitle")}</DialogTitle>
            <DialogDescription className="text-xs">{t("apiKeyCreatedBody")}</DialogDescription>
          </DialogHeader>
          <Card size="sm">
            <CardContent className="flex min-w-0 items-center gap-1.5 py-2 pl-3 pr-1.5">
            <pre className="min-w-0 flex-1 truncate font-mono text-xs" title={created?.secret}>
              {created?.secret}
            </pre>
            <ButtonGroup className="shrink-0">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={copied ? tc("copied") : tc("copy")}
                onClick={handleCopySecret}
              >
                <HugeiconsIcon
                  icon={copied ? Tick02Icon : Copy01Icon}
                  className="size-4"
                  strokeWidth={1.75}
                />
              </Button>
            </ButtonGroup>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  )
}
