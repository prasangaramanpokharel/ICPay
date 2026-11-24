"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { Icon } from "@/components/ui/icon"
import { XGlassIcon, CoinsGlassIcon } from "@thesvg/ui-react"
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { LaunchStatus } from "@/components/launch/launch-status"
import { useToken } from "@/hooks/token/useLaunchData"
import { useIsMobile } from "@/hooks/use-mobile"
import { statusOf } from "@/services/launch/launch"
import { cn } from "@/lib/ui/utils"

const STATUS_VARIANT = {
  active: "secondary",
  pending: "outline",
  failed: "destructive",
} as const

export function LaunchTokenDrawer({
  tokenId,
  open,
  onOpenChange,
}: {
  tokenId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations("launch")
  const isMobile = useIsMobile()
  const { token, isLoading } = useToken(tokenId)

  const [logo] = token?.logo ?? []
  const status = token ? statusOf(token) : null

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      showSwipeHandle={isMobile}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent
        className={cn(
          "border-border/60 bg-card p-0 focus:outline-none flex flex-col",
          isMobile
            ? "max-h-[92dvh] rounded-t-3xl border-t"
            : "fixed inset-y-0 right-0 h-full w-[540px] max-w-full rounded-l-3xl border-l shadow-2xl"
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
              {logo ? (
                <Image src={logo} alt="" width={28} height={28} className="size-full object-cover" unoptimized />
              ) : (
                <Icon icon={CoinsGlassIcon} className="size-4 text-muted-foreground" strokeWidth={1.75} />
              )}
            </span>
            <div className="min-w-0 flex items-center gap-2">
              <DrawerTitle className="truncate text-sm font-semibold text-foreground">
                {token ? token.name : t("title")}
              </DrawerTitle>
              {token && (
                <span className="font-mono text-xs text-muted-foreground">{token.symbol}</span>
              )}
              {status && (
                <Badge variant={STATUS_VARIANT[status]} className={cn("text-[10px] px-1.5 py-0 h-5", status === "pending" && "animate-pulse")}>
                  {t(`status.${status}`)}
                </Badge>
              )}
              <DrawerDescription className="sr-only">
                {token ? `${token.name} (${token.symbol}) launch details` : "Token details"}
              </DrawerDescription>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            onClick={() => onOpenChange(false)}
            aria-label="Close drawer"
          >
            <Icon icon={XGlassIcon} className="size-4" strokeWidth={2} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {isLoading && !token ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-16 rounded-(--radius)" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-6 w-32 rounded-lg" />
                  <Skeleton className="h-4 w-20 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-48 w-full rounded-(--radius)" />
            </div>
          ) : !token ? (
            <Alert variant="destructive">
              <AlertDescription>{t("notFound")}</AlertDescription>
            </Alert>
          ) : (
            <LaunchStatus token={token} />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
