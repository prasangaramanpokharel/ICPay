import type { Metadata } from "next"
import { AcademyAdminGate } from "@/components/products/icacademy/admin/academy-admin-gate"
import { AcademyAdminNav } from "@/components/products/icacademy/admin/academy-admin-nav"
import { Toaster } from "@/components/ui/toast"

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
  return (
    <AcademyAdminGate>
      <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
        <AcademyAdminNav />
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <Toaster />
      </div>
    </AcademyAdminGate>
  )
}
