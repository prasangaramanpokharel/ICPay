"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "@/components/ui/sonner"
import { Icon } from "@/components/ui/icon"
import { CircleAlertGlassIcon, CopyGlassIcon, DeleteGlassIcon, DownloadGlassIcon, InfoGlassIcon, PauseGlassIcon, PlayGlassIcon, RefreshCwGlassIcon, SearchGlassIcon } from "@thesvg/ui-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { useAuth } from "@/components/auth/auth-provider"
import { useCanisterLogs } from "@/hooks/canister/useCanisterLogs"
import type { CanisterDetailTab } from "@/components/canister/details/my-canister-details"
import { cn } from "@/lib/ui/utils"

function isErrorLog(text: string): boolean {
  return /trap:|panic:|error:|assert\s+failed|fatal|exception/i.test(text)
}

export function CanisterLogsCard({
  canisterId,
  isController,
  onSelectTab,
}: {
  canisterId: string
  isController: boolean
  logVisibility?: "controllers" | "public"
  onSelectTab?: (tab: CanisterDetailTab) => void
}) {
  const t = useTranslations("myCanisters")
  const { identity } = useAuth()
  const {
    logs,
    isLoading,
    isRefreshing,
    denied,
    isLive,
    lastFetchedAt,
    refresh,
    clear,
    toggleLive,
  } = useCanisterLogs(identity, canisterId, {
    enabled: Boolean(canisterId),
    autoRefresh: true,
    pollIntervalMs: 3000,
  })

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "errors" | "normal">("all")
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  const errorCount = useMemo(
    () => logs.filter((l) => isErrorLog(l.text)).length,
    [logs]
  )
  const normalCount = useMemo(
    () => logs.filter((l) => !isErrorLog(l.text)).length,
    [logs]
  )

  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      if (filter === "errors" && !isErrorLog(item.text)) return false
      if (filter === "normal" && isErrorLog(item.text)) return false
      if (search.trim()) {
        const query = search.trim().toLowerCase()
        const textMatch = item.text.toLowerCase().includes(query)
        const idxMatch = item.idx.includes(query)
        const timeMatch = item.at.toLowerCase().includes(query)
        if (!textMatch && !idxMatch && !timeMatch) return false
      }
      return true
    })
  }, [logs, filter, search])

  const handleCopy = () => {
    if (filteredLogs.length === 0) return
    const content = filteredLogs.map((l) => `[#${l.idx}] [${l.at}] ${l.text}`).join("\n")
    void navigator.clipboard.writeText(content).then(() => {
      toast.success(t("copy"))
    })
  }

  const handleDownload = () => {
    if (logs.length === 0) return
    const content = logs.map((l) => `[#${l.idx}] [${l.at}] ${l.text}`).join("\n")
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${canisterId}-logs.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t("download"))
  }

  return (
    <Card className="rounded-xl border border-border/40 bg-card p-6 gap-4">
      <CardHeader className="flex flex-col gap-4 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between p-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-foreground">
              {t("logsTitle")}
            </CardTitle>
            <Badge variant="outline" className="border-border/60 text-muted-foreground text-[10px] font-normal">
              {t("controllersOnly")}
            </Badge>
            <Tooltip>
              <TooltipTrigger className="cursor-help text-muted-foreground hover:text-foreground">
                <Icon icon={InfoGlassIcon} className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent side="top">{t("ringBufferTooltip")}</TooltipContent>
            </Tooltip>
          </div>
          <CardDescription className="text-xs">
            {t("logsSubtitle")}
          </CardDescription>
        </div>

        <ButtonGroup>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleLive}
            className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
          >
            <Icon
              icon={isLive ? PauseGlassIcon : PlayGlassIcon}
              className="size-3.5 text-muted-foreground"
            />
            <span>{isLive ? t("live") : t("paused")}</span>
          </Button>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => void refresh()}
                  disabled={isLoading || isRefreshing}
                  className="cursor-pointer"
                  aria-label={t("refresh")}
                >
                  <Icon
                    icon={RefreshCwGlassIcon}
                    className={cn("size-3.5", (isLoading || isRefreshing) && "animate-spin")}
                    strokeWidth={1.75}
                  />
                </Button>
              }
            />
            <TooltipContent side="top">{t("refresh")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={handleCopy}
                  disabled={filteredLogs.length === 0}
                  className="cursor-pointer"
                  aria-label={t("copy")}
                >
                  <Icon icon={CopyGlassIcon} className="size-3.5" strokeWidth={1.75} />
                </Button>
              }
            />
            <TooltipContent side="top">{t("copy")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={handleDownload}
                  disabled={logs.length === 0}
                  className="cursor-pointer"
                  aria-label={t("download")}
                >
                  <Icon icon={DownloadGlassIcon} className="size-3.5" strokeWidth={1.75} />
                </Button>
              }
            />
            <TooltipContent side="top">{t("download")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setClearDialogOpen(true)}
                  disabled={logs.length === 0}
                  className="cursor-pointer text-muted-foreground hover:text-destructive"
                  aria-label={t("clear")}
                >
                  <Icon icon={DeleteGlassIcon} className="size-3.5" strokeWidth={1.75} />
                </Button>
              }
            />
            <TooltipContent side="top">{t("clear")}</TooltipContent>
          </Tooltip>
        </ButtonGroup>
      </CardHeader>

      <CardContent className="space-y-4 p-0">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="relative w-full max-w-sm">
            <Icon
              icon={SearchGlassIcon}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
              strokeWidth={1.75}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchLogs")}
              className="h-8 pl-8 text-xs rounded-md bg-muted/20 border-border/60"
            />
          </div>

          <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/20 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
                filter === "all"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{t("filterAll")}</span>
              <span className="ml-1 text-[10px] text-muted-foreground">{logs.length}</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter("errors")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
                filter === "errors"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className={cn(errorCount > 0 && "text-destructive")}>{t("filterErrors")}</span>
              <span className="ml-1 text-[10px] text-muted-foreground">{errorCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter("normal")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
                filter === "normal"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{t("filterNormal")}</span>
              <span className="ml-1 text-[10px] text-muted-foreground">{normalCount}</span>
            </button>
          </div>
        </div>

        {denied ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-8 text-center">
            <Icon icon={CircleAlertGlassIcon} className="size-8 text-destructive" strokeWidth={1.5} />
            <div className="space-y-1 max-w-md">
              <p className="text-sm font-semibold text-foreground">{t("restrictedTitle")}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("restrictedBody")}
              </p>
            </div>
            {isController && onSelectTab && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSelectTab("settings")}
                className="mt-1 text-xs cursor-pointer"
              >
                {t("settings")}
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-border/40 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="w-16 font-mono text-xs">{t("colIndex")}</TableHead>
                  <TableHead className="w-44 font-mono text-xs">{t("colTime")}</TableHead>
                  <TableHead className="text-xs">{t("colMessage")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-xs text-muted-foreground">
                      <div className="inline-flex items-center justify-center gap-2">
                        <Spinner className="size-4" />
                        <span>Loading…</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-xs text-muted-foreground">
                      {t("noLogs")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((item) => {
                    const isError = isErrorLog(item.text)
                    return (
                      <TableRow
                        key={`${item.idx}-${item.at}`}
                        className={cn(
                          "border-b border-border/20 transition-colors",
                          isError && "bg-destructive/5 text-destructive"
                        )}
                      >
                        <TableCell className="w-16 font-mono text-xs text-muted-foreground select-none align-top">
                          #{item.idx}
                        </TableCell>
                        <TableCell className="w-44 font-mono text-xs text-muted-foreground select-none whitespace-nowrap align-top">
                          {item.time || item.at}
                        </TableCell>
                        <TableCell className="font-mono text-xs whitespace-pre-wrap break-all leading-relaxed align-top">
                          {item.text || "—"}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="text-xs text-muted-foreground tabular-nums">
          {t("lastFetched", { time: lastFetchedAt ? lastFetchedAt.toLocaleTimeString() : "—" })}
        </div>
      </CardContent>

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("clearConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("clearConfirmBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                clear()
                setClearDialogOpen(false)
              }}
            >
              {t("clear")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
