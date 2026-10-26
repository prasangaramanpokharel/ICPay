# ICRC-1 / ICRC-2 Token Index Canister Architecture & Deployment Guide

## 1. Overview and Purpose

An ICRC-1 Token Ledger canister records transfers, mints, burns, and approvals sequentially into an append-only linear chain of blocks. While the ledger canister efficiently validates transactions and appends blocks, querying account-specific transaction history directly from the ledger is computationally expensive and not exposed as a standard querying endpoint.

The **Index Canister** (`ic-icrc1-index-ng`) solves this by operating as a dedicated companion service that:
1. Continuously synchronizes new blocks from the Ledger Canister using periodic timers.
2. Extracts and indexes transactions by account (`principal` and optional `subaccount`).
3. Exposes performant query endpoints (`get_account_transactions`, `get_blocks`, `icrc1_balance_of`, `list_subaccounts`).

An active Index Canister is a strict prerequisite for:
- **Oisy Wallet** (`oisy.com`) integration and automatic balance/history display.
- **Plug Wallet** transaction activity streams.
- **DEX Listing** (e.g., ICPSwap, KongSwap) for automated transaction verification.
- **On-chain token dashboards** (e.g., OhShii launcher / token trackers).

---

## 2. Mainnet Deployment Identifiers

| Parameter | Identifier / Value |
|---|---|
| Token Name | ICPay |
| Token Symbol | ICPAY |
| Token Standard | ICRC-1 / ICRC-2 |
| Ledger Canister ID | `5fsnk-rqaaa-aaaan-q6m4q-cai` |
| Index Canister ID | `geode-2qaaa-aaaan-q6wuq-cai` |
| Operator / Controller Principal | `or2yr-zj6k5-5gi2u-qo3tj-5pyn6-lbgwr-gqgpq-ubmff-ih4t4-yopxz-lqe` |
| Wasm Commit Hash | `5e8370e0a84ffb783d6a9d77e0d3e90fa3914cfe` |
| Upstream Release Tag | `release-2026-10-22_03-29-base` |
| Module Hash | `0xfb8b877dd6b116f1302ec9e98de3faafcb2ec91b796de82e1d57eca543e7feb8` |
| Ledger Decimals | 8 |
| Ledger Transfer Fee | 10,000 (0.0001 ICPAY) |

---

## 3. Cycle Economics and Cost Estimates

Deploying an index canister requires calculating upfront subnet creation fees, Wasm installation execution cycles, and ongoing idle burn costs.

### 3.1 Initial Deployment Costs

| Step | Cost | Notes |
|---|---|---|
| Subnet Creation Fee | 500,000,000,000 cycles (0.50 TC) | Standard IC system fee to allocate a new canister on an application subnet. |
| Wasm Installation & Storage Fee | ~30,000,000,000 cycles (0.03 TC) | Covers bytecode verification, initial memory pages, and execution. |
| Operational Buffer | 300,000,000,000 to 470,000,000 cycles (~0.30 - 0.47 TC) | Retained as active balance inside the canister for ongoing indexing. |
| **Recommended Initial Funding** | **0.80 TC to 1.00 TC** (800B - 1,000B cycles) | Ensures the canister installs cleanly and operates for 180+ days without immediate top-up. |

### 3.2 Ongoing Operational Burn Rates

* **Idle Burn Rate**: ~2,038,754,537 cycles per day (~0.002 TC/day or ~0.74 TC/year).
* **30-Day Freezing Reserve**: ~0.06 TC (~61,162,636,110 cycles).
* **Sync Consumption**: Querying and parsing blocks from the ledger uses negligible cycles because inter-canister calls between canisters on application subnets are highly efficient.
* **Current Status on Mainnet**:
  * Balance: `~426,000,000,000 cycles` (~0.426 TC)
  * Daily Idle Burn: `~2.04B cycles/day`
  * Net Runway: **~180 to 200 days** above freezing threshold.

---

## 4. Step-by-Step Deployment Runbook

Follow these exact steps to create and configure a clean index canister.

### Step 1: Download Official DFINITY Index Artifacts

Always source the latest verified build from DFINITY's official release distribution:

```bash
mkdir -p backend/deps/index

# 1. Download latest index-ng wasm (gzip compressed)
curl -sSL "https://download.dfinity.systems/ic/5e8370e0a84ffb783d6a9d77e0d3e90fa3914cfe/canisters/ic-icrc1-index-ng.wasm.gz" \
  -o backend/deps/index/ic-icrc1-index-ng.wasm.gz

# 2. Download latest Candid interface
curl -sSL "https://raw.githubusercontent.com/dfinity/ic/5e8370e0a84ffb783d6a9d77e0d3e90fa3914cfe/rs/ledger_suite/icrc1/index-ng/index-ng.did" \
  -o backend/deps/index/index-ng.did
```

### Step 2: Register Canister Target in `backend/dfx.json`

Add the custom target to `backend/dfx.json`:

```json
    "icpay_index": {
      "type": "custom",
      "candid": "deps/index/index-ng.did",
      "wasm": "deps/index/ic-icrc1-index-ng.wasm.gz",
      "init_arg": "(opt variant { Init = record { ledger_id = principal \"5fsnk-rqaaa-aaaan-q6m4q-cai\" } })"
    }
```

### Step 3: Create Canister on Mainnet

Run with cycle allocation from the controller identity:

```bash
cd backend
export DFX_WARNING=-mainnet_plaintext_identity
dfx canister --network ic create icpay_index --with-cycles 800000000000
```

*Expected output:*
```text
icpay_index canister created on network ic with canister id: geode-2qaaa-aaaan-q6wuq-cai
```

This updates `backend/canister_ids.json` automatically:
```json
  "icpay_index": {
    "ic": "geode-2qaaa-aaaan-q6wuq-cai"
  }
```

### Step 4: Top Up Canister for Wasm Installation

Subnet creation consumes 500B cycles. Before installing the ~342 KB Wasm, top up the canister with ~0.15 TC to ensure it does not encounter `IC0207` (out of cycles during install):

```bash
export DFX_WARNING=-mainnet_plaintext_identity
dfx cycles top-up geode-2qaaa-aaaan-q6wuq-cai 150000000000 --network ic
```

*Expected output:*
```text
Transfer sent at block index 16983335
```

### Step 5: Install Wasm with Ledger Principal Argument

Install code into the canister with the `Init` record:

```bash
cd backend
export DFX_WARNING=-mainnet_plaintext_identity
dfx canister --network ic install icpay_index \
  --wasm deps/index/ic-icrc1-index-ng.wasm.gz \
  --argument '(opt variant { Init = record { ledger_id = principal "5fsnk-rqaaa-aaaan-q6m4q-cai" } })' \
  --mode install
```

*Expected output:*
```text
Installed code for canister icpay_index, with canister ID geode-2qaaa-aaaan-q6wuq-cai
```

---

## 5. Verification Commands and Expected Responses

Execute queries directly to ensure the indexer is healthy and synced.

### 5.1 Verify Configured Ledger Principal

```bash
export DFX_WARNING=-mainnet_plaintext_identity
dfx canister --network ic call geode-2qaaa-aaaan-q6wuq-cai ledger_id
```

*Expected output:*
```text
(principal "5fsnk-rqaaa-aaaan-q6m4q-cai")
```

### 5.2 Verify Synchronization Progress

```bash
export DFX_WARNING=-mainnet_plaintext_identity
dfx canister --network ic call geode-2qaaa-aaaan-q6wuq-cai status
```

*Expected output:*
```text
(record { num_blocks_synced = 323 : nat })
```
`num_blocks_synced` must match the `chain_length` reported by the token ledger canister.

### 5.3 Verify Block Ingestion

```bash
export DFX_WARNING=-mainnet_plaintext_identity
dfx canister --network ic call geode-2qaaa-aaaan-q6wuq-cai get_blocks '(record { start = 0 : nat; length = 2 : nat })'
```

*Expected output:*
```text
(
  record {
    blocks = vec {
      variant { Map = vec { ... } };
      variant { Map = vec { ... } };
    };
    chain_length = 323 : nat64;
  }
)
```

### 5.4 Verify Account Transaction Query

```bash
export DFX_WARNING=-mainnet_plaintext_identity
dfx canister --network ic call geode-2qaaa-aaaan-q6wuq-cai get_account_transactions \
  '(record { account = record { owner = principal "6vbhm-nqaaa-aaaan-q6muq-cai"; subaccount = null }; max_results = 5 : nat })'
```

*Expected output:*
```text
(
  variant {
    Ok = record {
      balance = 0 : nat;
      transactions = vec { ... };
      oldest_tx_id = null;
    }
  }
)
```

---

## 6. Common Pitfalls and Solutions

### Pitfall 1: TimeStamp Decoding Trap on ICRC-2 Approvals

* **Error in Logs**:
  ```text
  [TRAP]: Unable to decode encoded block at index 71. Error: failed to decode a block: Semantic(None, "invalid type: integer 1786100109397000000, expected struct TimeStamp")
  ```
* **Root Cause**: Older builds of `ic-icrc1-index-ng` attempted to decode approval expiration (`expires_at`) using legacy `struct TimeStamp { timestamp_nanos: u64 }` instead of primitive `nat64` (`u64`) defined by ICRC-2 specifications.
* **Fix**: Upgrade the Wasm to commit `5e8370e0a84ffb783d6a9d77e0d3e90fa3914cfe` (`release-2026-10-22` or later).

### Pitfall 2: `SysTransient / IC0207` Out of Cycles on Install

* **Error**:
  ```text
  Canister geode-2qaaa-aaaan-q6wuq-cai is out of cycles: please top up the canister with at least 26_562_522_205 additional cycles
  ```
* **Root Cause**: Creating a canister with 0.8 TC expends 0.5 TC on subnet creation, leaving 0.3 TC. High freezing threshold calculation may reject Wasm installation until extra headroom is supplied.
* **Fix**: Run `dfx cycles top-up <canister_id> 150000000000 --network ic` before installing the Wasm.

### Pitfall 3: Subnet Placement

* Intersubnet calls incur cycle overhead compared to intra-subnet calls. When creating an index canister, you can optionally pass `--next-to 5fsnk-rqaaa-aaaan-q6m4q-cai` to co-locate both canisters on the same application subnet if subnet capacity permits.

---

## 7. Integrated Operations Tooling (`npm run ci`)

The index canister is fully wired into the repository's CI management suite:

| Command | Action |
|---|---|
| `npm run ci index:status` | Queries index sync progress (`num_blocks_synced`) and target ledger ID. |
| `npm run ci canister:status index` | Displays canister state, controller, memory usage, and cycles balance. |
| `npm run ci cycles:balance` | Computes daily idle burn, freezing threshold, and remaining runway days across all canisters. |
| `npm run ci cycles:topup 500000000000 index` | Tops up the index canister with 0.5 TC from the operator cycles ledger. |
| `npm run ci index:hash` | Outputs the current module hash on mainnet. |
| `npm run ci canister:list` | Lists all active ICPay canisters and shorthand aliases. |

---

## 8. Listing Submission Template for Third Parties

Use the following parameters when submitting ICPay for verification on Oisy Wallet, OhShii, ICPSwap, or KongSwap:

```json
{
  "token_symbol": "ICPAY",
  "token_name": "ICPay",
  "token_standard": "ICRC-1 / ICRC-2",
  "decimals": 8,
  "transfer_fee": 10000,
  "ledger_canister_id": "5fsnk-rqaaa-aaaan-q6m4q-cai",
  "index_canister_id": "geode-2qaaa-aaaan-q6wuq-cai",
  "logo_url": "https://icpay.app/logo.png",
  "website": "https://icpay.app",
  "documentation": "https://icpay.app/docs"
}
```
