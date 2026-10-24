import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { BlogAuthorMeta } from "@/components/blog/blog-author-meta"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "dfinity-near-patent-dispute-threshold-ecdsa-chain-signatures-intents"
const TITLE =
  "DFINITY vs. NEAR: The Cryptographic Patent Dispute Over Chain Signatures, Threshold ECDSA, and Confidential Intents Explained"
const DESCRIPTION =
  "A comprehensive technical and architectural breakdown of Dominic Williams' allegations against NEAR Protocol. We examine US Patent 12,695,626 (re-randomized threshold ECDSA presignatures by Groth & Shoup), the Confidential Key Derivation vs. vetKeys dispute, the permissioned FAR network powering NEAR Confidential Intents, and what this high-stakes IP battle means for multichain chain abstraction."
const PUBLISHED_AT = "2026-10-24"
const READING_MINUTES = 15

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "dfinity vs near",
    "dominic williams near protocol",
    "near chain signatures patent",
    "patent 12695626",
    "digital signatures with re-randomized presignatures",
    "jens groth victor shoup threshold ecdsa",
    "near confidential intents far",
    "icp chain-key cryptography vs near mpc",
    "vetkeys vs confidential key derivation",
    "chain abstraction intellectual property",
    "threshold signature patent dispute",
    "dfinity stiftung patent infringement",
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
        url: "https://res.cloudinary.com/dn2ycbmrc/image/upload/v1792815999/Unknown_alxwrq.png",
        width: 1200,
        height: 630,
        alt: "DFINITY vs NEAR Cryptographic Patent Dispute Over Chain Signatures and Threshold ECDSA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["https://res.cloudinary.com/dn2ycbmrc/image/upload/v1792815999/Unknown_alxwrq.png"],
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
      name: "What are Dominic Williams' core allegations against NEAR Protocol?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dominic Williams, Founder and Chief Scientist of DFINITY, publicly alleged that NEAR Protocol built its flagship Chain Signatures and NEAR Intents technologies using proprietary, patented threshold cryptography invented by DFINITY cryptographers Dr. Jens Groth and Dr. Victor Shoup. He cited granted US Patent 12,695,626 covering threshold ECDSA with re-randomized presignatures, alleged that NEAR copied non-public implementations brought over by a former DFINITY employee, and criticized NEAR's Confidential Intents for relying on a permissioned private network called FAR rather than decentralized cryptography.",
      },
    },
    {
      "@type": "Question",
      name: "What is US Patent 12,695,626 and why is it significant?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "US Patent 12,695,626, titled 'Digital signatures with re-randomized presignatures', was granted on July 28, 2026, and assigned to DFINITY Stiftung. The patent covers an asynchronous threshold ECDSA protocol that precomputes cryptographic presignatures, re-randomizes them to eliminate linkage and side-channel leakage, and enables rapid on-demand signature synthesis under additive non-interactive child key derivation. This protocol serves as the mathematical foundation for Internet Computer's Chain-Key technology, enabling canisters to sign Bitcoin, Ethereum, and other transactions natively.",
      },
    },
    {
      "@type": "Question",
      name: "How does NEAR's Chain Signatures compare to ICP's Chain-Key Cryptography?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "While both systems aim to achieve cross-chain interoperability and chain abstraction without custodial bridges, their architectures diverge fundamentally. ICP's Chain-Key cryptography is integrated directly into the core consensus layer of public decentralized subnets (13 to 34 sovereign hardware nodes), executing via deterministic on-chain canister calls with proactive secret sharing and reverse-gas billing. NEAR Chain Signatures operates as an external multi-party computation (MPC) network running separate nodes that relay signatures back to the NEAR blockchain.",
      },
    },
    {
      "@type": "Question",
      name: "What is the controversy surrounding NEAR's Confidential Intents and the FAR network?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NEAR promoted Confidential Intents as an MEV-shielded privacy solution for cross-chain execution. However, architectural reviews highlighted by Dominic Williams revealed that these confidential intents execute on an external permissioned consortium chain called FAR (Financial Application Runtime). Because FAR is operated by a small, closed set of permissioned nodes rather than a decentralized public consensus, critics argue that the privacy guarantees depend on trusting private operators rather than verifiable on-chain zero-knowledge or threshold encryption.",
      },
    },
    {
      "@type": "Question",
      name: "How does NEAR's Confidential Key Derivation relate to ICP's vetKeys?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dominic Williams pointed out strong conceptual and mathematical overlaps between NEAR's newly promoted Confidential Key Derivation (CKD) and DFINITY's vetKeys (Verifiable Encrypted Threshold Keys) framework. vetKeys allows on-chain canisters to provide verifiable threshold identity-based encryption and private key shares without exposing plaintext secret keys to node operators, representing a critical primitive for confidential on-chain computation.",
      },
    },
    {
      "@type": "Question",
      name: "What does this patent dispute mean for developers building cross-chain applications?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For developers and institutions evaluating chain abstraction stacks, the dispute underscores the importance of IP diligence and underlying security assumptions. Protocols relying on NEAR Chain Signatures may face legal uncertainties if formal patent enforcement actions are initiated, while also depending on external MPC relayers. In contrast, ICP's Chain-Key infrastructure offers native, patent-cleared, battle-tested threshold signing that has secured billions of dollars in Bitcoin (ckBTC) and Ethereum (ckETH) on mainnet without bridges.",
      },
    },
  ],
}

export default function DfinityVsNearPatentDisputePage() {
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
            Security &amp; Cryptography
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            October 2026 Analysis
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
          DFINITY vs. NEAR: The Cryptographic Patent Dispute Over Chain Signatures, Threshold ECDSA, and Confidential Intents Explained
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed sm:text-lg">
          In late October 2026, Dominic Williams, Founder and Chief Scientist of DFINITY, published an exhaustive exposé
          accusing NEAR Protocol of deploying proprietary and patented threshold cryptography to power NEAR Intents and Chain
          Signatures. From granted US Patent 12,695,626 to the permissioned architecture of the FAR network and vetKeys
          overlaps, here is the complete technical and architectural breakdown of the most significant intellectual property
          conflict in modern Web3.
        </p>
        <BlogAuthorMeta publishedAt={PUBLISHED_AT} readingMinutes={READING_MINUTES} />
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative w-full overflow-hidden bg-muted/40">
          <Image
            src="https://res.cloudinary.com/dn2ycbmrc/image/upload/v1792815999/Unknown_alxwrq.png"
            alt="DFINITY vs NEAR Cryptographic Patent Dispute Over Chain Signatures and Threshold ECDSA"
            width={1200}
            height={630}
            className="w-full h-auto object-cover max-h-[500px]"
            unoptimized
            priority
          />
        </div>
        <div className="p-4 bg-muted/20 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Chain-Key Cryptography vs. External MPC Relayers: The Battle for Chain Abstraction</span>
          <Link href="/token/create" className="font-medium text-primary hover:underline">
            Launch On-Chain ICRC Tokens with ICPay &rarr;
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
          Executive Summary: The Core Points of the Dispute
        </h2>
        <p className="text-sm leading-relaxed text-foreground">
          On October 22–24, 2026, DFINITY Founder Dominic Williams sparked a major industry debate by publicly alleging that
          NEAR Protocol&apos;s celebrated Chain Signatures and NEAR Intents products rely on threshold ECDSA algorithms
          invented by DFINITY cryptographers Dr. Jens Groth and Dr. Victor Shoup. The claims center on granted US Patent
          12,695,626, additive non-interactive child key derivation, alleged code and personnel transfers, similarities
          between NEAR&apos;s Confidential Key Derivation and ICP&apos;s vetKeys, and the architectural disclosure that
          NEAR&apos;s Confidential Intents execute on a permissioned private network named FAR rather than decentralized on-chain
          consensus.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          1. The Origins of the Conflict: Dominic Williams&apos; Exposé
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The public dispute erupted when Dominic Williams published a long-form article titled <em>&ldquo;New discovery:
          NEAR Intents is based on proprietary DFINITY tech&rdquo;</em> on X, detailing what he described as a systematic
          appropriation of DFINITY&apos;s core cryptographic breakthroughs over a 2.5-year timeline.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          For years, threshold digital signature algorithms for elliptic curves—most notably ECDSA (used by Bitcoin,
          Ethereum, and standard EVM chains) and Ed25519/Schnorr (used by Solana, Cardano, and Polkadot)—represented one of the
          most notorious open problems in computer science. Standard ECDSA requires a non-linear ephemeral nonce inversion
          operation during signing (<code>k⁻¹ (z + r · d) mod n</code>), making distributed multi-party computation
          inherently slow, communication-heavy, and susceptible to abort attacks in asynchronous networks.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          To solve this for the Internet Computer, DFINITY assembled a cryptographic research team including Dr. Jens
          Groth—the world-renowned cryptographer who invented the Groth16 zero-knowledge proof system underpinning zk-SNARKs—and
          Dr. Victor Shoup, co-inventor of the Cramer-Shoup cryptosystem and pioneer of practical threshold RSA signatures.
          Together, they engineered a novel protocol for asynchronous threshold ECDSA that unlocked fast, decentralized on-chain
          signing without exposing master secret keys.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          According to Williams, this foundational research was brought to NEAR Protocol following the departure of a former
          DFINITY employee, leading to the deployment of NEAR&apos;s Multichain MPC network and subsequently NEAR Intents.
          Williams argued that while academic preprints were published for peer review, commercial rights were legally reserved
          under exclusive patents owned by DFINITY Stiftung to protect the Internet Computer ecosystem.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          2. Anatomy of the Patent: US 12,695,626 Explained
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          At the center of the legal allegations lies United States Patent <strong>US 12,695,626</strong>, granted on July 28,
          2026, and officially titled <em>&ldquo;Digital signatures with re-randomized presignatures&rdquo;</em> (available
          publicly on Justia Patents). The patent lists DFINITY Stiftung as the sole assignee.
        </p>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-base font-semibold text-foreground">The Four Pillars of Patent US 12,695,626</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/40 p-4 border border-border/60 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">1. Asynchronous Presignature Generation</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nodes cooperatively generate raw presignatures in the background during idle consensus cycles before any
                transaction message is requested. This decouples computationally heavy multi-party multiplication from the
                user&apos;s real-time signing latency.
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 p-4 border border-border/60 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">2. Cryptographic Re-Randomization</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Before combining shares into a final signature, presignatures undergo non-interactive re-randomization. This
                mathematically prevents side-channel correlation attacks, timing analysis, and malicious linkage across derived
                keys.
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 p-4 border border-border/60 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">3. Additive Child Key Derivation</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Allows any canister or smart contract to non-interactively derive virtually infinite child public keys and
                blockchain addresses (BIP-32 style) from a single master threshold key without requiring node communication
                or resharding.
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 p-4 border border-border/60 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">4. Sub-Second Online Synthesis</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When a contract requests an ECDSA signature for a message hash, nodes perform a single, fast linear
                combination round using an available precomputed presignature, completing the cryptographic signature in a
                fraction of a second.
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Williams asserted that NEAR Protocol&apos;s Chain Signatures implementation mirrors these exact claims step for step,
          relying on the Groth-Shoup re-randomized presignature pipeline to produce ECDSA signatures across external networks
          like Bitcoin, Ethereum, and Cosmos.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          3. Architectural Contrast: ICP Chain-Key Cryptography vs. NEAR Chain Signatures
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Beyond intellectual property claims, the debate highlighted fundamental differences between how the Internet
          Computer and NEAR execute cross-chain threshold signatures in production.
        </p>

        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/50 text-foreground font-semibold">
              <tr>
                <th className="p-3">Architectural Dimension</th>
                <th className="p-3 text-primary font-bold">Internet Computer (Chain-Key tECDSA)</th>
                <th className="p-3 text-amber-500 font-bold">NEAR Protocol (Chain Signatures MPC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-muted-foreground">
              <tr>
                <td className="p-3 font-medium text-foreground">Consensus Integration</td>
                <td className="p-3">Native protocol-level integration inside Subnet State Machines. No external relayers.</td>
                <td className="p-3">Separate external Multi-Party Computation (MPC) cluster relaying calls to the NEAR contract.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Node Hardware &amp; Security</td>
                <td className="p-3">13 to 34 sovereign hardware nodes running in independent tier-3/4 data centers governed by NNS.</td>
                <td className="p-3">Consortium of multi-party computation signers hosted primarily on commercial cloud servers.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Secret Sharing Maintenance</td>
                <td className="p-3">Autonomous Proactive Secret Sharing (PSS): secret key shares are reshuffled periodically without changing the public key.</td>
                <td className="p-3">Static or manual key rotation cycles across active MPC participant nodes.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Supported Curves</td>
                <td className="p-3">secp256k1 (tECDSA for Bitcoin, Ethereum) and Ed25519 (tSchnorr for Solana, Cardano, Polkadot).</td>
                <td className="p-3">secp256k1 (tECDSA) with ongoing development for Ed25519 support.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Gas &amp; Economic Model</td>
                <td className="p-3">Reverse-gas model paid in Cycles by canister developers. End users pay 0 gas fees for signatures.</td>
                <td className="p-3">Users pay NEAR network transaction gas plus secondary execution fees to external relayer networks.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Production Mainnet Track Record</td>
                <td className="p-3">Live on mainnet since 2022; secures over $100M+ in native ckBTC, ckETH, and ckSOL with 0 bridge hacks.</td>
                <td className="p-3">Launched in 2024 as part of NEAR&apos;s chain abstraction initiative and expanded into NEAR Intents in 2026.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          4. The FAR Network Controversy: Is &ldquo;Confidential Intents&rdquo; Truly Decentralized?
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          One of the sharpest technical critiques in Dominic Williams&apos; exposé focused not on patents, but on the trust
          assumptions of NEAR&apos;s newly promoted <strong>Confidential Intents</strong>.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Marketed as an MEV-protected, front-running-immune solution for cross-chain intent swaps, Confidential Intents claims
          to keep user swap parameters, trade sizes, and slippage thresholds completely private until orders are settled.
          However, Williams cited technical engineering reviews demonstrating that these confidential orders do not execute on
          NEAR&apos;s public, decentralized blockchain.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Instead, execution is offloaded to a separate permissioned consortium environment known as <strong>FAR (Financial
          Application Runtime)</strong>.
        </p>

        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-destructive">
            The Centralization Trap: FAR Architecture Critique
          </h3>
          <ul className="space-y-2 text-sm text-foreground">
            <li className="flex items-start gap-2">
              <span className="text-destructive font-bold">•</span>
              <span>
                <strong>Permissioned Private Cluster:</strong> The FAR network runs on a small, closed group of permissioned
                validator nodes operated by designated corporate partners, rather than open, permissionless proof-of-stake validators.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive font-bold">•</span>
              <span>
                <strong>Trust-Based Privacy:</strong> Confidentiality in FAR is not enforced by trustless zero-knowledge proofs
                or mathematically verified on-chain threshold encryption. Instead, users must trust that the private node
                operators will not inspect, collude, or leak their private trade intents before on-chain execution.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive font-bold">•</span>
              <span>
                <strong>Regulatory &amp; Subpoena Exposure:</strong> Because FAR operators are identifiable entities running in
                permissioned setups, they face legal vulnerability to regulatory demands, data interception, and court-ordered
                disclosure, compromising the censorship-resistance promised by Web3.
              </span>
            </li>
          </ul>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          In contrast, on the Internet Computer, all Chain-Key operations occur within public subnets managed by the
          decentralized Network Nervous System (NNS). Every byte of canister execution and state transition is verified by
          consensus across independent global data centers, eliminating reliance on private side-channel consortiums.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          5. vetKeys vs. Confidential Key Derivation (CKD)
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The controversy deepened further when Dominic Williams drew parallels between NEAR&apos;s newly unveiled
          <strong>Confidential Key Derivation (CKD)</strong> proposal and DFINITY&apos;s pioneering <strong>vetKeys (Verifiable
          Encrypted Threshold Keys)</strong> framework.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          On public blockchains, data is by definition visible to every validating node. Storing sensitive user data—such as
          medical records, private financial messages, or autonomous AI agent keys—requires a mechanism where the smart
          contract can encrypt data for a specific identity without the nodes ever learning the underlying decryption key.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          DFINITY developed <strong>vetKeys</strong> to solve this using threshold identity-based encryption (IBE). In vetKeys,
          the subnet holds shares of a master secret key. When a user requests their decryption key, nodes generate encrypted
          decryption key shares that only the authenticated user can combine using their private transport key. At no point
          can any node operator, canister developer, or eavesdropper inspect the plaintext key.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Williams pointed out that NEAR&apos;s marketing of Confidential Key Derivation mirrors the architectural principles
          and mathematical mechanics that DFINITY open-sourced through academic whitepapers and developer presentations over the
          past two years, arguing that another pillar of ICP&apos;s privacy roadmap was being rebranded without attribution or
          licensing.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          6. The Industry Debate: Open Source Research vs. Patent Protection
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The clash has ignited fierce discussion across the broader Web3 ecosystem, pitting traditional open-source crypto
          ethos against corporate intellectual property rights.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-base font-semibold text-foreground">The NEAR &amp; Open-Source Defense</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>
                  <strong>Academic Research is Public Domain:</strong> Proponents argue that cryptographic papers published on
                  ePrint and arXiv are meant for the advancement of the entire blockchain industry.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>
                  <strong>Independent Re-implementation:</strong> NEAR community members assert that writing clean-room code
                  based on public cryptographic formulas does not constitute illegal theft.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>
                  <strong>Skepticism of Crypto Patents:</strong> Many Web3 developers express philosophical opposition to software
                  patents in general, warning that patent wars will stifle decentralization and cross-chain innovation.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-base font-semibold text-foreground">The DFINITY &amp; Institutional Position</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Academic Publication ≠ Commercial License:</strong> Publishing a scientific paper for peer review does
                  not grant commercial competitors permission to infringe on registered patents.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Massive R&amp;D Investment:</strong> DFINITY spent tens of millions of dollars employing world-class
                  cryptographers to solve unsolvable problems; allowing funded competitors to take it without licensing undermines
                  foundational research.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Downstream Legal Risk:</strong> Third-party dApps, exchanges, and institutions utilizing infringing
                  technology could potentially face legal liability or patent injunctions.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          7. What Builders &amp; Enterprises Need to Know
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          For developers building cross-chain DeFi applications, autonomous AI agents, and non-custodial wallets, the
          dispute offers essential architectural and legal takeaways:
        </p>
        <ol className="list-decimal pl-5 space-y-3 text-sm text-muted-foreground">
          <li>
            <strong>Verifiable Security Trumps Marketing:</strong> Trust-minimized threshold signatures require genuine
            decentralization across independent hardware nodes. Offloading critical signing or intent routing to private
            consortium networks re-introduces the centralized honeypots that blockchain was created to replace.
          </li>
          <li>
            <strong>Intellectual Property Diligence:</strong> As crypto infrastructure matures, patents granted in key
            jurisdictions like the US, Switzerland, and the EU carry real commercial weight. Projects must audit the licensing
            provenance of the cryptographic libraries they embed into their smart contracts.
          </li>
          <li>
            <strong>ICP Remains the Gold Standard for Chain-Key Interoperability:</strong> With over four years of battle-tested
            mainnet operation, native support for Bitcoin, Ethereum, and Solana, and patent-cleared threshold cryptography,
            Internet Computer provides the most robust, decentralized foundation for multichain chain abstraction.
          </li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqJsonLd.mainEntity.map((faq, index) => (
            <div key={index} className="rounded-xl border border-border bg-card p-5 space-y-2">
              <h3 className="text-base font-semibold text-foreground">{faq.name}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{faq.acceptedAnswer.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          Experience True Sovereign Chain-Key Cryptography on ICPay
        </h2>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground leading-relaxed">
          ICPay leverages the Internet Computer&apos;s native, patent-cleared Chain-Key cryptography to deliver instant,
          gasless crypto payments, decentralized token launches, and on-chain cloud storage without custodial bridges or
          private relayer networks.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/token/create"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Create ICRC-1 Token
          </Link>
          <Link
            href="/icbucket"
            className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Explore icBucket Storage
          </Link>
        </div>
      </div>
    </article>
  )
}
