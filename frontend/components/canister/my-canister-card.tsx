"use client"

import { useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Icon } from "@/components/ui/icon"
import { FuelGaugeGlassIcon } from "@thesvg/ui-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { MineRowStatus } from "@/hooks/canister/useMineStatusMap"
import { projectAvatarUriFor } from "@/lib/profile/avatar"
import { useAuth } from "@/components/auth/auth-provider"
import { preloadCanisterStatus } from "@/hooks/canister/useCanisterStatus"
import { cn } from "@/lib/ui/utils"

export function MyCanisterCard({
  id,
  label,
  status,
  statusLoading,
  onTopUp,
  onConnect,
}: {
  id: string
  label: string
  status?: MineRowStatus
  statusLoading?: boolean
  onTopUp: () => void
  onConnect?: () => void
}) {
  const t = useTranslations("myCanisters")
  const ts = useTranslations("canisterStatus")
  const { identity } = useAuth()

  const avatarUri = useMemo(
    () => projectAvatarUriFor(id || label),
    [id, label]
  )

  const handlePreload = () => {
    if (identity && id) void preloadCanisterStatus(identity, id)
  }

  return (
    <Card
      onMouseEnter={handlePreload}
      className="flex flex-col justify-between gap-3.5 rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-border hover:shadow-xs group"
    >
      <CardContent className="p-0 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="size-9 shrink-0 border border-border/60 bg-muted/40 overflow-hidden rounded-lg">
              <AvatarImage src={avatarUri} alt={label} className="size-full object-cover" />
              <AvatarFallback className="bg-transparent text-xs font-semibold uppercase text-foreground">
                {(label || id).trim().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-0.5">
              <Link
                href={`/canister?id=${id}`}
                className="truncate block text-sm font-semibold text-foreground group-hover:text-primary transition-colors"
              >
                {label}
              </Link>
              <Link
                href={`/canister?id=${id}`}
                className="truncate block font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {id}
              </Link>
            </div>
          </div>

          <div className="shrink-0">
            {statusLoading && !status ? (
              <Skeleton className="h-5 w-16 rounded-full" />
            ) : status?.kind === "ok" ? (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-foreground">
                <span
                  className={cn(
                    "size-1.5 rounded-full shrink-0",
                    status.data.runStatus === "running"
                      ? "bg-success"
                      : status.data.runStatus === "stopped"
                        ? "bg-muted-foreground"
                        : "bg-destructive"
                  )}
                />
                <span className="capitalize">{ts(`run.${status.data.runStatus}`)}</span>
              </div>
            ) : status?.kind === "denied" ? (
              onConnect ? (
                <button
                  type="button"
                  onClick={onConnect}
                  className="cursor-pointer inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <span className="size-1.5 rounded-full shrink-0 bg-destructive" />
                  <span>{t("rowDenied")}</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                  <span className="size-1.5 rounded-full shrink-0 bg-destructive" />
                  <span>{t("rowDenied")}</span>
                </div>
              )
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-border/40 bg-muted/20 p-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">Cycles Balance</span>
            {status?.kind === "ok" && (
              <span className="text-[10px] text-muted-foreground font-mono">
                {status.data.memoryLabel}
              </span>
            )}
          </div>
          <div className="mt-1">
            {statusLoading && !status ? (
              <Skeleton className="h-6 w-24 rounded-md" />
            ) : status?.kind === "ok" ? (
              <div className="flex items-center gap-1.5">
                <Image
                  src="/images/pages/canister/icon/tcycle.svg"
                  alt="TC"
                  width={20}
                  height={20}
                  className="size-4.5 shrink-0 rounded-full select-none"
                />
                <span className="text-base font-bold tracking-tight text-foreground tabular-nums">
                  {status.data.cyclesLabel}
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">cycles</span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">—</span>
            )}
          </div>
        </div>
      </CardContent>

      <div className="border-t border-border/40 pt-2.5 flex items-center justify-between gap-2">
        <Link
          href={`/canister?id=${id}`}
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <span>{t("view")}</span>
        </Link>

        <div className="flex items-center gap-1.5">
          {((status?.kind === "denied") || (status?.kind === "ok" && !status.data.isController)) && onConnect ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onConnect}
              className="h-7 px-2 text-xs font-medium cursor-pointer"
            >
              <span>Connect</span>
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onTopUp}
            className="h-7 gap-1.5 px-2.5 text-xs font-medium cursor-pointer"
          >
            <Icon icon={FuelGaugeGlassIcon} className="size-3 text-muted-foreground" strokeWidth={1.75} />
            <span>{t("topUp")}</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}
