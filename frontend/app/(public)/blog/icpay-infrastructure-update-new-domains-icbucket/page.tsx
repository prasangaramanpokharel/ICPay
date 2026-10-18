import type { Metadata } from "next"
import Link from "next/link"
import { BlogAuthorMeta } from "@/components/blog/blog-author-meta"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "icpay-infrastructure-update-new-domains-icbucket"
const TITLE = "ICPay Infrastructure Update: New Domains icpay.cloud & onchainstorage.shop, Plus 268+ User Milestone"
const DESCRIPTION =
  "A complete overview of ICPay's latest domain expansions with icpay.cloud and onchainstorage.shop, official contact channels, and crossing 268 on-chain usernames with live ICBucket storage metrics."
const PUBLISHED_AT = "2026-10-09"
const READING_MINUTES = 5

export const metadata: Metadata = {
  title: `${TITLE} — ICPay Blog`,
  description: DESCRIPTION,
  keywords: [
    "icpay domains",
    "icpay cloud",
    "onchainstorage shop",
    "icbucket decentralized storage",
    "internet computer infrastructure",
    "web3 domain architecture",
    "contact icpay cloud",
    "on-chain username growth",
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
        alt: "ICPay Infrastructure and Domain Update",
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
      name: "What is icpay.cloud used for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "icpay.cloud serves as the primary infrastructure, developer services, and official communications domain for the ICPay ecosystem, including the official support email contact@icpay.cloud.",
      },
    },
    {
      "@type": "Question",
      name: "What is onchainstorage.shop?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "onchainstorage.shop is a dedicated gateway domain that routes directly to ICBucket, providing developers and organizations with a memorable vanity entrypoint to on-chain, S3-compatible decentralized cloud storage.",
      },
    },
    {
      "@type": "Question",
      name: "How can I contact ICPay for support or enterprise partnerships?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can email contact@icpay.cloud directly for questions, partnerships, and support, or submit open bug reports and technical proposals via our public GitLab repository issues.",
      },
    },
  ],
}

export default function InfrastructureUpdateBlogPage() {
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

      {/* Header */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Infrastructure & Updates
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          {TITLE}
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">{DESCRIPTION}</p>
        <BlogAuthorMeta publishedAt={PUBLISHED_AT} readingMinutes={READING_MINUTES} />
      </header>

      {/* Executive Summary */}
      <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Quick Highlights (October 2026)
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">✓</span>
            <span>
              <strong>New Domain Gateway:</strong> <code>icpay.cloud</code> deployed for official infrastructure and communications.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">✓</span>
            <span>
              <strong>Dedicated S3 Storage Entry:</strong> <code>onchainstorage.shop</code> now redirects seamlessly to ICBucket.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">✓</span>
            <span>
              <strong>Direct Support Channel:</strong> Official support launched at <code>contact@icpay.cloud</code>.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">✓</span>
            <span>
              <strong>268+ User Milestone:</strong> On-chain verified claimed usernames growing steadily with 541+ days canister cycle runway.
            </span>
          </li>
        </ul>
      </section>

      {/* Section 1: Domain Architecture Expansion */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          1. Expanding the Domain Portfolio: Why Dedicated Gateways Matter
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          As ICPay matures from a pure custodial Internet Computer wallet into a broader sovereign cloud suite featuring{" "}
          <Link href="/icbucket" className="font-semibold text-foreground underline underline-offset-2">
            ICBucket
          </Link>{" "}
          (on-chain object storage) and{" "}
          <Link href="/icfalcon" className="font-semibold text-foreground underline underline-offset-2">
            ICFalcon
          </Link>{" "}
          (Motoko developer framework), our web presence requires dedicated, role-specific domain holdings.
        </p>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Role & Purpose</th>
                <th className="px-4 py-3">Destination / Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-muted-foreground">
              <tr className="hover:bg-muted/20">
                <td className="px-4 py-3 font-mono font-semibold text-foreground">icpay.app</td>
                <td className="px-4 py-3">Primary Web Application & Wallet Console</td>
                <td className="px-4 py-3">Live Application Dashboard</td>
              </tr>
              <tr className="hover:bg-muted/20">
                <td className="px-4 py-3 font-mono font-semibold text-foreground">icpay.cloud</td>
                <td className="px-4 py-3">Infrastructure Hub, Communications & Support</td>
                <td className="px-4 py-3">Redirects to <code>icpay.app</code> + Mail Host</td>
              </tr>
              <tr className="hover:bg-muted/20">
                <td className="px-4 py-3 font-mono font-semibold text-foreground">onchainstorage.shop</td>
                <td className="px-4 py-3">Vanity Gateway & Direct Marketing Entrypoint for ICBucket</td>
                <td className="px-4 py-3">301 Redirect to <code>icpay.app/bucket</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 2: Official Support Email */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          2. Official Support Channel: contact@icpay.cloud
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          While ICPay core smart contracts operate autonomously on-chain without human intermediaries, users, developers, and institutional partners frequently require direct contact for:
        </p>
        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
          <li>Enterprise storage quota inquiries and custom bucket configurations.</li>
          <li>Partnership discussions and ecosystem integration opportunities.</li>
          <li>Direct developer onboarding and technical feedback.</li>
          <li>Non-public security disclosures prior to public issue publication.</li>
        </ul>
        <p className="leading-relaxed text-muted-foreground">
          You can now reach the team directly at{" "}
          <a
            href="mailto:contact@icpay.cloud"
            className="font-medium text-primary underline underline-offset-2"
          >
            contact@icpay.cloud
          </a>
          . This option is permanently integrated across our public footer, legal documents, and in-app settings drawer.
        </p>
      </section>

      {/* Section 3: On-Chain Growth Milestone */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          3. Live On-Chain Milestone: 268+ Usernames & Healthy Runway
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Our on-chain canister query metrics (verified via our operations suite <code>npm run ci users:count</code> and <code>npm run ci bucket:stats</code>) show healthy, organic ecosystem adoption:
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="text-3xl font-extrabold text-foreground">268</div>
            <div className="mt-1 text-xs text-muted-foreground">Claimed On-Chain Handles</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="text-3xl font-extrabold text-primary">5</div>
            <div className="mt-1 text-xs text-muted-foreground">Active Storage Canisters</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="text-3xl font-extrabold text-foreground">~541 Days</div>
            <div className="mt-1 text-xs text-muted-foreground">Canister Cycle Runway</div>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Every username claim is recorded directly into the backend canister subaccounts (Canister ID: <code>6vbhm-nqaaa-aaaan-q6muq-cai</code>), protected against clipboard poisoning and spoofing attacks.
        </p>
      </section>

      {/* Section 4: ICBucket Drop-in Replacement */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          4. How to Deploy Your First Bucket Today
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Developers looking to migrate static assets away from centralized cloud providers and eliminate unpredictable bandwidth invoices can get started immediately:
        </p>
        <ol className="list-inside list-decimal space-y-2 text-muted-foreground">
          <li>
            Visit{" "}
            <Link href="/bucket" className="font-semibold text-foreground underline underline-offset-2">
              icpay.app/bucket
            </Link>{" "}
            (or type <code>onchainstorage.shop</code> into your browser).
          </li>
          <li>Log in with your Internet Identity (no credit card or KYC required).</li>
          <li>Create a bucket and choose a 30-day lease paid in ICP.</li>
          <li>
            Integrate using standard S3 SDKs:
            <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs text-foreground">
              npm install icpay-bucket
            </pre>
          </li>
        </ol>
      </section>

      {/* CTA Box */}
      <section className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">
            Ready to Take Back Control of Your Storage?
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Experience permanent on-chain cloud storage with zero AWS invoices.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/bucket"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
          >
            Launch ICBucket
          </Link>
          <a
            href="mailto:contact@icpay.cloud"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Contact Team
          </a>
        </div>
      </section>
    </article>
  )
}
