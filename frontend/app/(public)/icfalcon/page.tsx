import type { Metadata } from "next"
import { HeroSection } from "@/components/products/icfalcon/hero-section"
import { ProblemSolution } from "@/components/products/icfalcon/problem-solution"
import { ArchitectureSection } from "@/components/products/icfalcon/architecture-section"
import { OrmSection } from "@/components/products/icfalcon/orm-section"
import { MoneyLayerSection } from "@/components/products/icfalcon/money-layer-section"
import { AuthSection } from "@/components/products/icfalcon/auth-section"
import { UniverseSection } from "@/components/products/icfalcon/universe-section"
import { AgentSkillsSection } from "@/components/products/icfalcon/agent-skills-section"
import { CliSection } from "@/components/products/icfalcon/cli-section"
import { WalkthroughSection } from "@/components/products/icfalcon/walkthrough-section"
import { DirectoryLayoutSection } from "@/components/products/icfalcon/directory-layout-section"
import { UpdaterSection } from "@/components/products/icfalcon/updater-section"
import { ArticleSection } from "@/components/products/icfalcon/article-section"
import { FaqSection } from "@/components/products/icfalcon/faq-section"
import { CtaSection } from "@/components/products/icfalcon/cta-section"
import { PAGE_IMAGES, pageImageUrl } from "@/lib/public/page-images"

export const metadata: Metadata = {
  title: "ICFalcon - Motoko Framework for Internet Computer | ICPay",
  description:
    "ICFalcon is a production-ready Motoko framework for Internet Computer canister development. Build ICP dApps with enforced layered architecture, Next.js frontend, Internet Identity auth, and global falcon CLI. One command to start: npm create icfalcon@latest",
  keywords: [
    "ICFalcon",
    "Motoko framework",
    "Internet Computer framework",
    "ICP development",
    "canister framework",
    "Motoko",
    "ICP dApp",
    "Internet Computer Protocol",
    "Web3 framework",
    "blockchain framework",
    "falcon CLI",
    "ICP scaffold",
    "canister development",
    "DFINITY",
    "Internet Identity",
    "Next.js ICP",
    "full-stack ICP",
  ],
  openGraph: {
    title: "ICFalcon - Motoko Framework for Internet Computer",
    description:
      "Production-ready Motoko framework with layered architecture, Next.js frontend, and global falcon CLI. Start building: npm create icfalcon@latest",
    url: "https://icpay.app/icfalcon",
    siteName: "ICPay",
    images: [
      {
        url: pageImageUrl(PAGE_IMAGES.icfalcon.og),
        width: 1254,
        height: 1254,
        alt: "ICFalcon - Motoko Framework",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ICFalcon - Motoko Framework for Internet Computer",
    description:
      "Production-ready Motoko framework. Start building: npm create icfalcon@latest",
    images: [pageImageUrl(PAGE_IMAGES.icfalcon.og)],
    creator: "@IcpayOfficial",
  },
  alternates: {
    canonical: "https://icpay.app/icfalcon",
  },
}

export default function ICFalconPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ProblemSolution />
      <ArchitectureSection />
      <OrmSection />
      <MoneyLayerSection />
      <AuthSection />
      <UniverseSection />
      <AgentSkillsSection />
      <CliSection />
      <WalkthroughSection />
      <DirectoryLayoutSection />
      <UpdaterSection />
      <ArticleSection />
      <FaqSection />
      <CtaSection />
    </div>
  )
}
