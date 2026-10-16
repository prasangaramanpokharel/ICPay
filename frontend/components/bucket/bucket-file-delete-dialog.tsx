"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon } from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/spinner"
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

export function BucketFileDeleteDialog({
  open,
  onOpenChange,
  fileName,
  count,
  isFolder = false,
  deleting,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName: string
  count?: number
  isFolder?: boolean
  deleting: boolean
  onConfirm: () => void | Promise<void>
}) {
  const t = useTranslations("bucket")
  const tc = useTranslations("common")
  const bulk = (count ?? 1) > 1

  const title = bulk
    ? t("deleteSelectedTitle")
    : isFolder
      ? `Delete folder "${fileName}"?`
      : t("deleteFileTitle")

  const description = bulk
    ? t("deleteSelectedBody", { count: String(count) })
    : isFolder
      ? `Folder "${fileName}" and all of its contents will be removed from this bucket. This action cannot be undone.`
      : t("deleteFileBody", { name: fileName })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>{tc("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleting}
            className="gap-2"
            onClick={(e) => {
              e.preventDefault()
              void onConfirm()
            }}
          >
            {deleting ? (
              <>
                <Spinner data-icon="inline-start" />
                <span>{tc("loading")}</span>
              </>
            ) : (
              <>
                <HugeiconsIcon icon={Delete02Icon} className="size-4" strokeWidth={1.75} />
                <span>{t("delete")}</span>
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
