export type BlogPost = {
  slug: string
  title: string
  description: string
  publishedAt: string
  readingMinutes: number
  category?: string
}

export function blogPostPath(slug: string): string {
  const name = slug.startsWith("blog/") ? slug.slice("blog/".length) : slug
  return `/blog/${name}`
}

export function sortedBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export function blogCategories(): string[] {
  const categories = new Set<string>()
  for (const post of BLOG_POSTS) {
    if (post.category) categories.add(post.category)
  }
  return Array.from(categories).sort((a, b) => a.localeCompare(b))
}

export function filterBlogPostsByCategory(posts: BlogPost[], category: string): BlogPost[] {
  if (category === "all") return posts
  return posts.filter((post) => post.category === category)
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "icpay-changelog",
    title: "ICPay v1.7.0 Changelog: Introducing icCron Autonomous Scheduler, Dead Letter Queues & On-Chain Automation",
    description:
      "Explore the major updates in ICPay v1.7.0: The launch of icCron, our decentralized autonomous cron and webhook dispatcher running natively on Internet Computer canister timers. Featuring sub-second precision, O(1) bitmask scheduling, Dead Letter Queues, and 99.4% cycle savings over legacy heartbeats.",
    publishedAt: "2026-11-12",
    readingMinutes: 12,
    category: "Product",
  },
  {
    slug: "icpay-github-details",
    title: "Inside the ICPay GitHub Repository: Codebase Architecture, 641 Commits, and 311K+ Lines of Decentralized Code",
    description:
      "A transparent architectural deep dive into the official ICPay open-source repository on GitHub. Explore repository metrics, 641 commits across 69 active development days, 311,769 lines of code spanning Next.js, Motoko, and Rust, and how we build enterprise-grade custodial Web3 infrastructure on the Internet Computer.",
    publishedAt: "2026-11-12",
    readingMinutes: 11,
    category: "Technology",
  },
  {
    slug: "bypassing-vercel-cron-tax-decentralized-scheduler",
    title: "Bypassing the Vercel $20/Month Cron Tax: How to Trigger Next.js Scheduled Jobs with Decentralized On-Chain Timers",
    description:
      "A hands-on architectural guide to eliminating Vercel's $20/month per seat Pro plan requirement for sub-daily cron jobs. Discover how to trigger Next.js route handlers with sub-second precision, threshold-signed HTTPS outcalls, automated retries, and zero server maintenance using icCron on the Internet Computer for just $0.36/month.",
    publishedAt: "2026-11-12",
    readingMinutes: 14,
    category: "Developers",
  },
  {
    slug: "dfinity-near-patent-dispute-threshold-ecdsa-chain-signatures-intents",
    title: "DFINITY vs. NEAR: The Cryptographic Patent Dispute Over Chain Signatures, Threshold ECDSA, and Confidential Intents Explained",
    description:
      "A comprehensive technical and architectural breakdown of Dominic Williams' allegations against NEAR Protocol. We examine US Patent 12,695,626 (re-randomized threshold ECDSA presignatures by Groth & Shoup), the Confidential Key Derivation vs. vetKeys dispute, the permissioned FAR network powering NEAR Confidential Intents, and what this high-stakes IP battle means for multichain chain abstraction.",
    publishedAt: "2026-10-24",
    readingMinutes: 15,
    category: "Security",
  },
  {
    slug: "2-tib-subnets-enterprise-cloud-engines-on-chain-storage",
    title: "The 2 TiB Subnet Milestone & Enterprise Cloud Engines: Why 2026 Marks the Turning Point for On-Chain Storage",
    description:
      "DFINITY's expansion to 2 TiB replicated state per subnet and the launch of Enterprise Cloud Engines have fundamentally redefined decentralized cloud infrastructure. Here is an in-depth architectural breakdown of on-chain state replication, the ShadowBridge migration protocol, the Mission 70 deflationary burn flywheel, and how icBucket delivers true sovereign S3-compatible storage.",
    publishedAt: "2026-10-19",
    readingMinutes: 14,
    category: "Infrastructure",
  },
  {
    slug: "cloud-storage-pricing-comparison-2026",
    title: "Cloud Storage Pricing Comparison 2026: AWS vs Google vs Azure vs ICBucket",
    description:
      "Complete 2026 cloud storage pricing comparison guide. We break down storage costs, hidden egress bandwidth fees, request charges, and compare AWS S3, Google Cloud Storage, Microsoft Azure Blob, and on-chain ICBucket.",
    publishedAt: "2026-10-12",
    readingMinutes: 14,
    category: "Infrastructure",
  },
  {
    slug: "file-upload-api-s3-compatible",
    title: "File Upload API 2026: S3-Compatible SDK & Direct Cloudinary Alternative | ICBucket",
    description:
      "Looking for a fast, reliable file upload API? Meet icpay-bucket: the S3-compatible TypeScript and Python SDK for on-chain cloud storage on the Internet Computer. Zero egress fees, chunked uploads, and instant public CDN delivery.",
    publishedAt: "2026-10-12",
    readingMinutes: 12,
    category: "Developers",
  },
  {
    slug: "best-s3-compatible-storage-aws-pricing-alternative",
    title: "Best S3 Compatible Storage 2026: AWS S3 Pricing Alternative & Cloud Cost Comparison",
    description:
      "Looking for the best S3-compatible storage and AWS S3 pricing alternative? We compare AWS S3 cost, Google Cloud Storage, Azure Blob, MinIO, and icBucket — highlighting hidden egress fees, API compatibility, and predictable $5/GB/year on-chain storage.",
    publishedAt: "2026-10-12",
    readingMinutes: 13,
    category: "Infrastructure",
  },
  {
    slug: "best-cloudinary-alternative-zero-egress-fees",
    title: "Best Cloudinary Alternative 2026: Fast Image CDN & On-Chain S3 Storage (Zero Egress Taxes)",
    description:
      "Tired of expensive Cloudinary credit limits and surprise bandwidth invoices? Discover the best Cloudinary alternative in 2026: icBucket provides high-speed image & video CDN hosting, direct upload APIs, and predictable flat-rate storage with zero egress taxes.",
    publishedAt: "2026-10-12",
    readingMinutes: 12,
    category: "Developers",
  },
  {
    slug: "on-chain-storage-explained",
    title: "On-Chain Storage Explained: Architecture, Costs & Why ICP Outperforms Sui, IPFS & Arweave",
    description:
      "What is on-chain storage? A comprehensive technical guide comparing on-chain vs. off-chain storage, storage economics across Ethereum, Sui (Walrus), Arweave, Filecoin, and why Internet Computer (icBucket) achieves true on-chain HTTP streaming at $5/GB/year.",
    publishedAt: "2026-10-12",
    readingMinutes: 14,
    category: "Explainers",
  },
  {
    slug: "on-chain-storage-vs-centralized-cloud",
    title: "On-Chain Storage vs. Centralized Cloud: The Hidden Risks of AWS, Supabase & The Sovereign Alternative",
    description:
      "Why storing critical documents and customer data exclusively on AWS S3 or Supabase is an existential business risk. Real-world analysis of account suspensions, the UniSuper cloud deletion disaster, legal liability gaps, and how on-chain storage (icBucket) provides sovereign immunity.",
    publishedAt: "2026-10-12",
    readingMinutes: 13,
    category: "Infrastructure",
  },
  {
    slug: "icpay-infrastructure-update-new-domains-icbucket",
    title: "ICPay Infrastructure Update: New Domains icpay.cloud & onchainstorage.shop, Plus 268+ User Milestone",
    description:
      "A complete overview of ICPay's latest domain expansions with icpay.cloud and onchainstorage.shop, official contact channels, and crossing 268 on-chain usernames with live ICBucket storage metrics.",
    publishedAt: "2026-10-09",
    readingMinutes: 5,
    category: "Infrastructure",
  },
  {
    slug: "on-chain-cloud-storage-icbucket-s3-guide",
    title: "icBucket: True On-Chain Cloud Storage with S3-Compatible API at 1 GB per ICP",
    description:
      "How icBucket delivers decentralized, S3-compatible object storage hosted 100% on the Internet Computer with zero AWS invoices, simple 30-day plans, and instant payment from your ICPay balance.",
    publishedAt: "2026-09-28",
    readingMinutes: 6,
    category: "Infrastructure",
  },
  {
    slug: "address-poisoning-clipboard-hijacking-username-protection",
    title: "How Address Poisoning Scams Work and Why Verified Usernames on ICPay Eliminate Clipboard Hijacking",
    description:
      "A deep dive into address poisoning and clipboard hijacking scams in Web3, and how ICPay uses verified human-readable usernames and subaccount isolation on the Internet Computer to eradicate destination spoofing.",
    publishedAt: "2026-09-28",
    readingMinutes: 7,
    category: "Security",
  },
  {
    slug: "icfalcon-framework-milestone",
    title: "ICFalcon Crosses 469 Weekly Downloads on npm: Standardizing Four-Layer Motoko Architecture",
    description:
      "How ICFalcon reached 469 weekly downloads on npm by bringing strict four-layer Motoko backend architecture, Next.js frontend scaffolding, and deterministic CLI operations to the Internet Computer.",
    publishedAt: "2026-09-28",
    readingMinutes: 6,
    category: "Developers",
  },
  {
    slug: "bitget-wallet-exploit-lessons-self-custody",
    title: "The $351M Bitget Exploit: How Centralized Backend Vulnerabilities Expose Crypto and Why On-Chain Verification Wins",
    description:
      "A breakdown of the $351.6M Bitget hot wallet security breach, how transaction spoofing bypassed backend authorization, and why on-chain smart contract canisters eliminate centralized honeypots.",
    publishedAt: "2026-09-25",
    readingMinutes: 7,
    category: "Security",
  },
  {
    slug: "drafting-a-tool-agnostic-guide-to-building-without-code",
    title: "Drafting a Tool-Agnostic Guide to Building Without Code on the Internet Computer",
    description:
      "A platform-independent blueprint for creating and launching ICRC-1 tokens and on-chain assets without code. Originally published on Medium by @mrcupss.design.",
    publishedAt: "2026-09-25",
    readingMinutes: 5,
    category: "Guides",
  },
  {
    slug: "how-to-create-icrc1-token-no-code",
    title: "How to Create and Launch an ICRC-1 Token on the Internet Computer (No-Code Guide)",
    description:
      "Learn how to create, mint, and deploy an ICRC-1 token on the Internet Computer in under 5 minutes without writing code or using dfx — step-by-step with ICPay.",
    publishedAt: "2026-09-10",
    readingMinutes: 7,
    category: "How-to",
  },
  {
    slug: "ai-agent-crypto-wallets",
    title: "Agentic Wallets: Why Autonomous AI Agents Need On-Chain Canister Accounts",
    description:
      "Why AI agents in 2026 cannot use traditional bank accounts or seed phrases — how on-chain canisters and reverse gas enable autonomous agentic commerce.",
    publishedAt: "2026-09-10",
    readingMinutes: 9,
    category: "Technology",
  },
  {
    slug: "decentralized-storage-comparison-ipfs-filecoin-icp",
    title: "Decentralized Storage Compared: IPFS vs. Arweave vs. Filecoin vs. icBucket (2026)",
    description:
      "A side-by-side comparison of decentralized storage protocols in 2026: persistence models, retrieval speeds, costs, and why native ICP canister storage is different.",
    publishedAt: "2026-09-10",
    readingMinutes: 10,
    category: "Infrastructure",
  },
  {
    slug: "native-account-abstraction-vs-erc4337",
    title: "ERC-4337 vs. ICP Native Account Abstraction: Why ICP Never Needed a Wallet Upgrade",
    description:
      "How native account abstraction on the Internet Computer compares to Ethereum ERC-4337 account abstraction — bundlers, paymasters, and passkey security compared.",
    publishedAt: "2026-09-10",
    readingMinutes: 8,
    category: "Explainers",
  },
  {
    slug: "how-to-audit-icp-canister",
    title: "How to Audit an ICP Canister: Security Best Practices & Vulnerability Prevention",
    description:
      "The comprehensive checklist for auditing Motoko and Rust canisters on the Internet Computer — reentrancy risks, cycle drains, controller security, and icFalcon.",
    publishedAt: "2026-09-10",
    readingMinutes: 9,
    category: "Developers",
  },
  {
    slug: "passkey-crypto-wallets-guide",
    title: "The Ultimate Guide to Passkey Crypto Wallets: Biometrics, FIDO2 & Zero Seed Phrases",
    description:
      "How passkey crypto wallets use WebAuthn, biometric hardware chips, and threshold cryptography to eliminate seed phrase theft while maintaining self-custody.",
    publishedAt: "2026-09-10",
    readingMinutes: 8,
    category: "Security",
  },
  {
    slug: "cksol-chain-fusion-solana",
    title: "ckSOL Explained: Native Solana Integration on Internet Computer Without Bridges",
    description:
      "How ckSOL brings native Solana to the Internet Computer using threshold Schnorr signatures and RPC canisters — zero bridge risk and 1-second finality.",
    publishedAt: "2026-09-10",
    readingMinutes: 7,
    category: "Chain Fusion",
  },
  {
    slug: "canister-smart-contracts-vs-evm",
    title: "Canister Smart Contracts vs. EVM: Concurrency, Storage & Execution Compared",
    description:
      "A deep technical breakdown comparing WebAssembly canister smart contracts to the Ethereum Virtual Machine (EVM) — actor model, orthogonal persistence, and gas.",
    publishedAt: "2026-09-10",
    readingMinutes: 10,
    category: "Technology",
  },
  {
    slug: "migrate-aws-s3-to-on-chain-icbucket",
    title: "How to Replace AWS S3 with On-Chain Object Storage: Python, Node.js & Go Guide",
    description:
      "Step-by-step developer tutorial for migrating file storage and media uploads from Amazon AWS S3 to icBucket on the Internet Computer with SDK code examples.",
    publishedAt: "2026-09-10",
    readingMinutes: 8,
    category: "Developers",
  },
  {
    slug: "transparent-crypto-donations-on-chain",
    title: "How On-Chain Donations Eliminate NGO Fraud & Intermediary Fees",
    description:
      "Why transparent on-chain charity donations on the Internet Computer eliminate traditional 10-20% payment processor cuts and provide 100% public cryptographic audit trails.",
    publishedAt: "2026-09-10",
    readingMinutes: 7,
    category: "Product",
  },
  {
    slug: "what-is-on-chain",
    title: "What Is On-Chain? The Definitive Guide to Blockchain Data, State & Execution",
    description:
      "What does 'on-chain' actually mean? We break down on-chain data, execution, storage, and transactions from a builder's perspective — plus on-chain vs. off-chain trade-offs and 2026 AI agent payments.",
    publishedAt: "2026-09-10",
    readingMinutes: 11,
    category: "Explainers",
  },
  {
    slug: "what-is-cycles-minting-canister",
    title: "What Is the Cycles Minting Canister (CMC)? | ICPay",
    description:
      "How the CMC converts ICP to cycles, creates canisters, and tops them up — notify_create_canister, notify_top_up, and ICPay.",
    publishedAt: "2026-09-05",
    readingMinutes: 9,
    category: "Explainers",
  },
  {
    slug: "icp-canister-controllers-explained",
    title: "ICP Canister Controllers Explained | ICPay",
    description:
      "Who can manage an ICP canister — status, start/stop, snapshots — and how Internet Identity becomes controller on create.",
    publishedAt: "2026-09-05",
    readingMinutes: 8,
    category: "Explainers",
  },
  {
    slug: "canister-out-of-cycles-fix",
    title: "Canister Out of Cycles: What Happens & How to Fix It | ICPay",
    description:
      "What happens when an ICP canister runs out of cycles and how to top up via CMC on ICPay before it freezes.",
    publishedAt: "2026-09-05",
    readingMinutes: 8,
    category: "How-to",
  },
  {
    slug: "how-to-create-icp-canister",
    title: "How to Create an ICP Canister with CMC (No dfx) | ICPay",
    description:
      "What an ICP canister is, the 500B cycle creation fee, 0.5 ICP minimum, and step-by-step CMC create on ICPay — no dfx.",
    publishedAt: "2026-09-05",
    readingMinutes: 10,
    category: "How-to",
  },
  {
    slug: "how-to-manage-icp-canister",
    title: "How to Manage an ICP Canister: Status, Start & Stop | ICPay",
    description:
      "Live canister_status, start/stop, and logs when your Internet Identity is a controller — browser guide with ICPay.",
    publishedAt: "2026-09-05",
    readingMinutes: 7,
    category: "How-to",
  },
  {
    slug: "how-to-mint-cycles-ledger",
    title: "How to Mint Cycles to the Cycles Ledger | ICPay",
    description:
      "Mint ICP into cycles on the cycles ledger with notify_mint_cycles, then withdraw to any canister — ICPay cycles wallet guide.",
    publishedAt: "2026-09-05",
    readingMinutes: 8,
    category: "How-to",
  },
  {
    slug: "how-to-snapshot-icp-canister",
    title: "How to Snapshot an ICP Canister: Take, Load & Delete | ICPay",
    description:
      "Take, list, load, and delete Internet Computer canister snapshots when you are a controller — browser guide with ICPay.",
    publishedAt: "2026-09-05",
    readingMinutes: 7,
    category: "How-to",
  },
  {
    slug: "how-to-top-up-icp-cycles",
    title: "How to Top Up ICP Cycles: Canister Cycles Guide (2026)",
    description:
      "How to top up ICP cycles — convert ICP to canister cycles via the CMC, step-by-step with ICPay, fees, and how to keep canisters from freezing.",
    publishedAt: "2026-09-04",
    readingMinutes: 12,
    category: "How-to",
  },
  {
    slug: "instant-crypto-payments-icpay",
    title: "Instant Crypto Payments with ICPay: Send ICP in Seconds, Not Minutes",
    description:
      "Instant crypto payments with ICPay — sub-second ICP transfers, username sends, 0.0001 ICP fees, and passkey login. The fastest way to pay on the Internet Computer.",
    publishedAt: "2026-08-28",
    readingMinutes: 5,
    category: "Product",
  },
  {
    slug: "icrc-1-token-standard",
    title: "ICRC-1 Token Standard Explained: The ERC-20 of the Internet Computer",
    description:
      "ICRC-1 and ICRC-2 token standards on ICP — transfers, fees, wallet support, and ICRC-1 token integration for merchants and developers.",
    publishedAt: "2026-08-28",
    readingMinutes: 6,
    category: "Developers",
  },
  {
    slug: "depin-on-internet-computer",
    title: "DePIN on Internet Computer: Decentralized Physical Infrastructure Networks Explained",
    description:
      "DePIN crypto on ICP — how decentralized physical infrastructure networks use canisters for coordination, ICRC payments, and on-chain data.",
    publishedAt: "2026-08-28",
    readingMinutes: 6,
    category: "Ecosystem",
  },
  {
    slug: "sovereign-cloud-vs-aws-web3",
    title: "Sovereign Cloud vs. AWS: Why Next-Gen Web3 DApps Are Built 100% On-Chain",
    description:
      "Decentralized cloud vs AWS for Web3 hosting — why ICPay and other DApps run frontend, backend, and data on-chain instead of centralized servers.",
    publishedAt: "2026-08-28",
    readingMinutes: 7,
    category: "Infrastructure",
  },
  {
    slug: "ckbtc-cketh-chain-key-security",
    title: "ckBTC & ckETH Explained: How Chain-Key Tech Eliminates Cross-Chain Bridge Hacks",
    description:
      "ckBTC vs wBTC — chain-key cryptography makes cross-chain assets safer than wrapped tokens. Secure crypto bridges without custodians.",
    publishedAt: "2026-08-28",
    readingMinutes: 7,
    category: "Chain Fusion",
  },
  {
    slug: "on-chain-ai-internet-computer",
    title: "On-Chain AI on Internet Computer: How AI Models Run Directly Inside Canisters",
    description:
      "On-chain AI crypto on ICP — AI smart contracts in canisters without AWS. Decentralized AI infrastructure with verified outputs and cycle-based billing.",
    publishedAt: "2026-08-28",
    readingMinutes: 7,
    category: "Technology",
  },
  {
    slug: "accept-icp-payments-ecommerce",
    title: "How to Accept ICP and ICRC-1 Tokens on Your E-Commerce Store",
    description:
      "Accept crypto payments with ICP payment gateway setup — payment links, QR codes, and ICRC-1 token integration for merchants.",
    publishedAt: "2026-08-28",
    readingMinutes: 7,
    category: "Merchants",
  },
  {
    slug: "ckbtc-without-btc-network-fees",
    title: "How to Send and Receive Bitcoin (ckBTC) Without Paying BTC Network Fees",
    description:
      "ckBTC payments on ICP — send Bitcoin at layer-1 speed without BTC network fees or bridge contracts. Zero-bridge Bitcoin with threshold cryptography.",
    publishedAt: "2026-08-28",
    readingMinutes: 6,
    category: "Chain Fusion",
  },
  {
    slug: "internet-identity-vs-seed-phrases",
    title: "Internet Identity vs. Seed Phrases: Why Passkeys Are the Future of Crypto Security",
    description:
      "Internet Identity vs seed phrases — passkey crypto wallet security with biometrics. The seed phrase alternative ICPay uses for safer crypto.",
    publishedAt: "2026-08-28",
    readingMinutes: 6,
    category: "Security",
  },
  {
    slug: "gasless-crypto-transactions-icpay",
    title: "How to Send Crypto with Zero Gas Fees Using ICPay",
    description:
      "Gasless crypto transactions on ICP — ICPay wallet users never pay gas. Cycle-based queries and the reverse gas model for instant crypto payments.",
    publishedAt: "2026-08-28",
    readingMinutes: 6,
    category: "Product",
  },
  {
    slug: "jackson-hole-2026-crypto-payments",
    title:
      "Jackson Hole 2026: What Kevin Warsh's Fed Speech Means for Bitcoin, Stablecoins and Crypto Payments",
    description:
      "Fed Chair Kevin Warsh's Jackson Hole 2026 keynote puts stablecoins and crypto payments on the agenda. What it means for Bitcoin, rate expectations, and on-chain wallets.",
    publishedAt: "2026-08-28",
    readingMinutes: 6,
    category: "Market watch",
  },
  {
    slug: "un-sovereign-ai-crypto-infrastructure",
    title: "Why the UN's Sovereign AI Push Validates Crypto Infrastructure",
    description:
      "The UN is piloting decentralized AI to help governments escape Big Tech cloud dependency. For crypto projects built on sovereign infrastructure like the Internet Computer, this validates the architectural bet made years ago.",
    publishedAt: "2026-08-25",
    readingMinutes: 6,
    category: "Infrastructure",
  },
  {
    slug: "icpay-swap-and-live",
    title: "ICPay Swap: Trade ICP and ICRC Tokens on the Internet Computer",
    description:
      "Swap ICP and ICRC tokens directly in your wallet with ICPSwap — live quotes, pool fees, and instant custodial subaccount settlement.",
    publishedAt: "2026-08-17",
    readingMinutes: 6,
    category: "Product",
  },
  {
    slug: "what-is-icp",
    title: "What is ICP?",
    description:
      "A plain-language guide to the Internet Computer Protocol — how it works, why it exists, and what makes it different from other blockchains.",
    publishedAt: "2026-08-09",
    readingMinutes: 6,
    category: "Explainers",
  },
  {
    slug: "best-crypto-wallet",
    title: "Best Crypto Wallet in 2026: How to Choose One",
    description:
      "Custodial vs self-custody, hot vs cold storage. A practical guide to picking a crypto wallet in 2026.",
    publishedAt: "2026-08-10",
    readingMinutes: 8,
    category: "Security",
  },
  {
    slug: "best-icp-wallet",
    title: "Best ICP Wallet in 2026: Why ICPay Is the Top Internet Computer Wallet",
    description:
      "The best ICP wallet in 2026 — ICPay leads with Internet Identity login, username transfers, on-chain custody, and native ICRC-1 ledger calls. Compare features and alternatives.",
    publishedAt: "2026-08-28",
    readingMinutes: 8,
    category: "Product",
  },
  {
    slug: "what-is-internet-identity",
    title: "What is Internet Identity? The Internet Computer Login, Explained",
    description:
      "The passkey-based login system of the Internet Computer — no passwords, no seed phrases, anonymous by default.",
    publishedAt: "2026-08-10",
    readingMinutes: 5,
    category: "Security",
  },
  {
    slug: "how-to-send-icp",
    title: "How to Send ICP: Step by Step",
    description:
      "Send ICP by account ID or username, transfer fees, and the mistakes that lose funds.",
    publishedAt: "2026-08-10",
    readingMinutes: 5,
    category: "How-to",
  },
  {
    slug: "icp-price",
    title: "ICP Price Today: Live Price, Technical Analysis & News",
    description:
      "Live ICP price, 7-day chart, technical read, and this week's Internet Computer news.",
    publishedAt: "2026-08-11",
    readingMinutes: 5,
    category: "Market watch",
  },
  {
    slug: "icp-cloud-storage",
    title: "ICP Cloud Storage in 2026: Decentralized File Storage on the Internet Computer",
    description:
      "What ICP cloud storage is, how on-chain buckets work, encrypted CDN delivery, pricing in ICP, and how it compares to AWS S3 and IPFS.",
    publishedAt: "2026-08-13",
    readingMinutes: 7,
    category: "Infrastructure",
  },
  {
    slug: "internet-computer-chain-fusion",
    title: "Internet Computer Chain Fusion Explained: How ICP Connects to Bitcoin, Ethereum and Solana",
    description:
      "How ICP canisters hold, sign, and move Bitcoin, Ethereum, and Solana natively using threshold signatures — no bridges, no custodians.",
    publishedAt: "2026-08-16",
    readingMinutes: 7,
    category: "Chain Fusion",
  },
  {
    slug: "how-icp-canisters-work",
    title: "How Internet Computer Canisters Work",
    description:
      "The Wasm-based smart contracts that hold code and state on ICP — subnets, stable memory, cycles, and the path a call takes from browser to consensus.",
    publishedAt: "2026-08-16",
    readingMinutes: 7,
    category: "Explainers",
  },
  {
    slug: "icp-cycles-explained",
    title: "ICP Cycles Explained: How Internet Computer Apps Pay for Compute and Storage",
    description:
      "The fuel of the Internet Computer — the XDR peg, storage and compute pricing, and the reverse gas model that keeps users paying nothing.",
    publishedAt: "2026-08-16",
    readingMinutes: 6,
    category: "Explainers",
  },
  {
    slug: "icp-vs-ethereum",
    title: "ICP vs Ethereum: What Is the Difference?",
    description:
      "Architecture, execution, storage, fees, and finality — an honest side-by-side of the Internet Computer and Ethereum.",
    publishedAt: "2026-08-16",
    readingMinutes: 7,
    category: "Explainers",
  },
  {
    slug: "can-icp-replace-cloud-computing",
    title: "Can ICP Replace the Cloud? AWS vs the Internet Computer",
    description:
      "What canisters genuinely replace from the traditional cloud, what they cannot, and where the line sits for real applications.",
    publishedAt: "2026-08-16",
    readingMinutes: 7,
    category: "Infrastructure",
  },
  {
    slug: "icp-stable-memory",
    title: "ICP Stable Memory Explained: How Canisters Persist State",
    description:
      "How canisters survive upgrades with persistent stable memory, why it replaces a managed database, and what migration discipline means.",
    publishedAt: "2026-08-16",
    readingMinutes: 6,
    category: "Developers",
  },
  {
    slug: "icp-subnets-explained",
    title: "ICP Subnets and Nodes Explained: How the Network Replicates State",
    description:
      "Nodes, subnets, replicas, and consensus — the physical layer that makes the Internet Computer tamper-proof.",
    publishedAt: "2026-08-16",
    readingMinutes: 6,
    category: "Infrastructure",
  },
  {
    slug: "icp-reverse-gas-model",
    title: "The ICP Reverse Gas Model Explained: Why Users Never Pay Gas",
    description:
      "How canisters prepay their own cycles so users interact for free, and what the reverse gas model means for apps and developers.",
    publishedAt: "2026-08-16",
    readingMinutes: 5,
    category: "Explainers",
  },
  {
    slug: "icp-https-outcalls",
    title: "ICP HTTPS Outcalls Explained: How Canisters Talk to the Outside World",
    description:
      "How canisters make HTTP requests to external APIs directly from on-chain code, what it costs, and why it removes the oracle.",
    publishedAt: "2026-08-16",
    readingMinutes: 5,
    category: "Developers",
  },
  {
    slug: "how-to-stake-icp",
    title: "How to Stake ICP: NNS Neurons, Rewards, and Risks",
    description:
      "Creating a neuron, choosing a dissolve delay, voting rewards, and the liquidity risks of locking up your ICP.",
    publishedAt: "2026-08-16",
    readingMinutes: 6,
    category: "How-to",
  },
  {
    slug: "icpay-bucket-sdk",
    title: "ICPay Bucket SDK: npm, Python & Go Clients",
    description:
      "Official packages for ICPay Cloud — install links, quick starts, and when to use each language client.",
    publishedAt: "2026-08-16",
    readingMinutes: 5,
    category: "Developers",
  },
]
