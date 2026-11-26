---
name: icpay-command
description: Authoritative guide and reference for ICPay operations using icp-cli and npm run ci — commands, syntax, flags, recipe architecture, environments, cycles management, and migration from dfx.
---

# ICPay Operations & `icp-cli` Command Reference

ICPay uses **`icp-cli`** (replacing the deprecated `dfx`) as the official toolchain for canister compilation, deployment, cycles management, and network interaction.

Operations run through either:
1. **The `npm run ci` CLI suite**: Pre-configured production operations in `ci/` executed via `npm run ci <group>:<command>`.
2. **Direct `icp` invocations**: Run from `backend/` or via the root forwarder `npm run ci -- icp <subcommand> [flags]`.

---

## 1. Non-Negotiable Invariants & Safety

* **Default Network is Mainnet (`-e ic`)**: Commands target the Internet Computer mainnet by default. For local testing, pass `-- --local` (or `-e local`).
* **Interactive Confirmations for State Mutations**: Any command modifying live mainnet state requires a typed `yes` in an interactive terminal.
* **Identity Security**: Never request, log, or commit private keys, `.pem` files, or seed phrases. Identities remain strictly in the local keyring.
* **Pinned Derivation Origin**: `NEXT_PUBLIC_DERIVATION_ORIGIN` is permanently `https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io`. Never change this value.

---

## 2. Configuration Architecture

### `backend/icp.yaml`
Configured with DFINITY's official recipe system:

```yaml
canisters:
  # Motoko Custodial Wallet Backend
  - name: icp_wallet_backend
    recipe:
      type: "@dfinity/motoko@v4.0.0"
      configuration:
        main: src/main.mo
        args: ""

  # Next.js Static Asset Canister
  - name: icp_wallet_frontend
    recipe:
      type: "@dfinity/asset-canister@v2.2.1"
      configuration:
        dir: dist

  # Rust DEX & Auxiliary Canisters
  - name: icpay_trade
    recipe:
      type: "@dfinity/rust@v3.4.0"
      configuration:
        package: icpay_trade
        candid: rust/trade/icpay_trade.did

  - name: cnsmangment
    recipe:
      type: "@dfinity/rust@v3.4.0"
      configuration:
        package: cnsmangment
        candid: rust/cnsmangment/cnsmangment.did

  - name: icpay_academy
    recipe:
      type: "@dfinity/rust@v3.4.0"
      configuration:
        package: icpay_academy
        candid: rust/academy/icpay_academy.did

  - name: iccron
    recipe:
      type: "@dfinity/rust@v3.4.0"
      configuration:
        package: iccron
        candid: rust/iccron/iccron.did

  # Motoko Microservices with Init Arguments
  - name: icp_blob_store
    init_args: '(principal "6vbhm-nqaaa-aaaan-q6muq-cai")'
    recipe:
      type: "@dfinity/motoko@v4.0.0"
      configuration:
        main: blob_store/src/main.mo
        args: ""

  - name: icpay_notifier
    init_args: '(principal "6vbhm-nqaaa-aaaan-q6muq-cai")'
    recipe:
      type: "@dfinity/motoko@v4.0.0"
      configuration:
        main: notifier/src/main.mo
        args: ""

  # Pre-built Custom Canisters
  - name: icpay_index
    init_args: '(opt variant { Init = record { ledger_id = principal "5fsnk-rqaaa-aaaan-q6m4q-cai" } })'
    build:
      steps:
        - type: script
          commands:
            - cp deps/index/ic-icrc1-index-ng.wasm.gz "$ICP_WASM_OUTPUT_PATH"
```

### Canister ID Mappings (`backend/.icp/data/mappings/ic.ids.json`)
Persistent canister mappings tracked in Git:

```json
{
  "cnsmangment": "6jtj7-4qaaa-aaaan-q6tta-cai",
  "iccron": "w2fxo-5qaaa-aaaan-q6zxq-cai",
  "icp_blob_store": "fly6t-piaaa-aaaan-q6oga-cai",
  "icp_wallet_backend": "6vbhm-nqaaa-aaaan-q6muq-cai",
  "icp_wallet_frontend": "63dke-waaaa-aaaan-q6mvq-cai",
  "icpay_academy": "wkdfn-yqaaa-aaaan-q6vyq-cai",
  "icpay_index": "geode-2qaaa-aaaan-q6wuq-cai",
  "icpay_notifier": "2hvuh-xiaaa-aaaan-q6uua-cai",
  "icpay_trade": "gomfy-saaaa-aaaan-q6onq-cai"
}
```

---

## 3. Essential `icp` Commands & Use Cases

### Canister Queries & Inspection
```bash
# Print canister ID only (from local mappings, no network cost)
icp canister status icp_wallet_backend -e ic --id-only

# Public canister report (controllers, module hash) via state tree
icp canister status icp_wallet_backend -e ic -p

# Full canister status report (includes memory, cycles balance when caller is controller)
icp canister status icp_wallet_backend -e ic

# List all configured canisters in the environment
icp canister list -e ic

# Make a query call (fast, read-only, uncertified, zero cycle burn)
icp canister call icp_wallet_backend getUsernameCount '()' --query -e ic

# Make an update call (consensus round, state mutating)
icp canister call icp_wallet_backend registerLaunchedLedgers '()' -e ic

# Read canister log stream
icp canister logs icp_wallet_backend -e ic
```

### Building & Deploying
```bash
# Validate project configuration and effective recipe expansion
icp project show

# Build a specific canister (uses mops moc or cargo wasm32)
icp build icp_wallet_backend -e ic

# Deploy / upgrade a canister to mainnet
icp deploy icp_wallet_backend -e ic --mode upgrade --yes

# Deploy with specific initial cycles attachment
icp deploy icpay_trade -e ic --cycles 1t --yes

# Sync asset canister static directory
icp sync icp_wallet_frontend -e ic
```

### Cycles Management
```bash
# Display identity's cycles balance on the cycles ledger
icp cycles balance

# Convert ICP to cycles
icp cycles mint 1.5

# Transfer cycles to a specific principal
icp cycles transfer 6vbhm-nqaaa-aaaan-q6muq-cai 5t

# Top up a canister with cycles directly
icp canister top-up icp_wallet_backend 2t -e ic
```

### Token Operations
```bash
# Check ledger balance
icp token balance icp -e ic

# Transfer ICP
icp token transfer icp <destination-account-or-principal> 1.0 -e ic

# ICRC-2 Spender allowance & approval
icp token approve icp <spender-principal> 5.0 -e ic
icp token allowance icp <spender-principal> -e ic
```

### Local Network Operations
```bash
# Start local network in background
icp network start -d

# Check status of local network
icp network status

# Ping network gateway
icp network ping local
icp network ping ic

# Stop local network
icp network stop
```

---

## 4. `npm run ci` Command Mapping

The project wraps `icp` invocations in `ci/` via `npm run ci`:

| Command | Action | Underlying `icp` Mechanism |
|---|---|---|
| `npm run ci canister:id <name>` | Print resolved canister ID | `icp canister status <name> -e ic --id-only` |
| `npm run ci canister:info <name>` | Fetch controllers & module hash | `icp canister status <name> -e ic -p` |
| `npm run ci canister:status <name>` | Query management canister status | `icp canister status <name> -e ic` |
| `npm run ci canister:list` | List all owned mainnet canisters | Reads `.icp/data/mappings/ic.ids.json` |
| `npm run ci canister:call <method> ['(args)']` | Query or update canister method | `icp canister call <canister> <method> [args] -e ic` |
| `npm run ci users:count` | Query registered username count | `icp canister call icp_wallet_backend getUsernameCount '()' --query -e ic` |
| `npm run ci backend:build` | Compile Motoko backend | `icp build icp_wallet_backend -e ic` |
| `npm run ci backend:deploy` | Upgrade mainnet custodial backend | `icp deploy icp_wallet_backend -e ic --mode upgrade --yes` |
| `npm run ci backend:logs` | Stream backend execution logs | `icp canister logs icp_wallet_backend -e ic` |
| `npm run ci backend:hash` | Inspect live module hash | `icp canister status icp_wallet_backend -e ic -p` |
| `npm run ci trade:build` / `:deploy` | Compile / Deploy Rust DEX | `icp build icpay_trade` / `icp deploy icpay_trade -e ic` |
| `npm run ci blob:status` | Audit on-chain storage metrics | Queries `stats`, `getCapacityLimit` via `icp canister call` |
| `npm run ci cycles:balance` | Check canister cycles & runway | `icp canister status` across all canisters |
| `npm run ci ledger:balance` | Check operator's ICP balance | `icp token balance icp -e ic` |
| `npm run ci -- icp <subcommand>` | Direct proxy to `icp-cli` | Passes command directly to `icp` in `backend/` |

---

## 5. Migration Cheat Sheet (`dfx` vs `icp-cli`)

| Legacy `dfx` Syntax | Modern `icp-cli` Syntax |
|---|---|
| `dfx deploy --network ic` | `icp deploy -e ic` |
| `dfx build <canister>` | `icp build <canister> -e ic` |
| `dfx canister id <canister> --network ic` | `icp canister status <canister> -e ic --id-only` |
| `dfx canister info <canister> --network ic` | `icp canister status <canister> -e ic -p` |
| `dfx canister status <canister> --network ic` | `icp canister status <canister> -e ic` |
| `dfx canister call <canister> <fn> '(args)'` | `icp canister call <canister> <fn> '(args)' -e ic` |
| `dfx canister call <canister> <fn> --query` | `icp canister call <canister> <fn> '(args)' --query -e ic` |
| `dfx canister logs <canister> --network ic` | `icp canister logs <canister> -e ic` |
| `dfx start --background` | `icp network start -d` |
| `dfx stop` | `icp network stop` |
| `dfx ledger balance --network ic` | `icp token balance icp -e ic` |
| `dfx cycles balance` | `icp cycles balance` |
| `canister_ids.json` | `.icp/data/mappings/ic.ids.json` |
| `dfx.json` | `icp.yaml` |
