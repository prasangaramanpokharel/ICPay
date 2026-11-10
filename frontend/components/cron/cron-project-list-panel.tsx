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
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Delete02Icon,
  Folder01Icon,
  PauseIcon,
  PlayIcon,
  PlusSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { useAuth } from "@/components/auth/auth-provider"
import {
  createProject,
  deleteProject,
  getMyCredits,
  listJobs,
  listProjects,
  pauseProject,
  resumeProject,
} from "@/services/cron/client"
import type {
  RemoteCreditBalance,
  RemoteJobSummary,
  RemoteProjectRecord,
} from "@/services/cron/types"
import { CronBuyPackModal } from "./cron-buy-pack-modal"

type FilterTab = "all" | "active" | "paused"

export function CronProjectListPanel() {
  const router = useRouter()
  const { identity } = useAuth()

  const [projects, setProjects] = React.useState<RemoteProjectRecord[]>([])
  const [allJobs, setAllJobs] = React.useState<RemoteJobSummary[]>([])
  const [credits, setCredits] = React.useState<RemoteCreditBalance | null>(null)
  const [loading, setLoading] = React.useState(Boolean(identity))

  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<FilterTab>("all")

  const [createOpen, setCreateOpen] = React.useState(false)
  const [newProjectName, setNewProjectName] = React.useState("")
  const [creatingProject, setCreatingProject] = React.useState(false)

  const [buyModalOpen, setBuyModalOpen] = React.useState(false)
  const [projectToDelete, setProjectToDelete] = React.useState<RemoteProjectRecord | null>(null)
  const [actionLoadingId, setActionLoadingId] = React.useState<bigint | null>(null)

  const loadData = React.useCallback(async () => {
    if (!identity) {
      setLoading(false)
      return
    }
    try {
      const [projs, jobsData, creds] = await Promise.all([
        listProjects(identity),
        listJobs(undefined, identity),
        getMyCredits(identity).catch(() => null),
      ])
      setProjects(projs)
      setAllJobs(jobsData)
      setCredits(creds)
    } catch {
      setProjects([])
      setAllJobs([])
    } finally {
      setLoading(false)
    }
  }, [identity])

  React.useEffect(() => {
    let active = true
    if (!identity) {
      return () => {
        active = false
      }
    }
    Promise.all([
      listProjects(identity),
      listJobs(undefined, identity),
      getMyCredits(identity).catch(() => null),
    ])
      .then(([projs, jobsData, creds]) => {
        if (!active) return
        setProjects(projs)
        setAllJobs(jobsData)
        setCredits(creds)
      })
      .catch(() => {
        if (!active) return
        setProjects([])
        setAllJobs([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [identity])

  const jobsByProject = React.useMemo(() => {
    const map = new Map<string, RemoteJobSummary[]>()
    for (const job of allJobs) {
      const key = job.project_id.toString()
      const existing = map.get(key) ?? []
      existing.push(job)
      map.set(key, existing)
    }
    return map
  }, [allJobs])

  const filteredProjects = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    return projects.filter((proj) => {
      const jobs = jobsByProject.get(proj.id.toString()) ?? []
      const hasActive = jobs.some((j) => j.status === "Active")
      if (filter === "active" && !hasActive && jobs.length > 0) return false
      if (filter === "paused" && hasActive) return false

      if (!needle) return true
      return proj.name.toLowerCase().includes(needle)
    })
  }, [projects, jobsByProject, query, filter])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) return
    if (!identity) {
      toast.error("Please sign in with Internet Identity first.")
      return
    }
    setCreatingProject(true)
    try {
      const proj = await createProject(newProjectName.trim(), identity)
      setProjects((prev) => [...prev, proj])
      setNewProjectName("")
      setCreateOpen(false)
      toast.success(`Project "${proj.name}" created successfully.`)
      router.push(`/cron?id=${encodeURIComponent(proj.name)}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create project.")
    } finally {
      setCreatingProject(false)
    }
  }

  const handleToggleProjectStatus = async (
    proj: RemoteProjectRecord,
    hasActiveJobs: boolean
  ) => {
    if (!identity) return
    setActionLoadingId(proj.id)
    try {
      if (hasActiveJobs) {
        const count = await pauseProject(proj.id, identity)
        toast.success(`Paused project "${proj.name}" (${count.toString()} jobs paused).`)
      } else {
        const count = await resumeProject(proj.id, identity)
        toast.success(`Resumed project "${proj.name}" (${count.toString()} jobs resumed).`)
      }
      const updatedJobs = await listJobs(undefined, identity)
      setAllJobs(updatedJobs)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update project status.")
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete || !identity) return
    setActionLoadingId(projectToDelete.id)
    try {
      await deleteProject(projectToDelete.id, identity)
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id))
      setAllJobs((prev) => prev.filter((j) => j.project_id !== projectToDelete.id))
      toast.success(`Project "${projectToDelete.name}" deleted successfully.`)
      setProjectToDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete project.")
    } finally {
      setActionLoadingId(null)
    }
  }

  const freeRuns = credits ? Number(credits.free_runs_remaining) : 18
  const paidCredits = credits ? credits.prepaid_credits.toLocaleString() : "0"

  const jobsCountFor = (proj: RemoteProjectRecord | null) => {
    if (!proj) return 0
    return (jobsByProject.get(proj.id.toString()) ?? []).length
  }

  return (
    <AppPage
      title="icCron Scheduler"
      description="Decentralized on-chain automated jobs, recurring tasks, and webhooks"
      className="mx-auto max-w-6xl w-full space-y-6"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/cron/api" />}
          >
            API
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBuyModalOpen(true)}
          >
            Top Up
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="gap-1.5"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-4" strokeWidth={1.75} />
            <span>New Project</span>
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="rounded-lg border border-border/80 bg-card/60 p-3.5 backdrop-blur-xs shadow-2xs">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground tabular-nums">{freeRuns}/60</span> free runs left this month
              </span>
              <span className="text-muted-foreground tabular-nums">
                Paid credits: <span className="font-medium text-foreground">{paidCredits}</span>
              </span>
            </div>
            <Progress value={(freeRuns / 60) * 100} className="[&_[data-slot=progress-track]]:h-1.5" />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <HugeiconsIcon
              icon={Search01Icon}
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects"
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

        {loading ? (
          <Card className="rounded-lg border border-border/80 p-4">
            <CardContent className="space-y-3 p-0">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </CardContent>
          </Card>
        ) : projects.length === 0 ? (
          <Empty className="rounded-2xl border border-dashed py-14">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={Folder01Icon} className="size-6 text-muted-foreground" strokeWidth={1.75} />
              </EmptyMedia>
              <EmptyTitle>No projects yet</EmptyTitle>
              <EmptyDescription>
                Create a project to organize and schedule your automated cron jobs, recurring HTTP webhooks, and canister tasks.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
                <HugeiconsIcon icon={PlusSignIcon} className="size-4" strokeWidth={1.75} />
                Create your first project
              </Button>
            </EmptyContent>
          </Empty>
        ) : filteredProjects.length === 0 ? (
          <Empty className="rounded-2xl border border-dashed py-14">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={Search01Icon} className="size-6 text-muted-foreground" strokeWidth={1.75} />
              </EmptyMedia>
              <EmptyTitle>No projects match your search</EmptyTitle>
              <EmptyDescription>
                Try clearing your search query or switching filters.
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
                    <TableHead className="font-semibold text-muted-foreground py-3.5">Project</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-3.5 hidden sm:table-cell">Jobs</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-3.5 hidden sm:table-cell">Status</TableHead>
                    <TableHead className="text-right font-semibold text-muted-foreground py-3.5 w-24 pr-2">Action</TableHead>
                    <TableHead className="w-8 pr-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((proj) => {
                    const jobs = jobsByProject.get(proj.id.toString()) ?? []
                    const hasActive = jobs.some((j) => j.status === "Active")
                    const isBusy = actionLoadingId === proj.id

                    return (
                      <TableRow
                        key={proj.id.toString()}
                        onClick={() => router.push(`/cron?id=${encodeURIComponent(proj.name)}`)}
                        className="cursor-pointer border-border hover:bg-muted/40 transition-colors"
                      >
                        <TableCell className="font-medium text-foreground py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 items-center justify-center rounded-md border border-border/70 bg-muted/30">
                              <HugeiconsIcon icon={Folder01Icon} className="size-4 text-primary" strokeWidth={1.75} />
                            </div>
                            <span className="font-semibold text-sm">{proj.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground tabular-nums py-3.5 hidden sm:table-cell">
                          {jobs.length}
                        </TableCell>
                        <TableCell className="py-3.5 hidden sm:table-cell">
                          <Badge
                            variant={jobs.length === 0 ? "secondary" : hasActive ? "outline" : "secondary"}
                            className="text-[10px] px-1.5 py-0 font-medium"
                          >
                            {jobs.length === 0 ? "Empty" : hasActive ? "Active" : "Paused"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right py-3.5 w-24 pr-2">
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
                                    onClick={() => void handleToggleProjectStatus(proj, hasActive)}
                                    aria-label={jobs.length === 0 ? "No jobs to toggle" : hasActive ? "Pause project" : "Resume project"}
                                    disabled={isBusy || jobs.length === 0}
                                  >
                                    {isBusy ? (
                                      <Spinner className="size-3.5" />
                                    ) : (
                                      <HugeiconsIcon
                                        icon={hasActive ? PauseIcon : PlayIcon}
                                        className="size-3.5 text-muted-foreground hover:text-foreground"
                                      />
                                    )}
                                  </Button>
                                }
                              />
                              <TooltipContent side="top">
                                {jobs.length === 0 ? "No jobs to toggle" : hasActive ? "Pause project" : "Resume project"}
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setProjectToDelete(proj)}
                                    aria-label="Delete project"
                                    disabled={isBusy || projects.length <= 1}
                                  >
                                    <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                                  </Button>
                                }
                              />
                              <TooltipContent side="top">Delete project</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                        <TableCell className="w-8 pr-4 text-right py-3.5">
                          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground ml-auto" strokeWidth={1.75} />
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Create a New Project
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Group related cron jobs, webhooks, and API keys under a project namespace.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProject} className="flex flex-col gap-4 py-2">
            <Input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="e.g. Production Webhooks, Analytics Poller..."
              className="text-sm"
              required
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={creatingProject}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {creatingProject ? <Spinner className="size-3.5" /> : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <CronBuyPackModal
        open={buyModalOpen}
        onOpenChange={setBuyModalOpen}
        credits={credits}
        onPurchased={() => {
          void loadData()
        }}
      />

      <AlertDialog
        open={projectToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setProjectToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete project &quot;{projectToDelete?.name}&quot; ({jobsCountFor(projectToDelete)} jobs)? All associated cron jobs will be permanently deleted. This action cannot be undone.
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
    </AppPage>
  )
}
