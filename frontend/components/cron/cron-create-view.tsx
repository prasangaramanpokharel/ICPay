"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, Folder01Icon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/components/auth/auth-provider"
import { listProjects } from "@/services/cron/client"
import type { RemoteProjectRecord } from "@/services/cron/types"
import { CronCreateForm } from "./cron-create-form"
import { formatProjectId, parseProjectId } from "./cron-types"

function CronCreateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations("cron")
  const queryProjectId = searchParams.get("projectId")
  const queryProjectName = searchParams.get("id") || searchParams.get("name")

  const { identity } = useAuth()
  const [projects, setProjects] = React.useState<RemoteProjectRecord[]>([])
  const [selectedProjectId, setSelectedProjectId] = React.useState<bigint | null>(() => {
    if (!queryProjectId) return null
    try {
      return parseProjectId(queryProjectId)
    } catch {
      return null
    }
  })
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
            const parsed = parseProjectId(queryProjectId)
            const found = data.find(
              (p) =>
                p.id === parsed ||
                p.id.toString() === queryProjectId ||
                formatProjectId(p.id) === queryProjectId
            )
            setSelectedProjectId(found ? found.id : data[0].id)
          } else if (queryProjectName) {
            const decoded = decodeURIComponent(queryProjectName).toLowerCase()
            const found = data.find((p) => p.name.toLowerCase() === decoded)
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
  }, [identity, queryProjectId, queryProjectName, selectedProjectId])

  const currentProject = React.useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) ?? null
  }, [projects, selectedProjectId])

  const targetProjectName =
    currentProject?.name ??
    (queryProjectName ? decodeURIComponent(queryProjectName) : null)
  const backHref = targetProjectName
    ? `/cron?id=${encodeURIComponent(targetProjectName)}`
    : "/cron"
  const backLabel = targetProjectName ?? t("backToProjects")

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href={backHref} />}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          <span>{backLabel}</span>
        </Button>

        {projects.length > 1 && (
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Folder01Icon} className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{t("project")}:</span>
            <NativeSelect
              value={selectedProjectId?.toString() ?? ""}
              onChange={(e) => {
                const nextId = BigInt(e.target.value)
                setSelectedProjectId(nextId)
                const nextProj = projects.find((p) => p.id === nextId)
                if (nextProj) {
                  router.replace(
                    `/cron/create?id=${encodeURIComponent(nextProj.name)}&projectId=${formatProjectId(nextProj.id)}`
                  )
                }
              }}
              className="text-xs h-8 bg-card border-border"
            >
              {projects.map((p) => (
                <NativeSelectOption key={p.id.toString()} value={p.id.toString()}>
                  {p.name} ({formatProjectId(p.id)})
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
        <Empty className="rounded-2xl border border-dashed py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Folder01Icon} className="size-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>{t("noProjectsTitle")}</EmptyTitle>
            <EmptyDescription>
              {t("noProjectsDesc")}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/cron" />}
              className="gap-1.5"
            >
              {t("backToProjects")}
            </Button>
          </EmptyContent>
        </Empty>
      ) : selectedProjectId ? (
        <CronCreateForm
          projectId={selectedProjectId}
          onJobCreated={() => {
            const destName =
              currentProject?.name ??
              (queryProjectName ? decodeURIComponent(queryProjectName) : null)
            if (destName) {
              router.push(`/cron?id=${encodeURIComponent(destName)}`)
            } else {
              router.push("/cron")
            }
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
