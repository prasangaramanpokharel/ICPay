"use client"

import { useTranslations } from "next-intl"
import { Icon } from "@/components/ui/icon"
import { XGlassIcon, DeleteGlassIcon } from "@thesvg/ui-react"
import {
  ActionBar,
  ActionBarBody,
  ActionBarClose,
  ActionBarContent,
  ActionBarSeparator,
  ActionBarValue,
} from "@/components/ui/action-bar"
import { Button } from "@/components/ui/button"
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

  return (
    <ActionBar
      open={count > 0}
      onOpenChange={(open) => {
        if (!open) onClear()
      }}
      positioning={{ placement: "bottom", gutter: "24px" }}
    >
      <ActionBarContent>
        <ActionBarValue count={count}>
          {t("selectedCount", { count: String(count) })}
        </ActionBarValue>
        <ActionBarSeparator />
        <ActionBarBody>
          {canWrite ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={onDelete}
              className="h-8 gap-1.5 px-3 text-xs"
            >
              {deleting ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Icon icon={DeleteGlassIcon} className="size-3.5" strokeWidth={1.75} />
              )}
              <span>{deleting ? tc("loading") : t("delete")}</span>
            </Button>
          ) : null}
          <ActionBarClose onClick={onClear} disabled={deleting} aria-label={tc("cancel")}>
            <Icon icon={XGlassIcon} className="size-4" strokeWidth={1.75} />
          </ActionBarClose>
        </ActionBarBody>
      </ActionBarContent>
    </ActionBar>
  )
}
