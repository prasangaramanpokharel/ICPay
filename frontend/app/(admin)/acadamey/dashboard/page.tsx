import type { Metadata } from "next"
import { AdminDashboardView } from "@/components/products/icacademy/admin/dashboard/admin-dashboard-view"

export const metadata: Metadata = {
  title: "Academy Dashboard — Admin",
}

export default function AcademyAdminDashboardPage() {
  return <AdminDashboardView />
}
