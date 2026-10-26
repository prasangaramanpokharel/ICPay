"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { LinkSquare02Icon, Tick02Icon, ZapIcon } from "@hugeicons/core-free-icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { canisterDashboardUrl } from "@/services/canister/createCanister"

export type CreateCanisterSuccess = {
  canister: string
  block: string
  amount: string
  withdrew: boolean
}

export function CreateCanisterAlerts({
  error,
  lastOk,
  onDismissSuccess,
}: {
  error: string | null
  lastOk: CreateCanisterSuccess | null
  onDismissSuccess: () => void
}) {
  const t = useTranslations("canisterCreate")
  const tc = useTranslations("common")

  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t("failed")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Dialog
        open={lastOk != null}
        onOpenChange={(open) => {
          if (!open) {
            onDismissSuccess()
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center sm:items-center sm:text-center">
            <div className="animate-in fade-in zoom-in-75 mb-1 flex items-center justify-center text-success duration-200">
              <HugeiconsIcon icon={Tick02Icon} className="size-10" strokeWidth={2.25} />
            </div>
            <DialogTitle>{t("successTitle")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("success", { canister: lastOk?.canister ?? "" })}
            </DialogDescription>
          </DialogHeader>

          {lastOk && (
            <div className="space-y-4 text-center">
              <div className="space-y-1.5">
                <div className="flex items-center justify-center gap-1.5">
                  <p className="max-w-[85%] break-all font-mono text-sm text-foreground/80">
                    {lastOk.canister}
                  </p>
                  <CopyButton text={lastOk.canister} size="icon-sm" className="shrink-0" />
                </div>
                <p className="text-sm text-foreground">
                  {t("amountPaid")}:{" "}
                  <span className="font-medium tabular-nums">{lastOk.amount} ICP</span>
                  {" · "}
                  {t("blockIndex")}:{" "}
                  <span className="font-medium tabular-nums">{lastOk.block}</span>
                </p>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {lastOk.withdrew && <p>{t("successWithdrew")}</p>}
                <p>{t("successHint")}</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-stretch">
            {lastOk && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex-1 gap-1.5"
                  nativeButton={false}
                  render={
                    <a
                      href={canisterDashboardUrl(lastOk.canister)}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                >
                  <HugeiconsIcon icon={LinkSquare02Icon} className="size-3.5" />
                  {t("viewOnDashboard")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full flex-1 gap-1.5"
                  nativeButton={false}
                  render={<Link href="/canister" />}
                >
                  <HugeiconsIcon icon={ZapIcon} className="size-3.5" />
                  {t("viewMine")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex-1 gap-1.5"
                  nativeButton={false}
                  render={<Link href="/topup" />}
                >
                  {t("topUpNext")}
                </Button>
              </>
            )}
            <Button type="button" variant="default" className="w-full flex-1" onClick={onDismissSuccess}>
              {tc("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
