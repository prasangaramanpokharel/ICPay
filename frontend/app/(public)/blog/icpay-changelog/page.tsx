import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { BlogAuthorMeta } from "@/components/blog/blog-author-meta"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Clock01Icon,
  GlobalIcon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

const SLUG = "icpay-changelog"
const TITLE = "ICPay v1.7.0 Changelog: Introducing icCron Autonomous Scheduler, Dead Letter Queues & On-Chain Automation"
const DESCRIPTION =
  "Explore the major updates in ICPay v1.7.0: The launch of icCron, our decentralized autonomous cron and webhook dispatcher running natively on Internet Computer canister timers. Featuring sub-second precision, O(1) bitmask scheduling, Dead Letter Queues, and 99.4% cycle savings over legacy heartbeats."
const PUBLISHED_AT = "2026-11-12"
const READING_MINUTES = 12

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "icpay changelog",
    "icpay v1.7.0",
    "iccron launch",
    "decentralized cron scheduler",
    "internet computer canister timers",
    "canister heartbeat alternative",
    "on-chain webhook dispatcher",
    "dead letter queue blockchain",
    "O(1) bitmask cron compiler",
    "icpay cloud updates",
    "icbucket documentation polish",
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
        url: "/images/pages/iccron/hero-automation.jpg",
        width: 1200,
        height: 630,
        alt: "ICPay v1.7.0 Changelog and icCron Launch",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/pages/iccron/hero-automation.jpg"],
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
      name: "What is the headline feature of ICPay v1.7.0?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The flagship addition of ICPay v1.7.0 is icCron, an independent Rust canister (uzt4z-lp777-77774-qaabq-cai) that enables decentralized, sub-second cron scheduling, automated retries with Dead Letter Queues (DLQ), inter-canister smart contract calls, and threshold-signed HTTPS outcalls to Web2 webhooks without servers or keeper bots.",
      },
    },
    {
      "@type": "Question",
      name: "How does icCron achieve 99.4% cycle savings over legacy heartbeats?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Legacy ICP canisters relied on canister_heartbeat, which executed every consensus round (~1 second) regardless of whether work was pending. icCron integrates directly with IC Canister Timers with 64-bit nanosecond scheduling, sleeping at zero cycle burn between jobs and waking up only at the exact scheduled second.",
      },
    },
    {
      "@type": "Question",
      name: "What pricing model is introduced for icCron in v1.7.0?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every user receives 60 free execution runs each month upon signing in with Internet Identity. Additional prepaid credits cost just $0.0005 per run ($0.50 per 1,000 runs) with no minimum monthly spend or seat-based subscriptions.",
      },
    },
  ],
}

export default function IcpayChangelogPage() {
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
            Product Release
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Version 1.7.0
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
          {TITLE}
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed sm:text-lg">
          Today, we are thrilled to announce the official release of <strong>ICPay v1.7.0</strong>. This milestone marks the debut of <strong>icCron</strong>—the unstoppable, serverless cron layer for Web2 and Web3 workloads—alongside major developer documentation updates and performance polish across the platform.
        </p>

        <BlogAuthorMeta
          publishedAt={PUBLISHED_AT}
          readingMinutes={READING_MINUTES}
          title={TITLE}
          slug={SLUG}
        />
      </header>

      <div className="relative aspect-16/9 w-full overflow-hidden rounded-3xl border border-border">
        <Image
          src="/images/pages/iccron/hero-automation.jpg"
          alt="icCron Autonomous Scheduling Engine"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-md font-mono text-xs text-primary font-bold">
            Canister ID: uzt4z-lp777-77774-qaabq-cai
          </Badge>
          <span className="text-xs text-muted-foreground font-semibold">
            Replicated State Consensus
          </span>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          1. The Headline: icCron Autonomous Scheduler
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Scheduled execution has long been one of the weakest links in decentralized applications. Developers building on Web3 protocols previously had to rely on off-chain &ldquo;keeper bots&rdquo; running on AWS EC2 or DigitalOcean VPS instances. These bots required plaintext private keys stored in server configuration files, had single points of failure, and frequently crashed due to memory leaks or host reboots.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Meanwhile, Web2 developers deploying Next.js applications on platforms like Vercel have been subjected to an aggressive <strong>$20/month per-seat cron tax</strong> just to trigger background jobs more frequently than once every 24 hours.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <strong>icCron</strong> resolves both challenges simultaneously by providing an autonomous, on-chain time engine running directly on the Internet Computer blockchain.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          <Card className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <HugeiconsIcon icon={Clock01Icon} className="size-4" />
              Sub-Second Canister Timers
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Native 64-bit nanosecond scheduling with zero heartbeat idle cycle burn. Sleeps at 0 cycles between jobs, saving over 99.4% in operational costs.
            </p>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <HugeiconsIcon icon={GlobalIcon} className="size-4" />
              Threshold HTTPS Outcalls
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cryptographically signed outbound HTTP webhooks that reach any public URL with threshold subnet consensus, verified caller headers, and automatic retries.
            </p>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          2. Under the Hood: Rust Canister Architecture
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          To maintain strict isolation from ICPay&apos;s custodial wallet funds, icCron is implemented as an independent Rust microservice canister located at <code className="rounded-md bg-secondary px-1.5 py-0.5 text-xs font-mono text-foreground">backend/rust/iccron/</code>.
        </p>

        <div className="relative mx-auto my-6 flex justify-center overflow-hidden rounded-2xl bg-secondary/30 p-4 border border-border">
          <Image
            src="/images/pages/iccron/architecture-diagram.svg"
            alt="icCron Architecture Diagram"
            width={900}
            height={400}
            className="h-auto w-full max-w-3xl object-contain dark:invert-0"
          />
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          The canister incorporates several architectural breakthroughs:
        </p>

        <ul className="space-y-3 text-sm text-muted-foreground pl-2">
          <li className="flex items-start gap-2.5">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="mt-0.5 size-4 text-primary shrink-0" />
            <span>
              <strong className="text-foreground">O(1) Bitmask Cron Engine:</strong> Standard 5-field cron strings are parsed into binary bitmasks (<code className="font-mono text-xs">minutes: u64, hours: u32, days: u32, months: u16, weekdays: u8</code>). Scheduler tick evaluation is calculated using bitwise AND operations with zero regular expression parsing overhead.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="mt-0.5 size-4 text-primary shrink-0" />
            <span>
              <strong className="text-foreground">Dead Letter Queue (DLQ) & Circuit Breaker:</strong> Downstream targets experiencing consecutive HTTP 500 or timeout failures trigger an automatic circuit breaker (<code className="font-mono text-xs">AutoPausedDormant</code>), moving the task to a persistent Dead Letter Queue with full status code and latency diagnostics.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="mt-0.5 size-4 text-primary shrink-0" />
            <span>
              <strong className="text-foreground">Zero-Key Caller Authentication:</strong> Canister-to-canister invocations authenticate using the authentic canister principal (<code className="font-mono text-xs">uzt4z-lp777-77774-qaabq-cai</code>). No private keys, seed phrases, or credentials ever exist to be compromised.
            </span>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          3. Developer Experience & Quickstart Integration
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Integrating icCron into your Next.js application, Motoko canister, or AI workflow takes less than 60 seconds:
        </p>

        <div className="rounded-2xl border border-border bg-card p-5 font-mono text-xs text-foreground space-y-3">
          <div className="flex items-center justify-between text-muted-foreground border-b border-border/50 pb-2">
            <span>Next.js API Route Handler</span>
            <span className="text-[11px]">app/api/cron/route.ts</span>
          </div>
          <pre className="overflow-x-auto text-muted-foreground leading-relaxed">
{`import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== \`Bearer \${process.env.ICCRON_SECRET}\`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Your autonomous logic: sync DB, compound DeFi yields, or trigger emails
  await performScheduledWorkload();
  return NextResponse.json({ ok: true, timestamp: Date.now() });
}`}
          </pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          4. Operational Economics: Free Tier & Micro-Credits
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We believe scheduled automation should be accessible to solo developers, bootstrapped startups, and enterprise protocols alike:
        </p>

        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs font-semibold text-primary">Free Baseline</p>
            <p className="font-mono text-2xl font-extrabold text-foreground">60 Runs</p>
            <p className="text-xs text-muted-foreground">Free every month for every user</p>
          </div>

          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-1">
            <p className="text-xs font-semibold text-primary">Micro-Credits</p>
            <p className="font-mono text-2xl font-extrabold text-foreground">$0.0005</p>
            <p className="text-xs text-muted-foreground">Per execution ($0.50 per 1,000 runs)</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">Vercel Comparison</p>
            <p className="font-mono text-2xl font-extrabold text-foreground">98.2% Less</p>
            <p className="text-xs text-muted-foreground">Save $235+/year on hourly jobs</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          5. ICBucket Documentation & UI Polish
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          In addition to the icCron release, v1.7.0 delivers notable quality improvements across ICPay:
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground pl-2">
          <li className="flex items-center gap-2">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-primary shrink-0" />
            <span>Cleaned navigation chrome in ICBucket developer documentation by removing redundant navigation arrows and headers.</span>
          </li>
          <li className="flex items-center gap-2">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-primary shrink-0" />
            <span>Streamlined clipboard copy UX across API keys and code snippets.</span>
          </li>
          <li className="flex items-center gap-2">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-primary shrink-0" />
            <span>Maintained 100% multilingual key parity across all 17 supported locales.</span>
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8 space-y-4">
        <h3 className="text-xl font-bold text-foreground">
          Try icCron Today
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The public landing page is live at <Link href="/iccron" className="text-primary font-semibold underline underline-offset-4">/iccron</Link>. Explore the interactive cron syntax sandbox, test real-time ROI savings, and schedule your first autonomous job.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            size="default"
            className="rounded-xl font-semibold gap-2"
            nativeButton={false}
            render={<Link href="/iccron" />}
          >
            Explore icCron
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="default"
            className="rounded-xl font-medium"
            nativeButton={false}
            render={
              <Link
                href="https://dashboard.internetcomputer.org/canister/uzt4z-lp777-77774-qaabq-cai"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            View Verified Canister
          </Button>
        </div>
      </section>
    </article>
  )
}
