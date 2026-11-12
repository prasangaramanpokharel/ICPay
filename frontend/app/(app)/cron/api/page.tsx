import type { Metadata } from "next"
import { Suspense } from "react"
import { CronApiView } from "@/components/cron/cron-api-view"
import { FormRouteLoading } from "@/components/layout/route-loading"

export const metadata: Metadata = {
  title: "icCron API Keys",
  description: "Manage trigger API keys and programmatic webhooks for icCron automated scheduler.",
}

export default function CronApiPage() {
  return (
    <Suspense fallback={<FormRouteLoading />}>
      <CronApiView />
    </Suspense>
  )
}
