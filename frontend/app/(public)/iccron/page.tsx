import type { Metadata } from "next"
import { HeroSection } from "@/components/products/iccron/hero-section"
import { ProblemSolution } from "@/components/products/iccron/problem-solution"
import { WhatIsSection } from "@/components/products/iccron/what-is-section"
import { GalleryShowcase } from "@/components/products/iccron/gallery-showcase"
import { UseCasesSection } from "@/components/products/iccron/use-cases-section"
import { ArchitectureSection } from "@/components/products/iccron/architecture-section"
import { PricingCalculator } from "@/components/products/iccron/pricing-calculator"
import { QuickstartSection } from "@/components/products/iccron/quickstart-section"
import { FaqSection } from "@/components/products/iccron/faq-section"
import { CtaSection } from "@/components/products/iccron/cta-section"
import { PAGE_IMAGES, pageImageUrl } from "@/lib/public/page-images"

export const metadata: Metadata = {
  title: "icCron - Autonomous On-Chain Cron & Webhook Dispatcher | ICPay",
  description:
    "Decentralized sub-second cron scheduling, automated retries with Dead Letter Queues, inter-canister calls, and global HTTPS outcalls. Bypass the $20/mo Vercel cron tax with zero server maintenance.",
  keywords: [
    "icCron",
    "decentralized cron",
    "on-chain cron",
    "cron job scheduler",
    "Vercel cron alternative",
    "Vercel cron tax",
    "keeper bot alternative",
    "autonomous smart contracts",
    "Internet Computer cron",
    "canister timers",
    "webhook scheduler",
    "scheduled webhooks",
    "AWS EventBridge alternative",
    "serverless cron",
    "crypto automation",
    "DeFi scheduler",
  ],
  openGraph: {
    title: "icCron - Autonomous On-Chain Cron & Webhook Dispatcher",
    description:
      "Sub-second cron scheduling without servers or keeper bots. Run hourly webhooks for $4.32/yr instead of paying Vercel $240/yr.",
    url: "https://icpay.app/iccron",
    siteName: "ICPay",
    images: [
      {
        url: pageImageUrl(PAGE_IMAGES.iccron.og),
        width: 1254,
        height: 1254,
        alt: "icCron - Decentralized Cron & Webhook Dispatcher",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "icCron - Autonomous On-Chain Cron & Webhook Dispatcher",
    description:
      "Schedule HTTP webhooks and canister smart contracts with sub-second precision. Zero servers, zero keeper bots, 60 free runs/month.",
    images: [pageImageUrl(PAGE_IMAGES.iccron.og)],
    creator: "@IcpayOfficial",
  },
  alternates: {
    canonical: "https://icpay.app/iccron",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "icCron",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "All, Web, Internet Computer",
      "description":
        "Autonomous on-chain cron scheduler and webhook dispatcher on the Internet Computer with sub-second precision and Dead Letter Queues. 60 free monthly runs, $0.0005 per run.",
      "url": "https://icpay.app/iccron",
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "lowPrice": "0.00",
        "highPrice": "0.0005",
        "offerCount": "2",
      },
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://icpay.app",
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "icCron",
          "item": "https://icpay.app/iccron",
        },
      ],
    },
  ],
}

export default function IcCronPage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <ProblemSolution />
      <WhatIsSection />
      <GalleryShowcase />
      <UseCasesSection />
      <ArchitectureSection />
      <PricingCalculator />
      <QuickstartSection />
      <FaqSection />
      <CtaSection />
    </div>
  )
}
