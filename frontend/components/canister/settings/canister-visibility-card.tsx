"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { mutate } from "swr"
import { toast } from "@/components/ui/sonner"

import { SettingsSection } from "./settings-section"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
import { useAuth } from "@/components/auth/auth-provider"
import {
  LogVisibility,
  updateCanisterSettings,
  formatManageError,
} from "@/services/canister/management"
import { cn } from "@/lib/ui/utils"

export function CanisterVisibilityCard({
  canisterId,
  initialLogVisibility = "controllers",
  isController,
  onRefresh,
}: {
  canisterId: string
  initialLogVisibility?: "controllers" | "public"
  isController: boolean
  onRefresh: () => void
}) {
  const t = useTranslations("myCanisters")
  const { identity } = useAuth()
  const [selectedVisibility, setSelectedVisibility] = useState<"controllers" | "public">(
    initialLogVisibility
  )
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isDirty = selectedVisibility !== initialLogVisibility

  const handleSave = () => {
    if (!identity || !canisterId) return
    setConfirmOpen(false)

    startTransition(async () => {
      try {
        await updateCanisterSettings(identity, canisterId, {
          logVisibility:
            selectedVisibility === "public" ? LogVisibility.Public : LogVisibility.Controllers,
        })
        toast.success(t("settingsSaved"))
        void mutate(["canister-status", canisterId])
        onRefresh()
      } catch (err) {
        toast.error(formatManageError(err))
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isDirty || isPending || !isController) return
    if (selectedVisibility === "public") {
      setConfirmOpen(true)
    } else {
      handleSave()
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <SettingsSection
          title={t("visibilityTitle")}
          description={t("visibilitySubtitle")}
          footer={
            isController ? (
              <Button
                type="submit"
                disabled={!isDirty || isPending}
                size="sm"
                className="cursor-pointer"
              >
                <span>{isPending ? "Saving…" : t("save")}</span>
              </Button>
            ) : null
          }
        >
          <RadioGroup
            value={selectedVisibility}
            onValueChange={(val) => setSelectedVisibility(val as "controllers" | "public")}
            disabled={!isController || isPending}
            className="gap-3"
          >
            <label
              htmlFor="vis-ctrl"
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3.5 transition-colors cursor-pointer",
                selectedVisibility === "controllers"
                  ? "border-border bg-accent/30 text-foreground"
                  : "border-border/40 hover:bg-muted/20 text-muted-foreground"
              )}
            >
              <RadioGroupItem value="controllers" id="vis-ctrl" className="mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-foreground">{t("optControllersTitle")}</p>
                <p className="text-[11px] text-muted-foreground">{t("optControllersDesc")}</p>
              </div>
            </label>

            <label
              htmlFor="vis-pub"
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3.5 transition-colors cursor-pointer",
                selectedVisibility === "public"
                  ? "border-border bg-accent/30 text-foreground"
                  : "border-border/40 hover:bg-muted/20 text-muted-foreground"
              )}
            >
              <RadioGroupItem value="public" id="vis-pub" className="mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-foreground">{t("optPublicTitle")}</p>
                <p className="text-[11px] text-muted-foreground">{t("optPublicDesc")}</p>
              </div>
            </label>
          </RadioGroup>
        </SettingsSection>
      </form>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("save")}</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              {t("publicVisibilityConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={handleSave}>
              {t("save")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
