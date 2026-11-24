"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { RadialMeter } from "@/components/ui/radial-meter"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { Icon } from "@/components/ui/icon"
import { DeleteGlassIcon, FolderGlassIcon, InfoGlassIcon, KeyGlassIcon, EllipsisVerticalGlassIcon, PauseGlassIcon, PlayGlassIcon, PlusGlassIcon, SearchGlassIcon } from "@thesvg/ui-react"
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
import { formatProjectId } from "./cron-types"

type FilterTab = "all" | "active" | "paused"

export function CronProjectListPanel() {
  const router = useRouter()
  const { identity } = useAuth()
  const t = useTranslations("cron")
  const tCommon = useTranslations("common")

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
      return (
        proj.name.toLowerCase().includes(needle) ||
        formatProjectId(proj.id).toLowerCase().includes(needle)
      )
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

  return (
    <AppPage
      title={t("schedulerTitle")}
      description={t("schedulerSubtitle")}
      className="w-full space-y-6"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/cron/api" />}
            className="gap-1.5"
          >
            <Icon icon={KeyGlassIcon} className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
            <span>{t("api")}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBuyModalOpen(true)}
          >
            {t("topUp")}
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="gap-1.5"
          >
            <Icon icon={PlusGlassIcon} className="size-4" strokeWidth={1.75} />
            <span>{t("newProject")}</span>
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-border/80 bg-card/60 p-4 backdrop-blur-xs shadow-2xs sm:p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-1 flex-col gap-3 min-w-0 w-full">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {t("monthlyQuota")}
                </span>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-medium">
                  {t("active")}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                {t("quotaDesc")}
              </p>

              <div className="grid grid-cols-2 gap-2.5 sm:max-w-md">
                <div className="rounded-lg border border-border/60 bg-background/50 p-2.5">
                  <span className="text-[11px] text-muted-foreground block">{t("freeAllowance")}</span>
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {freeRuns} <span className="text-xs font-normal text-muted-foreground">{t("leftLabel")}</span>
                  </span>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/50 p-2.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-muted-foreground">{t("prepaidCredits")}</span>
                    <Tooltip>
                      <TooltipTrigger
                        type="button"
                        className="inline-flex cursor-help text-muted-foreground/70 transition-colors hover:text-foreground outline-none"
                      >
                        <Icon icon={InfoGlassIcon} className="size-3.5" />
                        <span className="sr-only">{t("prepaidCredits")}</span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs">
                        {t("prepaidTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {paidCredits} <span className="text-xs font-normal text-muted-foreground">{t("runs")}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center shrink-0">
              <RadialMeter
                value={freeRuns}
                max={60}
                color="var(--primary)"
                innerRadius={50}
                outerRadius={74}
                polarRadius={[66, 56]}
                centerValue={freeRuns}
                centerLabel={t("leftLabel")}
                width={150}
                height={150}
                valueClassName="fill-foreground text-2xl font-bold tabular-nums"
                labelClassName="fill-muted-foreground text-[10px] font-medium uppercase tracking-wider"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Icon
              icon={SearchGlassIcon}
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchProjects")}
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
                {tab === "all" ? t("all") : tab === "active" ? t("active") : t("paused")}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        {loading ? (
          <Card className="overflow-hidden py-0 rounded-lg border border-border/80">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-semibold text-muted-foreground py-3.5">{t("project")}</TableHead>
                  <TableHead className="font-semibold text-muted-foreground py-3.5 hidden sm:table-cell">{t("jobs")}</TableHead>
                  <TableHead className="font-semibold text-muted-foreground py-3.5 hidden sm:table-cell">{t("status")}</TableHead>
                  <TableHead className="text-right font-semibold text-muted-foreground py-3.5 pr-4 w-16">{t("action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-border/40">
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="size-8 rounded-md" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-32 rounded-md" />
                          <Skeleton className="h-3 w-28 rounded-md font-mono" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 hidden sm:table-cell">
                      <Skeleton className="h-4 w-8 rounded-md" />
                    </TableCell>
                    <TableCell className="py-3.5 hidden sm:table-cell">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell className="py-3.5 pr-4 text-right">
                      <Skeleton className="ml-auto size-7 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : projects.length === 0 ? (
          <Empty className="rounded-(--radius) border border-dashed py-14">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon icon={FolderGlassIcon} className="size-6 text-muted-foreground" strokeWidth={1.75} />
              </EmptyMedia>
              <EmptyTitle>{t("noProjectsTitle")}</EmptyTitle>
              <EmptyDescription>
                {t("noProjectsDesc")}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
                <Icon icon={PlusGlassIcon} className="size-4" strokeWidth={1.75} />
                {t("createFirstProject")}
              </Button>
            </EmptyContent>
          </Empty>
        ) : filteredProjects.length === 0 ? (
          <Empty className="rounded-(--radius) border border-dashed py-14">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon icon={SearchGlassIcon} className="size-6 text-muted-foreground" strokeWidth={1.75} />
              </EmptyMedia>
              <EmptyTitle>{t("noProjectsMatch")}</EmptyTitle>
              <EmptyDescription>
                {t("noProjectsMatchDesc")}
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
                {t("clearFilters")}
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <Card className="overflow-hidden py-0 rounded-lg border border-border/80">
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="font-semibold text-muted-foreground py-3.5">{t("project")}</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-3.5 hidden sm:table-cell">{t("jobs")}</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-3.5 hidden sm:table-cell">{t("status")}</TableHead>
                    <TableHead className="text-right font-semibold text-muted-foreground py-3.5 pr-4 w-16">{t("action")}</TableHead>
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
                              <Icon icon={FolderGlassIcon} className="size-4 text-primary" strokeWidth={1.75} />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{proj.name}</span>
                              <span className="font-mono text-[10px] text-muted-foreground">{formatProjectId(proj.id)}</span>
                            </div>
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
                            {jobs.length === 0 ? t("empty") : hasActive ? t("active") : t("paused")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right py-3.5 pr-4 w-16">
                          <div
                            className="inline-flex items-center justify-end"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    className="size-8 text-muted-foreground hover:bg-muted hover:text-foreground"
                                    aria-label="Project actions"
                                  />
                                }
                              >
                                <Icon icon={EllipsisVerticalGlassIcon} className="size-4" strokeWidth={1.75} />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => router.push(`/cron?id=${encodeURIComponent(proj.name)}`)}
                                  className="gap-2 text-xs"
                                >
                                  <Icon icon={FolderGlassIcon} className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                                  <span>{t("projectDetails")}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => void handleToggleProjectStatus(proj, hasActive)}
                                  disabled={isBusy || jobs.length === 0}
                                  className="gap-2 text-xs"
                                >
                                  {isBusy ? (
                                    <Spinner className="size-3.5" />
                                  ) : (
                                    <Icon
                                      icon={hasActive ? PauseGlassIcon : PlayGlassIcon}
                                      className="size-3.5 text-muted-foreground"
                                      strokeWidth={1.75}
                                    />
                                  )}
                                  <span>{hasActive ? t("pauseAllJobs") : t("resumeAllJobs")}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => setProjectToDelete(proj)}
                                  disabled={isBusy || projects.length <= 1}
                                  className="gap-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
                                >
                                  <Icon icon={DeleteGlassIcon} className="size-3.5 text-destructive" strokeWidth={1.75} />
                                  <span>{t("deleteProject")}</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("createProjectTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("createProjectDesc")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProject} className="flex flex-col gap-4 py-2">
            <Input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder={t("projectNamePlaceholder")}
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
                {tCommon("cancel")}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={creatingProject}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {creatingProject ? <Spinner data-icon="inline-start" /> : null}
                <span>{t("createProject")}</span>
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
            <AlertDialogTitle>{t("deleteProjectTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteProjectConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                void handleDeleteProject()
              }}
            >
              {t("deleteProject")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppPage>
  )
}
