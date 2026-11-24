import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PricingSection } from "@/components/products/icbucket/pricing-section"
import { ComparisonSection } from "@/components/products/icbucket/comparison-section"
import { FaqSection } from "@/components/products/icbucket/faq-section"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { PAGE_IMAGES, pageImageUrl } from "@/lib/public/page-images"

export const metadata: Metadata = {
  title: "icBucket Pricing (2026): Flat-Rate On-Chain S3 Storage & Zero Egress Fees | ICPay",
  description:
    "Explore icBucket on-chain S3 storage pricing plans starting at 1 GB up to 100+ GB. Flat-rate ICP billing, zero egress bandwidth fees, instant global CDN, and no credit card required.",
  keywords: [
    "s3 storage pricing",
    "buy s3 storage",
    "s3 storage cost",
    "cloud storage pricing 2026",
    "aws s3 pricing alternative",
    "icbucket pricing",
    "zero egress cloud storage",
    "on chain s3 storage",
    "decentralized cloud storage pricing",
  ],
  openGraph: {
    title: "icBucket Pricing: Flat-Rate On-Chain S3 Storage & Zero Egress Fees",
    description:
      "Predictable 30-day and yearly storage plans with zero egress fees and zero surprise invoices. S3-compatible APIs for developers.",
    url: "https://icpay.app/icbucket/pricing",
    siteName: "ICPay",
    images: [
      {
        url: pageImageUrl(PAGE_IMAGES.icbucket.og),
        width: 1254,
        height: 1254,
        alt: "icBucket Cloud Storage Pricing",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "icBucket Pricing: Flat-Rate On-Chain S3 Storage & Zero Egress Fees",
    description:
      "Predictable 30-day and yearly storage plans with zero egress fees and zero surprise invoices.",
    images: [pageImageUrl(PAGE_IMAGES.icbucket.og)],
    creator: "@IcpayOfficial",
  },
  alternates: {
    canonical: "https://icpay.app/icbucket/pricing",
  },
}

const FAQ_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does icBucket storage cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "icBucket plans start at 1 GB for personal sandboxes up to 100+ GB for enterprise applications. Pricing is fixed in ICP (approx. $5/GB/year or $0.50/GB/month) with zero variable bandwidth or egress surcharges."
      }
    },
    {
      "@type": "Question",
      "name": "Does icBucket charge data egress or transfer fees?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Unlike AWS S3 which charges $0.09 per GB in outbound data transfer, icBucket charges zero egress fees. All bandwidth and global edge CDN distribution are bundled into the flat subscription rate."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need a credit card or AWS account to use icBucket?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. icBucket is 100% decentralized and custodial on the Internet Computer. You authenticate with Internet Identity (passkeys, Google, or Apple) and pay directly from your ICPay balance."
      }
    },
    {
      "@type": "Question",
      "name": "Is icBucket compatible with the Amazon S3 API?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. icBucket supports standard S3 operations including multipart chunked uploads, bucket management, presigned read URLs, and scoped API keys. SDKs are available for TypeScript, Python, and Go."
      }
    }
  ]
}

export default function IcBucketPricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_STRUCTURED_DATA) }}
      />

      <section className="border-b border-border/60 bg-background pt-12 pb-8 md:pt-16 md:pb-12">
        <div className="container mx-auto max-w-7xl px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              nativeButton={false}
              render={
                <Link href="/icbucket" className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
                  <span>Back to icBucket Overview</span>
                </Link>
              }
            />
          </div>

          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            Transparent On-Chain Pricing
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
            Simple, Predictable Cloud Storage Pricing
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Zero egress fees, zero API request surcharges, and no surprise cloud bills. Pay in ICP with 30-day or yearly subscriptions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-foreground shadow-xs">
              <span className="size-1.5 rounded-full bg-success" />
              <span>$0 Egress Fees</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-foreground shadow-xs">
              <span className="size-1.5 rounded-full bg-primary" />
              <span>S3 API & SDKs</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-foreground shadow-xs">
              <span className="size-1.5 rounded-full bg-accent" />
              <span>Internet Identity Auth</span>
            </span>
          </div>
        </div>
      </section>

      <PricingSection />

      <ComparisonSection />

      <FaqSection />

      <section className="border-t border-border/60 bg-muted/20 py-16 text-center">
        <div className="container mx-auto max-w-3xl px-4 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ready to deploy your first on-chain bucket?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Scaffold your bucket, generate API keys, and upload files in under 2 minutes.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              className="gap-2 rounded-full px-6 bg-primary text-primary-foreground font-semibold shadow-sm"
              nativeButton={false}
              render={
                <Link href="/bucket" className="flex items-center gap-2">
                  <span>Launch Bucket Console</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                </Link>
              }
            />
          </div>
        </div>
      </section>
    </div>
  )
}
