---
name: icpay-bucket
description: ICPay Cloud (icBucket) decentralized on-chain S3-compatible storage guide — architecture, canister map, scaling runbook (0-400GB+ multi-canister sharding), CLI operations, unit economics, and CDN caching policies.
---

# ICPay Cloud Storage (icBucket) — Architecture & Scaling Guide

ICPay Cloud is an on-chain, S3-compatible decentralized storage platform powered by the Internet Computer (ICP).

---

## 1. System Architecture & Canister Map

```
┌──────────────────────────────────────────────────────────────┐
│                       Clients / Users                        │
│   (Web Dashboard · S3 SDK · CLI · Edge CDN · Public Visitors)│
└──────────────────────────────┬───────────────────────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌──────────────────────────────┐       ┌──────────────────────────────┐
│  icpay-cdn (Vercel Edge)     │       │  Direct IC Raw Gateway       │
│  cdn.icpay.app / cloud.*     │       │  *.raw.icp0.io/cloud/*       │
└──────────────┬───────────────┘       └──────────────┬───────────────┘
               │                                      │
               └───────────────────┬──────────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Control Plane Canister: `icp_wallet_backend`                     │
│    ID: 6vbhm-nqaaa-aaaan-q6muq-cai (Motoko)                         │
│    - Custodies user ICP & billing                                   │
│    - Metadata, leases, API keys, bucket ownership & permissions     │
│    - NEVER stores raw file bytes (remains lightweight & lean)       │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
          ┌────────────────────────┴────────────────────────┐
          ▼                                                 ▼
┌──────────────────────────────────┐      ┌──────────────────────────────────┐
│ 2. Data Plane: `icp_blob_store`  │      │ 3. Notifier: `icpay_notifier`    │
│    ID: fly6t-piaaa-aaaan-q6oga-cai│      │    ID: 2hvuh-xiaaa-aaaan-q6uua-cai│
│    - Stores raw encrypted chunks │      │    - Daily autonomous sweep      │
│    - Handles HTTP streaming      │      │    - Resend lifecycle alerts     │
│    - Max 400 GB stable memory    │      │    - T-3d, Expired, Frozen       │
└──────────────────────────────────┘      └──────────────────────────────────┘
```

---

## 2. Canister Directory & Deployment Roles

| Canister Name | Mainnet Canister ID | Path | Role |
|---|---|---|---|
| `icp_wallet_backend` | `6vbhm-nqaaa-aaaan-q6muq-cai` | `backend/src/` | Control Plane: Ledger, User accounts, Billing, Bucket Registry |
| `icp_blob_store` | `fly6t-piaaa-aaaan-q6oga-cai` | `backend/blob_store/` | Data Plane: Dedicated storage & file chunk streaming |
| `icpay_notifier` | `2hvuh-xiaaa-aaaan-q6uua-cai` | `backend/notifier/` | Notifier Plane: Autonomous daily sweeps & lifecycle alerts |
| `icpay-cdn` | Vercel Edge Proxy | `api/proxy.js` (GitLab) | Edge Cache & URL rewrite: `cloud.icpay.app` / `cdn.icpay.app` |

---

## 3. Operations & Management Commands (Complete Map)

Always run CI operations from the repo root (`/home/prasanga/Desktop/icppay`):

### 1. Storage & Health Audits
```bash
# Comprehensive Storage & Sharding Audit:
# Checks bucket creations, dates, heap memory, cycles balance, capacity headroom, and sharding trigger
npm run ci blob:audit

# Sample Output of blob:audit:
# • Audit Date/Time:         Tue, 13 Oct 2026 08:40:19 GMT
# • Total Buckets Created:   7 buckets (7 active, 0 expired)
# • Capacity Tiers Sold:     6.52 GB
# • Files Stored:            88 files
# • Physical Storage Used:   1.85 MB (0.0018 GB)
# • Free Storage Remaining:  372.53 GB (99.9995% free)
# • Cycles Balance:          1.608 Trillion Cycles (TC)
# • Headroom Before Shard:   300.00 GB remaining before needing Shard 2
# • Sharding Health Status:  [HEALTHY & OPTIMAL]
# • Notifier Subscriptions:  3 bucket owners registered

# Live Storage Gauge & Capacity Utilization:
# Shows current MB/GB used, file count, free space, and progress gauge
npm run ci blob:status

# Wallet Cloud Rollup:
# Shows total user buckets, active vs expired, logical storage, and real cycle burn
npm run ci bucket:stats
```

### 2. Canister Management & Upgrades
```bash
# Safe upgrade of the live blob store canister on mainnet:
# Rebuilds wasm, checks module hash, confirms TTY, deploys with memory-persistence
npm run ci blob:deploy

# Direct DFX Canister Status check:
npm run ci canister:status

# Wallet backend health:
dfx canister --network ic status 6vbhm-nqaaa-aaaan-q6muq-cai
```

### 3. Notifier Plane Operations
```bash
# Build notifier wasm:
npm run ci notifier:build

# Deploy / upgrade notifier on mainnet:
npm run ci notifier:deploy

# Configure Resend credentials on live canister:
npm run ci notifier:config

# Inspect notifier status & active bucket subscriptions:
dfx canister --network ic call 2hvuh-xiaaa-aaaan-q6uua-cai getStatus '()'
```

---

## 4. Scaling Runbook: Scaling Past 400 GB (Horizontal Sharding)

On the Internet Computer, a single canister has a hard limit of **400 GB (or 500 GB)** of 64-bit stable memory.

### When to Scale
* **0 – 250 GB:** Safe. No action required.
* **250 – 300 GB:** Plan deployment of Canister #2.
* **300 – 350 GB (75%–85% Capacity):** **Scale immediately.** Do not wait until 390+ GB.

### How to Scale (Horizontal Canister Sharding)
To scale beyond 400 GB without downtime:

1. **Create the New Storage Canister:**
   Deploy a new instance of `backend/blob_store`:
   ```bash
   dfx canister --network ic create icp_blob_store_2 --with-cycles 1000000000000
   dfx deploy icp_blob_store_2 --network ic --argument '(principal "6vbhm-nqaaa-aaaan-q6muq-cai")'
   ```

2. **Register in Control Plane Router:**
   In `backend/src/services/bucket/`:
   Add a registry array or map:
   ```motoko
   let blobStores : [Principal] = [
     Principal.fromText("fly6t-piaaa-aaaan-q6oga-cai"), // Canister 1 (Full / Read-only)
     Principal.fromText("<new-canister-id>"),          // Canister 2 (Active writes)
   ];
   ```

3. **Active Write Routing:**
   * Reads: Route to the specific canister ID saved on the file's metadata (`file.canisterId`).
   * Writes: New files are written to the current active canister until it reaches 350 GB.

### Storage Capacity Scaling Table
* 1 Canister = **400 GB**
* 5 Canisters = **2.0 Terabytes**
* 10 Canisters = **4.0 Terabytes**
* 100 Canisters = **40.0 Terabytes**

---

## 5. Unit Economics & Pricing Model

### Pricing Tiers
* **Monthly:** Base tier.
* **Annual:** 10 months upfront = 2 months free (~17% discount).

| Capacity Tier | Monthly Price | Annual Plan (Upfront) | Real IC Cycles Cost / Year | Company Profit Margin |
|---|---|---|---|---|
| **1 GB** | 0.50 ICP | **5.00 ICP** (~$45) | ~0.40 ICP (~$3.60) | **~92%** |
| **5 GB** | 2.00 ICP | **20.00 ICP** (~$180) | ~2.96 ICP (~$26.63) | **~85.2%** |
| **10 GB** | 4.00 ICP | **40.00 ICP** (~$360) | ~5.92 ICP (~$53.26) | **~85.2%** |
| **20 GB** | 8.00 ICP | **80.00 ICP** (~$720) | ~11.84 ICP (~$106.52) | **~85.2%** |
| **50 GB** | 20.00 ICP | **200.00 ICP** (~$1,800) | ~29.60 ICP (~$266.30) | **~85.2%** |
| **100 GB** | 40.00 ICP | **400.00 ICP** (~$3,600) | ~59.20 ICP (~$532.60) | **~85.2%** |

*Cycle pricing benchmark: 127,000 cycles / GiB / second $\approx$ 4.005 Trillion Cycles per GB per year ($\approx$ $3.60 USD / GB / year).*

---

## 6. Public vs. Private Bucket Security & CDN Rules

### Public Buckets
* Accessible worldwide via global edge CDN (`https://cdn.icpay.app/cloud/{bucket}/{file}`).
* Cache Policy: `s-maxage=60, stale-while-revalidate=300`. Fast edge acceleration while ensuring any status change to Private takes effect in seconds.

### Private Buckets
* Unauthenticated requests to raw or CDN URLs strictly return **`403 Forbidden`**.
* Cache Policy: `cache-control: private, no-store, no-cache`. Never cached on shared edge CDNs.
* Access requires:
  1. Authenticated Internet Identity owner via frontend dashboard.
  2. Scoped API Key via `Authorization: Bearer <key>` or `x-api-key: <key>`.
