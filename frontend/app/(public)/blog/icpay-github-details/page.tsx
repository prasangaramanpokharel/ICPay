import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { BlogAuthorMeta } from "@/components/blog/blog-author-meta"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  GitForkIcon,
  GitCommitIcon,
  Clock01Icon,
  LinkSquare02Icon,
  SourceCodeIcon,
  Folder01Icon,
} from "@hugeicons/core-free-icons"

const SLUG = "icpay-github-details"
const TITLE = "Inside the ICPay GitHub Repository: Codebase Architecture, 641 Commits, and 311K+ Lines of Decentralized Code"
const DESCRIPTION =
  "A transparent architectural deep dive into the official ICPay open-source repository on GitHub. Explore repository metrics, 641 commits across 69 active development days, 311,769 lines of code spanning Next.js, Motoko, and Rust, and how we build enterprise-grade custodial Web3 infrastructure on the Internet Computer."
const PUBLISHED_AT = "2026-11-12"
const READING_MINUTES = 11

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "icpay github",
    "icpay repository",
    "open source internet computer",
    "icpay commit history",
    "motoko smart contracts github",
    "rust icp canister github",
    "nextjs icp static export",
    "decentralized cloud engineering",
    "icpay development velocity",
    "icpay architecture stats",
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
        url: "/images/pages/iccron/cloud-network.jpg",
        width: 1200,
        height: 630,
        alt: "Inside the ICPay GitHub Repository",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/pages/iccron/cloud-network.jpg"],
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
      name: "Where is the official ICPay repository hosted?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The primary active Git repository is hosted on GitHub at github.com/prasangaramanpokharel/ICPay, mirrored continuously to GitLab at gitlab.com/prasangapokharel/icpay.",
      },
    },
    {
      "@type": "Question",
      name: "How many lines of code and commits make up ICPay?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "As of release v1.7.0, ICPay comprises 641 commits across 69 active development days, spanning 311,769 lines of code across 1,978 source files in TypeScript (Next.js), Motoko, Rust, and Candid.",
      },
    },
    {
      "@type": "Question",
      name: "What is the architectural split between Motoko and Rust in the backend?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The custodial wallet engine and ledger services run on Motoko canisters utilizing orthogonal persistence. High-throughput auxiliary microservices—such as icCron (autonomous cron scheduler) and blob storage engines—are built in memory-safe Rust with ic-stable-structures.",
      },
    },
  ],
}

const LANGUAGE_STATS = [
  { language: "TypeScript (React / Next.js)", files: "799", lines: "99,086", pct: "31.8%" },
  { language: "JSON / i18n & Configuration", files: "55", lines: "89,374", pct: "28.7%" },
  { language: "Markdown / Architecture Docs", files: "277", lines: "53,509", pct: "17.2%" },
  { language: "TypeScript (Services & Scripts)", files: "430", lines: "34,618", pct: "11.1%" },
  { language: "Motoko (Canister Contracts)", files: "326", lines: "24,496", pct: "7.9%" },
  { language: "Rust (Microservice Canisters)", files: "45", lines: "5,782", pct: "1.8%" },
  { language: "Candid (Interface IDLs)", files: "26", lines: "3,386", pct: "1.1%" },
  { language: "Shell & CI Automation Scripts", files: "17", lines: "932", pct: "0.3%" },
  { language: "Tailwind CSS & Styling", files: "3", lines: "586", pct: "0.2%" },
]

const MONTHLY_COMMITS = [
  { month: "July 2026", commits: 4, focus: "Repository bootstrap, initial DFX canister config & basic wallet architecture" },
  { month: "August 2026", commits: 423, focus: "Foundational sprint: Custodial subaccounts, Internet Identity auth, ICRC-1 transfer flows" },
  { month: "September 2026", commits: 107, focus: "icBucket S3-compatible decentralized storage, multi-canister sharding & Python/TS SDKs" },
  { month: "October 2026", commits: 87, focus: "icFalcon Motoko framework, DFINITY patent analysis, 2 TiB subnet storage & security audits" },
  { month: "November 2026", commits: 20, focus: "icCron autonomous scheduler, Dead Letter Queues, ROI calculator, and v1.7.0 release" },
]

export default function IcpayGithubDetailsPage() {
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
            Open Source Transparency
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            GitHub Insights
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
          {TITLE}
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed sm:text-lg">
          In Web3, real trust is earned through verifiable code. Today, we pull back the curtain on the official <strong>ICPay repository</strong> on GitHub—analyzing 641 commits, 69 active development days, 311,769 lines of production code, and the engineering principles behind our multi-canister system.
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
          src="/images/pages/iccron/cloud-network.jpg"
          alt="ICPay GitHub Repository Architecture"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-md font-mono text-xs text-primary font-bold">
            github.com/prasangaramanpokharel/ICPay
          </Badge>
          <span className="text-xs text-muted-foreground font-semibold">
            641 Commits · 311K+ Lines
          </span>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          1. Key Repository Metrics at a Glance
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Since the first commit on July 30, 2026, ICPay has been developed in the open with relentless velocity. Below are the verified metrics straight from the Git tree:
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
          <Card className="rounded-2xl border border-border bg-card p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Total Commits</span>
              <HugeiconsIcon icon={GitCommitIcon} className="size-4 text-primary" />
            </div>
            <p className="font-mono text-3xl font-black text-foreground">641</p>
            <p className="text-[11px] text-muted-foreground">Verified Git revisions</p>
          </Card>

          <Card className="rounded-2xl border border-border bg-card p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Active Days</span>
              <HugeiconsIcon icon={Clock01Icon} className="size-4 text-primary" />
            </div>
            <p className="font-mono text-3xl font-black text-foreground">69 Days</p>
            <p className="text-[11px] text-muted-foreground">~9.3 commits per active day</p>
          </Card>

          <Card className="rounded-2xl border border-border bg-card p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Total Source Lines</span>
              <HugeiconsIcon icon={SourceCodeIcon} className="size-4 text-primary" />
            </div>
            <p className="font-mono text-3xl font-black text-foreground">311,769</p>
            <p className="text-[11px] text-muted-foreground">Across 1,978 code files</p>
          </Card>

          <Card className="rounded-2xl border border-border bg-card p-5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Tracked Objects</span>
              <HugeiconsIcon icon={Folder01Icon} className="size-4 text-primary" />
            </div>
            <p className="font-mono text-3xl font-black text-foreground">2,931</p>
            <p className="text-[11px] text-muted-foreground">Files, assets, and diagrams</p>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          2. Language & Technology Breakdown
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICPay combines the safety of static typing across the entire stack. We use Next.js for high-performance static client rendering, Motoko for custodial orthogonal persistence, and Rust for high-throughput background automation:
        </p>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead className="text-xs font-bold text-foreground">Language / Layer</TableHead>
                <TableHead className="text-xs font-bold text-foreground text-right">Files</TableHead>
                <TableHead className="text-xs font-bold text-foreground text-right">Lines of Code</TableHead>
                <TableHead className="text-xs font-bold text-foreground text-right">Share (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LANGUAGE_STATS.map((row, idx) => (
                <TableRow key={idx} className="border-border/40 text-xs">
                  <TableCell className="font-semibold text-foreground">{row.language}</TableCell>
                  <TableCell className="font-mono text-right text-muted-foreground">{row.files}</TableCell>
                  <TableCell className="font-mono font-bold text-right text-foreground">{row.lines}</TableCell>
                  <TableCell className="font-mono text-right text-primary">{row.pct}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          3. Development Timeline & Monthly Velocity
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The commit cadence reflects the rapid evolution of ICPay from a prototype wallet to an enterprise on-chain cloud operating system:
        </p>

        <div className="space-y-3">
          {MONTHLY_COMMITS.map((item, idx) => (
            <Card key={idx} className="rounded-2xl border border-border bg-card p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm text-foreground">{item.month}</p>
                <Badge variant="outline" className="border-primary/30 text-primary font-mono text-xs">
                  {item.commits} Commits
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.focus}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          4. Three Non-Negotiable Invariants
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Because ICPay handles real custody and live mainnet assets, three architectural invariants are permanently enforced by our automated CI test suite:
        </p>

        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-1">
            <p className="font-semibold text-foreground">1. Authentication via Internet Identity Only</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              The canister never accepts a principal parameter in place of <code className="font-mono text-xs">caller</code>. The caller IS the account. We never store private keys, seed phrases, or passwords.
            </p>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-1">
            <p className="font-semibold text-foreground">2. Permanently Pinned Derivation Origin</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              <code className="font-mono text-xs">NEXT_PUBLIC_DERIVATION_ORIGIN</code> is permanently pinned to <code className="font-mono text-xs">https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io</code>. Changing this value would invalidate all existing users&apos; principals and lock their funds forever.
            </p>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-1">
            <p className="font-semibold text-foreground">3. Next.js Static Export Architecture</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              The entire frontend compiles to pure static HTML/JS with zero Node.js server at runtime (<code className="font-mono text-xs">output: &ldquo;export&rdquo;</code>). All canister calls run client-side through <code className="font-mono text-xs">@dfinity/agent</code> directly to ICP boundary nodes.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4">
        <h3 className="text-xl font-bold text-foreground">
          Explore the Source Code
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The ICPay codebase is publicly viewable on GitHub and GitLab. Inspect our smart contracts, review our tests, or contribute to the next evolution of decentralized infrastructure.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            size="default"
            className="rounded-xl font-semibold gap-2"
            nativeButton={false}
            render={
              <Link
                href="https://github.com/prasangaramanpokharel/ICPay"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <HugeiconsIcon icon={GitForkIcon} className="size-4" />
            GitHub Repository
          </Button>
          <Button
            variant="outline"
            size="default"
            className="rounded-xl font-medium gap-2"
            nativeButton={false}
            render={
              <Link
                href="https://gitlab.com/prasangapokharel/icpay"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <HugeiconsIcon icon={LinkSquare02Icon} className="size-4" />
            GitLab Mirror
          </Button>
        </div>
      </section>
    </article>
  )
}
