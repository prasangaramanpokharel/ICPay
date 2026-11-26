# CyclePay Integration Blueprint & Architecture Audit

Comprehensive reference and integration blueprint for **[CyclePay](https://www.cyclepay.org)** (`www.cyclepay.org`) within **ICPay**.

---

## 1. Executive Summary & Core Value Proposition

**CyclePay** is an official DFINITY Foundation-backed decentralized infrastructure service on the Internet Computer that enables **zero-margin cycles purchasing and automated canister refills** using:
1. **Credit/Debit Cards & Mobile Wallets** (Apple Pay, Google Pay via Stripe)
2. **ck-USDC** (Native on-chain ICP token via ICRC-2 and direct checkouts)

### Key Value for ICPay
* **Zero Service Markup**: 100% protocol rate ($1\text{ XDR} = 1\text{ Trillion Cycles}$). Users only pay the payment rail processor fee (Stripe 2.9% + $0.30 or ck-USDC 0.01 ledger fee).
* **Frictionless Developer Onboarding**: Web2 developers and project managers can create and fund IC canisters immediately using a credit card without having an exchange account, buying ICP, or setting up a cycles wallet.
* **Direct Canister Delivery**: Cycles land directly in the target canister via the Cycles Minting Canister (CMC) `notify_top_up` with zero intermediate ledger fees.
* **Prepaid Auto-Refill Subscriptions**: Monitors canister balances and automatically tops them up from a Cycles Ledger allowance before they freeze.

---

## 2. Protocol Architecture & Smart Contracts

CyclePay has **no REST API**. It runs 100% on Internet Computer canisters. All interactions are Candid queries or consensus update calls.

### Canister Registry

| Canister Name | Canister ID | Network | Role |
|---|---|---|---|
| **CyclePay Backend** | `2bwus-iiaaa-aaaac-bee3a-cai` | IC Mainnet | Order creation, Stripe webhook ingestion, ck-USDC pull & checkout, CMC minting coordinator |
| **CyclePay Console** | `to2ii-4iaaa-aaaac-bgdma-cai` | IC Mainnet | Auto-refill subscription manager, status-viewer monitor, order history |
| **Cycles Ledger** | `um5iw-rqaaa-aaaaq-qaaba-cai` | IC Mainnet | ICRC-1/ICRC-2 cycles token ledger (1 cycle = 1 atom, fee = 100M cycles) |
| **ck-USDC Ledger** | `xevnm-gaaaa-aaaar-qafnq-cai` | IC Mainnet | ICRC-1/ICRC-2 USD token ledger (6 decimals, fee = 10,000 = $0.01) |
| **Cycles Minting Canister (CMC)** | `rkp4c-7iaaa-aaaaa-aaaca-cai` | IC Mainnet | IC system canister: burns ICP and mints cycles |
| **Exchange Rate Canister (XRC)** | `uf6dk-hyaaa-aaaaq-qaaaq-cai` | IC Mainnet | Provides certified live ICP/XDR and USD/XDR rates |
| **Stripe Gateway Canister** | `4w3yu-fyaaa-aaaac-beeoa-cai` | IC Mainnet | Ingests Stripe webhook consensus messages |

---

## 3. Candid API Specification

### 3.1. Public Pricing & Terms

#### `get_xdr_rate_status`
```candid
get_xdr_rate_status : () -> (XdrRateStatus) query
```
* **Canister**: `2bwus-iiaaa-aaaac-bee3a-cai` (Anonymous query)
* **Returns**:
  ```candid
  record {
    xdr_usd_x10000 : nat64; // e.g. 13520 represents $1.3520 per XDR
    source : variant { Xrc; Legacy; Manual };
    updated_at : opt nat64;
    stale : bool;
  }
  ```
* **Cycles Calculation Formula**:
  $$\text{Delivered Cycles} = \frac{\text{Net USD Amount}}{\text{USD per XDR}} \times 10^{12}$$

#### `get_card_terms`
```candid
get_card_terms : () -> (CardTerms) query
```
* **Returns**:
  * `payment_link`: Base Stripe payment link
  * `min_order_usd_cents`: 100 ($1.00)
  * `max_order_usd_cents`: 20000 ($200.00)
  * `fee_bps`: 290 (2.9%)
  * `fee_fixed_usd_cents`: 30 ($0.30)
  * `ledger_delivery_fee_cycles`: 200,000,000 cycles (0.0002T, applied only if destination is Cycles Ledger, 0 for canister destination)
  * `deliveries_paused`: boolean

#### `get_ckusdc_terms`
```candid
get_ckusdc_terms : () -> (CkUsdcTerms) query
```
* **Returns**:
  * `spender`: `record { owner = principal "2bwus-iiaaa-aaaac-bee3a-cai"; subaccount = null }`
  * `ledger`: `xevnm-gaaaa-aaaar-qafnq-cai`
  * `fee_atomic`: 10,000 (0.01 ck-USDC)
  * `min_amount_atomic`: 1,000,000 ($1.00)
  * `max_amount_atomic`: 200,000,000 ($200.00)
  * `step_atomic`: 10,000 (1 cent)

---

### 3.2. Card / Stripe Payment Flow

#### 1. Instant Guest Checkout (Zero Canister Calls Required)
For amounts between **$5 and $100**, no authentication or preliminary canister call is required:
* **Canister Top-Up**:
  `https://www.cyclepay.org/c/<canister_id>/<usd_amount>`
  *(e.g., `https://www.cyclepay.org/c/6vbhm-nqaaa-aaaan-q6muq-cai/25`)*
* **Cycles Ledger Account Top-Up**:
  `https://www.cyclepay.org/b/<principal>/<usd_amount>`

#### 2. Authenticated / Custom Card Order (`create_order`)
```candid
create_order : (record {
  destination : variant { Canister : principal; Ledger };
  beneficiary : opt principal;
  amount_usd_cents : nat64;
  escrow_spender : opt principal;
  escrow_principal : opt principal;
  project_id : opt text;
  confirm_system_canister : opt bool;
}) -> (variant { Ok : CreatedOrder; Err : OrderError })
```
* **Result**:
  * `order_id`: Unique order identifier (e.g., `"ord_abc123"`)
  * `payment_url`: Direct Stripe Checkout URL carrying `client_reference_id="o_<order_id>"`
  * `expires_at`: Order timestamp expiration (unpaid orders expire in 25 hours)

#### 3. Status Polling (`order_status`)
```candid
order_status : (text) -> (opt OrderStatusView) query
```
* Query with `order_id` every 2–3 seconds while user pays.
* Status variants:
  * `AwaitingPayment`: User has not completed checkout
  * `Processing` / `Delivered`: Cycles minted and delivered to target canister
  * `Refunding` / `Refunded`: Payment cancelled or refunded

---

### 3.3. Native ck-USDC Payment Flow

#### Method A: ICRC-2 Approve & Pull (`topup_ckusdc`)
1. Call `icrc2_approve` on ck-USDC ledger (`xevnm-gaaaa-aaaar-qafnq-cai`) approving spender `2bwus-iiaaa-aaaac-bee3a-cai` for `amount + 0.01`.
2. Call `topup_ckusdc`:
```candid
topup_ckusdc : (record {
  request_id : text; // Idempotency key (e.g. UUID)
  amount_atomic : nat; // e.g. 25_000_000 for $25.00
  destination : variant { Canister : principal; Ledger };
  beneficiary : opt principal;
  project_id : opt text;
  confirm_system_canister : opt bool;
}) -> (variant { Ok : CkUsdcPayment; Err : TopupCkUsdcError })
```
* Cycles are pulled and delivered directly in a single call (usually < 5 seconds).

#### Method B: Direct Transfer Checkout (`create_ckusdc_checkout`)
1. Call `create_ckusdc_checkout` $\rightarrow$ returns unique `deposit_account` (`owner: 2bwus-iiaaa-aaaac-bee3a-cai`, `subaccount: opt blob`).
2. Transfer exact `amount_atomic` to `deposit_account` via standard `icrc1_transfer`.
3. Call `notify_ckusdc_checkout` with the block index to immediately trigger delivery.

---

### 3.4. Prepaid Auto-Refill Subscriptions (`subscription_create`)

Operated via the **CyclePay Console** (`to2ii-4iaaa-aaaac-bgdma-cai`):
1. **Grant Permission**:
   Add the console canister as a `status-viewer` so it can monitor cycles balance:
   ```bash
   icp canister settings update <target_canister> --add-status-viewer to2ii-4iaaa-aaaac-bgdma-cai -e ic
   ```
2. **Create Subscription**:
   ```candid
   subscription_create : (record {
     destination : variant { Canister : principal; LedgerAccount : Account };
     threshold_cycles : nat; // e.g. 2_000_000_000_000 (2T cycles)
     refill_to_cycles : nat; // e.g. 10_000_000_000_000 (10T cycles)
     funding : variant {
       Prepaid : record {
         monthly_cap_cycles : nat; // Maximum cycles allowed to burn per month
         from_subaccount : opt blob;
       }
     };
     project_id : opt text;
   }) -> (variant { Ok : SubscriptionView; Err : ConsoleError })
   ```
3. **Approve Allowance**:
   Call `icrc2_approve` on the Cycles Ledger (`um5iw-rqaaa-aaaaq-qaaba-cai`) approving the subscription's designated spender principal for the monthly cap.

---

## 4. Current ICPay Architecture Audit

### Existing State in ICPay
* **Canister Management (`/canister`)**:
  * Users view controlled canisters, cycles balances, and controllers.
  * Top-ups currently require **custodial ICP balance** from the ICPay wallet.
  * Under the hood, ICPay calls the CMC to convert ICP and trigger `notify_top_up`.
* **Pain Points Identified**:
  1. **New Users Have Zero ICP**: A user who just created an Internet Identity or wants to test a canister must first find a crypto exchange, buy ICP, withdraw to ICPay, and then top up.
  2. **No Fiat Card Rail**: No in-app option to pay $10, $25, or $50 with a credit card or Apple Pay to top up a canister.
  3. **No Direct Stablecoin (ck-USDC) Rail**: Users holding ck-USDC must first swap to ICP on the DEX (incurring slippage and fees) before converting to cycles.
  4. **Manual Monitoring Risk**: If a developer forgets to check their canister cycles, the canister freezes and risks de-allocation. ICPay currently has no auto-refill triggers.

---

## 5. Implementation Roadmap & Use Cases for ICPay

### Use Case 1: Multi-Rail Top-Up Modal in Canister Management
Upgrade `frontend/components/canister/details/my-canister-topup-dialog.tsx` to provide 3 clear payment tabs:

```
┌────────────────────────────────────────────────────────┐
│ Top Up Canister Cycles                                 │
├────────────────────────────────────────────────────────┤
│  [ ICP Balance ]   [ Card / Apple Pay ]   [ ck-USDC ]  │
│                                                        │
│  Selected: Card / Apple Pay (via CyclePay)            │
│  Canister: 6vbhm-nqaaa-aaaan-q6muq-cai                 │
│                                                        │
│  Presets:  [ $10 ]   [ $25 ]   [ $50 ]   [ $100 ]      │
│                                                        │
│  Est. Cycles:  ~17.73 Trillion Cycles (at $1.352/XDR) │
│  Processor Fee: $1.03 (Stripe 2.9% + $0.30)            │
│  CyclePay Markup: $0.00 (Zero Margin)                  │
│                                                        │
│  [ Pay $25.00 with Card / Apple Pay ]                  │
└────────────────────────────────────────────────────────┘
```
* **Instant Guest Link Mode**: For quick top-ups ($5–$100), ICPay can open `https://www.cyclepay.org/c/<canister_id>/<usd>` in a focused popup or new tab.
* **In-App Checkout Mode**: Call `create_order` directly via `@dfinity/agent` to get a customized `payment_url` and poll `order_status` in real time, displaying a native checkmark when cycles land.

---

### Use Case 2: Direct ck-USDC Cycles Conversion
Allow users holding ck-USDC in their ICPay wallet to fund canisters directly:
1. One-click approval on ck-USDC ledger (`xevnm-gaaaa-aaaar-qafnq-cai`).
2. Invoke `topup_ckusdc` on CyclePay backend `2bwus-iiaaa-aaaac-bee3a-cai`.
3. Eliminates DEX trading fees, slippage, and manual CMC burn steps.

---

### Use Case 3: Cycles Ledger Asset Card in ICPay Wallet
Integrate the official IC **Cycles Ledger** (`um5iw-rqaaa-aaaaq-qaaba-cai`):
* Display `Cycles` as a first-class asset in the token list (`Tokens` overview).
* Query balance via `icrc1_balance_of`.
* Allow transferring cycles between principals via standard ICRC-1 transfer.
* Allow topping up any controlled canister directly from the Cycles Ledger balance.

---

### Use Case 4: Automated Canister Runway Protection (Auto-Refill)
Protect canisters from sudden depletion and freezing:
1. In the Canister Management UI, provide an **"Auto-Refill Settings"** switch.
2. User configures:
   * **Minimum Threshold**: e.g., 2T cycles.
   * **Refill Target**: e.g., 10T cycles.
   * **Monthly Budget Cap**: e.g., $15 (11T cycles).
3. ICPay executes:
   * `icp canister settings update <canister> --add-status-viewer to2ii-4iaaa-aaaac-bgdma-cai`
   * Registers subscription with `subscription_create`.
   * Automatically keeps mission-critical canisters (like `icp_blob_store` for icBucket and `iccron`) online 24/7.

---

### Use Case 5: Public "Sponsor this Canister" Badges & Links
For canisters hosted through ICPay (e.g., custom domains, decentralized websites on icBucket, public community canisters):
* Generate embeddable badges and URLs:
  ```html
  <a href="https://www.cyclepay.org/c/<canister_id>/10" target="_blank">
    <img src="https://icpay.app/images/badges/fund-with-cyclepay.svg" alt="Fund with CyclePay" />
  </a>
  ```
* Any user or donor can contribute cycles using their credit card without needing an IC wallet or identity.

---

### Use Case 6: Autonomous Agent Operations (ICPay AI & Cron Tasks)
* Autonomous agents executing on `iccron` or handling automated background tasks can monitor their cycle consumption.
* If runway drops below 7 days, the agent can programmatically call `create_order` or `topup_ckusdc` to maintain operational independence within a pre-approved budget.

---

## 6. Summary of Architectural Interfaces & Constants

```typescript
export const CYCLEPAY_BACKEND_CANISTER_ID = "2bwus-iiaaa-aaaac-bee3a-cai"
export const CYCLEPAY_CONSOLE_CANISTER_ID = "to2ii-4iaaa-aaaac-bgdma-cai"
export const CYCLES_LEDGER_CANISTER_ID = "um5iw-rqaaa-aaaaq-qaaba-cai"
export const CK_USDC_LEDGER_CANISTER_ID = "xevnm-gaaaa-aaaar-qafnq-cai"

export const CYCLEPAY_GUEST_CANISTER_URL = (canisterId: string, usd: number) =>
  `https://www.cyclepay.org/c/${canisterId}/${usd}`

export const CYCLEPAY_GUEST_LEDGER_URL = (principal: string, usd: number) =>
  `https://www.cyclepay.org/b/${principal}/${usd}`
```
