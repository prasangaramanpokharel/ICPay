# icCron Landing Page: Architecture, Component Map & Design Blueprint

> Comprehensive technical specification, shadcn UI mapping, asset guide, and copy blueprint for the official **icCron** public landing page (`/iccron`).

---

## 1. Executive Summary & Product Positioning

**icCron** is the decentralized, autonomous job scheduler and webhook dispatcher running natively on the Internet Computer (`uzt4z-lp777-77774-qaabq-cai`). It provides sub-second cron scheduling, automated retries with Dead Letter Queues (DLQ), inter-canister Candid calls, and global HTTPS outcalls with zero infrastructure management.

* **Core Value Proposition**: The unstoppable, serverless cron layer for Web2 & Web3. Run hourly crons without paying Vercel's \$20/month fee, and execute autonomous on-chain actions without running fragile keeper bots or storing private keys on AWS EC2.
* **Pricing Model**: **\$0.0005 per execution run** (\$0.50 per 1,000 runs) with **60 free runs per month**.
* **Target Audience**:
  1. Next.js, Vercel, Supabase, and Cloudflare Workers developers seeking sub-daily cron triggers without enterprise SaaS markups.
  2. Internet Computer canister builders needing reliable, cycle-efficient scheduled jobs without keeper scripts.
  3. DeFi protocols, DAOs, and fintech platforms automating recurring payouts, DCA investments, and yield compounding.

---

## 2. shadcn Component Architecture Mapping

The landing page is constructed using existing shadcn primitives from `@/components/ui/*`, styled with semantic tokens from `globals.css` and Hugeicons:

| Page Section | Primary shadcn Components | Utility & Visual Effects |
|---|---|---|
| **Global Shell** | `AppPage`, `PublicNav`, `PublicFooter` | Consistent site-wide header & footer navigation |
| **Hero Section** | `Card`, `Badge`, `Button`, `HoverCard`, `Avatar` | `ShineBorder` (`["#A07CFE", "#FE8FB5", "#FFBE7B"]`), glowing radial gradients |
| **Interactive Scheduler** | `Tabs`, `Input`, `Badge`, `CopyButton` | Dynamic cron-expression interpreter, next-5-runs preview |
| **Problem vs. Solution** | `Card`, `Alert`, `Badge`, `Separator` | Comparative split-grid with semantic destructive/success accents |
| **What is icCron?** | `Card`, `HoverCard`, `Progress` | Interactive architecture visualization, cycle efficiency comparison gauge |
| **Use Cases Showcase** | `Tabs`, `Card`, `Badge`, `Button` | 5 domain recipes with live payload previews & code snippets |
| **Architecture & Engine** | `Card`, `HoverCard`, `Item` | Embedded SVG architecture diagram, hover tooltips for Candid / HTTPS outcalls |
| **Pricing & ROI Calculator**| `Card`, `Slider`, `Badge`, `Button` | Live interactive slider comparing Vercel Pro (\$240/yr) vs icCron (\$4.32/yr) |
| **Developer Quickstart** | `Tabs`, `CodeBlock` (`components/ui/code-block`) | Multi-language syntax (cURL, TypeScript, Motoko, Claude Code MCP) |
| **FAQ Section** | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` | Categorized expandable technical disclosures |
| **Bottom CTA** | `Card`, `Button`, `Badge` | `ShineBorder` enclosure, direct link to `/cron/create` |

---

## 3. Curated High-Resolution Assets & Illustrations

All visual assets have been downloaded via Pexels API (`AwPKMtRHsiZ7L582VHx9RX3AOj8TiJ2bOTrE4YzFvaYQRCEMToRd171O`) and generated as native vector SVGs, stored under `docs/iccron/ui/assets/`:

```
docs/iccron/ui/assets/
├── manifest.json              # Source metadata, photographer credits, and queries
├── hero-automation.jpg        # Modern neon-lit workstation with digital clocks & screens
├── cloud-network.jpg          # Enterprise datacenter server racks with active fiber optics
├── workflow-automation.jpg    # Deep abstract digital code data stream
├── defi-finance.jpg           # Financial candlestick trading chart & automated yield data
├── security-shield.jpg        # High-tech cryptographic security and encryption lock
├── developer-code.jpg         # Dark-mode terminal programming code monitor
├── architecture-diagram.svg   # Custom vector SVG of icCron Canister Core & dual dispatch
└── cron-flow.svg              # Custom vector SVG of 4-step pipeline (Define -> Compile -> Tick -> Execute)
```

---

## 4. Detailed Section-by-Section Blueprint

### Section 1: Hero Section (The Autonomous Time Engine)
* **Eyebrow**: `<Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Decentralized Job Orchestration</Badge>`
* **Headline**:
  > Autonomous On-Chain Cron & Webhook Dispatcher
* **Subheadline**:
  > Schedule HTTP webhooks and inter-canister calls with sub-second precision. Zero servers, zero keeper bots, and no Vercel pro tax. Powered by the Internet Computer.
* **CTAs**:
  - Primary: `<Button size="lg" className="rounded-xl">Start Free (60 runs/mo) <HugeiconsIcon icon={ArrowRight01Icon} /></Button>` (Links to `/cron/create`)
  - Secondary: `<Button variant="outline" size="lg" className="rounded-xl">View Live Canister <HugeiconsIcon icon={LinkSquare02Icon} /></Button>`
  - Tertiary: `<Button variant="ghost" size="lg">Explore Docs</Button>` (Links to `/cron/api`)
* **Hero Visual / Interactive Widget**:
  Enclosed in a `Card` wrapped with `ShineBorder`:
  - **Live Cron Syntax Sandbox**: An interactive input initialized with `0 */2 * * *`.
  - **Natural Language Translation**: "Runs every 2 hours at minute 0."
  - **Next 5 Execution Timestamps**: Real-time calculated UTC dates.
  - **Target Toggle**: Webhook (HTTP POST) vs Canister Call (Candid update).
  - Background: `hero-automation.jpg` with high-contrast gradient overlay (`bg-background/85`).

---

### Section 2: Problem vs. Solution (Why We Built icCron)
A comparative 3-column breakdown highlighting pain points with traditional cron infrastructure:

| Pain Point in Web2 & Web3 | The Traditional Workaround | The icCron Decentralized Solution |
|---|---|---|
| **Vercel Cron Tax** | Vercel Free limits crons to **once per 24 hours**. Any hourly job forces an upgrade to Vercel Pro at **\$20/month per seat** (\$240/yr). | Point icCron at your Next.js `/api/cron` route. Run it hourly for **\$0.36/month** (\$4.32/yr) — **98.2% cost reduction**. |
| **Fragile Keeper Bots** | Running 24/7 Python scripts on AWS EC2 or DigitalOcean to trigger DeFi smart contracts. Requires managing server uptime, memory leaks, and OS patches. | **100% On-Chain Canister Timers**. icCron runs directly inside a replicated WebAssembly canister. No servers to maintain, crash, or reboot. |
| **Private Key Exposure** | Keeper bots require hot private keys stored in plaintext `.env` files on VPS instances to sign transactions, creating catastrophic exploit risks. | **Zero Hot Keys Required**. icCron invokes canister methods and HTTP webhooks autonomously using cryptographic canister caller identity. |
| **AWS Cloud Sprawl** | Setting up AWS EventBridge requires configuring IAM roles, CloudWatch rules, SQS dead-letter queues, and API Gateway endpoints. | **One-Click Scheduling**. Enter your URL or Canister ID, set the cron expression, and launch in 30 seconds from a clean dashboard. |

---

### Section 3: What is icCron? (Architecture & Core Mechanics)
A deep dive into the engineering foundations of icCron:

1. **Canister Timers vs. Legacy Heartbeats**:
   - Legacy ICP canisters used `canister_heartbeat`, executing every single consensus round (~1 second) regardless of whether work was pending, burning millions of cycles unnecessarily.
   - icCron leverages native **IC Canister Timers** with 64-bit nanosecond scheduling. The canister sleeps at 0 cycle cost until the exact scheduled moment arrives, achieving **99.4% cycle efficiency**.
2. **Dual-Dispatch Engine**:
   - **HTTPS Outcalls**: Direct cryptographic outbound HTTP requests with consensus threshold signing. Calls Vercel, Supabase, Cloudflare Workers, AWS Lambda, or custom webhooks.
   - **Inter-Canister Candid Calls**: Directly invokes update methods across any ICP canister (`canister_id.method(payload)`), verified by the canister's caller principal.
3. **Bitmask Cron Compiler**:
   - Compiles standard 5-field cron strings (`minute hour day month weekday`) into bitmask records in memory (`CompiledCron`), enabling $O(1)$ timestamp matching without regex overhead during scheduler ticks.
4. **Resilient Retry Policy & Dead Letter Queue (DLQ)**:
   - Configurable exponential backoff retries (`max_retries`).
   - Consecutive failure circuit breakers (`AutoPausedDormant`, `TargetUnavailable`).
   - Complete execution history logs with response status codes, execution latency (`duration_ms`), and error snippets.

---

### Section 4: Real-World Use Cases (Interactive Tabbed Showcase)
Interactive showcase featuring real-world integration recipes:

```
[ DeFi & Yield ]  [ Cloud Storage Backup ]  [ Vercel / Next.js ]  [ E-Commerce / CRM ]  [ Canister Sentinel ]
```

1. **DeFi Auto-Compounding & Yield Harvesting**:
   - Expression: `0 0 * * *` (Daily at 00:00 UTC)
   - Target: Canister Call `harvest_and_reinvest()`
   - Image: `docs/iccron/ui/assets/defi-finance.jpg`
2. **Nightly Database Snapshots to icBucket**:
   - Expression: `0 2 * * *` (Daily at 2:00 AM UTC)
   - Target: Webhook `POST https://api.my-app.com/v1/backup`
   - Flow: Triggers server to dump PostgreSQL, AES-encrypt, and upload to decentralized icBucket S3 storage.
   - Image: `docs/iccron/ui/assets/cloud-network.jpg`
3. **Bypassing Vercel's Cron Tax**:
   - Expression: `0 * * * *` (Every hour)
   - Target: Webhook `POST https://my-app.vercel.app/api/cron/sync`
   - Header: `Authorization: Bearer CRON_SECRET`
   - Image: `docs/iccron/ui/assets/developer-code.jpg`
4. **Abandoned Cart & Retention Drip Campaigns**:
   - Expression: `*/30 * * * *` (Every 30 minutes)
   - Target: Webhook `POST https://store.com/api/webhooks/abandoned-check`
   - Image: `docs/iccron/ui/assets/workflow-automation.jpg`
5. **Canister Cycle Top-Up Sentinel**:
   - Expression: `0 */6 * * *` (Every 6 hours)
   - Target: Canister Call `check_cycles_and_topup()`
   - Image: `docs/iccron/ui/assets/security-shield.jpg`

---

### Section 5: Transparent Pricing & Interactive Savings Calculator
* **Free Tier**: 60 free execution runs every month — permanent, no credit card required.
* **Prepaid Credits**: **\$0.0005 per execution run** (\$0.50 per 1,000 runs).
* **Interactive ROI Calculator**:
  - Slider: Number of scheduled tasks (1 to 50) and frequency (Every 5 mins, Hourly, Daily).
  - Live comparison card:
    - **Vercel Pro Cost**: \$240.00 / year (requires Pro upgrade for sub-daily).
    - **AWS EventBridge + Lambda**: ~\$18.50 / year + IAM complexity & maintenance hours.
    - **icCron Cost**: **\$4.32 / year** (8,760 runs × \$0.0005).
    - **Net Savings**: **98.2% less cost, 0 maintenance overhead**.

---

### Section 6: Developer Quickstart & SDK Integration
Developer-focused tabbed code block with instant copy buttons:

* **Tab 1: cURL / External Webhook Trigger**:
  ```bash
  curl -X POST "https://iccron.icpay.app/api/v1/cron/trigger" \
    -H "Authorization: Bearer cr_live_9f82bc4e..." \
    -H "Content-Type: application/json" \
    -d '{"job_id": 42}'
  ```

* **Tab 2: Next.js API Route Protected Handler**:
  ```typescript
  import { NextRequest, NextResponse } from "next/server"

  export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.ICCRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Execute scheduled task
    await syncDatabaseRecords()
    return NextResponse.json({ ok: true, timestamp: Date.now() })
  }
  ```

* **Tab 3: Claude Code & AI Agent MCP Connector**:
  ```bash
  # Connect icCron to Claude Code or Cursor AI
  claude mcp add iccron -- npx -y @icpay/iccron-mcp
  ```

---

### Section 7: Frequently Asked Questions (FAQ)
Expandable `Accordion` addressing technical questions:

1. **How is icCron different from standard Linux cron or node-cron?**
   Linux cron and node-cron run on a single server. If the server crashes, reboots, or runs out of memory, jobs fail silently. icCron runs on the Internet Computer's decentralized blockchain state machine, backed by consensus across dozens of independent node providers.

2. **Can icCron make HTTP requests to private or localhost servers?**
   icCron uses Internet Computer HTTPS outcalls, which can reach any public IP or domain on the web (e.g. Vercel, AWS, Cloudflare, Fly.io). For local development, use tools like ngrok or Cloudflare Tunnels to expose your local webhook.

3. **What happens if my target webhook endpoint is down?**
   icCron implements automatic exponential backoff retries. If the target fails repeatedly up to `max_retries`, the job is safely moved to the Dead Letter Queue (DLQ) with status `TargetUnavailable` so you don't burn credits indefinitely.

4. **Do I need to hold cryptocurrency or ICP to use icCron?**
   No. Every user receives 60 free runs per month upon signing in with Internet Identity. When buying prepaid credit packs, you can pay with ICP or via standard payment mechanisms directly in the ICPay app.

5. **How accurate is the execution timing?**
   icCron triggers with 1-second consensus precision on the Internet Computer. Unlike AWS Lambda cold starts or serverless cron wake-up delays that vary by minutes, icCron ticks predictably.

---

### Section 8: Final CTA Enclosure
* **Visual**: `Card` enclosed with `ShineBorder`, subtle background glow.
* **Heading**: Ready to automate your decentralized workflows?
* **Subheading**: Set up your first cron trigger in 30 seconds. 60 free runs every month. No credit card required.
* **Button**: `<Button size="lg" className="rounded-xl">Launch icCron Console <HugeiconsIcon icon={ArrowRight01Icon} /></Button>`
