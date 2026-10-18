"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ConnectIcon, FuelStationIcon, ViewIcon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SubnetCountryFlags } from "@/components/canister/subnet-country-flags"
import type { MineRowStatus } from "@/hooks/canister/useMineStatusMap"
import { cn } from "@/lib/ui/utils"

export function MyCanisterRow({
  id,
  label,
  place,
  countries,
  selected,
  status,
  statusLoading,
  onTopUp,
  onConnect,
}: {
  id: string
  label: string
  place: string
  countries?: string[]
  selected: boolean
  status?: MineRowStatus
  statusLoading?: boolean
  onTopUp: () => void
  onConnect?: () => void
}) {
  const t = useTranslations("myCanisters")
  const ts = useTranslations("canisterStatus")

  return (
    <>
      <TableRow data-state={selected ? "selected" : undefined}>
        <TableCell>
          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/canister?id=${id}`}
                className="truncate text-sm font-medium text-foreground hover:underline"
              >
                {label}
              </Link>
              {statusLoading && !status ? (
                <Skeleton className="h-5 w-16 rounded-full" />
              ) : status?.kind === "ok" ? (
                <Badge
                  variant={
                    status.data.runStatus === "running"
                      ? "default"
                      : status.data.runStatus === "stopped"
                        ? "outline"
                        : "secondary"
                  }
                  className="h-5 gap-1 px-1.5 text-[10px]"
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      status.data.runStatus === "running"
                        ? "bg-emerald-400"
                        : "bg-muted-foreground"
                    )}
                  />
                  {ts(`run.${status.data.runStatus}`)}
                </Badge>
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
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                    {t("rowDenied")}
                  </Badge>
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
            {(countries && countries.length > 0) || place ? (
              <div className="flex min-w-0 items-center gap-1.5">
                {countries && countries.length > 0 ? (
                  <SubnetCountryFlags countries={countries} max={4} />
                ) : null}
                {place ? (
                  <span className="truncate text-[11px] text-muted-foreground">{place}</span>
                ) : null}
              </div>
            ) : null}
          </div>
        </TableCell>
        <TableCell className="text-right">
          <span className="text-xs tabular-nums text-muted-foreground">
            {status?.kind === "ok" ? status.data.cyclesLabel : "—"}
          </span>
        </TableCell>
        <TableCell className="w-[100px] text-right align-middle">
          <div className="flex items-center justify-end gap-1">
            {status?.kind === "denied" && onConnect ? (
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
                      <HugeiconsIcon icon={ConnectIcon} className="size-4 text-primary" strokeWidth={1.75} />
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
