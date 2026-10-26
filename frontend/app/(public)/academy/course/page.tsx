import { Suspense } from "react"
import type { Metadata } from "next"
import { CoursePlayerView } from "@/components/products/icacademy/course-player-view"

export const metadata: Metadata = {
  title: "Course Player — ICAcademy | ICPay",
  description:
    "Interactive Web3 curriculum and video masterclasses on the Internet Computer. Learn Motoko smart contract development, orthogonal persistence, and cycles economics.",
  openGraph: {
    title: "Course Player — ICAcademy | ICPay",
    description:
      "Interactive Web3 developer curriculum and hands-on video masterclasses on the Internet Computer.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CoursePlayerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <CoursePlayerView />
      </Suspense>
    </div>
  )
}
