import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PricingCalculator } from "@/components/products/iccron/pricing-calculator"
import { FaqSection } from "@/components/products/iccron/faq-section"
import { Icon } from "@/components/ui/icon"
import { ArrowLeftGlassIcon, ArrowRightGlassIcon } from "@thesvg/ui-react"
import { PAGE_IMAGES, pageImageUrl } from "@/lib/public/page-images"

export const metadata: Metadata = {
  title: "icCron Pricing: 60 Free Monthly Runs & $0.0005 Pay-As-You-Go | ICPay",
  description:
    "Transparent on-chain cron pricing: 60 free executions every month plus $0.0005 per execution run via ICP credit packs. Zero monthly subscriptions or server fees.",
  keywords: [
    "icCron pricing",
    "decentralized cron pricing",
    "cheap cron scheduler",
    "Vercel cron alternative pricing",
    "AWS EventBridge pricing alternative",
    "ICP cycles cron cost",
    "pay per run scheduler",
  ],
  openGraph: {
    title: "icCron Pricing | ICPay",
    description:
      "Run hourly cron jobs for $4.32/year instead of $240/year. 60 free monthly runs included.",
    url: "https://icpay.app/iccron/pricing",
    siteName: "ICPay",
    images: [
      {
        url: pageImageUrl(PAGE_IMAGES.iccron.og),
        width: 1254,
        height: 1254,
        alt: "icCron Pricing",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "icCron Pricing: 60 Free Monthly Runs & $0.0005 Pay-As-You-Go",
    description:
      "Run hourly cron jobs for $4.32/year instead of $240/year. 60 free monthly runs included, zero monthly subscriptions.",
    images: [pageImageUrl(PAGE_IMAGES.iccron.og)],
    creator: "@IcpayOfficial",
  },
  alternates: {
    canonical: "https://icpay.app/iccron/pricing",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "name": "icCron Autonomous Scheduler",
      "description":
        "Autonomous on-chain cron scheduler and webhook dispatcher on the Internet Computer with sub-second precision. 60 free monthly runs, $0.0005 per execution run.",
      "url": "https://icpay.app/iccron/pricing",
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
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Pricing",
          "item": "https://icpay.app/iccron/pricing",
        },
      ],
    },
  ],
}

export default function IcCronPricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="border-b border-border/60 bg-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/iccron" />}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Icon icon={ArrowLeftGlassIcon} className="size-3.5" />
              Back to icCron
            </Button>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/cron" />}
              className="gap-1.5 text-xs"
            >
              Open Dashboard
              <Icon icon={ArrowRightGlassIcon} className="size-3.5" />
            </Button>
          </div>
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              Pay-Per-Execution Pricing
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Zero Monthly Tax. Pay Only Per Run.
            </h1>
            <p className="text-base text-muted-foreground">
              Start with 60 free monthly executions, then scale at $0.0005 per execution run with ICP credit packs.
            </p>
          </div>
        </div>
      </section>
      <PricingCalculator />
      <FaqSection />
    </div>
  )
}
