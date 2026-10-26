---
name: icpay-integration
description: Complete blueprint for integrating new backend modules and independent Rust canisters into ICPay — crate layout, stable memory, dfx registration, custom CI CLI commands, cycle economics, and frontend client sync. Read before adding any new canister or backend microservice.
---

# ICPay Module & Canister Integration Standard

This guide specifies how to design, build, deploy, and integrate new independent backend canisters (especially Rust canisters) into ICPay without touching the custodial Motoko backend.

---

## 1. Core Principles

1. **Custodial Isolation**: The core Motoko canister (`icp_wallet_backend` in `backend/src/`) custodies real user funds. New features (e.g. trading engines, canister registries, indexing, blob stores) must be built as **independent micro-canisters**. Never pollute `backend/src/` with auxiliary services.
2. **Zero-Migration Stable Storage**: All stateful Rust canisters must use `ic-stable-structures` (`MemoryManager` + `StableBTreeMap` / `StableCell`) so that memory survives upgrades automatically with zero manual pre/post-upgrade serialization bugs.
3. **Operations Automation**: Every canister must have dedicated CI commands in `ci/` (`<name>:test`, `<name>:build`, `<name>:deploy`, `<name>:hash`) and be recognized in `ci/lib.ts` (`canister:list`, `canister:status`, `cycles:topup`).
4. **Offline-First Frontend Resilience**: Frontend clients must support graceful degradation. If a micro-canister is temporarily unreachable or not yet configured in local development, the UI must fall back gracefully without blocking the core wallet.

---

## 2. Directory Layout for a New Module

Place new Rust canisters inside `backend/rust/<module_name>/`:

```
backend/rust/<module_name>/
├── Cargo.toml            # Package manifest with crate-type = ["cdylib"]
├── <module_name>.did     # Candid interface
└── src/
    ├── lib.rs            # Endpoints (query/update) + export_candid!()
    ├── types.rs          # Candid & Storable structs (ciborium serialization)
    └── storage.rs        # MemoryManager + StableBTreeMap / StableCell
```

Reference implementations:
- `backend/rust/cnsmangment/` (User Canister Management & Registry)
- `backend/rust/trade/` (DEX Trading Engine)

---

## 3. Step-by-Step Canister Implementation

### Step 3.1: Manifest (`backend/rust/<module_name>/Cargo.toml`)

```toml
[package]
name = "<module_name>"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]
name = "<module_name>"

[dependencies]
ic-cdk = "0.19"
candid = "0.10"
ic-stable-structures = "0.7"
serde = { version = "1", features = ["derive"] }
ciborium = "0.2"
```

### Step 3.2: Storable Types (`src/types.rs`)

Use `ciborium` for `Storable` encoding. For composite keys, derive `PartialEq, Eq, PartialOrd, Ord`:

```rust
use candid::{CandidType, Principal};
use ic_stable_structures::{storable::Bound, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct EntityKey {
    pub owner: Principal,
    pub entity_id: Principal,
}

impl Storable for EntityKey {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        let mut buf = vec![];
        ciborium::into_writer(self, &mut buf).expect("encode EntityKey");
        Cow::Owned(buf)
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        ciborium::from_reader(bytes.as_ref()).expect("decode EntityKey")
    }
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct EntityRecord {
    pub id: Principal,
    pub label: String,
    pub created_at: u64,
}

impl Storable for EntityRecord {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        let mut buf = vec![];
        ciborium::into_writer(self, &mut buf).expect("encode EntityRecord");
        Cow::Owned(buf)
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        ciborium::from_reader(bytes.as_ref()).expect("decode EntityRecord")
    }
}
```

### Step 3.3: Stable Storage (`src/storage.rs`)

```rust
use candid::Principal;
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap,
};
use std::cell::RefCell;

use crate::types::{EntityKey, EntityRecord};

pub type Memory = VirtualMemory<DefaultMemoryImpl>;
pub const ENTITY_MEM_ID: MemoryId = MemoryId::new(0);

thread_local! {
    pub static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    pub static ENTITIES: RefCell<StableBTreeMap<EntityKey, EntityRecord, Memory>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(ENTITY_MEM_ID))
        ));
}

pub fn list_by_owner(owner: Principal) -> Vec<EntityRecord> {
    ENTITIES.with(|m| {
        m.borrow()
            .iter()
            .filter(|entry| entry.key().owner == owner)
            .map(|entry| entry.value())
            .collect()
    })
}
```

> [!IMPORTANT]
> In `ic-stable-structures 0.7`, `.iter()` returns `LazyEntry`. Always use `entry.key()` and `entry.value()`.

### Step 3.4: Endpoints & Candid Export (`src/lib.rs`)

Always reject `Principal::anonymous()` on user-scoped actions. Use `ic_cdk::api::msg_caller()`:

```rust
use candid::Principal;
use ic_cdk::{query, update};

pub mod storage;
pub mod types;

use types::EntityRecord;

fn caller_or_trap() -> Principal {
    let caller = ic_cdk::api::msg_caller();
    if caller == Principal::anonymous() {
        ic_cdk::trap("Anonymous caller is not permitted");
    }
    caller
}

#[query]
fn get_my_entities() -> Vec<EntityRecord> {
    let caller = caller_or_trap();
    storage::list_by_owner(caller)
}

ic_cdk::export_candid!();
```

---

## 4. Registering in the Backend Project

### 4.1: Root Cargo Workspace (`backend/Cargo.toml`)

Add your new crate under `workspace.members`:

```toml
[workspace]
members = [
  "rust/trade",
  "rust/cnsmangment",
  "rust/<module_name>"
]
resolver = "2"
```

### 4.2: DFX Configuration (`backend/dfx.json`)

Register the canister target in `backend/dfx.json`:

```json
    "<module_name>": {
      "candid": "rust/<module_name>/<module_name>.did",
      "package": "<module_name>",
      "crate": "<module_name>",
      "type": "rust"
    }
```

---

## 5. Integrating with CI Operations CLI (`ci/`)

Every canister needs operations tooling so developers never have to type raw dfx invocations or guess flags.

### 5.1: Create `ci/<module>/` Scripts

Create 4 files under `ci/<module>/`:

1. **`ci/<module>/test.ts`**:
   ```ts
   import { dirname, resolve } from "node:path"
   import { fileURLToPath } from "node:url"
   import { run, step } from "../lib.ts"
   const dir = resolve(dirname(fileURLToPath(import.meta.url)), "../../backend/rust/<module>")
   step("<MODULE> TESTS / CHECK")
   run("cargo", ["check", "--target", "wasm32-unknown-unknown"], dir)
   ```

2. **`ci/<module>/build.ts`**:
   ```ts
   import { dirname, resolve } from "node:path"
   import { fileURLToPath } from "node:url"
   import { run, step } from "../lib.ts"
   const dir = resolve(dirname(fileURLToPath(import.meta.url)), "../../backend/rust/<module>")
   step("<MODULE> BUILD")
   run("cargo", ["build", "--target", "wasm32-unknown-unknown", "--release"], dir)
   ```

3. **`ci/<module>/hash.ts`**:
   ```ts
   import { moduleHash } from "../lib.ts"
   console.log(moduleHash("<module_name>"))
   ```

4. **`ci/<module>/deploy.ts`**:
   ```ts
   import { dirname, resolve } from "node:path"
   import { fileURLToPath } from "node:url"
   import { BACKEND, canisterIds, confirm, dfx, dfxOut, moduleHash, run, step } from "../lib.ts"

   const CANISTER_NAME = "<module_name>"
   const CREATE_CYCLES = "1000000000000" // 1.0 TC initial funding
   const dir = resolve(dirname(fileURLToPath(import.meta.url)), "../../backend/rust/<module>")

   step("CHECK")
   run("cargo", ["check", "--target", "wasm32-unknown-unknown"], dir)

   step("BUILD")
   run("cargo", ["build", "--target", "wasm32-unknown-unknown", "--release"], dir)

   const ids = canisterIds()
   const canisterId = ids[CANISTER_NAME]?.ic
   const deployed = Boolean(canisterId)
   const before = deployed ? moduleHash(CANISTER_NAME) : "not deployed"

   console.log(`\nCurrent module hash: ${before}`)
   console.log(`Cycles ledger: ${dfxOut(["cycles", "balance"])}`)
   if (canisterId) console.log(`Canister id: ${canisterId}`)

   confirm(deployed ? `upgrade ${CANISTER_NAME} on mainnet` : `create and install ${CANISTER_NAME} on mainnet`)

   step("DEPLOY")
   if (deployed) {
     dfx(["deploy", CANISTER_NAME, "--yes"], BACKEND)
   } else {
     dfx(["deploy", CANISTER_NAME, "--yes", "--with-cycles", CREATE_CYCLES], BACKEND)
   }

   step("RESULT")
   console.log(`after: ${moduleHash(CANISTER_NAME)}`)
   ```

### 5.2: Update `ci/lib.ts`

Add your canister to `OWNED_CANISTERS` and `resolveOwnedCanister`:

```ts
export const OWNED_CANISTERS = [
  { name: "icp_wallet_backend", label: "backend" },
  { name: "icpay_trade", label: "trade" },
  { name: "icp_wallet_frontend", label: "frontend" },
  { name: "icp_blob_store", label: "blob store" },
  { name: "cnsmangment", label: "cns" },
  { name: "<module_name>", label: "<shorthand>" },
] as const
```

### 5.3: Register Commands in `ci/cli.ts`

```ts
  "<module>:test": "<module>/test.ts",
  "<module>:build": "<module>/build.ts",
  "<module>:deploy": "<module>/deploy.ts",
  "<module>:hash": "<module>/hash.ts",
```

Now `npm run ci <module>:deploy`, `npm run ci canister:status <module>`, and `npm run ci cycles:topup <amount> <module>` work out of the box.

---

## 6. Cycle Economics for New Canisters

> [!CAUTION]
> **Subnet Creation Fees**: Creating a brand-new canister on an IC application subnet requires an upfront creation fee of **500_000_000_000 cycles (0.5 TC)**.
> In addition, installing the wasm module requires runtime execution cycles (~0.2 TC).
>
> **Rule of Thumb**: Ensure the operator's cycles ledger has at least **0.8 to 1.0 TC** before creating a new canister:
> 1. Check: `npm run ci cycles:balance`
> 2. Convert ICP if needed: `npm run ci cycles:convert 0.3` (burns ~0.3 ICP to mint ~0.75 TC)
> 3. Deploy: `npm run ci <module>:deploy`

---

## 7. Frontend Integration Pattern

In `frontend/services/<module>/`:

1. **Client Service ([services/<module>/client.ts](file:///home/prasanga/Desktop/icppay/frontend/services))**:
   - Provide fallback to tracked mainnet canister ID from `backend/canister_ids.json`.
   - Wrap canister calls in `try/catch` and return `null` / fallback data on error.
2. **Offline-First Store**:
   - Cache results in `localStorage` or SWR cache for instant 0ms first render.
   - Sync with the canister in the background when `isAuthenticated`.
3. **Verification**:
   - Always run:
     ```bash
     cd frontend
     ./node_modules/.bin/tsc --noEmit
     ./node_modules/.bin/eslint services hooks components app lib --ext .ts,.tsx
     npm run build
     ```
