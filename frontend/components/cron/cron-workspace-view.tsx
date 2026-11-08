"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  ZapIcon,
  Folder01Icon,
  Edit01Icon,
  Delete02Icon,
  PauseIcon,
  PlayIcon,
} from "@hugeicons/core-free-icons"
import {
  createProject,
  deleteProject,
  getMyCredits,
  listJobs,
  listProjects,
  pauseProject,
  renameProject,
  resumeProject,
} from "@/services/cron/client"
import type {
  RemoteCreditBalance,
  RemoteJobSummary,
  RemoteProjectRecord,
} from "@/services/cron/types"
import { CronCreateForm } from "./cron-create-form"
import { CronJobTable } from "./cron-job-table"
import { CronApiKeysCard } from "./cron-api-keys-card"
import { CronBuyPackModal } from "./cron-buy-pack-modal"

export function CronWorkspaceView() {
  const [projects, setProjects] = React.useState<RemoteProjectRecord[]>([])
  const [selectedProjectId, setSelectedProjectId] = React.useState<bigint | null>(null)
  const [jobs, setJobs] = React.useState<RemoteJobSummary[]>([])
  const [credits, setCredits] = React.useState<RemoteCreditBalance | null>(null)

  const [loadingProjects, setLoadingProjects] = React.useState(true)
  const [loadingJobs, setLoadingJobs] = React.useState(false)

  const [createProjectOpen, setCreateProjectOpen] = React.useState(false)
  const [newProjectName, setNewProjectName] = React.useState("")
  const [creatingProject, setCreatingProject] = React.useState(false)

  const [renameProjectOpen, setRenameProjectOpen] = React.useState(false)
  const [renameProjectName, setRenameProjectName] = React.useState("")
  const [renamingProject, setRenamingProject] = React.useState(false)
  const [actionLoading, setActionLoading] = React.useState(false)

  const [buyModalOpen, setBuyModalOpen] = React.useState(false)


  const refreshJobs = React.useCallback(async () => {
    if (!selectedProjectId) return
    setLoadingJobs(true)
    try {
      const data = await listJobs(selectedProjectId)
      setJobs(data)
    } catch {
      setJobs([])
    } finally {
      setLoadingJobs(false)
    }
  }, [selectedProjectId])

  const refreshCredits = React.useCallback(async () => {
    try {
      const creds = await getMyCredits()
      setCredits(creds)
    } catch {
    }
  }, [])

  React.useEffect(() => {
    let active = true
    listProjects()
      .then((data) => {
        if (!active) return
        setProjects(data)
        if (data.length > 0 && selectedProjectId === null) {
          setSelectedProjectId(data[0].id)
        } else if (data.length === 0) {
          createProject("Default Project").then((autoProj) => {
            if (active) {
              setProjects([autoProj])
              setSelectedProjectId(autoProj.id)
            }
          })
        }
      })
      .catch(() => {
        if (active) setProjects([])
      })
      .finally(() => {
        if (active) setLoadingProjects(false)
      })

    getMyCredits()
      .then((creds) => {
        if (active) setCredits(creds)
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [selectedProjectId])

  React.useEffect(() => {
    let active = true
    if (selectedProjectId) {
      listJobs(selectedProjectId)
        .then((data) => {
          if (active) setJobs(data)
        })
        .catch(() => {
          if (active) setJobs([])
        })
        .finally(() => {
          if (active) setLoadingJobs(false)
        })
    }
    return () => {
      active = false
    }
  }, [selectedProjectId])

  const currentProject = projects.find((p) => p.id === selectedProjectId)

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) return
    setCreatingProject(true)
    try {
      const proj = await createProject(newProjectName.trim())
      setProjects((prev) => [...prev, proj])
      setSelectedProjectId(proj.id)
      setNewProjectName("")
      setCreateProjectOpen(false)
    } catch {
    } finally {
      setCreatingProject(false)
    }
  }

  const handleRenameProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectId || !renameProjectName.trim()) return
    setRenamingProject(true)
    try {
      const updated = await renameProject(selectedProjectId, renameProjectName.trim())
      setProjects((prev) =>
        prev.map((p) => (p.id === updated.id ? { ...p, name: updated.name } : p))
      )
      setRenameProjectOpen(false)
    } catch {
    } finally {
      setRenamingProject(false)
    }
  }

  const handlePauseAllJobs = async () => {
    if (!selectedProjectId) return
    setActionLoading(true)
    try {
      await pauseProject(selectedProjectId)
      await refreshJobs()
    } catch {
    } finally {
      setActionLoading(false)
    }
  }

  const handleResumeAllJobs = async () => {
    if (!selectedProjectId) return
    setActionLoading(true)
    try {
      await resumeProject(selectedProjectId)
      await refreshJobs()
    } catch {
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!selectedProjectId) return
    setActionLoading(true)
    try {
      await deleteProject(selectedProjectId)
      const remaining = projects.filter((p) => p.id !== selectedProjectId)
      setProjects(remaining)
      if (remaining.length > 0) {
        setSelectedProjectId(remaining[0].id)
      } else {
        setSelectedProjectId(null)
      }
    } catch {
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto py-6 px-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            icCron Scheduler
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Decentralized on-chain automated jobs, recurring tasks, and webhooks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {credits && (
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs">
              <HugeiconsIcon icon={ZapIcon} className="size-3.5 text-primary" />
              <span className="text-muted-foreground">Free runs:</span>
              <span className="font-mono font-semibold text-foreground">
                {credits.free_runs_remaining.toString()}/60
              </span>
              <span className="text-muted-foreground">· Paid:</span>
              <span className="font-mono font-semibold text-foreground">
                {credits.prepaid_credits.toLocaleString()}
              </span>
            </div>
          )}

          <Button
            size="sm"
            onClick={() => setBuyModalOpen(true)}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9"
          >
            <HugeiconsIcon icon={ZapIcon} className="size-3.5" />
            Buy Credits
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {loadingProjects ? (
            <Spinner className="size-5 text-primary" />
          ) : (
            projects.map((proj) => {
              const isSelected = selectedProjectId === proj.id
              return (
                <Button
                  key={proj.id.toString()}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`text-xs gap-1.5 ${
                    isSelected ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  <HugeiconsIcon icon={Folder01Icon} className="size-3.5" />
                  {proj.name}
                </Button>
              )
            })
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentProject && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRenameProjectName(currentProject.name)
                  setRenameProjectOpen(true)
                }}
                disabled={actionLoading}
                className="text-xs gap-1.5"
              >
                <HugeiconsIcon icon={Edit01Icon} className="size-3.5" />
                Rename
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePauseAllJobs}
                disabled={actionLoading}
                className="text-xs gap-1.5 text-muted-foreground"
              >
                <HugeiconsIcon icon={PauseIcon} className="size-3.5" />
                Pause All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResumeAllJobs}
                disabled={actionLoading}
                className="text-xs gap-1.5 text-muted-foreground"
              >
                <HugeiconsIcon icon={PlayIcon} className="size-3.5" />
                Resume All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteProject}
                disabled={actionLoading || projects.length <= 1}
                className="text-xs gap-1.5 text-destructive hover:bg-destructive/10"
              >
                <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                Delete
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateProjectOpen(true)}
            className="text-xs gap-1.5"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
            New Project
          </Button>
        </div>
      </div>

      {selectedProjectId && (
        <>
          <CronCreateForm
            projectId={selectedProjectId}
            onJobCreated={() => {
              refreshJobs()
              refreshCredits()
            }}
          />

          <CronJobTable
            jobs={jobs}
            loading={loadingJobs}
            onRefresh={() => {
              refreshJobs()
              refreshCredits()
            }}
          />

          <CronApiKeysCard projectId={selectedProjectId} />
        </>
      )}

      <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
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
              placeholder="e.g. E-Commerce Store, Analytics Poller..."
              className="text-sm"
              required
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateProjectOpen(false)}
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

      <Dialog open={renameProjectOpen} onOpenChange={setRenameProjectOpen}>
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
              value={renameProjectName}
              onChange={(e) => setRenameProjectName(e.target.value)}
              placeholder="Project Name"
              className="text-sm"
              required
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRenameProjectOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={renamingProject}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {renamingProject ? <Spinner className="size-3.5" /> : "Save"}
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
          refreshCredits()
        }}
      />
    </div>
  )
}
