import type { Metadata } from "next"
import { DownloadsView } from "@/components/public/downloads/downloads-view"

export const metadata: Metadata = {
  title: "Download ICPay Desktop — macOS, Windows & Linux",
  description:
    "Download the official ICPay desktop app. Native performance, Internet Identity auth, and custodial wallet security for macOS (Apple Silicon & Intel), Windows, and Linux.",
  alternates: { canonical: "/downloads" },
  openGraph: {
    title: "Download ICPay Desktop",
    description:
      "Native desktop client for ICPay on macOS (Apple Silicon & Intel), Windows, and Linux with Cloudflare CDN high-speed downloads.",
    url: "https://icpay.app/downloads",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Download ICPay Desktop",
    description:
      "Native desktop client for ICPay on macOS, Windows, and Linux.",
  },
}

export default function DownloadsPage() {
  return <DownloadsView />
}
