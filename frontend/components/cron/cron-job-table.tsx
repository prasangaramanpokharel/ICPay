"use client"

import * as React from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlayIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
import { useAuth } from "@/components/auth/auth-provider"
import { deleteJob, pauseJob, resumeJob, triggerJob } from "@/services/cron/client"
import type { RemoteJobSummary } from "@/services/cron/types"
import { CronOutputDrawer } from "./cron-output-drawer"

interface CronJobTableProps {
  jobs: RemoteJobSummary[]
  loading: boolean
  projectId?: bigint
  onRefresh: () => void
}

export function CronJobTable({ jobs, loading, projectId, onRefresh }: CronJobTableProps) {
  const { identity } = useAuth()
  const [selectedJob, setSelectedJob] = React.useState<RemoteJobSummary | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [actionInProgress, setActionInProgress] = React.useState<string | null>(null)

  const handleDelete = async (job: RemoteJobSummary) => {
    if (!confirm(`Are you sure you want to delete job "${job.label}"?`)) return
    if (!identity) {
      toast.error("Please sign in with Internet Identity first.")
      return
    }
    setActionInProgress(`delete-${job.id}`)
    try {
      await deleteJob(job.id, identity)
      onRefresh()
      toast.success(`Job "${job.label}" deleted successfully.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete job.")
    } finally {
      setActionInProgress(null)
    }
  }

  const handleTogglePause = async (job: RemoteJobSummary) => {
    if (!identity) {
      toast.error("Please sign in with Internet Identity first.")
      return
    }
    const isPaused = job.status === "Paused"
    setActionInProgress(`pause-${job.id}`)
    try {
      if (isPaused) {
        await resumeJob(job.id, identity)
        toast.success(`Job "${job.label}" resumed successfully.`)
      } else {
        await pauseJob(job.id, identity)
        toast.success(`Job "${job.label}" paused successfully.`)
      }
      onRefresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update job status.")
    } finally {
      setActionInProgress(null)
    }
  }

  const handleRunNow = async (job: RemoteJobSummary) => {
    if (!identity) {
      toast.error("Please sign in with Internet Identity first.")
      return
    }
    setActionInProgress(`run-${job.id}`)
    try {
      await triggerJob(job.id, identity)
      onRefresh()
      toast.success(`Job "${job.label}" triggered successfully.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to trigger job.")
    } finally {
      setActionInProgress(null)
    }
  }

  const handleViewOutput = (job: RemoteJobSummary) => {
    setSelectedJob(job)
    setDrawerOpen(true)
  }

  return (
    <>
      <Card className="border border-border/80 bg-card text-card-foreground shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            List of Cron Jobs
          </CardTitle>
          <Link
            href={projectId ? `/cron/create?projectId=${projectId.toString()}` : "/cron/create"}
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "gap-1.5 text-xs h-8",
            })}
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
            New Cron Job
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Spinner className="size-6 text-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <span className="text-sm text-muted-foreground">
                No cron jobs configured yet in this project.
              </span>
              <Link
                href={projectId ? `/cron/create?projectId=${projectId.toString()}` : "/cron/create"}
                className={buttonVariants({
                  variant: "default",
                  size: "sm",
                  className: "mt-4 gap-1.5 text-xs h-8",
                })}
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
                Create Your First Cron Job
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-semibold py-3.5 w-44">
                      Time
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold py-3.5">
                      Command to Run
                    </TableHead>
                    <TableHead className="text-right text-muted-foreground font-semibold py-3.5 pr-6 w-72">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => {
                    const isDeleting = actionInProgress === `delete-${job.id}`
                    const isToggling = actionInProgress === `pause-${job.id}`
                    const isRunning = actionInProgress === `run-${job.id}`

                    return (
                      <TableRow
                        key={job.id.toString()}
                        className="border-border hover:bg-muted/40 transition-colors"
                      >
                        <TableCell className="font-mono text-sm font-semibold text-foreground py-4">
                          <div className="flex flex-col gap-1">
                            <span>{job.cron_expression}</span>
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant={job.status === "Active" ? "outline" : "secondary"}
                                className="text-[10px] py-0 px-1 font-sans"
                              >
                                {job.status}
                              </Badge>
                              {job.consecutive_failures > 0 && (
                                <Badge
                                  variant="destructive"
                                  className="text-[10px] py-0 px-1 font-sans"
                                >
                                  {job.consecutive_failures} fails
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="font-mono text-sm text-foreground py-4 break-all">
                          <div className="flex flex-col gap-1">
                            <span className="text-foreground">{job.target_preview}</span>
                            {job.label && (
                              <span className="text-xs font-sans text-muted-foreground">
                                {job.label} · Total runs: {job.total_runs.toString()}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-right py-4 pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              title="Run Now"
                              disabled={isRunning}
                              onClick={() => handleRunNow(job)}
                              className="size-8 rounded-md"
                            >
                              {isRunning ? (
                                <Spinner className="size-3.5" />
                              ) : (
                                <HugeiconsIcon icon={PlayIcon} className="size-3.5 text-foreground" />
                              )}
                            </Button>

                            <div
                              className="flex items-center gap-1.5 px-1"
                              title={job.status === "Active" ? "Pause job" : "Resume job"}
                            >
                              {isToggling ? (
                                <Spinner className="size-3.5" />
                              ) : (
                                <Switch
                                  checked={job.status === "Active"}
                                  onCheckedChange={() => handleTogglePause(job)}
                                  disabled={actionInProgress !== null}
                                />
                              )}
                            </div>

                            <Button
                              size="sm"
                              onClick={() => handleViewOutput(job)}
                              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-3.5 rounded-md text-xs h-8"
                            >
                              View Output
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isDeleting}
                              onClick={() => handleDelete(job)}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive border-border font-medium px-3.5 rounded-md text-xs h-8"
                            >
                              {isDeleting ? <Spinner className="size-3" /> : "Delete"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CronOutputDrawer
        job={selectedJob}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  )
}
