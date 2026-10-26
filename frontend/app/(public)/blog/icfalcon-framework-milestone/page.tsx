import type { Metadata } from "next"
import Link from "next/link"
import { BlogAuthorMeta } from "@/components/blog/blog-author-meta"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "icfalcon-framework-milestone"
const TITLE = "ICFalcon Crosses 469 Weekly Downloads on npm: Standardizing Four-Layer Motoko Architecture"
const DESCRIPTION =
  "How ICFalcon reached 469 weekly downloads on npm by bringing strict four-layer Motoko backend architecture, Next.js frontend scaffolding, and deterministic CLI operations to the Internet Computer."
const PUBLISHED_AT = "2026-09-28"
const READING_MINUTES = 6

export const metadata: Metadata = {
  title: `${TITLE} — ICPay Blog`,
  description: DESCRIPTION,
  keywords: [
    "ICFalcon",
    "Motoko framework",
    "Internet Computer framework",
    "npm create icfalcon",
    "four-layer Motoko architecture",
    "ICP canister development",
    "full-stack ICP",
    "canister upgrade safety",
    "DFINITY Motoko",
  ],
  alternates: { canonical: blogCanonical(SLUG) },
  openGraph: {
    title: `${TITLE} — ICPay Blog`,
    description: DESCRIPTION,
    url: blogCanonical(SLUG),
    siteName: "ICPay",
    type: "article",
    publishedTime: `${PUBLISHED_AT}T00:00:00Z`,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
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
      name: "What is ICFalcon?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ICFalcon is a production-grade full-stack framework for building decentralized applications on the Internet Computer. It combines a strictly layered Motoko backend architecture, a Next.js 16 frontend with Internet Identity authentication, and a unified operations CLI.",
      },
    },
    {
      "@type": "Question",
      name: "How do I get started with ICFalcon?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can scaffold a new project with a single command: `npm create icfalcon`. This creates the backend actor hierarchy, client frontend, and deployment scripts ready for local dfx or mainnet deployment.",
      },
    },
    {
      "@type": "Question",
      name: "What is the four-layer Motoko architecture in ICFalcon?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The four-layer architecture enforces strict separation of concerns: api/v1 handles ingress and validation, services implements business logic, repositories abstracts data access, and storage manages stable memory and migration hooks across canister upgrades.",
      },
    },
  ],
}

const VIDEO_URL =
  "https://res.cloudinary.com/dn2ycbmrc/video/upload/v1790573665/Black_Gradient_Modern_Digital_Marketing_Presentation_htzni7.mp4"

export default function ICFalconMilestonePage() {
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
            Ecosystem Milestones
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            469 Weekly Downloads
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          {TITLE}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Building production canisters on the Internet Computer requires rigorous separation of
          concerns, stable memory survival across upgrades, and secure client authentication.
          With <strong className="text-foreground">ICFalcon</strong> crossing 469 weekly downloads on
          npm, developers are standardizing on a battle-tested four-layer architecture.
        </p>
        <BlogAuthorMeta publishedAt={PUBLISHED_AT} readingMinutes={READING_MINUTES} />
      </header>

      {/* Video Demonstration Embed */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative aspect-video w-full bg-black/90">
          <video
            src={VIDEO_URL}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="p-4 bg-muted/20 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <span>ICFalcon Overview & Architectural Presentation</span>
          <Link
            href="/icfalcon"
            className="font-medium text-primary hover:underline"
          >
            Visit ICFalcon Portal &rarr;
          </Link>
        </div>
      </div>

      {/* Quickstart Callout Box */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
            Initialize in Seconds
          </h2>
          <span className="font-mono text-xs text-muted-foreground">npm registry</span>
        </div>
        <div className="rounded-lg bg-background/80 p-3 font-mono text-sm text-foreground border border-border/80 flex items-center justify-between">
          <span>npm create icfalcon</span>
          <span className="text-xs text-muted-foreground">terminal</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Scaffolds a complete four-layer Motoko backend canister, Next.js 16 App Router frontend,
          and unified operations CLI with zero configuration required.
        </p>
      </div>

      {/* Section 1: The Problem Space */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          1. The Engineering Challenges Facing ICP Developers
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The Internet Computer provides unmatched computing infrastructure: canisters run at web speed,
          serve HTTP traffic natively, and execute under a reverse-gas model where end users do not need
          tokens to interact. However, raw developer setups frequently face three critical failure modes:
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-4 bg-card space-y-1.5">
            <h3 className="text-sm font-bold text-foreground">State Loss on Upgrades</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Monolithic actor files mixing state with logic risk deserialization panics during
              canister code upgrades, threatening production balances and user records.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 bg-card space-y-1.5">
            <h3 className="text-sm font-bold text-foreground">Reentrancy Traps</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Asynchronous `await` calls yield execution back to the subnet scheduler. Without
              disciplined repository and service isolation, concurrent calls can exploit intermediate state.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 bg-card space-y-1.5">
            <h3 className="text-sm font-bold text-foreground">Accidental Reinstalls</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Standard dfx tooling allows accidental `--mode=reinstall` flags that completely wipe
              mainnet canisters and controller records without warning.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: The Four-Layer Architecture */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          2. The Four-Layer Motoko Architecture
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          ICFalcon enforces strict architectural layering inspired by clean architecture and enterprise
          domain-driven design. Each layer has a single responsibility and zero leaky abstractions:
        </p>
        <div className="rounded-lg border border-border bg-card p-5 space-y-3 font-mono text-xs">
          <div className="text-primary font-bold">api/v1  &rarr;  services  &rarr;  repositories  &rarr;  storage</div>
          <p className="font-sans text-xs text-muted-foreground">
            Enforced unidirectional dependency flow. Endpoints never communicate directly with storage.
          </p>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4 bg-card space-y-1">
            <h3 className="text-sm font-bold text-foreground">Layer 1: api/v1 (Protocol Routing)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Entry point for ingress queries and updates. Validates caller principals, unpacks Candid payloads,
              and delegates to domain services. Contains zero business logic and zero storage access.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 bg-card space-y-1">
            <h3 className="text-sm font-bold text-foreground">Layer 2: services (Business Logic)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Executes domain algorithms, authorization rules, transaction flows, and inter-canister messaging.
              Orchestrates business state transitions without coupling to persistence formats.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 bg-card space-y-1">
            <h3 className="text-sm font-bold text-foreground">Layer 3: repositories (Data Access)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Manages in-memory maps, trees, and indexes. Isolates entity querying and mutations from raw
              storage implementations.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 bg-card space-y-1">
            <h3 className="text-sm font-bold text-foreground">Layer 4: storage (Stable Persistence)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Direct interface with ICP stable memory. Implements pre-upgrade serialization, post-upgrade
              deserialization, and schema migrations that survive canister upgrades without downtime.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Next.js Frontend & Production Tooling */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          3. Next.js 16 Client & Operations CLI
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          ICFalcon bridges on-chain computation with modern consumer experiences through out-of-the-box
          frontend and operations tooling:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-xs text-muted-foreground">
          <li>
            <strong className="text-foreground">Internet Identity & WebAuthn:</strong> Authenticate users
            with biometric passkeys (FaceID, TouchID, YubiKey) with zero seed phrases or browser extension requirements.
          </li>
          <li>
            <strong className="text-foreground">Pinned Derivation Origin:</strong> Prevents principal
            fragmentation across multiple staging and production domains.
          </li>
          <li>
            <strong className="text-foreground">Deterministic Rollback Verification:</strong> Every upgrade
            is verified against its wasm SHA256 module hash before deploying to mainnet.
          </li>
          <li>
            <strong className="text-foreground">Cycle Monitoring:</strong> Integrated cycle balance health
            checks to guarantee canister solvency.
          </li>
        </ul>
      </section>

      {/* Section 4: Quickstart Guide */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          4. Getting Started in 3 Steps
        </h2>
        <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-primary">Step 1: Scaffold your app</span>
            <div className="rounded bg-background p-2.5 font-mono text-xs border border-border">
              npm create icfalcon
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-primary">Step 2: Start local replica</span>
            <div className="rounded bg-background p-2.5 font-mono text-xs border border-border">
              dfx start --clean --background
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-primary">Step 3: Deploy and run</span>
            <div className="rounded bg-background p-2.5 font-mono text-xs border border-border">
              dfx deploy && npm run dev
            </div>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
        <div>
          Published by <strong className="text-foreground">ICPay Engineering</strong> &middot; September 28, 2026
        </div>
        <div className="flex gap-4">
          <Link href="/icfalcon" className="font-semibold text-primary hover:underline">
            ICFalcon Documentation
          </Link>
          <Link href="/blog" className="font-semibold text-primary hover:underline">
            All Blog Articles
          </Link>
        </div>
      </div>
    </article>
  )
}
