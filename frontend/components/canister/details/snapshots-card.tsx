"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import useSWR from "swr"
import { toast } from "@/components/ui/sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Camera01Icon,
  Download01Icon,
  InformationCircleIcon,
  Delete02Icon,
  RotateLeft01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
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
import { CopyButton } from "@/components/ui/copy-button"
import { Skeleton } from "@/components/ui/skeleton"
import { SnapshotDownloadDialog } from "@/components/canister/details/snapshot-download-dialog"
import { useAuth } from "@/components/auth/auth-provider"
import { useCanisterStatus } from "@/hooks/canister/useCanisterStatus"
import { rememberCanister } from "@/lib/canister/savedCanisters"
import { parseCanisterId } from "@/services/cycles/topUp"
import {
  deleteSnapshot,
  formatManageError,
  listSnapshots,
  loadSnapshot,
  takeSnapshot,
} from "@/services/canister/management"

export function SnapshotsCard({
  canisterId: fixedCanisterId,
  isController: propIsController,
}: {
  canisterId?: string
  embedded?: boolean
  isController?: boolean
} = {}) {
  const t = useTranslations("myCanisters")
  const ts = useTranslations("canisterSnapshots")
  const { identity, isAuthenticated } = useAuth()
  const searchParams = useSearchParams()
  const canisterId = fixedCanisterId ?? searchParams.get("id")?.trim() ?? ""
  const trimmed = canisterId.trim()

  const [busy, setBusy] = useState(false)
  const [downloadSnapshotId, setDownloadSnapshotId] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<null | { kind: "load" | "delete"; id: string }>(null)

  const parsedOk = useMemo(() => {
    try {
      if (!trimmed) return false
      parseCanisterId(trimmed)
      return true
    } catch {
      return false
    }
  }, [trimmed])

  const status = useCanisterStatus(
    identity,
    trimmed,
    Boolean(isAuthenticated && parsedOk)
  )

  const canControl =
    propIsController !== undefined
      ? propIsController
      : status.kind === "ok"
        ? status.data.isController
        : null

  const {
    data: rows,
    isLoading: loading,
    mutate: mutateRows,
  } = useSWR(
    identity && isAuthenticated && parsedOk && canControl !== false
      ? ["canister-snapshots", trimmed]
      : null,
    () => listSnapshots(identity!, trimmed),
    { revalidateOnFocus: false }
  )

  const onTake = async () => {
    if (!identity || !parsedOk) return
    setBusy(true)
    try {
      const snap = await takeSnapshot(identity, trimmed)
      toast.success(ts("toastTaken"))
      rememberCanister(identity.getPrincipal().toText(), trimmed)
      void mutateRows((prev) => [snap, ...(prev ?? [])], false)
      status.refresh()
    } catch (e) {
      toast.error(formatManageError(e))
    } finally {
      setBusy(false)
    }
  }

  const onConfirm = async () => {
    if (!identity || !confirm) return
    const { kind, id } = confirm
    setConfirm(null)
    setBusy(true)
    try {
      if (kind === "load") {
        await loadSnapshot(identity, trimmed, id)
        toast.success(ts("toastLoaded"))
        void mutateRows()
        status.refresh()
      } else {
        await deleteSnapshot(identity, trimmed, id)
        toast.success(ts("toastDeleted"))
        void mutateRows((prev) => (prev ?? []).filter((r) => r.id !== id), false)
        status.refresh()
      }
    } catch (e) {
      toast.error(formatManageError(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Card className="rounded-xl border border-border/40 bg-card p-6 gap-4">
        <CardHeader className="flex flex-col gap-4 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between p-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Camera01Icon} className="size-4 text-muted-foreground" strokeWidth={1.5} />
              <CardTitle className="text-base font-semibold text-foreground">
                {t("snapshotsTitle")}
              </CardTitle>
              <HoverCard>
                <HoverCardTrigger className="cursor-help inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
                  <HugeiconsIcon icon={InformationCircleIcon} className="size-3.5 text-muted-foreground/70" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80 space-y-2 text-xs">
                  <p className="font-semibold text-foreground">Canister State Snapshots</p>
                  <p className="text-muted-foreground">
                    A snapshot freezes the exact state of your canister, capturing the compiled WASM binary, heap memory, and 64-bit stable memory. Restoring overwrites current state.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
            <CardDescription className="text-xs">
              {t("snapshotsDesc")}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={!parsedOk || busy || canControl === false}
              onClick={() => void onTake()}
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              <HugeiconsIcon icon={Camera01Icon} className="size-3.5" />
              <span>{t("takeSnapshot")}</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-0">
          {canControl === false && isAuthenticated && (
            <div className="rounded-lg border border-border/40 bg-muted/20 p-8 text-center space-y-2">
              <HugeiconsIcon icon={InformationCircleIcon} className="size-5 text-muted-foreground mx-auto" />
              <p className="text-xs font-medium text-foreground">{t("controllersOnly")}</p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {t("restrictedBody")}
              </p>
            </div>
          )}

          {canControl !== false && (
            <div className="rounded-lg border border-border/40 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/40 hover:bg-transparent">
                    <TableHead className="font-mono text-xs">{t("colSnapshotId")}</TableHead>
                    <TableHead className="text-xs">{t("colSize")}</TableHead>
                    <TableHead className="text-xs">{t("colTaken")}</TableHead>
                    <TableHead className="text-right text-xs pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i} className="border-b border-border/40">
                        <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell className="text-right pr-4"><Skeleton className="h-7 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : !rows || rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-xs text-muted-foreground">
                        {t("noSnapshots")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow key={row.id} className="border-b border-border/40 hover:bg-muted/30">
                        <TableCell className="font-mono text-xs py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-foreground">{row.id}</span>
                            <CopyButton value={row.id} size="icon-xs" variant="ghost" />
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono tabular-nums text-muted-foreground">
                          {row.totalSizeLabel}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {row.takenAtLabel}
                        </TableCell>
                        <TableCell className="text-right pr-4 py-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              onClick={() => setConfirm({ kind: "load", id: row.id })}
                              className="h-7 text-xs cursor-pointer gap-1"
                            >
                              <HugeiconsIcon icon={RotateLeft01Icon} className="size-3" />
                              <span>{t("restore")}</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              onClick={() => setDownloadSnapshotId(row.id)}
                              className="h-7 text-xs cursor-pointer gap-1"
                            >
                              <HugeiconsIcon icon={Download01Icon} className="size-3" />
                              <span>{t("download")}</span>
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              disabled={busy}
                              onClick={() => setConfirm({ kind: "delete", id: row.id })}
                              className="h-7 text-xs cursor-pointer gap-1"
                            >
                              <HugeiconsIcon icon={Delete02Icon} className="size-3" />
                              <span>{t("clear")}</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {downloadSnapshotId && (
        <SnapshotDownloadDialog
          open={Boolean(downloadSnapshotId)}
          onOpenChange={(open) => !open && setDownloadSnapshotId(null)}
          canisterId={trimmed}
          snapshotId={downloadSnapshotId}
        />
      )}

      <AlertDialog
        open={confirm != null}
        onOpenChange={(open) => !open && setConfirm(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.kind === "load" ? t("restoreConfirmTitle") : ts("deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              {confirm?.kind === "load" ? t("restoreConfirmBody") : ts("deleteBody")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={busy}
              onClick={() => void onConfirm()}
            >
              {busy ? "Processing…" : confirm?.kind === "load" ? t("restore") : t("clear")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
