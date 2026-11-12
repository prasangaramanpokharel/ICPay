import type { Metadata } from "next"
import { AdminAuditView } from "@/components/products/icacademy/admin/audit/admin-audit-view"

export const metadata: Metadata = {
  title: "Audit Trail — Admin",
}

export default function AcademyAdminAuditPage() {
  return <AdminAuditView />
}
