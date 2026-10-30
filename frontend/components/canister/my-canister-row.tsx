"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { createAvatar } from "@dicebear/core"
import { glass } from "@dicebear/collection"
import { HugeiconsIcon } from "@hugeicons/react"
import { ConnectIcon, FuelStationIcon, ViewIcon } from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { MineRowStatus } from "@/hooks/canister/useMineStatusMap"
import { cn } from "@/lib/ui/utils"

export function MyCanisterRow({
  id,
  label,
  selected,
  status,
  statusLoading,
  onTopUp,
  onConnect,
}: {
  id: string
  label: string
  selected: boolean
  status?: MineRowStatus
  statusLoading?: boolean
  onTopUp: () => void
  onConnect?: () => void
}) {
  const t = useTranslations("myCanisters")
  const ts = useTranslations("canisterStatus")

  const avatarUri = useMemo(
    () => createAvatar(glass, { seed: id || label }).toDataUri(),
    [id, label]
  )

  return (
    <>
      <TableRow data-state={selected ? "selected" : undefined}>
        <TableCell>
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-9 shrink-0 border border-border/60 bg-muted/40 overflow-hidden">
              <AvatarImage src={avatarUri} alt={label} className="size-full object-cover" />
              <AvatarFallback className="bg-transparent text-xs font-semibold uppercase text-foreground">
                {(label || id).trim().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/canister?id=${id}`}
                  className="truncate text-sm font-medium text-foreground hover:underline"
                >
                  {label}
                </Link>
                {statusLoading && !status ? (
                  <Skeleton className="h-4 w-14 rounded-full" />
                ) : status?.kind === "ok" ? (
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <span
                      className={cn(
                        "size-2 rounded-full shrink-0",
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
                      title="Click to connect controller via CLI"
                      className="cursor-pointer inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <span>{t("rowDenied")}</span>
                      <span className="underline underline-offset-2">Connect</span>
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <span className="size-2 rounded-full shrink-0 bg-destructive" />
                      <span>{t("rowDenied")}</span>
                    </div>
                  )
                ) : null}
              </div>
              <p className="w-full truncate font-mono text-[10px]">
                <Link
                  href={`/canister?id=${id}`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {id}
                </Link>
              </p>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-right">
          <span className="text-xs tabular-nums text-muted-foreground">
            {status?.kind === "ok" ? status.data.cyclesLabel : "—"}
          </span>
        </TableCell>
        <TableCell className="w-[100px] text-right align-middle">
          <div className="flex items-center justify-end gap-1">
            {((status?.kind === "denied") || (status?.kind === "ok" && !status.data.isController)) && onConnect ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={onConnect}
                      aria-label="Connect Canister"
                    >
                      <HugeiconsIcon icon={ConnectIcon} className="size-4 text-muted-foreground" strokeWidth={1.75} />
                    </Button>
                  }
                />
                <TooltipContent side="top">Connect controller via CLI</TooltipContent>
              </Tooltip>
            ) : null}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    nativeButton={false}
                    variant="ghost"
                    size="icon-sm"
                    render={<Link href={`/canister?id=${id}`} />}
                    aria-label={t("view")}
                  >
                    <HugeiconsIcon icon={ViewIcon} className="size-4" strokeWidth={1.75} />
                  </Button>
                }
              />
              <TooltipContent side="top">{t("view")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={onTopUp}
                    aria-label={t("topUp")}
                  >
                    <HugeiconsIcon icon={FuelStationIcon} className="size-4" strokeWidth={1.75} />
                  </Button>
                }
              />
              <TooltipContent side="top">{t("topUp")}</TooltipContent>
            </Tooltip>
          </div>
        </TableCell>
      </TableRow>
    </>
  )
}
