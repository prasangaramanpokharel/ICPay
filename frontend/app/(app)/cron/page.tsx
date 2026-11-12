import type { Metadata } from "next"
import { CronWorkspaceView } from "@/components/cron/cron-workspace-view"

export const metadata: Metadata = {
  title: "icCron — Automated Scheduler",
}

export default function AppCronPage() {
  return <CronWorkspaceView />
}
