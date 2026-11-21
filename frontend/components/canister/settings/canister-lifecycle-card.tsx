"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { mutate } from "swr"
import { toast } from "@/components/ui/sonner"

import { SettingsSection } from "./settings-section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/components/auth/auth-provider"
import {
  startCanister,
  stopCanister,
  deleteCanister,
  formatManageError,
} from "@/services/canister/management"
import type { CanisterRunStatus } from "@/lib/canister/format"

export function CanisterLifecycleCard({
  canisterId,
  runStatus,
  isController,
  onRefresh,
}: {
  canisterId: string
  runStatus: CanisterRunStatus
  isController: boolean
  onRefresh: () => void
}) {
  const t = useTranslations("myCanisters")
  const router = useRouter()
  const { identity } = useAuth()

  const [stopConfirmOpen, setStopConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("")
  const [isPending, startTransition] = useTransition()

  const isDeleteMatched = deleteConfirmationText.trim() === canisterId

  const handleToggleState = (action: "start" | "stop") => {
    if (!identity || !canisterId) return
    setStopConfirmOpen(false)

    startTransition(async () => {
      try {
        if (action === "start") {
          await startCanister(identity, canisterId)
          toast.success(t("canisterStarted"))
        } else {
          await stopCanister(identity, canisterId)
          toast.success(t("canisterStopped"))
        }
        void mutate(["canister-status", canisterId])
        void mutate(["canister-audit-info", canisterId])
        onRefresh()
      } catch (err) {
        toast.error(formatManageError(err))
      }
    })
  }

  const handleDelete = () => {
    if (!identity || !canisterId || !isDeleteMatched) return
    setDeleteConfirmOpen(false)

    startTransition(async () => {
      try {
        await deleteCanister(identity, canisterId)
        toast.success(t("canisterDeleted"))
        router.push("/canister")
      } catch (err) {
        toast.error(formatManageError(err))
      }
    })
  }

  return (
    <>
      <SettingsSection
        title={t("lifecycleTitle")}
        description={t("lifecycleSubtitle")}
      >
        <div className="divide-y divide-border/30">
          <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-foreground">
                {runStatus === "running" ? t("stop") : t("start")}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {runStatus === "running"
                  ? t("stopConfirmDesc")
                  : "Resume execution and timers."}
              </p>
            </div>
            {runStatus === "running" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!isController || isPending}
                onClick={() => setStopConfirmOpen(true)}
                className="shrink-0 cursor-pointer"
              >
                <span>{isPending ? "Stopping…" : t("stop")}</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="default"
                size="sm"
                disabled={!isController || isPending}
                onClick={() => handleToggleState("start")}
                className="shrink-0 cursor-pointer"
              >
                <span>{isPending ? "Starting…" : t("start")}</span>
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-foreground">{t("delete")}</p>
              <p className="text-[11px] text-muted-foreground">
                {runStatus === "stopped" ? t("deleteCanisterConfirm") : t("stopFirstHint")}
              </p>
            </div>
            {runStatus === "stopped" ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={!isController || isPending}
                onClick={() => {
                  setDeleteConfirmationText("")
                  setDeleteConfirmOpen(true)
                }}
                className="shrink-0 cursor-pointer"
              >
                <span>{t("delete")}</span>
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span className="inline-block cursor-not-allowed">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled
                        className="shrink-0 pointer-events-none"
                      >
                        <span>{t("delete")}</span>
                      </Button>
                    </span>
                  }
                />
                <TooltipContent side="left">{t("stopFirstHint")}</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </SettingsSection>

      <AlertDialog open={stopConfirmOpen} onOpenChange={setStopConfirmOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("stop")}</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              {t("stopConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={() => handleToggleState("stop")}
            >
              {t("stop")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete")}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-xs text-muted-foreground">
              <p>{t("deleteCanisterConfirm")}</p>
              <p className="font-mono text-foreground break-all">{canisterId}</p>
              <div className="space-y-1 pt-1">
                <p className="text-foreground">{t("typeCanisterNameToConfirm")}:</p>
                <Input
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder={canisterId}
                  className="font-mono text-xs rounded-md"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending || !isDeleteMatched}
              onClick={handleDelete}
            >
              {isPending ? "Deleting…" : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
