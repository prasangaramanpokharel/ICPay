"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { CronProjectListPanel } from "./cron-project-list-panel"
import { CronProjectDetail } from "./cron-project-detail"

function CronWorkspaceContent() {
  const searchParams = useSearchParams()
  const projectIdParam = searchParams.get("id")

  if (projectIdParam) {
    return <CronProjectDetail projectNameOrId={projectIdParam} />
  }

  return <CronProjectListPanel />
}

export function CronWorkspaceView() {
  return (
    <React.Suspense fallback={null}>
      <CronWorkspaceContent />
    </React.Suspense>
  )
}
