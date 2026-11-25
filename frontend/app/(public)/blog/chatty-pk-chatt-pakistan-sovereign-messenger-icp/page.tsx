import type { Metadata } from "next"
import Link from "next/link"
import { BlogAuthorMeta } from "@/components/blog/blog-author-meta"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"
import { Icon } from "@/components/ui/icon"
import { ShieldGlassIcon, GlobeGlassIcon, LockGlassIcon, ArrowRightGlassIcon } from "@thesvg/ui-react"
import { Button } from "@/components/ui/button"

const SLUG = "chatty-pk-chatt-pakistan-sovereign-messenger-icp"
const TITLE =
  "ChatT (chatty.pk): Inside Pakistan's Sovereign Messenger Built on the Internet Computer (ICP)"
const DESCRIPTION =
  "A technical breakdown of ChatT (chatty.pk), Pakistan's national sovereign messaging platform developed with DFINITY and the Pakistan Digital Authority. How on-chain canisters and the Pakistan Cloud Engine redefine sovereign communication ahead of the December 1, 2026 launch."
const PUBLISHED_AT = "2026-11-25"
const READING_MINUTES = 10

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "ChatT Pakistan",
    "chatty.pk",
    "chatty pk",
    "Pakistan sovereign messenger",
    "Pakistan Digital Authority DFINITY",
    "Internet Computer Pakistan Cloud Engine",
    "OpenChat Pakistan",
    "decentralized messaging app Pakistan",
    "ICP sovereign cloud",
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
      name: "What is ChatT (chatty.pk)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ChatT (hosted at chatty.pk) is Pakistan's sovereign digital messaging and communications application. Developed in strategic collaboration between the Pakistan Digital Authority (PDA) and the DFINITY Foundation, it runs 100% on-chain on the Internet Computer (ICP) blockchain network without relying on foreign cloud providers.",
      },
    },
    {
      "@type": "Question",
      name: "When does ChatT launch?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Following the memorandum of understanding between the Pakistan Digital Authority and DFINITY, ChatT enters its closed beta rollout on December 1, 2026, ahead of nationwide general availability.",
      },
    },
    {
      "@type": "Question",
      name: "How does the Pakistan Cloud Engine host ChatT locally?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ChatT runs on a dedicated sovereign subnet within the Internet Computer known as the Pakistan Cloud Engine. Physical node machines are operated by independent node providers situated within Pakistan's borders, ensuring full statutory compliance with national data localization and sovereignty mandates while maintaining decentralized consensus.",
      },
    },
    {
      "@type": "Question",
      name: "How does ChatT handle user privacy and authentication?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ChatT utilizes Internet Identity for biometric authentication via WebAuthn passkeys, eliminating passwords and phone-number SIM tracking. All chats feature end-to-end encryption with zero advertisements and zero tracking cookies.",
      },
    },
  ],
}

export default function ChattyPkBlogPage() {
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Sovereign Infrastructure
          </span>
          <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Breaking · December 1, 2026 Launch
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          {TITLE}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          <strong className="text-foreground">ChatT</strong> (accessible via{" "}
          <Link href="https://chatty.pk" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
            chatty.pk
          </Link>
          ) is Pakistan&apos;s groundbreaking national sovereign communication platform, built entirely on the
          Internet Computer (ICP) blockchain in partnership with the{" "}
          <strong className="text-foreground">Pakistan Digital Authority (PDA)</strong> and the{" "}
          <strong className="text-foreground">DFINITY Foundation</strong>. Launching its closed beta on{" "}
          <strong className="text-foreground">December 1, 2026</strong>, ChatT replaces centralized Big Tech
          messaging apps with a 100% on-chain, end-to-end encrypted architecture hosted on the dedicated
          Pakistan Cloud Engine.
        </p>
        <BlogAuthorMeta publishedAt={PUBLISHED_AT} readingMinutes={READING_MINUTES} />
      </header>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Icon icon={GlobeGlassIcon} className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Project Overview: ChatT (chatty.pk)</h2>
            <p className="text-xs text-muted-foreground">National Sovereign Messenger · Beta Launch: December 1, 2026</p>
          </div>
        </div>

        <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1">
            <span className="text-muted-foreground">Platform</span>
            <p className="text-base font-bold text-foreground">ChatT (chatty.pk)</p>
            <p className="text-[11px] text-muted-foreground">Sovereign Messaging App</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1">
            <span className="text-muted-foreground">Consensus Layer</span>
            <p className="text-base font-bold text-primary">Internet Computer</p>
            <p className="text-[11px] text-muted-foreground">WASM Canister Contracts</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1">
            <span className="text-muted-foreground">Hosting Infrastructure</span>
            <p className="text-base font-bold text-foreground">Pakistan Cloud Engine</p>
            <p className="text-[11px] text-muted-foreground">Local domestic subnets</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1">
            <span className="text-muted-foreground">Institutional Backing</span>
            <p className="text-base font-bold text-foreground">PDA & DFINITY</p>
            <p className="text-[11px] text-muted-foreground">Official GovTech initiative</p>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          1. What is ChatT (chatty.pk)?
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          For years, developing nations have faced a severe digital sovereignty dilemma: critical citizen communications,
          government coordination, and private messaging have relied almost exclusively on foreign-controlled corporate
          monopolies such as WhatsApp, Telegram, and Signal. These platforms store user metadata on foreign cloud servers,
          comply with foreign court orders, and are vulnerable to international cable disruptions, policy changes, and sudden
          service throttling.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">ChatT</strong> represents Pakistan&apos;s answer to this vulnerability.
          Announced through a formal alliance between the <strong className="text-foreground">Pakistan Digital Authority (PDA)</strong> and
          the <strong className="text-foreground">DFINITY Foundation</strong>, ChatT provides a sovereign alternative engineered
          from the ground up to operate without centralized intermediaries, proprietary database engines, or commercial advertising trackers.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          2. The Architecture: How the Pakistan Cloud Engine Operates on ICP
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Traditional blockchain networks cannot host high-frequency consumer applications like real-time messaging due to
          exorbitant gas fees, low throughput, and block confirmation latency. The Internet Computer solves this through its
          unique reverse-gas model, sub-second finality, and canister smart contract architecture.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          To satisfy Pakistan&apos;s national data residency and sovereignty requirements, ChatT leverages a specialized
          deployment architecture:
        </p>

        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Icon icon={GlobeGlassIcon} className="size-4 text-primary" />
              <span>The Pakistan Cloud Engine (Sovereign Subnet)</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              DFINITY&apos;s subnet architecture allows dedicated subnets to be formed from physical hardware nodes situated
              within specific geographic boundaries. The Pakistan Cloud Engine utilizes validated local node machines across
              Pakistani tier-3/tier-4 data centers, guaranteeing that raw state replication remains domestically anchored.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Icon icon={LockGlassIcon} className="size-4 text-primary" />
              <span>Canister-Level Isolation & OpenChat Roots</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Drawing architectural heritage from decentralized ecosystems like OpenChat, each chat room, user profile,
              and message index in ChatT is partitioned across smart contract canisters running compiled WebAssembly (WASM).
              Messages execute under consensus, preventing database tampering, silent deletions, or unauthorized message injection.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          3. Privacy & Authentication: Eliminating Phone Number Tracking
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A fundamental weakness of mainstream messengers like WhatsApp and Telegram is their reliance on phone numbers
          for identity. Phone numbers are vulnerable to SIM swapping, telecommunication tracking, and IMSI catchers.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ChatT integrates <strong className="text-foreground">Internet Identity</strong>:
        </p>
        <ul className="space-y-2.5 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">WebAuthn / FIDO2 Hardware Passkeys:</strong> Users authenticate using their
            device biometric sensors (Face ID, Touch ID, Windows Hello, or hardware security keys). No plaintext passwords
            are stored or transmitted.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Cryptographic Subaccount Identities:</strong> User accounts are derived from
            cryptographic keypairs. Even if a central telecommunication network is disrupted, identity proofs remain
            cryptographically valid.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Zero Metadata Surveillance:</strong> Because there are no commercial
            advertising engines, ChatT does not harvest user social graphs, location tags, or communication intervals.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          4. Comparison: ChatT vs. WhatsApp vs. Telegram
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Here is how ChatT compares directly with legacy corporate communication channels:
        </p>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-foreground font-semibold border-b border-border">
              <tr>
                <th className="p-3.5">Architecture Feature</th>
                <th className="p-3.5">ChatT (chatty.pk)</th>
                <th className="p-3.5">WhatsApp (Meta)</th>
                <th className="p-3.5">Telegram</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-muted-foreground">
              <tr>
                <td className="p-3.5 font-medium text-foreground">Infrastructure</td>
                <td className="p-3.5 text-primary font-medium">100% On-Chain Canisters (ICP)</td>
                <td className="p-3.5">Proprietary Meta Cloud (US)</td>
                <td className="p-3.5">Proprietary MTProto Servers</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-foreground">Data Residency</td>
                <td className="p-3.5 text-primary font-medium">Pakistan Cloud Engine (Domestic)</td>
                <td className="p-3.5">US & International Data Centers</td>
                <td className="p-3.5">Distributed International Cloud</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-foreground">Authentication</td>
                <td className="p-3.5 text-primary font-medium">Biometric Passkey (Internet Identity)</td>
                <td className="p-3.5">Phone Number / SMS (SIM risk)</td>
                <td className="p-3.5">Phone Number / SMS (SIM risk)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-foreground">Monetization / Ads</td>
                <td className="p-3.5 text-primary font-medium">Zero Ads (Sovereign Utility)</td>
                <td className="p-3.5">Targeted Meta Ad Tracking</td>
                <td className="p-3.5">Sponsored Ads & Premium Tiers</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-foreground">Auditability</td>
                <td className="p-3.5 text-foreground">Public WASM bytecode & verifiable execution</td>
                <td className="p-3.5">Closed-source backend servers</td>
                <td className="p-3.5">Closed-source backend servers</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          5. The Sovereign Cloud Stack: How ChatT, ICPay, and icBucket Connect
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The emergence of ChatT demonstrates the maturity of the Internet Computer as a full-stack, enterprise-grade
          alternative to legacy cloud infrastructure. A modern sovereign digital society requires three core primitives:
        </p>

        <div className="space-y-3">
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-1.5 text-xs">
            <h4 className="font-bold text-foreground">1. Sovereign Communication: ChatT (chatty.pk)</h4>
            <p className="text-muted-foreground leading-relaxed">
              Provides real-time voice, video, and text messaging running on autonomous smart contracts, shielded
              from foreign surveillance and server downtime.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-1.5 text-xs">
            <h4 className="font-bold text-foreground">2. Sovereign Financial Layer: ICPay Protocol</h4>
            <p className="text-muted-foreground leading-relaxed">
              Provides custodial payments, human-readable username transfers (e.g., <code>@username</code> instead of 63-character addresses),
              and subaccount isolation secured natively by Internet Identity.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-1.5 text-xs">
            <h4 className="font-bold text-foreground">3. Sovereign Cloud Storage: icBucket</h4>
            <p className="text-muted-foreground leading-relaxed">
              Provides S3-compatible decentralized cloud storage with flat annual pricing and zero data transfer out fees ($0.00 egress),
              enabling apps to store terabytes of encrypted media completely on-chain.
            </p>
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Icon icon={ShieldGlassIcon} className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Join the Sovereign On-Chain Revolution</h3>
            <p className="text-xs text-muted-foreground">
              Experience zero-egress decentralized cloud storage and username-based crypto custody on the Internet Computer.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            nativeButton={false}
            render={<Link href="/icbucket" />}
            className="rounded-full px-5 text-xs font-semibold"
          >
            Deploy S3 Storage on icBucket
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/login" />}
            className="gap-1.5 rounded-full px-4 text-xs font-medium"
          >
            <span>Open ICPay Account</span>
            <Icon icon={ArrowRightGlassIcon} className="size-3.5" />
          </Button>
        </div>
      </div>

      <section className="space-y-3 border-t border-border/40 pt-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Related Sovereign Architecture Reading</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link
              href="/blog/2-tib-subnets-enterprise-cloud-engines-on-chain-storage"
              className="underline underline-offset-2 hover:text-foreground"
            >
              The 2 TiB Subnet Milestone & Enterprise Cloud Engines: Sovereign Storage Explained
            </Link>
          </li>
          <li className="list-disc">
            <Link
              href="/blog/sovereign-cloud-vs-aws-web3"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Sovereign Cloud vs. AWS: Why Web3 Infrastructure Is Moving On-Chain
            </Link>
          </li>
          <li className="list-disc">
            <Link
              href="/blog/what-is-internet-identity"
              className="underline underline-offset-2 hover:text-foreground"
            >
              What is Internet Identity? The Passwordless Biometric Standard for Web3
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
