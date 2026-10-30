"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  Copy01Icon,
  Delete02Icon,
  Download01Icon,
  PauseIcon,
  PlayIcon,
  RefreshIcon,
  Search01Icon,
  TerminalIcon,
} from "@hugeicons/core-free-icons"

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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { useAuth } from "@/components/auth/auth-provider"
import { useCanisterLogs } from "@/hooks/canister/useCanisterLogs"
import type { CanisterDetailTab } from "@/components/canister/details/my-canister-details"
import { cn } from "@/lib/ui/utils"

function isErrorLog(text: string): boolean {
  return /trap:|panic:|error:|assert\s+failed|fatal|exception/i.test(text)
}

function isWarnLog(text: string): boolean {
  return /warn:|warning:|deprecated/i.test(text)
}

export function CanisterLogsCard({
  canisterId,
  isController,
  logVisibility,
  onSelectTab,
}: {
  canisterId: string
  isController: boolean
  logVisibility?: "controllers" | "public"
  onSelectTab?: (tab: CanisterDetailTab) => void
}) {
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
  const logContainerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [filteredLogs])

  const handleCopy = () => {
    if (filteredLogs.length === 0) return
    const content = filteredLogs.map((l) => `[#${l.idx}] [${l.at}] ${l.text}`).join("\n")
    void navigator.clipboard.writeText(content).then(() => {
      toast.success("Logs copied to clipboard")
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
    toast.success("Logs downloaded")
  }

  return (
    <Card className="rounded-2xl border border-border/40 bg-card/40">
      <CardHeader className="flex flex-col gap-4 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={TerminalIcon} className="size-4 text-primary" strokeWidth={1.75} />
            <CardTitle className="text-base font-semibold text-foreground">
              Execution & Debug Logs
            </CardTitle>
            <Badge variant="outline" className="text-[10px] uppercase font-mono">
              4 KiB Ring Buffer
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Real-time stdout prints, debug logging, and runtime trap stack traces from canister execution.
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleLive}
            className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
          >
            <span
              className={cn(
                "size-2 rounded-full shrink-0",
                isLive ? "bg-success animate-pulse" : "bg-muted-foreground"
              )}
            />
            <span>{isLive ? "Live" : "Paused"}</span>
            <HugeiconsIcon
              icon={isLive ? PauseIcon : PlayIcon}
              className="size-3 text-muted-foreground"
            />
          </Button>

          <ButtonGroup>
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
                    aria-label="Refresh logs"
                  >
                    <HugeiconsIcon
                      icon={RefreshIcon}
                      className={cn("size-3.5", (isLoading || isRefreshing) && "animate-spin")}
                      strokeWidth={1.75}
                    />
                  </Button>
                }
              />
              <TooltipContent side="top">Fetch latest logs</TooltipContent>
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
                    aria-label="Copy logs"
                  >
                    <HugeiconsIcon icon={Copy01Icon} className="size-3.5" strokeWidth={1.75} />
                  </Button>
                }
              />
              <TooltipContent side="top">Copy logs to clipboard</TooltipContent>
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
                    aria-label="Download logs"
                  >
                    <HugeiconsIcon icon={Download01Icon} className="size-3.5" strokeWidth={1.75} />
                  </Button>
                }
              />
              <TooltipContent side="top">Download .txt log file</TooltipContent>
            </Tooltip>
          </ButtonGroup>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={clear}
                  disabled={logs.length === 0}
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                  aria-label="Clear local view"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-3.5" strokeWidth={1.75} />
                </Button>
              }
            />
            <TooltipContent side="top">Clear console display</TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
              strokeWidth={1.75}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter logs by message or ID..."
              className="h-8 pl-8 text-xs bg-muted/20 border-border/60"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <Button
              type="button"
              variant={filter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className="h-7 px-2.5 text-xs font-medium cursor-pointer"
            >
              <span>All</span>
              <span className="ml-1 text-[10px] text-muted-foreground">({logs.length})</span>
            </Button>
            <Button
              type="button"
              variant={filter === "errors" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("errors")}
              className="h-7 px-2.5 text-xs font-medium cursor-pointer"
            >
              <span className={cn(errorCount > 0 && "text-destructive")}>Errors / Traps</span>
              <span className="ml-1 text-[10px] text-muted-foreground">({errorCount})</span>
            </Button>
            <Button
              type="button"
              variant={filter === "normal" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("normal")}
              className="h-7 px-2.5 text-xs font-medium cursor-pointer"
            >
              <span>Normal</span>
              <span className="ml-1 text-[10px] text-muted-foreground">({normalCount})</span>
            </Button>
          </div>
        </div>

        {denied ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/60 bg-muted/20 min-h-[360px] p-8 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-8 text-destructive" strokeWidth={1.5} />
            <div className="space-y-1 max-w-md">
              <p className="text-sm font-semibold text-foreground">Canister Logs Restricted</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Viewing execution logs requires controller permissions or Public Log Visibility.
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
                Change to Public Visibility in Settings
              </Button>
            )}
          </div>
        ) : (
          <div
            ref={logContainerRef}
            className="flex flex-col rounded-xl border border-border/60 bg-muted/20 font-mono text-xs overflow-y-auto min-h-[360px] max-h-[560px] divide-y divide-border/20 p-2"
          >
            {isLoading && logs.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 p-12 text-muted-foreground">
                <Spinner className="size-5" />
                <span className="text-xs">Connecting to canister log stream...</span>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 p-12 text-center text-muted-foreground">
                <HugeiconsIcon icon={TerminalIcon} className="size-8 opacity-40" strokeWidth={1.5} />
                <p className="text-xs font-medium text-foreground">No logs recorded</p>
                <p className="text-[11px] max-w-md text-muted-foreground leading-relaxed">
                  {search
                    ? "No log entries match your filter criteria."
                    : "Output generated by Motoko Debug.print() or Rust println!() and execution traps will automatically appear here."}
                </p>
              </div>
            ) : (
              filteredLogs.map((item) => {
                const isError = isErrorLog(item.text)
                const isWarn = isWarnLog(item.text)
                return (
                  <div
                    key={`${item.idx}-${item.at}`}
                    className={cn(
                      "flex items-start gap-2.5 py-1.5 px-2 rounded transition-colors",
                      isError
                        ? "bg-destructive/10 text-destructive border-l-2 border-destructive"
                        : isWarn
                          ? "bg-warning/10 text-warning border-l-2 border-warning"
                          : "hover:bg-muted/40 text-foreground"
                    )}
                  >
                    <span className="select-none font-mono text-[10px] text-muted-foreground/60 w-10 shrink-0 text-right pt-0.5">
                      #{item.idx}
                    </span>
                    <span className="select-none font-mono text-[10px] text-muted-foreground shrink-0 pt-0.5">
                      {item.time || item.at}
                    </span>
                    <pre className="flex-1 whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed">
                      {item.text || "—"}
                    </pre>
                  </div>
                )
              })
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "size-1.5 rounded-full",
                isLive ? "bg-success animate-pulse" : "bg-muted-foreground"
              )}
            />
            <span>
              {isLive ? "Polling every 3 seconds" : "Live stream paused"}
            </span>
            <span>·</span>
            <span>
              Log Visibility: {logVisibility === "public" ? "Public" : "Controllers Only"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>
              Last fetched: {lastFetchedAt ? lastFetchedAt.toLocaleTimeString() : "—"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
