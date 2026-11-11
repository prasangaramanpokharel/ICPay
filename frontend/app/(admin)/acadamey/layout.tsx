import type { Metadata } from "next"
import { AcademyAdminShell } from "@/components/products/icacademy/admin/academy-admin-shell"

export const metadata: Metadata = {
  title: "ICAcademy Management Suite | ICPay",
  description: "Administrative console for managing ICAcademy courses, lessons, and pricing.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function AcademyAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AcademyAdminShell>{children}</AcademyAdminShell>
}
