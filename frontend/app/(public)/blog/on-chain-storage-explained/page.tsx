import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { BlogAuthorMeta } from "@/components/blog/blog-author-meta"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "on-chain-storage-explained"
const TITLE = "On-Chain Storage Explained: Architecture, Costs & Why ICP Outperforms Sui, IPFS & Arweave"
const DESCRIPTION =
  "What is on-chain storage? A comprehensive technical guide comparing on-chain vs. off-chain storage, storage economics across Ethereum, Sui (Walrus), Arweave, Filecoin, and why Internet Computer (icBucket) achieves true on-chain HTTP streaming at $5/GB/year."
const PUBLISHED_AT = "2026-10-12"
const READING_MINUTES = 14

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "onchain storage",
    "on-chain storage explained",
    "on chain storage",
    "sui onchain storage",
    "startupik on-chain storage",
    "blockchain cloud storage",
    "icp on-chain storage",
    "icbucket",
    "decentralized storage comparison",
    "walrus sui vs icp",
    "arweave vs icp storage",
    "filecoin vs on-chain storage",
    "smart contract file storage",
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
        url: "https://res.cloudinary.com/dn2ycbmrc/image/upload/v1791780069/onchain_dfcbj6.png",
        width: 1200,
        height: 630,
        alt: "On-Chain Storage Explained: Blockchain State vs Decentralized Blob Storage Architecture",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["https://res.cloudinary.com/dn2ycbmrc/image/upload/v1791780069/onchain_dfcbj6.png"],
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
      name: "What is on-chain storage in blockchain technology?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On-chain storage refers to saving digital data directly into a blockchain's replicated state or smart contract memory. Every consensus validator on the network records, verifies, and preserves the binary data, making it tamper-proof, permanent, and accessible without reliance on centralized third parties or external servers.",
      },
    },
    {
      "@type": "Question",
      name: "How does on-chain storage differ from off-chain decentralized storage like IPFS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "IPFS is a content-addressed routing protocol, not a storage guarantee. IPFS only resolves hashes (CIDs); if nodes stop hosting or pinning the file, the data disappears. In contrast, true on-chain storage commits the actual raw bytes into the blockchain's replicated consensus memory, guaranteeing persistence as long as the smart contract remains active.",
      },
    },
    {
      "@type": "Question",
      name: "How does Sui's storage model (Walrus) compare to Internet Computer (icBucket)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sui stores small transactional state on-chain but offloads larger media and blobs to Walrus, an external protocol that splits data into erasure-coded slivers across dedicated storage nodes with on-chain availability certificates. In contrast, the Internet Computer stores entire gigabyte-scale files directly in 64-bit Wasm stable memory inside canister smart contracts and natively serves HTTP GET requests straight to web browsers without external gateway nodes.",
      },
    },
    {
      "@type": "Question",
      name: "How much does on-chain storage cost on the Internet Computer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On the Internet Computer, on-chain storage costs approximately $5 per gigabyte per year (roughly 0.005 USD per megabyte/year), paid in cycles burned by the canister. In comparison, storing 1 GB on Ethereum costs millions of dollars in gas, and Solana charges significant account rent.",
      },
    },
    {
      "@type": "Question",
      name: "Can web browsers directly load files stored on-chain?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On the Internet Computer, yes. Canisters implement the native http_request interface, allowing boundary nodes to serve standard HTTPS requests directly to HTML img, video, and audio tags without requiring browser extensions, Web3 wallets, or proprietary client SDKs.",
      },
    },
  ],
}

export default function OnChainStorageExplainedPage() {
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
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Architecture & Deep Dive
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Web3 Storage 2026
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
          On-Chain Storage Explained: Architecture, Costs & Why ICP Outperforms Sui, IPFS & Arweave
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed sm:text-lg">
          For years, blockchain developers were told a convenient lie: &quot;Blockchains are for computation and consensus;
          store your files on AWS S3 or IPFS.&quot; In 2026, that compromise is dead. Here is the definitive technical
          breakdown of <strong className="text-foreground">on-chain storage</strong>, how modern blockchain memory models
          work, and why true on-chain object storage is revolutionizing Web3.
        </p>
        <BlogAuthorMeta publishedAt={PUBLISHED_AT} readingMinutes={READING_MINUTES} />
      </header>

      {/* Hero Infographic Card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative w-full overflow-hidden bg-muted/40">
          <Image
            src="https://res.cloudinary.com/dn2ycbmrc/image/upload/v1791780069/onchain_dfcbj6.png"
            alt="On-Chain Storage Explained: Blockchain State vs Decentralized Blob Storage Architecture"
            width={1200}
            height={630}
            className="w-full h-auto object-cover max-h-[500px]"
            unoptimized
            priority
          />
        </div>
        <div className="p-4 bg-muted/20 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>On-Chain Storage Architecture: Smart Contract State vs Decentralized Blob Protocols</span>
          <Link href="/icbucket" className="font-medium text-primary hover:underline">
            Explore icBucket On-Chain Storage &rarr;
          </Link>
        </div>
      </div>

      {/* Quick Definition Callout */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
          Quick Definition: What Is On-Chain Storage?
        </h2>
        <p className="text-sm leading-relaxed text-foreground">
          <strong>On-chain storage</strong> means saving digital data directly into a blockchain&apos;s replicated
          smart contract state or consensus memory. Every full node in the network participates in validating,
          persisting, and cryptographically certifying the data, guaranteeing that the records are permanent,
          censorship-resistant, and verifiable without external databases.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Unlike &quot;off-chain storage with an on-chain hash&quot; (like traditional NFT metadata pointing to AWS or Pinata),
          true on-chain storage ensures that the raw payload itself is governed by smart contract logic and consensus rules.
        </p>
      </div>

      {/* Section 1: The Historical Storage Trilemma */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          1. The Historical Blockchain Storage Trilemma
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          In the first decade of blockchain development, storing large files on-chain was mathematically impossible.
          Blockchains were engineered with a single global state machine that replicated every byte across thousands of
          nodes simultaneously.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">1. Ethereum (EVM)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Storing a single 1 MB image inside an Ethereum contract requires millions of gas units, costing between{" "}
              <strong className="text-foreground">$20,000 to $100,000+</strong> depending on gas prices. EVM storage was
              never designed for arbitrary binary objects.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">2. Solana (Account Rent)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Solana caps account sizes at 10 MB and charges rent exemptions (~0.00089 SOL per byte). While cheaper than
              Ethereum, storing gigabytes of assets incurs high lamport locks and complex account serialization.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">3. Traditional L2s</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Rollups post transaction calldata or EIP-4844 blobs to Ethereum Layer 1, but blob data is ephemeral and
              pruned after ~18 days. Blobs provide data availability for proofs, not permanent storage.
            </p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Because of these limitations, the entire Web3 ecosystem settled for hazardous compromises: IPFS gateways,
          Arweave permaweb, Filecoin deals, and centralized AWS S3 buckets. Let us evaluate how these architectures compare.
        </p>
      </section>

      {/* Section 2: On-Chain vs. Off-Chain vs. Decentralized Blobs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          2. Architectural Breakdown: On-Chain vs. Off-Chain vs. Blob Protocols
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          When analyzing articles like Startupik&apos;s <em>&quot;On-Chain Storage Explained&quot;</em> or Sui&apos;s{" "}
          <em>&quot;All About Onchain Storage,&quot;</em> it is critical to distinguish between three fundamentally
          different storage models:
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border p-5 space-y-2 bg-card">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Model A: Off-Chain Storage with On-Chain Fingerprints (IPFS / S3)</h3>
              <span className="text-xs font-mono bg-destructive/10 text-destructive px-2 py-0.5 rounded">High Fragility</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The smart contract stores only a 32-byte cryptographic hash (like an IPFS CID or an S3 URL). The actual file
              lives on a third-party server or pinning node. If the monthly Pinata subscription lapses or AWS deletes the
              bucket, the hash remains on-chain forever pointing to a 404 dead link. Over 40% of 2021-era NFTs suffer from
              this silent &quot;link rot.&quot;
            </p>
          </div>

          <div className="rounded-xl border p-5 space-y-2 bg-card">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Model B: Decentralized Blob Networks (Sui Walrus / Filecoin / Arweave)</h3>
              <span className="text-xs font-mono bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">Partial Coupling</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Protocols like Sui&apos;s Walrus or Filecoin decouple storage from consensus execution. Files are encoded into
              erasure-coded slivers and distributed across independent storage node providers. The blockchain records
              availability certificates or storage deals. While far better than AWS, retrieval requires specialized SDKs or
              public gateway bridges that can suffer from latency, rate-limiting, and egress costs.
            </p>
          </div>

          <div className="rounded-xl border p-5 space-y-2 bg-card border-primary/40 bg-primary/[0.02]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-primary">Model C: True On-Chain Canister Storage (Internet Computer / icBucket)</h3>
              <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-0.5 rounded">True On-Chain</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              The raw binary data lives directly inside the smart contract&apos;s 64-bit Wasm stable memory (up to 400 GB
              per canister, with multi-terabyte subnet sharding). The canister executes smart contract logic directly over
              the data and serves native HTTP GET requests to web browsers through cryptographic boundary nodes. There are
              no third-party storage nodes, no separate token deals, and no external IPFS gateways.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: The Definitive 2026 Comparison Table */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          3. The 2026 Web3 Storage Comparison Matrix
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Here is how the leading on-chain and decentralized storage protocols compare across cost, architecture, and
          browser performance:
        </p>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b bg-muted/60 text-muted-foreground">
              <tr>
                <th className="p-3 font-semibold">Protocol / Network</th>
                <th className="p-3 font-semibold">Storage Location</th>
                <th className="p-3 font-semibold">Annual Cost (1 GB)</th>
                <th className="p-3 font-semibold">Direct Browser HTTP?</th>
                <th className="p-3 font-semibold">Smart Contract Computable?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-3 font-medium text-foreground">Ethereum (EVM)</td>
                <td className="p-3 text-muted-foreground">Global EVM State</td>
                <td className="p-3 text-destructive font-mono">&gt; $2,000,000</td>
                <td className="p-3 text-destructive">❌ Requires RPC Bridge</td>
                <td className="p-3 text-emerald-500"> Direct EVM</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Solana</td>
                <td className="p-3 text-muted-foreground">Account State</td>
                <td className="p-3 text-destructive font-mono">~$10,000 (Rent lock)</td>
                <td className="p-3 text-destructive">❌ Requires RPC Bridge</td>
                <td className="p-3 text-emerald-500"> Direct Sealevel</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Sui + Walrus</td>
                <td className="p-3 text-muted-foreground">Blob Storage Nodes (Slivers)</td>
                <td className="p-3 text-foreground font-mono">~$2 – $10 (WAL token)</td>
                <td className="p-3 text-amber-500">⚠️ Via Walrus Gateways</td>
                <td className="p-3 text-amber-500">⚠️ Availability certs only</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Arweave</td>
                <td className="p-3 text-muted-foreground">Blockweave (Permaweb)</td>
                <td className="p-3 text-foreground font-mono">~$3 – $8 (One-time AR)</td>
                <td className="p-3 text-amber-500">⚠️ Via arweave.net Gateways</td>
                <td className="p-3 text-destructive">❌ Limited (AO Compute layer)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Filecoin</td>
                <td className="p-3 text-muted-foreground">Storage Miner Deals</td>
                <td className="p-3 text-foreground font-mono">~$0.19 – $2 (FIL deals)</td>
                <td className="p-3 text-destructive">❌ Slow deal retrieval</td>
                <td className="p-3 text-amber-500">⚠️ FVM smart contracts</td>
              </tr>
              <tr className="bg-primary/5 font-semibold">
                <td className="p-3 text-primary">Internet Computer (icBucket)</td>
                <td className="p-3 text-foreground">Canister 64-bit Stable Memory</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-mono">~$5 / year (Cycles)</td>
                <td className="p-3 text-emerald-500 font-medium"> Native (icp0.io / Custom domain)</td>
                <td className="p-3 text-emerald-500 font-medium"> Native Wasm / Motoko execution</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Why Internet Computer is the Breakthrough */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          4. How Internet Computer Solved the On-Chain Storage Dilemma
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The Internet Computer does not treat storage as an afterthought or offload it to an external peer-to-peer network.
          It achieves true on-chain storage through three foundational innovations:
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5 space-y-2">
            <h3 className="text-base font-semibold text-foreground">A. Orthogonal Persistence & 64-bit Stable Memory</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Traditional blockchains require developers to write data to storage variables using expensive key-value stores.
              On ICP, canisters compile to WebAssembly with <strong>orthogonal persistence</strong>. Memory remains in place
              across function calls and canister upgrades. In 2026, individual canisters support up to{" "}
              <strong className="text-foreground">400 GB of 64-bit stable memory</strong>, allowing gigabytes of raw files
              to reside directly inside smart contract state.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-2">
            <h3 className="text-base font-semibold text-foreground">B. The Reverse-Gas Engine</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              On Ethereum or Solana, users pay gas to interact with contracts. On the Internet Computer, developers fund
              their canisters with <strong>Cycles</strong> (pegged to 1 SDR / IMF currency basket, approximately 1 USD per
              trillion cycles). Users can view photos, stream videos, and read documents with zero crypto wallet connections
              and zero gas fees.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-2">
            <h3 className="text-base font-semibold text-foreground">C. Direct HTTP Boundary Node Routing</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every ICP canister implements a native <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">http_request</code> method.
              Global boundary nodes translate incoming web requests directly into canister query calls. When a browser requests:
            </p>
            <div className="rounded-md bg-muted p-3 font-mono text-xs text-foreground overflow-x-auto">
              https://&lt;storage-canister-id&gt;.raw.icp0.io/my-bucket/video.mp4
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The canister streams the bytes directly back with standard HTTP status codes, headers, and media streaming
              support. No intermediaries, no IPFS desktop daemons, and no centralized web servers.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Real-World Use Cases */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          5. Who Needs True On-Chain Storage in 2026?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 space-y-2">
            <h3 className="text-base font-semibold text-foreground">1. Autonomous AI Agents</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Autonomous AI agents cannot sign credit card contracts with Amazon AWS. They need smart-contract-governed
              storage where they can store memory logs, model weights, and execution histories, paying autonomously with
              crypto.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5 space-y-2">
            <h3 className="text-base font-semibold text-foreground">2. Decentralized Social & Creator Platforms</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Platforms like DSCVR, OpenChat, and decentralized video networks need un-censorable media storage where creator
              content cannot be deplatformed by corporate cloud providers or deleted due to expired credit cards.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5 space-y-2">
            <h3 className="text-base font-semibold text-foreground">3. Immortal GameFi & Metaverse Assets</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Game studios storing 3D models, textures, and sound files on-chain ensure that players truly own their assets
              forever, even if the original gaming company ceases operations.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5 space-y-2">
            <h3 className="text-base font-semibold text-foreground">4. Legal & Compliance Provenance</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enterprise contracts, patent filings, and digital evidence stored on-chain receive tamper-proof cryptographic
              consensus timestamps that are mathematically verifiable in court.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: icBucket Developer Integration */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          6. How icBucket Delivers S3-Compatible On-Chain Storage
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          At <strong className="text-foreground">ICPay</strong>, we built <strong>icBucket</strong> to give developers
          the best of both worlds: the familiar developer experience of Amazon S3 combined with the sovereignty and
          permanence of the Internet Computer.
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Scoped API Keys:</strong> Generate granular read/write/delete API keys
            to integrate into your Next.js, Python, or Go backends.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Concurrent Chunk Engine:</strong> Files up to hundreds of megabytes are
            automatically sliced into Candid-optimized chunks and uploaded concurrently.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Predictable $5/GB/year Economics:</strong> Pay directly with ICP or Cycles;
            zero surprise egress bandwidth bills.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Optimistic UI & Subaccount Isolation:</strong> State changes reflect
            instantly with automatic rollback on network failure.
          </li>
        </ul>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3 mt-6">
          <h3 className="text-base font-semibold text-primary">Start Building with On-Chain Object Storage</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ready to decouple your application from centralized cloud providers? Create an on-chain bucket in seconds
            using your Internet Identity.
          </p>
          <div className="pt-2">
            <Link
              href="/icbucket"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Launch Your icBucket Now &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="space-y-4 pt-6 border-t border-border">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Frequently Asked Questions (FAQ)
        </h2>
        <div className="space-y-3">
          {faqJsonLd.mainEntity.map((faq, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">{faq.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{faq.acceptedAnswer.text}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  )
}
