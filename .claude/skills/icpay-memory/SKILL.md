---
name: icpay-memory
description: Canister memory architecture, stable memory vs heap limits, high-water mark mechanics, upgrade safety, and memory management rules for ICPay canisters (backend, blob store, trade, frontend).
---

# ICPay — Canister Memory Architecture & Rules

This guide explains how memory works across ICPay's canisters, what causes memory
growth, how the Internet Computer bills memory, and rules future developers and AI
must follow to keep canisters safe and healthy.

---

## 1. Canister Memory Map

| Canister | ID | Type | Billed Memory | Role & Data Contained |
|---|---|---|---|---|
| **`icp_wallet_backend`** | `6vbhm-nqaaa-aaaan-q6muq-cai` | Motoko | **~2.19 GB** | User profiles, handles, ledger subaccounts, transaction history, bucket metadata. |
| **`icp_blob_store`** | `fly6t-piaaa-aaaan-q6oga-cai` | Motoko | **~16.9 MB** | Raw file payloads (images, webp, media). Keeps the backend canister lean. |
| **`icpay_trade`** | `gomfy-saaaa-aaaan-q6onq-cai` | Rust | **~10 MB** | DEX trading pools, order books, liquidity state. |
| **`icp_wallet_frontend`** | `63dke-waaaa-aaaan-q6mvq-cai` | Assets | **~15 MB** | Asset canister serving static assets and II derivation origin. |

---

## 2. Understanding the "High-Water Mark" on the IC

### Why is the backend billed at ~2.19 GB when logical data is ~625 KB?
1. On the Internet Computer, WebAssembly and stable memory expand in **64 KB pages**.
2. Once a page is touched or allocated during past migrations, serialization, or
   indexing, the IC preserves that allocation for the canister.
3. The IC memory manager **does not shrink allocated pages back to the subnet**
   (this is known as the *high-water mark*).

### Does `npm run ci backend:deploy` increase memory?
**NO.**
* Routine code deployments and bug fixes **do not increase memory**.
* During an upgrade, the canister serializes its state into stable memory, installs
  the new wasm, and deserializes back into memory.
* Because the volume of data does not suddenly double, Motoko **overwrites and
  reuses the already-allocated pages**.
* Verified: Deploying an upgrade preserves the exact byte count (`2,351,435,523 Bytes`).

---

## 3. What Causes Memory to Increase (Awareness Watchlist)

Future developers and AI agents must be aware of the following 4 factors:

### Factor 1: Preupgrade / Postupgrade Duplication (High Risk)
* **What happens:** If a migration converts an old data format to a new one
  (e.g., converting a list of records to a new schema), having both the old
  dataset and the new dataset in memory simultaneously causes a memory peak.
* **Impact:** If the peak exceeds the currently allocated 2.19 GB, the IC will allocate
  more pages, raising the permanent high-water mark.
* **Rule:** When writing migrations in `backend/src/migrations/`, perform in-place
  transformations or chunked stream processing whenever possible. Never create full
  duplicate temporary arrays of large datasets.

### Factor 2: Storing Large File Blobs in the Backend (Critical Mistake)
* **What happens:** Storing binary files (images, audio, videos) directly inside
  `backend/src/storage/` will rapidly consume heap and stable memory.
* **Rule:** **Never store raw file blobs in `icp_wallet_backend`.**
  * All binary payloads must be dispatched to `icp_blob_store` (`fly6t-piaaa-aaaan-q6oga-cai`).
  * The backend canister only stores metadata (file name, size, hash, content type, owner).

### Factor 3: Unbounded In-Memory Collections (Silent Leak)
* **What happens:** Appending logs, rate-limit IP records, or analytics events to
  a `Buffer` or `HashMap` without a maximum eviction limit.
* **Rule:** Any logging or temporary tracking structure must use a **bounded ring buffer**
  (e.g., keeping only the latest 500 or 1,000 entries and dropping the oldest).

### Factor 4: Organic Growth (Expected & Safe)
* **What happens:** New users creating accounts, claiming `@handles`, or recording
  transactions.
* **Impact:** Very low. Each user record is only a few hundred bytes. Adding 100,000
  users only takes ~30–50 MB.

---

## 4. Memory Limits & Safety Thresholds

The backend canister is configured with safety limits to prevent hitting the 32-bit
Wasm heap ceiling:

* **Wasm Memory Safety Limit:** `3,221,225,472 Bytes` (**3.00 GiB**)
* **Current Billed Size:** `2,351,435,523 Bytes` (**~2.19 GiB**)
* **Safety Margin:** Over **870 MB** of headroom.
* **Freezing Threshold:** `2,592,000 Seconds` (30 days of idle burn reserved).
  * If cycles fall below 30 days of memory rent, the canister freezes and stops
    accepting update calls to protect state from deletion.

---

## 5. Daily Memory Rent & Cycles Economics

* **Idle burn (memory rent):** ~60.9 Billion cycles/day (~0.061 T/day).
* **Current balance:** ~18.71 Trillion cycles.
* **Runway:** **~277 days** above the 30-day freezing reserve.
* **Top-up threshold:** No top-up needed when runway > 90 days. Top-up guidance is
  checked automatically via `npm run ci bucket:stats`.

---

## 6. Audit & Inspection Commands

Run these from the repository root:

```bash
# 1. Full canister status (Memory size, balance, module hash, controllers)
npm run ci canister:status backend

# 2. Detailed memory, bucket storage, and runway analysis
npm run ci bucket:stats

# 3. Quick cycles & runway check across all 4 canisters
npm run ci cycles:balance

# 4. Total claimed users / handles (0 cycles query)
npm run ci users:count
```

---

## 7. Hard Safety Rules for AI & Operators

1. **NEVER run `--mode=reinstall` on mainnet.**
   Reinstalling erases every user, balance record, subaccount, and transaction.
   Upgrades are strictly `--mode=upgrade`.
2. **Never store raw blobs in `icp_wallet_backend`.**
   Use `icp_blob_store`.
3. **Do not create duplicate state during migrations.**
   Transform data in-place or stream lazily.
4. **Do not alarm the user about the 2.19 GB figure.**
   It is the historical high-water mark of allocated stable memory pages, is completely
   normal on the Internet Computer, and does not grow with normal code deployments.
