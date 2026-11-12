import type { Metadata } from "next"
import { Custom404Page } from "@/app/(error)/404"

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  robots: { index: false, follow: false },
}

export default function Error404RoutePage() {
  return <Custom404Page />
}
