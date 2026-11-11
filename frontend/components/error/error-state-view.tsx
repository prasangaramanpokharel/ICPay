"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function ErrorStateView({
  title = "Something went wrong",
  description = "An unexpected error occurred while rendering this view. Your funds remain safe on-chain.",
  digest,
  returnHref = "/",
  returnLabel = "Return Home",
  onReset,
}: {
  title?: string
  description?: string
  digest?: string
  returnHref?: string
  returnLabel?: string
  onReset: () => void
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center justify-center px-4 py-12">
      <Empty className="gap-5 rounded-3xl border border-border/60 bg-card/50 px-6 py-12">
        <EmptyHeader className="gap-2.5">
          <EmptyMedia
            variant="icon"
            className="mb-1 size-11 rounded-2xl border border-destructive/20 bg-destructive/10"
          >
            <HugeiconsIcon
              icon={Alert02Icon}
              className="size-5 text-destructive"
              strokeWidth={1.75}
            />
          </EmptyMedia>
          <Badge variant="outline" className="font-mono text-[11px] text-muted-foreground">
            {digest ? `REF: ${digest}` : "APPLICATION ERROR"}
          </Badge>
          <EmptyTitle className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </EmptyTitle>
          <EmptyDescription className="max-w-xs text-sm text-muted-foreground">
            {description}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row flex-wrap items-center justify-center gap-2.5 pt-1">
          <Button size="sm" onClick={onReset}>
            Try again
          </Button>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href={returnHref} />}>
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" strokeWidth={1.75} />
            {returnLabel}
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
