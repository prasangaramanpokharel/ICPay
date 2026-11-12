"use client"

import { type ReactNode } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"
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

export function CanisterSuccessDialog({
  open,
  onClose,
  title,
  description,
  highlight,
  detail,
  monoId,
  actions,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  highlight?: ReactNode
  detail?: ReactNode
  monoId?: string | null
  actions?: ReactNode
}) {
  const tc = useTranslations("common")
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
    >
      <DialogContent className="gap-5 p-5 sm:max-w-md sm:p-6" closeButtonSize="icon-lg">
        <DialogHeader className="items-center pr-10 text-center sm:items-center sm:text-center">
          <div className="animate-in fade-in zoom-in-75 mb-1 flex items-center justify-center text-success duration-200">
            <HugeiconsIcon icon={Tick02Icon} className="size-10" strokeWidth={2.25} />
          </div>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{title}</DialogDescription>
          )}
          {highlight}
        </DialogHeader>

        {(monoId || detail) && (
          <div className="space-y-3 text-center">
            {monoId ? (
              <div className="flex items-center justify-center gap-1.5">
                <p className="max-w-[85%] break-all font-mono text-sm text-foreground/80">
                  {monoId}
                </p>
                <CopyButton text={monoId} size="icon-sm" className="shrink-0" />
              </div>
            ) : null}
            {detail}
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col sm:justify-stretch">
          {actions}
          <Button
            type="button"
            size="lg"
            variant="default"
            className="w-full"
            onClick={onClose}
          >
            {tc("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
