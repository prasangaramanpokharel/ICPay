import type { Metadata } from "next"
import { PackagesHero } from "@/components/products/icfalcon/packages-hero"
import { PackagesBrowser } from "@/components/products/icfalcon/packages-browser"

export const metadata: Metadata = {
  title: "Falcon Packages — Motoko Registry & Ecosystem Libraries",
  description:
    "Browse curated Motoko packages, cryptographic libraries, data structures, and Internet Computer canisters compatible with the ICFalcon framework and Mops.",
  keywords: [
    "ICFalcon packages",
    "Motoko packages",
    "Mops registry",
    "Internet Computer libraries",
    "Motoko canisters",
    "falcon add",
  ],
  alternates: { canonical: "/products/icFalcon/packages" },
}

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PackagesHero />
      <PackagesBrowser />
    </div>
  )
}
