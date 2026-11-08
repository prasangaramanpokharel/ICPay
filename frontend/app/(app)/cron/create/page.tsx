import type { Metadata } from "next"
import { CronCreateView } from "@/components/cron/cron-create-view"

export const metadata: Metadata = {
  title: "Create Cron Job — icCron",
}

export default function AppCronCreatePage() {
  return <CronCreateView />
}
