"use client"

import * as React from "react"
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlayIcon,
  RefreshIcon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { useAuth } from "@/components/auth/auth-provider"
import { useIsMobile } from "@/hooks/use-mobile"
import { getJobLogs, triggerJob } from "@/services/cron/client"
import type { RemoteExecutionLog, RemoteJobSummary } from "@/services/cron/types"

interface CronOutputDrawerProps {
  job: RemoteJobSummary | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CronOutputDrawer({ job, open, onOpenChange }: CronOutputDrawerProps) {
  const isMobile = useIsMobile()
  const { identity } = useAuth()
  const [logs, setLogs] = React.useState<RemoteExecutionLog[]>([])
  const [loading, setLoading] = React.useState(false)
  const [triggering, setTriggering] = React.useState(false)

  const fetchLogs = React.useCallback(async () => {
    if (!job) return
    setLoading(true)
    try {
      const data = await getJobLogs(job.id, 50n, identity ?? undefined)
      setLogs(data)
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [job, identity])

  React.useEffect(() => {
    let active = true
    if (open && job) {
      getJobLogs(job.id, 50n, identity ?? undefined)
        .then((data) => {
          if (active) setLogs(data)
        })
        .catch(() => {
          if (active) setLogs([])
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }
    return () => {
      active = false
    }
  }, [open, job, identity])

  const handleRunNow = async () => {
    if (!job) return
    if (!identity) {
      toast.error("Please sign in with Internet Identity first.")
      return
    }
    setTriggering(true)
    try {
      await triggerJob(job.id, identity)
      toast.success(`Job "${job.label}" triggered successfully.`)
      setTimeout(() => {
        fetchLogs()
      }, 1500)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to trigger job.")
    } finally {
      setTriggering(false)
    }
  }

  if (!job) return null

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      showSwipeHandle={isMobile}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent className="max-h-[min(100dvh,720px)] sm:max-h-none sm:w-[480px] md:w-[560px] border-border/60 bg-card p-0 focus:outline-none flex flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-3.5">
          <div className="min-w-0 pr-2">
            <DrawerTitle className="truncate text-base font-semibold text-foreground">
              Output & Execution History
            </DrawerTitle>
            <DrawerDescription className="font-mono text-xs text-muted-foreground mt-0.5 truncate">
              Job #{job.id.toString()} · {job.label}
            </DrawerDescription>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={loading}
              className="gap-1.5 h-8 text-xs"
            >
              <HugeiconsIcon icon={RefreshIcon} className="size-3.5" />
              Refresh
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleRunNow}
              disabled={triggering}
              className="gap-1.5 bg-primary text-primary-foreground h-8 text-xs"
            >
              {triggering ? (
                <Spinner className="size-3.5" />
              ) : (
                <HugeiconsIcon icon={PlayIcon} className="size-3.5" />
              )}
              Run Now
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              onClick={() => onOpenChange(false)}
              aria-label="Close drawer"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-4" strokeWidth={2} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="rounded-lg border border-border bg-muted/40 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Schedule:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {job.cron_expression}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Target:</span>
              <span className="font-mono text-foreground truncate max-w-xs" title={job.target_preview}>
                {job.target_preview}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Status:</span>
              <Badge
                variant={job.status === "Active" ? "default" : "secondary"}
                className="text-xs"
              >
                {job.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Total Runs:</span>
              <span className="font-mono font-semibold text-foreground">
                {job.total_runs.toString()}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">
              Recent Execution Logs (Ring Buffer)
            </h4>
            <span className="text-xs text-muted-foreground font-mono">
              {logs.length} runs recorded
            </span>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Spinner className="size-6 text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <Empty className="py-8 border border-dashed rounded-lg">
              <EmptyHeader>
                <EmptyTitle className="text-sm font-normal text-muted-foreground">
                  No executions logged yet for this job. Click &quot;Run Now&quot; to test.
                </EmptyTitle>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex flex-col gap-3">
              {logs.map((log) => {
                const dateStr = new Date(Number(log.started_at) * 1000).toLocaleString()
                const statusCode = log.status_code.length > 0 ? log.status_code[0] : null
                const errStr = log.error.length > 0 ? log.error[0] : null

                return (
                  <div
                    key={log.log_id.toString()}
                    className="rounded-lg border border-border bg-background p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-medium">
                        {log.success ? (
                          <HugeiconsIcon
                            icon={CheckmarkCircle02Icon}
                            className="size-4 text-success"
                          />
                        ) : (
                          <HugeiconsIcon
                            icon={CancelCircleIcon}
                            className="size-4 text-destructive"
                          />
                        )}
                        <span className={log.success ? "text-success font-semibold" : "text-destructive font-semibold"}>
                          {log.success ? "Success" : "Failed"}
                        </span>
                        {statusCode && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">
                            HTTP {statusCode}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground font-mono text-[11px]">
                        <span>{log.duration_ms}ms</span>
                        <span>·</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>

                    {errStr && (
                      <div className="rounded bg-destructive/10 p-2 text-xs font-mono text-destructive">
                        {errStr}
                      </div>
                    )}

                    {log.response_snippet && (
                      <pre className="rounded bg-muted/60 p-2 text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all max-h-36">
                        {log.response_snippet}
                      </pre>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
