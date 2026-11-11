import type { Metadata } from "next"
import { PublicLayout } from "@/components/public/layout"
import { NotFoundView } from "@/components/error/not-found-view"

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The requested ICPay page could not be found.",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <PublicLayout variant="content">
      <NotFoundView />
    </PublicLayout>
  )
}
