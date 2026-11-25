import type { Metadata } from "next"
import { HeroSection } from "@/components/products/iccron/hero-section"
import { SdkBenchmarkSection } from "@/components/products/iccron/sdk-benchmark-section"
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
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How is icCron different from Linux cron or node-cron on a VPS?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Linux cron and node-cron run on a single host. If that machine runs out of memory, reboots for a kernel update, or experiences a network partition, jobs fail silently. icCron runs as a replicated state machine on the Internet Computer blockchain across independent node providers worldwide, providing 100% uptime with zero server maintenance.",
          },
        },
        {
          "@type": "Question",
          "name": "Can icCron make HTTPS requests to any public endpoint on the web?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Using Internet Computer HTTPS outcalls, icCron reaches any publicly addressable URL (Vercel, AWS, Cloudflare, Supabase, Fly.io, or private APIs). The HTTP requests are cryptographically threshold-signed by subnet consensus.",
          },
        },
        {
          "@type": "Question",
          "name": "What happens if my target endpoint is down or returns a 500 error?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "icCron features configurable exponential backoff retries. If the target endpoint fails repeatedly beyond the configured maximum retry count, the job is transitioned to a Dead Letter Queue (DLQ) with status TargetUnavailable or AutoPausedDormant.",
          },
        },
        {
          "@type": "Question",
          "name": "Do I need to hold cryptocurrency or ICP tokens to use icCron?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Every user receives 60 free execution runs every month simply by signing in with Internet Identity. For higher volume, you can purchase prepaid credit packs using ICP or standard payment methods right within the ICPay dashboard.",
          },
        },
        {
          "@type": "Question",
          "name": "How accurate is the execution timing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "icCron leverages native Internet Computer Canister Timers with 64-bit nanosecond scheduling. Unlike AWS Lambda cold starts or serverless cron jobs that experience unpredictable wake-up drift of minutes, icCron ticks with deterministic 1-second consensus precision.",
          },
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
      <SdkBenchmarkSection />
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
