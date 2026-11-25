import type { Metadata } from "next"
import Link from "next/link"
import { BlogAuthorMeta } from "@/components/blog/blog-author-meta"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { CloudGlassIcon, ShoppingBagGlassIcon, ShieldCheckGlassIcon, ArrowRightGlassIcon, DatabaseGlassIcon, SparklesGlassIcon } from "@thesvg/ui-react"

const SLUG = "changelog-2026-11-13"
const TITLE = "ICPay Changelog (Nov 13, 2026): Pro Username Shop, Free Storage Perks, Treasury Tokenomics & Multi-Handle Profiles"
const DESCRIPTION =
  "Major platform updates for November 13, 2026: Launch of the ICPay Pro Shop with dual-currency pricing (ICP and $ICPAY -20%), 1-year free decentralized storage perks in icBucket, zero-cost perk bucket creation, Gold/Blue verified badge tier alignment, multi-handle profile management, and bottom-center toast notification ergonomics."
const PUBLISHED_AT = "2026-11-13"
const READING_MINUTES = 10

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "icpay changelog",
    "icpay pro shop",
    "icpay storage perks",
    "icbucket free storage",
    "icpay token utility",
    "on-chain username pricing",
    "gold verified badge icp",
    "internet computer decentralized storage",
    "icpay multi-handle",
    "zero cost bucket creation",
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
        url: "/images/og/icpay-og.png",
        width: 1200,
        height: 630,
        alt: "ICPay Pro Shop & Storage Perks Release",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/og/icpay-og.png"],
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
      name: "What are the new storage perks for Pro username owners in ICPay?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Owners of Gold Ultra handles (1–3 characters) receive 5 GB of free on-chain decentralized storage in icBucket for 1 full year. Owners of Blue Premium handles (4 characters) receive 1 GB of free storage for 1 full year. Basic and Standard handles remain zero cycles liability with pure handle forwarding.",
      },
    },
    {
      "@type": "Question",
      name: "How does dual-currency pricing work in the ICPay Pro Shop?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Users can purchase premium usernames using either standard ICP or $ICPAY tokens. Paying with $ICPAY provides an automatic 20% discount across all tiers. 100% of proceeds route directly to the on-chain ICPay Treasury to fuel ongoing protocol cycles.",
      },
    },
    {
      "@type": "Question",
      name: "How does zero-cost bucket creation work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "When an eligible Pro handle owner creates their bucket in icBucket, the canister verifies their claim on-chain, automatically sets the plan duration to 1 year, and bypasses the ICP ledger debit (0.00 ICP cost). The on-chain fulfillment map records the grant to guarantee exactly one free bucket per eligible handle.",
      },
    },
  ],
}

export default function ChangelogNov13Page() {
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
            Platform Release
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            November 13, 2026
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
          {TITLE}
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed sm:text-lg">
          We are pleased to release today&apos;s feature update to ICPay. This release launches the on-chain <strong>ICPay Pro Shop</strong> with dual-currency tokenomics, integrates <strong>1-Year Free Decentralized Storage Perks</strong> directly with icBucket, enforces exact-tier zero-cost bucket provisioning, aligns the Gold checkmark badge with Ultra Premium handles, and introduces multi-handle profile management.
        </p>

        <BlogAuthorMeta
          publishedAt={PUBLISHED_AT}
          readingMinutes={READING_MINUTES}
          title={TITLE}
          slug={SLUG}
        />
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          1. The ICPay Pro Shop: Dual-Currency Token Utility & Treasury Routing
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICPay usernames serve as secure, human-readable account identifiers across the Internet Computer blockchain, replacing unwieldy 64-character account IDs and hexadecimal principals. With today&apos;s upgrade, we introduce a structured, value-accretive tier model designed to drive organic demand for the native <strong>$ICPAY</strong> token.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          <Card className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Icon icon={ShoppingBagGlassIcon} className="size-4" />
              Dual-Currency Pricing (-20% with $ICPAY)
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Users can purchase any available short handle with either ICP or $ICPAY. Choosing $ICPAY applies an instant 20% discount, providing a recurring on-chain utility sink.
            </p>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Icon icon={ShieldCheckGlassIcon} className="size-4" />
              100% On-Chain Treasury Inflow
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              100% of payments route straight to the on-chain ICPay Treasury canister. No tokens are burned; capital is preserved to fund long-term subnet cycles and developer grants.
            </p>
          </Card>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold">Tier</th>
                <th className="py-3 px-4 font-semibold">Handle Length</th>
                <th className="py-3 px-4 font-semibold">ICP Price</th>
                <th className="py-3 px-4 font-semibold">$ICPAY Price (-20%)</th>
                <th className="py-3 px-4 font-semibold">Badge Mark</th>
                <th className="py-3 px-4 font-semibold">Bundled Storage Perk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="py-3 px-4 font-semibold text-foreground">Ultra Premium</td>
                <td className="py-3 px-4 text-muted-foreground">1–3 chars (e.g., @icp, @btc)</td>
                <td className="py-3 px-4 font-mono font-medium">10.0 ICP</td>
                <td className="py-3 px-4 font-mono font-medium text-success">800 $ICPAY</td>
                <td className="py-3 px-4 text-amber-400 font-semibold">Gold Checkmark</td>
                <td className="py-3 px-4 font-semibold text-primary">5 GB for 1 Full Year</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-foreground">Premium</td>
                <td className="py-3 px-4 text-muted-foreground">4 chars (e.g., @gold, @elon)</td>
                <td className="py-3 px-4 font-mono font-medium">5.0 ICP</td>
                <td className="py-3 px-4 font-mono font-medium text-success">400 $ICPAY</td>
                <td className="py-3 px-4 text-blue-500 font-semibold">Blue Checkmark</td>
                <td className="py-3 px-4 font-semibold text-primary">1 GB for 1 Full Year</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-foreground">Standard</td>
                <td className="py-3 px-4 text-muted-foreground">5 chars</td>
                <td className="py-3 px-4 font-mono font-medium">2.0 ICP</td>
                <td className="py-3 px-4 font-mono font-medium text-success">160 $ICPAY</td>
                <td className="py-3 px-4 text-muted-foreground">—</td>
                <td className="py-3 px-4 text-muted-foreground">0 GB (Pure Handle)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-foreground">Basic</td>
                <td className="py-3 px-4 text-muted-foreground">6–8 chars</td>
                <td className="py-3 px-4 font-mono font-medium">1.0 ICP</td>
                <td className="py-3 px-4 font-mono font-medium text-success">80 $ICPAY</td>
                <td className="py-3 px-4 text-muted-foreground">—</td>
                <td className="py-3 px-4 text-muted-foreground">0 GB (Pure Handle)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          2. Zero-Cost Pro Perk Provisioning in icBucket
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Instead of locking storage perks behind coupon codes or manual admin distribution, we built an integrated on-chain flow between the wallet backend and the <strong>icBucket</strong> storage engine.
        </p>

        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          <Card className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Icon icon={SparklesGlassIcon} className="size-4" />
              Persistent On-Chain Claim
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Claims are recorded immutably in Motoko orthogonal persistence. Once claimed, the perk banner permanently dismisses across all mobile and desktop devices.
            </p>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Icon icon={CloudGlassIcon} className="size-4" />
              Dynamic Auto-Selection
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The Create Bucket modal automatically pre-selects the user&apos;s earned capacity (5 GB for Ultra, 1 GB for Premium) and sets the cycle to Annual (365 days).
            </p>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Icon icon={DatabaseGlassIcon} className="size-4" />
              0.00 ICP Ledger Bypass
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The canister skips the ICP ledger debit entirely (zero cost), provisions a dedicated 400 GB EOP storage canister, and marks fulfillment on-chain.
            </p>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          3. Verified Checkmark Alignment: 1–3 Characters are Ultra Gold
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Prior to this update, 3-character handles were rendered with a blue checkmark despite occupying the top 10 ICP Ultra tier. We have updated both the frontend badge derivation and the backend suggestion ranking:
        </p>
        <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
          <li>
            <strong>1–3 Characters (Ultra Premium)</strong>: Now permanently displays the official <strong>Gold Checkmark</strong> badge across user avatars, profile headers, transfer search, and channel messages.
          </li>
          <li>
            <strong>4 Characters (Premium)</strong>: Receives the official <strong>Blue Checkmark</strong> badge.
          </li>
          <li>
            <strong>Exact Tier Match</strong>: The bucket creation modal now strictly pairs the free perk with the user&apos;s exact earned tier, preventing accidental perk forfeiture on lower tiers.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          4. Ergonomic Improvements: Multi-Handle Profiles & Bottom-Center Toasts
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Alongside tokenomics and storage perks, today&apos;s release includes two key quality-of-life improvements:
        </p>
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          <Card className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Multi-Handle Portfolio on Profile</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Users holding multiple handles can now view their entire handle portfolio directly on the Profile page, labeled with Primary and Alias badges, 1-click copy buttons, and profile links.
            </p>
          </Card>
          <Card className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Bottom-Center Toast Notifications</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Notification toasts have been moved from the top edge to the bottom center of the screen, eliminating clipping behind navigation headers and providing a smoother mobile experience.
            </p>
          </Card>
        </div>
      </section>

      <section className="space-y-4 pt-6 border-t border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-muted/40 p-6 border border-border">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-semibold text-foreground">Ready to explore premium handles and storage?</h3>
            <p className="text-xs text-muted-foreground">
              Buy an Ultra or Premium handle to claim your 1-year free on-chain storage bucket today.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button nativeButton={false} render={<Link href="/username" />}>
              Explore Handles
              <Icon icon={ArrowRightGlassIcon} className="size-4 ml-1.5" />
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/bucket" />}>
              Open icBucket
            </Button>
          </div>
        </div>
      </section>
    </article>
  )
}
