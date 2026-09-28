import type { Metadata } from "next"
import Link from "next/link"
import { BlogAuthorMeta } from "@/components/blog/blog-author-meta"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "address-poisoning-clipboard-hijacking-username-protection"
const TITLE = "How Address Poisoning Scams Work and Why Verified Usernames on ICPay Eliminate Clipboard Hijacking"
const DESCRIPTION =
  "A deep dive into address poisoning and clipboard hijacking scams in Web3, and how ICPay uses verified human-readable usernames and subaccount isolation on the Internet Computer to eradicate destination spoofing."
const PUBLISHED_AT = "2026-09-28"
const READING_MINUTES = 7

export const metadata: Metadata = {
  title: `${TITLE} — ICPay Blog`,
  description: DESCRIPTION,
  keywords: [
    "address poisoning crypto",
    "clipboard hijacking malware",
    "crypto wallet security",
    "verified username crypto transfer",
    "icp ledger subaccounts",
    "destination spoofing prevention",
    "human readable crypto wallet",
    "icpay security",
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
        url: "https://pbs.twimg.com/media/HTHgRbAbIAA2UPk?format=jpg&name=small",
        width: 680,
        height: 382,
        alt: "Address Poisoning Security Infographic",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["https://pbs.twimg.com/media/HTHgRbAbIAA2UPk?format=jpg&name=small"],
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
      name: "What is address poisoning in cryptocurrency?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Address poisoning is a scam where an attacker generates a lookalike address sharing identical prefix and suffix characters with a victim's frequent counterparty. The attacker sends a 0-value transaction to poison the victim's transfer history, hoping the victim copies the fraudulent address during future transfers.",
      },
    },
    {
      "@type": "Question",
      name: "How does clipboard hijacking work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Clipboard hijacking occurs when background malware monitors the user's operating system clipboard. When a crypto address or principal is detected, the malware instantly swaps the copied address with the attacker's destination before the user pastes it.",
      },
    },
    {
      "@type": "Question",
      name: "How does ICPay protect against these attacks?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ICPay resolves transfers using verified human-readable @usernames instead of raw machine hashes. Routing is executed deterministically inside the on-chain canister directly to the recipient's isolated 32-byte subaccount on the official ICP ledger, eliminating clipboard manipulation and destination spoofing.",
      },
    },
  ],
}

export default function AddressPoisoningBlogPage() {
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
          <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-destructive">
            Security Analysis
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Identity Protection
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          {TITLE}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Address poisoning and clipboard hijacking steal tens of millions of dollars from crypto users every month.
          By replacing ambiguous 63-character hashes with verified <strong className="text-foreground">@usernames</strong> backed
          by on-chain ledger subaccounts, ICPay removes the attack surface entirely.
        </p>
        <BlogAuthorMeta publishedAt={PUBLISHED_AT} readingMinutes={READING_MINUTES} />
      </header>

      {/* Hero Visual Card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative w-full overflow-hidden bg-muted/40">
          <img
            src="https://pbs.twimg.com/media/HTHgRbAbIAA2UPk?format=jpg&name=small"
            alt="Address Poisoning vs Verified Username Security"
            className="w-full h-auto object-cover max-h-[440px]"
            loading="lazy"
          />
        </div>
        <div className="p-4 bg-muted/20 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <span>Destination Ambiguity vs Verified Identity</span>
          <Link href="/username" className="font-medium text-primary hover:underline">
            Claim Your Verified Handle &rarr;
          </Link>
        </div>
      </div>

      {/* Threat Diagnosis */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          1. Anatomy of the Two Deadliest Transfer Exploits
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Modern blockchains are cryptographically sound, but the human-computer interaction layer remains fundamentally broken.
          Attackers exploit human cognitive shortcuts through two widespread attack vectors:
        </p>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              <h3 className="text-sm font-bold text-foreground">Address Poisoning</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Attackers continuously monitor mempools and ledger transactions. Using vanity address generators, they deploy an
              address that matches the first 4–6 and last 4–6 characters of a wallet you frequently send funds to.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              They send a transaction with 0 tokens or spam dust to your wallet. When you later copy the recipient from your
              recent activity list without verifying all 63 characters, your funds go straight to the scammer.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              <h3 className="text-sm font-bold text-foreground">Clipboard Hijacking</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Lightweight background malware, browser extensions, or compromised desktop utilities monitor the system clipboard
              buffer via regular expressions matching crypto address formats.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The moment you hit <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">Ctrl+C</code> on a legitimate
              principal or account identifier, the clipboard contents are overwritten milliseconds later with the attacker&apos;s address.
            </p>
          </div>
        </div>
      </section>

      {/* The ICPay Solution */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          2. Zero-Hash Ambiguity: The Verified Username Protocol
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          ICPay eliminates destination ambiguity by introducing verified, human-readable <strong className="text-foreground">@usernames</strong>.
          Instead of relying on fragile client-side copy-paste operations, destination resolution is handled entirely on-chain:
        </p>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3 text-center">
            <div className="rounded-lg bg-muted/40 p-4 border border-border/60">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Traditional Flow</div>
              <div className="mt-2 font-mono text-xs text-destructive truncate">
                6vbhm-nqaaa-aaaan-q6muq-cai
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">High spoofing vulnerability</div>
            </div>
            <div className="flex items-center justify-center font-bold text-primary">&rarr;</div>
            <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
              <div className="text-xs font-semibold text-primary uppercase tracking-wider">ICPay Flow</div>
              <div className="mt-2 font-bold text-sm text-foreground">
                @alex
              </div>
              <div className="mt-1 text-[11px] text-primary">Zero destination ambiguity</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4 bg-card space-y-1.5">
            <h3 className="text-sm font-bold text-foreground">1. Deterministic On-Chain Routing</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When sending to an @username, your client never resolves the destination locally. The backend Motoko canister
              (<code className="bg-muted px-1 py-0.5 rounded text-foreground">6vbhm-nqaaa-aaaan-q6muq-cai</code>) maps the handle
              directly to the recipient&apos;s isolated 32-byte subaccount on the official ICP ledger. Clipboard malware has zero opportunity to tamper with the route.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 bg-card space-y-1.5">
            <h3 className="text-sm font-bold text-foreground">2. Subaccount Fund Segregation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every user&apos;s funds sit in a distinct subaccount derived cryptographically from their authenticated Internet Identity principal.
              Funds are never commingled in an opaque pool, guaranteeing provable solvency on the ledger.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 bg-card space-y-1.5">
            <h3 className="text-sm font-bold text-foreground">3. Biometric Passkey Confirmation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every outbound transfer requires WebAuthn biometric authorization (FaceID, TouchID, or security keys).
              Even if a device is physically unattended, transactions cannot be broadcast without cryptographic consent.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          3. Security Comparison
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border font-semibold text-foreground">
              <tr>
                <th className="p-3">Security Vector</th>
                <th className="p-3">Raw Hash Wallets (EVM / Solana)</th>
                <th className="p-3">ICPay Network</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-muted-foreground">
              <tr>
                <td className="p-3 font-medium text-foreground">Address Poisoning Resistance</td>
                <td className="p-3 text-destructive">Vulnerable (Vanity prefix matching)</td>
                <td className="p-3 text-primary font-semibold">Immune (Unique @handles)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Clipboard Hijacking Protection</td>
                <td className="p-3 text-destructive">None (OS clipboard is unencrypted)</td>
                <td className="p-3 text-primary font-semibold">Zero-clipboard on-chain lookup</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Counterparty Verification</td>
                <td className="p-3">Manual inspection of 40–64 chars</td>
                <td className="p-3 text-foreground font-semibold">Instant human recognition</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Authentication Layer</td>
                <td className="p-3">Exposed private keys & seed phrases</td>
                <td className="p-3 text-primary font-semibold">Internet Identity WebAuthn passkeys</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Call to Action */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-3">
        <h3 className="text-lg font-bold text-foreground">Protect Your Capital with a Verified Identity</h3>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto">
          Stop verifying random machine hashes under anxiety. Claim your permanent, verified @username on ICPay today
          and experience seamless, scam-free on-chain payments.
        </p>
        <div className="pt-2">
          <Link
            href="/username"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Claim Your Username on ICPay
          </Link>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
        <div>
          Published by <strong className="text-foreground">ICPay Security Team</strong> &middot; September 28, 2026
        </div>
        <div className="flex gap-4">
          <Link href="/transparency" className="font-semibold text-primary hover:underline">
            On-Chain Transparency
          </Link>
          <Link href="/blog" className="font-semibold text-primary hover:underline">
            All Articles
          </Link>
        </div>
      </div>
    </article>
  )
}
