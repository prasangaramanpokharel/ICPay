"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowLeft01Icon,
  Clock01Icon,
  Delete02Icon,
  Edit01Icon,
  Folder01Icon,
  MoreHorizontalIcon,
  PauseIcon,
  PlayIcon,
  Search01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import { useAuth } from "@/components/auth/auth-provider"
import {
  deleteJob,
  deleteProject,
  listJobs,
  listProjects,
  pauseJob,
  pauseProject,
  renameProject,
  resumeJob,
  resumeProject,
} from "@/services/cron/client"
import type {
  RemoteJobSummary,
  RemoteProjectRecord,
} from "@/services/cron/types"
import { formatHumanSchedule, formatRelativeTime } from "./cron-types"
import { CronOutputDrawer } from "./cron-output-drawer"
import { CronConnectModal } from "./cron-connect-modal"

type FilterTab = "all" | "active" | "paused"

export function CronProjectDetail({
  projectNameOrId,
}: {
  projectNameOrId: string
}) {
  const router = useRouter()
  const { identity } = useAuth()

  const [project, setProject] = React.useState<RemoteProjectRecord | null>(null)
  const [allProjects, setAllProjects] = React.useState<RemoteProjectRecord[]>([])
  const [jobs, setJobs] = React.useState<RemoteJobSummary[]>([])
  const [loading, setLoading] = React.useState(Boolean(identity))

  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<FilterTab>("all")

  const [renameOpen, setRenameOpen] = React.useState(false)
  const [renameName, setRenameName] = React.useState("")
  const [renaming, setRenaming] = React.useState(false)

  const [deleteProjectOpen, setDeleteProjectOpen] = React.useState(false)
  const [connectOpen, setConnectOpen] = React.useState(false)
  const [jobToDelete, setJobToDelete] = React.useState<RemoteJobSummary | null>(null)
  const [selectedJobForDrawer, setSelectedJobForDrawer] = React.useState<RemoteJobSummary | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const [actionLoading, setActionLoading] = React.useState(false)
  const [jobActionId, setJobActionId] = React.useState<bigint | null>(null)

  const loadProjectData = React.useCallback(async () => {
    if (!identity) {
      setLoading(false)
      return
    }
    try {
      const projs = await listProjects(identity)
      setAllProjects(projs)
      const decodedParam = decodeURIComponent(projectNameOrId).trim().toLowerCase()
      const found = projs.find(
        (p) =>
          p.name.toLowerCase() === decodedParam ||
          p.id.toString() === projectNameOrId
      )

      if (found) {
        setProject(found)
        const jobList = await listJobs(found.id, identity)
        setJobs(jobList)
      } else {
        setProject(null)
        setJobs([])
      }
    } catch {
      setProject(null)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [identity, projectNameOrId])

  React.useEffect(() => {
    let active = true
    if (!identity) {
      return () => {
        active = false
      }
    }
    listProjects(identity)
      .then(async (projs) => {
        if (!active) return
        setAllProjects(projs)
        const decodedParam = decodeURIComponent(projectNameOrId).trim().toLowerCase()
        const found = projs.find(
          (p) =>
            p.name.toLowerCase() === decodedParam ||
            p.id.toString() === projectNameOrId
        )

        if (found) {
          setProject(found)
          const jobList = await listJobs(found.id, identity)
          if (active) setJobs(jobList)
        } else {
          setProject(null)
          setJobs([])
        }
      })
      .catch(() => {
        if (!active) return
        setProject(null)
        setJobs([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [identity, projectNameOrId])

  const filteredJobs = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    return jobs.filter((job) => {
      const isActive = job.status === "Active"
      if (filter === "active" && !isActive) return false
      if (filter === "paused" && isActive) return false

      if (!needle) return true
      return (
        job.label.toLowerCase().includes(needle) ||
        job.cron_expression.toLowerCase().includes(needle) ||
        job.target_preview.toLowerCase().includes(needle)
      )
    })
  }, [jobs, query, filter])

  const hasActiveJobs = jobs.some((j) => j.status === "Active")

  const handlePauseAll = async () => {
    if (!project || !identity) return
    setActionLoading(true)
    try {
      const count = await pauseProject(project.id, identity)
      toast.success(`Paused project "${project.name}" (${count.toString()} jobs paused).`)
      await loadProjectData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to pause project.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleResumeAll = async () => {
    if (!project || !identity) return
    setActionLoading(true)
    try {
      const count = await resumeProject(project.id, identity)
      toast.success(`Resumed project "${project.name}" (${count.toString()} jobs resumed).`)
      await loadProjectData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resume project.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleRenameProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project || !renameName.trim() || !identity) return
    setRenaming(true)
    try {
      const updated = await renameProject(project.id, renameName.trim(), identity)
      setProject(updated)
      setRenameOpen(false)
      toast.success(`Project renamed to "${updated.name}" successfully.`)
      router.replace(`/cron?id=${encodeURIComponent(updated.name)}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to rename project.")
    } finally {
      setRenaming(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!project || !identity) return
    setActionLoading(true)
    try {
      await deleteProject(project.id, identity)
      toast.success(`Project "${project.name}" deleted successfully.`)
      router.push("/cron")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete project.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleJob = async (job: RemoteJobSummary) => {
    if (!identity) return
    setJobActionId(job.id)
    try {
      if (job.status === "Active") {
        await pauseJob(job.id, identity)
        toast.success(`Job "${job.label}" paused.`)
      } else {
        await resumeJob(job.id, identity)
        toast.success(`Job "${job.label}" resumed.`)
      }
      if (project) {
        const updated = await listJobs(project.id, identity)
        setJobs(updated)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update job status.")
    } finally {
      setJobActionId(null)
    }
  }

  const handleDeleteJob = async () => {
    if (!jobToDelete || !identity) return
    setJobActionId(jobToDelete.id)
    try {
      await deleteJob(jobToDelete.id, identity)
      toast.success(`Job "${jobToDelete.label}" deleted successfully.`)
      setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id))
      setJobToDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete job.")
    } finally {
      setJobActionId(null)
    }
  }

  const handleOpenDrawer = (job: RemoteJobSummary) => {
    setSelectedJobForDrawer(job)
    setDrawerOpen(true)
  }

  if (loading) {
    return (
      <AppPage className="mx-auto max-w-6xl w-full space-y-6">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Card className="rounded-lg border border-border/80 p-4">
          <CardContent className="space-y-3 p-0">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </AppPage>
    )
  }

  if (!project) {
    return (
      <AppPage className="mx-auto max-w-6xl w-full space-y-6">
        <Empty className="rounded-2xl border border-dashed py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Folder01Icon} className="size-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>Project not found</EmptyTitle>
            <EmptyDescription>
              The project &quot;{projectNameOrId}&quot; does not exist or has been deleted.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/cron")}
              className="gap-1.5"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
              <span>Back to projects</span>
            </Button>
          </EmptyContent>
        </Empty>
      </AppPage>
    )
  }

  const n = Number(project.created_at)
  const ms = project.created_at < 1_000_000_000_000n ? n * 1000 : Number(project.created_at / 1_000_000n)
  const createdDate = n > 0 ? new Date(ms).toLocaleDateString() : ""
  const descriptionText = `${jobs.length} ${jobs.length === 1 ? "job" : "jobs"}${
    createdDate ? ` · Created ${createdDate}` : ""
  }`

  return (
    <AppPage
      className="mx-auto max-w-6xl w-full space-y-6"
      title={
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold tracking-tight text-foreground">{project.name}</span>
          <Badge
            variant={jobs.length === 0 ? "secondary" : hasActiveJobs ? "outline" : "secondary"}
            className="text-xs px-2 py-0.5 font-medium"
          >
            {jobs.length === 0 ? "Empty" : hasActiveJobs ? "Active" : "Paused"}
          </Badge>
        </div>
      }
      description={descriptionText}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConnectOpen(true)}
            className="text-xs font-medium"
          >
            Connect
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="size-8"
                  aria-label="Project options"
                  disabled={actionLoading}
                >
                  <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => {
                  setRenameName(project.name)
                  setRenameOpen(true)
                }}
                className="gap-2 text-xs cursor-pointer"
              >
                <HugeiconsIcon icon={Edit01Icon} className="size-3.5" />
                <span>Rename</span>
              </DropdownMenuItem>
              {jobs.length > 0 && (
                <DropdownMenuItem
                  onClick={hasActiveJobs ? handlePauseAll : handleResumeAll}
                  disabled={actionLoading}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <HugeiconsIcon
                    icon={hasActiveJobs ? PauseIcon : PlayIcon}
                    className="size-3.5"
                  />
                  <span>{hasActiveJobs ? "Pause all jobs" : "Resume all jobs"}</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteProjectOpen(true)}
                disabled={allProjects.length <= 1}
                className="gap-2 text-xs text-destructive cursor-pointer"
              >
                <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={`/cron/create?id=${encodeURIComponent(project.name)}&projectId=${project.id.toString()}`} />}
            className="gap-1.5"
          >
            <HugeiconsIcon icon={Add01Icon} className="size-4" strokeWidth={1.75} />
            <span>Create Job</span>
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {jobs.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <HugeiconsIcon
                icon={Search01Icon}
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cron jobs"
                className="pl-10"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <ButtonGroup>
              {(["all", "active", "paused"] as const).map((tab) => (
                <Button
                  key={tab}
                  type="button"
                  size="sm"
                  variant={filter === tab ? "secondary" : "outline"}
                  onClick={() => setFilter(tab)}
                >
                  {tab === "all" ? "All" : tab === "active" ? "Active" : "Paused"}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        )}

        {jobs.length === 0 ? (
          <Empty className="rounded-2xl border border-dashed py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="size-12 rounded-full bg-muted flex items-center justify-center">
                <HugeiconsIcon icon={Clock01Icon} className="size-6 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No cron jobs yet</EmptyTitle>
              <EmptyDescription className="max-w-md">
                Schedule recurring tasks, HTTP webhooks, or on-chain canister calls for this project.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : filteredJobs.length === 0 ? (
          <Empty className="rounded-2xl border border-dashed py-14">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={Search01Icon} className="size-6 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No jobs match your search</EmptyTitle>
              <EmptyDescription>
                Try adjusting your search keywords or switching the status filter.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery("")
                  setFilter("all")
                }}
              >
                Clear filters
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <Card className="overflow-hidden py-0 rounded-lg border border-border/80">
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="font-semibold text-muted-foreground py-3.5">Name</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-3.5 hidden sm:table-cell">Type</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-3.5">Schedule</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-3.5 hidden md:table-cell">Status</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-3.5 hidden md:table-cell">Last Run</TableHead>
                    <TableHead className="text-right font-semibold text-muted-foreground py-3.5 w-32 pr-4">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => {
                    const isBusy = jobActionId === job.id
                    const isWebhook = job.target_type === "HttpWebhook"
                    const lastRunLabel = formatRelativeTime(job.last_run_at)
                    const hasFailed = job.consecutive_failures > 0
                    const hasRan = job.total_runs > 0n

                    return (
                      <TableRow
                        key={job.id.toString()}
                        onClick={() => handleOpenDrawer(job)}
                        className="cursor-pointer border-border hover:bg-muted/40 transition-colors"
                      >
                        <TableCell className="font-medium text-foreground py-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-sm">{job.label}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-xs font-mono">
                              {job.target_preview}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5 hidden sm:table-cell">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium">
                            {isWebhook ? "Webhook" : "Canister"}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium text-foreground">
                              {formatHumanSchedule(job.cron_expression)}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">
                              {job.cron_expression}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5 hidden md:table-cell">
                          <Badge
                            variant={job.status === "Active" ? "outline" : "secondary"}
                            className="text-[10px] px-1.5 py-0 font-medium"
                          >
                            {job.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-3.5 hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">{lastRunLabel}</span>
                            {hasFailed ? (
                              <Badge variant="destructive" className="text-[9px] px-1 py-0">
                                Failed
                              </Badge>
                            ) : hasRan ? (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 text-success border-success/30 bg-success/10">
                                Success
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell>

                        <TableCell className="text-right py-3.5 w-32 pr-4">
                          <div
                            className="inline-flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="size-8"
                                    onClick={() => void handleToggleJob(job)}
                                    aria-label={job.status === "Active" ? "Pause job" : "Resume job"}
                                    disabled={isBusy}
                                  >
                                    {isBusy ? (
                                      <Spinner className="size-3.5" />
                                    ) : (
                                      <HugeiconsIcon
                                        icon={job.status === "Active" ? PauseIcon : PlayIcon}
                                        className="size-3.5 text-muted-foreground hover:text-foreground"
                                      />
                                    )}
                                  </Button>
                                }
                              />
                              <TooltipContent side="top">
                                {job.status === "Active" ? "Pause job" : "Resume job"}
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="size-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => handleOpenDrawer(job)}
                                    aria-label="View job execution logs"
                                  >
                                    <HugeiconsIcon icon={ViewIcon} className="size-3.5" />
                                  </Button>
                                }
                              />
                              <TooltipContent side="top">View execution logs</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setJobToDelete(job)}
                                    aria-label="Delete cron job"
                                    disabled={isBusy}
                                  >
                                    <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                                  </Button>
                                }
                              />
                              <TooltipContent side="top">Delete job</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TooltipProvider>
          </Card>
        )}
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Rename Project
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update the display name of this project namespace.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRenameProject} className="flex flex-col gap-4 py-2">
            <Input
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              placeholder="Project Name"
              className="text-sm"
              required
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRenameOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={renaming}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {renaming ? <Spinner className="size-3.5" /> : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteProjectOpen}
        onOpenChange={setDeleteProjectOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete project &quot;{project.name}&quot; ({jobs.length} jobs)? All associated cron jobs will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                void handleDeleteProject()
              }}
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={jobToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setJobToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cron Job?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete job &quot;{jobToDelete?.label}&quot;? Recurring executions will stop immediately. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                void handleDeleteJob()
              }}
            >
              Delete Job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedJobForDrawer && (
        <CronOutputDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          job={selectedJobForDrawer}
        />
      )}

      <CronConnectModal
        open={connectOpen}
        onOpenChange={setConnectOpen}
        project={project}
      />
    </AppPage>
  )
}
