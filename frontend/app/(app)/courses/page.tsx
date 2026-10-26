import type { Metadata } from "next"
import { EnrolledCoursesPanel } from "@/components/products/icacademy/enrolled-courses-panel"

export const metadata: Metadata = {
  title: "My Courses — ICPay Academy",
  description: "View your active course enrollments, learning progress, and on-chain certificates.",
}

export default function AppCoursesPage() {
  return <EnrolledCoursesPanel />
}
