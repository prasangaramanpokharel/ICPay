import type { Metadata } from "next"
import Link from "next/link"
import { BlogAuthorMeta } from "@/components/blog/blog-author-meta"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "on-chain-cloud-storage-icbucket-s3-guide"
const TITLE = "icBucket: True On-Chain Cloud Storage with S3-Compatible API at 1 GB per ICP"
const DESCRIPTION =
  "How icBucket delivers decentralized, S3-compatible object storage hosted 100% on the Internet Computer with zero AWS invoices, simple 30-day plans, and instant payment from your ICPay balance."
const PUBLISHED_AT = "2026-09-28"
const READING_MINUTES = 6

export const metadata: Metadata = {
  title: `${TITLE} — ICPay Blog`,
  description: DESCRIPTION,
  keywords: [
    "icbucket on chain storage",
    "s3 compatible blockchain storage",
    "decentralized cloud storage icp",
    "1gb per icp",
    "replace aws s3 web3",
    "icpay bucket",
    "internet computer object storage",
    "zero server cloud storage",
  ],
  alternates: { canonical: blogCanonical(SLUG) },
  openGraph: {
    title: `${TITLE} — ICPay Blog`,
    description: DESCRIPTION,
    url: blogCanonical(SLUG),
    siteName: "ICPay",
    type: "article",
    publishedTime: `${PUBLISHED_AT}T00:00:00Z`,
    images: [
      {
        url: "https://res.cloudinary.com/dn2ycbmrc/image/upload/v1790573975/bb_dpkf0m.png",
        width: 1920,
        height: 1080,
        alt: "icBucket On-Chain Cloud Storage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["https://res.cloudinary.com/dn2ycbmrc/image/upload/v1790573975/bb_dpkf0m.png"],
  },
}

const jsonLd = blogArticleJsonLd({
  slug: SLUG,
  title: TITLE,
  description: DESCRIPTION,
  publishedAt: PUBLISHED_AT,
  readingMinutes: READING_MINUTES,
})

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much does icBucket cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "icBucket pricing is simple and predictable: 1 GB of on-chain storage per 1 ICP on renewable 30-day leases, paid directly and automatically from your ICPay balance without credit cards or surprise egress fees.",
      },
    },
    {
      "@type": "Question",
      name: "How do I integrate icBucket into my apps?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can integrate icBucket directly using the official, high-performance client libraries: icpay-bucket on npm (Node.js/TypeScript) and icpay-bucket with ic-py on PyPI (Python), along with direct HTTP CDN delivery.",
      },
    },
    {
      "@type": "Question",
      name: "Where are files actually stored?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Files are stored 100% on-chain inside replicated Internet Computer smart canisters. Data is secured by threshold cryptography, immutable subnet replication, and direct HTTP serving capabilities without intermediaries.",
      },
    },
  ],
}

export default function IcBucketS3GuidePage() {
  return (
    <article className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Cloud Infrastructure
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            1 GB per ICP
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          {TITLE}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Centralized cloud storage providers like Amazon AWS lock Web3 applications into recurring credit card
          invoices, arbitrary deplatforming risks, and opaque egress taxes. With <strong className="text-foreground">icBucket</strong>,
          developers can store files 100% on-chain with full S3 API compatibility at a transparent rate of 1 GB per ICP.
        </p>
        <BlogAuthorMeta publishedAt={PUBLISHED_AT} readingMinutes={READING_MINUTES} />
      </header>

      {/* Hero Visual Card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative w-full overflow-hidden bg-muted/40">
          <img
            src="https://res.cloudinary.com/dn2ycbmrc/image/upload/v1790573975/bb_dpkf0m.png"
            alt="icBucket 1GB per ICP Cloud Storage"
            className="w-full h-auto object-cover max-h-[440px]"
            loading="lazy"
          />
        </div>
        <div className="p-4 bg-muted/20 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <span>S3-Compatible Decentralized Cloud Storage</span>
          <Link href="/icbucket" className="font-medium text-primary hover:underline">
            Launch Your Bucket &rarr;
          </Link>
        </div>
      </div>

      {/* Overview Callout */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
            Simple, Transparent Pricing
          </h2>
          <span className="rounded-full bg-primary/20 px-2 py-0.5 font-bold text-xs text-primary">
            1 GB per ICP / 30 Days
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          No complicated cycle math. No credit card authorization holds. No surprise bandwidth egress fees.
          Your storage allocation is leased in 30-day blocks and settled instantly from your ICPay subaccount.
        </p>
      </div>

      {/* Section 1: The AWS S3 Dilemma */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          1. Why Web3 Needs Truly Sovereign Storage
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Many decentralized applications claim decentralization in their smart contracts while quietly storing their
          frontend build artifacts, user uploads, NFTs, and static documents on Amazon Web Services (S3), Google Cloud,
          or Cloudflare. This introduces fatal systemic risks:
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
            <h3 className="text-sm font-bold text-destructive">Egress Bandwidth Taxes</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Traditional cloud providers charge steep fees every time a user downloads content from an S3 bucket,
              making high-traffic consumer dApps unpredictable and expensive to maintain.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
            <h3 className="text-sm font-bold text-destructive">Credit Card Dependence</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              DAOs and autonomous on-chain agents cannot hold corporate fiat credit cards. If a founder&apos;s card expires,
              critical application data is wiped or frozen.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
            <h3 className="text-sm font-bold text-destructive">Deplatforming Surface</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Centralized cloud hosting providers can revoke accounts or block access instantly without cryptographic recourse,
              violating the sovereign promise of Web3.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Architectural Capabilities */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          2. The icBucket Architecture
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          icBucket transforms Internet Computer canister smart contracts into high-performance object storage buckets:
        </p>
        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4 bg-card space-y-1">
            <h3 className="text-sm font-bold text-foreground">S3 REST API Compatibility</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              icBucket implements standard S3 actions including <code className="bg-muted px-1 py-0.5 rounded text-foreground">PutObject</code>,
              <code className="bg-muted px-1 py-0.5 rounded text-foreground">GetObject</code>, and <code className="bg-muted px-1 py-0.5 rounded text-foreground">ListObjectsV2</code>.
              Your existing scripts and upload pipelines continue working seamlessly.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 bg-card space-y-1">
            <h3 className="text-sm font-bold text-foreground">100% On-Chain Canister Persistence</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Files are split into deterministic chunks and stored directly across Internet Computer subnet nodes. Data is replicated
              by Byzantine Fault Tolerant consensus with zero external dependencies.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 bg-card space-y-1">
            <h3 className="text-sm font-bold text-foreground">Zero-Egress Direct HTTP Delivery</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Because Internet Computer canisters can serve raw HTTP requests directly to standard web browsers, users can stream
              videos, render images, and download assets without intermediaries or bandwidth surcharges.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Developer Quickstart */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          3. Developer Integration in 60 Seconds
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Install the official, production-ready ICPay Cloud client library from npm or PyPI:
        </p>
        
        <div className="rounded-xl border border-border bg-card p-4 font-mono text-xs space-y-2 text-foreground">
          <div className="text-muted-foreground"># Install via npm or pip</div>
          <div className="text-primary font-bold">
            npm i icpay-bucket<br />
            pip install icpay-bucket ic-py
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Node.js / TypeScript Example</h3>
          <pre className="rounded bg-muted p-3 font-mono text-xs overflow-x-auto text-foreground">
{`import { BucketClient } from "icpay-bucket";

const client = new BucketClient({
  apiKey: process.env.IC_API_KEY!, // icp_cloud_...
});

// Upload directly to on-chain canister
await client.uploadFile({
  bucketId: "my-bucket",
  path: "/data.json",
  data: new TextEncoder().encode(JSON.stringify({ status: "on-chain" })),
  contentType: "application/json",
});

// Download and verify
const data = await client.downloadFile("my-bucket", "/data.json");`}
          </pre>
        </div>
      </section>

      {/* Section 4: Settlement via ICPay */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          4. Native ICPay Subaccount Settlement
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Storage allocations are tied directly to your authenticated ICPay identity. When provisioning or extending storage,
          the required ICP is deducted transparently from your isolated subaccount on the official ICP ledger. If you wish to
          expand capacity or renew for another 30-day cycle, one click in your ICPay dashboard authorizes the transaction with your
          Internet Identity biometric passkey.
        </p>
      </section>

      {/* Call to Action Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-3">
        <h3 className="text-lg font-bold text-foreground">Deploy Your First Sovereign Bucket Today</h3>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto">
          Leave Amazon Web Services behind. Enjoy predictable 1 GB per ICP pricing with 100% on-chain data custody.
        </p>
        <div className="pt-2">
          <Link
            href="/icbucket"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Open icBucket on ICPay
          </Link>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
        <div>
          Published by <strong className="text-foreground">ICPay Infrastructure</strong> &middot; September 28, 2026
        </div>
        <div className="flex gap-4">
          <Link href="/icbucket" className="font-semibold text-primary hover:underline">
            icBucket Portal
          </Link>
          <Link href="/blog" className="font-semibold text-primary hover:underline">
            All Articles
          </Link>
        </div>
      </div>
    </article>
  )
}
