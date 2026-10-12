import type { Metadata } from "next"
import { HeroSection } from "@/components/products/icbucket/hero-section"
import { IntegrateSection } from "@/components/products/icbucket/integrate-section"
import { ProblemSolution } from "@/components/products/icbucket/problem-solution"
import { TwitterSection } from "@/components/products/icbucket/twitter-section"
import { FeaturesSection } from "@/components/products/icbucket/features-section"
import { ArchitectureSection } from "@/components/products/icbucket/architecture-section"
import { ComparisonSection } from "@/components/products/icbucket/comparison-section"
import { PricingSection } from "@/components/products/icbucket/pricing-section"
import { FaqSection } from "@/components/products/icbucket/faq-section"
import { PAGE_IMAGES, pageImageUrl } from "@/lib/public/page-images"

export const metadata: Metadata = {
  title: "ICBucket - S3 Compatible Storage & AWS S3 Pricing Alternative | On-Chain Cloud",
  description:
    "ICBucket is S3-compatible decentralized cloud storage on the Internet Computer. Predictable AWS S3 pricing alternative with zero egress fees, scoped API keys, and SDKs. 30-day ICP plans, no credit card required.",
  keywords: [
    "AWS S3 pricing alternative",
    "S3 compatible storage",
    "cloud storage pricing",
    "AWS S3 cost",
    "best S3 compatible storage",
    "cheapest S3 compatible storage",
    "Cloudinary alternative",
    "Google Cloud Storage pricing",
    "s3 pricing",
    "ICBucket",
    "on-chain storage",
    "onchain storage",
    "decentralized storage crypto",
    "decentralized cloud storage",
    "Internet Computer storage",
    "ICP storage",
    "blockchain storage",
    "Web3 storage",
    "IPFS alternative",
    "S3 alternative",
    "dApp storage",
    "NFT metadata storage",
    "file hosting",
    "static hosting",
    "serverless storage",
    "censorship resistant",
    "immutable storage",
    "distributed storage",
  ],
  openGraph: {
    title: "ICBucket - S3 Compatible Storage & AWS S3 Pricing Alternative",
    description:
      "Store files on-chain with S3-compatible APIs and SDKs. Predictable 30-day ICP plans with zero AWS bills and zero egress fees.",
    url: "https://icpay.app/icbucket",
    siteName: "ICPay",
    images: [
      {
        url: pageImageUrl(PAGE_IMAGES.icbucket.og),
        width: 1920,
        height: 1080,
        alt: "ICBucket - On-Chain Cloud Storage",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ICBucket - On-Chain Cloud Storage for Web3",
    description:
      "Store files on-chain with API keys and SDKs. 30-day ICP plans — no servers, no AWS bills.",
    images: [pageImageUrl(PAGE_IMAGES.icbucket.og)],
    creator: "@IcpayOfficial",
  },
  alternates: {
    canonical: "https://icpay.app/icbucket",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "ICBucket",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "All, Web, Internet Computer",
      "description":
        "Decentralized on-chain cloud storage on the Internet Computer with CDN, API keys, and SDKs. 30-day ICP plans from 0.5 ICP, no credit card.",
      "url": "https://icpay.app/icbucket",
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "ICP",
        "lowPrice": "0.5",
        "highPrice": "2.0",
        "offerCount": "3",
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
          "name": "ICBucket",
          "item": "https://icpay.app/icbucket",
        },
      ],
    },
  ],
}

export default function ICBucketPage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <IntegrateSection />
      <ProblemSolution />
      <PricingSection />
      <TwitterSection />
      <FeaturesSection />
      <ArchitectureSection />
      <ComparisonSection />
      <FaqSection />
    </div>
  )
}

