"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Spinner } from "@/components/ui/spinner"

export function BucketSelectBar({
  count,
  canWrite,
  deleting,
  onClear,
  onDelete,
}: {
  count: number
  canWrite: boolean
  deleting: boolean
  onClear: () => void
  onDelete: () => void
}) {
  const t = useTranslations("bucket")
  const tc = useTranslations("common")

  if (count === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2">
      <p className="text-sm">
        {t("selectedCount", { count: String(count) })}
      </p>
      <ButtonGroup>
        <Button type="button" variant="outline" size="sm" disabled={deleting} onClick={onClear}>
          {tc("cancel")}
        </Button>
        {canWrite ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={deleting}
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
          >
            {deleting ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <HugeiconsIcon icon={Delete02Icon} className="size-4 text-destructive" strokeWidth={1.75} />
            )}
            <span>{deleting ? tc("loading") : t("delete")}</span>
          </Button>
        ) : null}
      </ButtonGroup>
    </div>
  )
}
