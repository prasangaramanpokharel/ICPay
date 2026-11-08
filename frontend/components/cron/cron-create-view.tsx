"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, Folder01Icon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/components/auth/auth-provider"
import { listProjects } from "@/services/cron/client"
import type { RemoteProjectRecord } from "@/services/cron/types"
import { CronCreateForm } from "./cron-create-form"

function CronCreateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryProjectId = searchParams.get("projectId")

  const { identity } = useAuth()
  const [projects, setProjects] = React.useState<RemoteProjectRecord[]>([])
  const [selectedProjectId, setSelectedProjectId] = React.useState<bigint | null>(
    queryProjectId ? BigInt(queryProjectId) : null
  )
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!identity) return
    let active = true
    listProjects(identity)
      .then((data) => {
        if (!active) return
        setProjects(data)
        if (selectedProjectId === null && data.length > 0) {
          if (queryProjectId) {
            const found = data.find((p) => p.id.toString() === queryProjectId)
            setSelectedProjectId(found ? found.id : data[0].id)
          } else {
            setSelectedProjectId(data[0].id)
          }
        }
      })
      .catch(() => {
        if (active) setProjects([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [identity, queryProjectId, selectedProjectId])

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/cron"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2",
          })}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          Back to Cron Jobs
        </Link>

        {projects.length > 1 && (
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Folder01Icon} className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Project:</span>
            <NativeSelect
              value={selectedProjectId?.toString() ?? ""}
              onChange={(e) => setSelectedProjectId(BigInt(e.target.value))}
              className="text-xs h-8 bg-card border-border"
            >
              {projects.map((p) => (
                <NativeSelectOption key={p.id.toString()} value={p.id.toString()}>
                  {p.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner className="size-6 text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="border border-border/80 bg-card p-12 text-center shadow-xs">
          <div className="flex flex-col items-center justify-center gap-3">
            <HugeiconsIcon icon={Folder01Icon} className="size-10 text-muted-foreground" />
            <h3 className="text-base font-semibold text-foreground">No projects found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Please create a project namespace first before scheduling cron jobs.
            </p>
            <Link
              href="/cron"
              className={buttonVariants({
                variant: "default",
                size: "sm",
                className: "mt-2",
              })}
            >
              Go to icCron Workspace
            </Link>
          </div>
        </Card>
      ) : selectedProjectId ? (
        <CronCreateForm
          projectId={selectedProjectId}
          onJobCreated={() => {
            router.push("/cron")
          }}
        />
      ) : null}
    </div>
  )
}

export function CronCreateView() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner className="size-6 text-primary" />
        </div>
      }
    >
      <CronCreateContent />
    </React.Suspense>
  )
}
