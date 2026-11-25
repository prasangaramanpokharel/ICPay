import Link from "next/link"
import { Icon } from "@/components/ui/icon"
import { ArrowLeftGlassIcon, ArrowRightGlassIcon, CompassGlassIcon } from "@thesvg/ui-react"
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

export function NotFoundView({
  homeHref = "/",
  walletHref = "/home",
}: {
  homeHref?: string
  walletHref?: string
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center justify-center px-4 py-12">
      <Empty className="gap-5 rounded-3xl border border-border/60 bg-card/50 px-6 py-12">
        <EmptyHeader className="gap-2.5">
          <EmptyMedia variant="icon" className="mb-1 size-11 rounded-(--radius) border border-border/60 bg-muted/60">
            <Icon
              icon={CompassGlassIcon}
              className="size-5 text-muted-foreground"
              strokeWidth={1.75}
            />
          </EmptyMedia>
          <Badge variant="outline" className="font-mono text-[11px] text-muted-foreground">
            404 — NOT FOUND
          </Badge>
          <EmptyTitle className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Page not found
          </EmptyTitle>
          <EmptyDescription className="max-w-xs text-sm text-muted-foreground">
            The page or username you are looking for does not exist or may have been moved.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row flex-wrap items-center justify-center gap-2.5 pt-1">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href={homeHref} />}>
            <Icon icon={ArrowLeftGlassIcon} className="size-3.5" strokeWidth={1.75} />
            Back to Home
          </Button>
          <Button size="sm" nativeButton={false} render={<Link href={walletHref} />}>
            Open Wallet
            <Icon icon={ArrowRightGlassIcon} className="size-3.5" strokeWidth={1.75} />
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
