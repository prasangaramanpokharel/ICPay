# ICPay Codebase & System Documentation

Comprehensive architecture, canister mechanics, frontend standards, operational playbooks, and development guides for **ICPay** — the decentralized finance, storage, and canister portal on the Internet Computer.

---

## 1. Quick Navigation

| Domain | Key Documentation | Description |
|---|---|---|
| **Architecture** | [`docs/architecture/`](architecture/) | System overview, data models, canister state flows, and Mermaid diagrams |
| **Operations** | [`docs/command/README.md`](command/README.md) | Authoritative reference for every `npm run ci` CLI command |
| **Git & Releases** | [`docs/workflow.md`](workflow.md) | Branching strategy (`dev` $\rightarrow$ `main`), release cutover, and tagging |
| **Roadmap** | [`docs/roadmap/roadmap.md`](roadmap/roadmap.md) | What shipped, current phase, and explicitly refused features |
| **Cycle Economics** | [`docs/costing/here.md`](costing/here.md) | Canister burn rate, 30-day runway reserves, and memory high-water mark |
| **Agent Protocols** | [`docs/agents/`](agents/) | Issue triage labels, domain glossaries, and autonomous agent coordination |
| **Mobile API Map** | [`docs/app/react-native/`](app/react-native/appallapi.json) | Canister method mappings for React Native mobile client |
| **Hyper-Scale Blueprint** | [`docs/future/scalabity/1.md`](future/scalabity/1.md) | 20 Million user sharding roadmap, multi-subnet throughput, and memory ceilings |

---

## 2. System Architecture

ICPay operates as a custodial wallet and multi-product decentralized ecosystem on the Internet Computer:

```
Browser / Mobile App
        │
        ▼ (Next.js Static Export / Vercel / ICP Asset Canister)
https://icpay.app
        │
        │  @dfinity/agent, update + query calls
        ▼
icp_wallet_backend (Motoko Canister: 6vbhm-nqaaa-aaaan-q6muq-cai)
        │
        ├── ICP Ledger & ICRC-1 Tokens (Native transfers via subaccounts)
        ├── icp_blob_store (Rust Canister: fly6t-piaaa-aaaan-q6oga-cai)
        ├── ic_cron (Rust Canister: Decentralized scheduler microservice)
        └── ic_falcon (Rust Canister: AI agent orchestration microservice)
```

### Invariants:
1. **Custodial Subaccount Model**: The backend owns one ICP ledger account. Each user's funds reside on a subaccount strictly derived from their `caller` principal. The canister never accepts an arbitrary principal parameter in place of `caller`.
2. **Pinned Derivation Origin**: `NEXT_PUBLIC_DERIVATION_ORIGIN` is permanently pinned to `https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io`. Changing it locks user funds permanently.
3. **No Private Keys**: Internet Identity is the sole authentication mechanism. No private keys, `.pem` files, or seed phrases are stored.

---

## 3. Product Ecosystem

* **[ICPay Wallet (`docs/icpay/`)](icpay/)**: Custodial instant transfer wallet with human-readable username handles (`@username`) and payment links.
* **[icBucket Decentralized Storage (`docs/bucket/`)](bucket/)**: S3-compatible decentralized cloud storage with zero egress fees and multi-canister chunking.
* **[icCron Decentralized Scheduler (`docs/iccron/`)](iccron/)**: Autonomous on-chain cron engine triggering precision webhooks and canister executions.
* **[icFalcon Autonomous Framework (`docs/icfalcon/`)](icfalcon/)**: Decentralized AI agent compute framework.
* **[icAcademy Web3 Learning (`docs/icacademy/`)](icacademy/)**: Interactive decentralized developer curriculum and soulbound certificates.

---

## 4. Frontend & Engineering Standards

* **Static Export Constraints**: `frontend/` runs Next.js with `output: "export"`. No server-side runtime, no Server Actions, no dynamic API routes.
* **Canister Agent Layer**: All IC calls go through `frontend/services/` (e.g. `services/icp.ts`, `services/wallet.ts`). `HttpAgent` is never instantiated in UI components.
* **UI Design System**:
  * Use existing shadcn components in `@/components/ui/*`.
  * Use semantic tokens from `frontend/app/globals.css` (e.g., `bg-background`, `text-primary`, `border-border`).
  * Never use hardcoded `#hex` or literal palette classes (`bg-white`, `text-gray-900`).
  * Use Hugeicons exclusively (`@hugeicons/react`).
  * Zero comments in UI React code.
* **Localization**: 10 locales (`en hi zh ja ko es fr de pt ru`). Follow [`docs/language/add/readme.md`](language/add/readme.md) when updating translation keys.

---

## 5. Development & CI Commands

All commands are executed via `npm run ci <group>:<command>`:

| Command | Action |
|---|---|
| `npm run ci -- verify` | Run typecheck, lint, and canister tests |
| `npm run ci:typecheck` | Run TypeScript check across all packages |
| `npm run ci backend:deploy` | Upgrade the Motoko backend canister on mainnet |
| `npm run ci cycles:balance` | Query live cycles balance and runway |
| `npm run ci cycles:topup` | Mint and deposit cycles via the cycles ledger |

See [`docs/command/README.md`](command/README.md) for the full operational guide.

---

## 6. Documentation Directory Map

```
docs/
├── README.md                 # This master portal
├── workflow.md               # Git branching and release flow
├── architecture/             # Architecture blueprints and Mermaid diagrams
├── backend/                  # Motoko & Rust canister technical specs
├── frontend/                 # Frontend architecture, components, and static export
├── command/                  # Full npm run ci command guide
├── costing/                  # Cycles cost, burn, and runway economics
├── roadmap/                  # Authoritative feature roadmap
├── agents/                   # Agent triage labels, issue trackers, and domain rules
├── demo/                     # Public showcase imagery for README.md
├── compliance/               # Security audits and regulatory compliance
├── reference/                # UI mockups, screen references, and design notes
├── research/                 # Tokenomics, DFINITY dashboard data, and research papers
├── sdk/                      # Python and TypeScript client SDKs
└── language/                 # Internationalization and localization guides
```
