# ICPay Payment Gateway — Developer & Merchant Documentation

Accept instant, decentralized ICP payments in any web app, store, or mobile platform with zero gateway fees, instant 1.5s L1 settlement, and passkey security.

---

## 1. Quick Overview

ICPay payment links turn any `@username` into a non-custodial checkout terminal.
* **Gateway Fees**: 0% (only the standard network fee of 0.0001 ICP ≈ \$0.001).
* **Settlement Time**: 1–2 seconds with final on-chain block confirmation.
* **Chargeback Risk**: 0% (blockchain transactions are irreversible).
* **Customer Auth**: Internet Identity (TouchID / FaceID / Passkeys).

---

## 2. Generating a Payment Link

### Canonical Syntax & URL Formats

ICPay supports payment links on both the custom production domain and the **100% decentralized on-chain asset canister**:

| Environment | Supported Syntax | Example | Notes |
|---|---|---|---|
| **Production (Web2 CDN)** | `https://icpay.app/@<username>`<br>`https://icpay.app/<username>` | `https://icpay.app/@cybercafe?amount=1.5` | Fast global edge routing via Vercel edge rewrite. |
| **On-Chain Canister (Web3)** | `https://<canister_id>.icp0.io/@<username>`<br>`https://<canister_id>.icp0.io/<username>` | `https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io/@cybercafe?amount=1.5` | 100% hosted on-chain in ICP asset canister. Censorship-resistant. |

> [!NOTE]
> Both `@merchant` and `merchant` formats are valid. Leading `@` is automatically sanitized by both the on-chain shell loader (`onchain-shell.js`) and the checkout parser.

### URL Parameters

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `username` | string | **Yes** | Your ICPay handle in the URL path (`@merchant` or `merchant`). | `@cybercafe` |
| `amount` | float | No | Preset payment amount in ICP. | `1.5` |
| `ref` | string | No | Opaque order or invoice ID (up to 32 bytes). | `ord_98432` |
| `return_url` | string | No | HTTPS URL to redirect customer upon success. | `https://store.com/checkout/success` |
| `#note` | string | No | Client-side note (never sent over HTTP headers). | `#note=Table+5` |

### Code Example (JavaScript / TypeScript)
```ts
interface CreateCheckoutUrlOptions {
  merchant: string
  amountIcp: number
  orderId: string
  returnUrl?: string
  useOnChainCanister?: boolean
  canisterId?: string // Defaults to official ICPay frontend canister
}

function createCheckoutUrl({
  merchant,
  amountIcp,
  orderId,
  returnUrl,
  useOnChainCanister = false,
  canisterId = "63dke-waaaa-aaaan-q6mvq-cai"
}: CreateCheckoutUrlOptions): string {
  const handle = merchant.replace(/^@/, "").toLowerCase()
  const origin = useOnChainCanister
    ? `https://${canisterId}.icp0.io`
    : "https://icpay.app"

  const url = new URL(`${origin}/@${handle}`)
  url.searchParams.set("amount", amountIcp.toFixed(4))
  url.searchParams.set("ref", orderId)
  if (returnUrl) {
    url.searchParams.set("return_url", returnUrl)
  }
  
  return url.toString()
}

// 1. Standard production checkout link:
const prodLink = createCheckoutUrl({
  merchant: "cybercafe",
  amountIcp: 2.5,
  orderId: "inv_49201",
  returnUrl: "https://my-store.com/receipt"
})
// => https://icpay.app/@cybercafe?amount=2.5000&ref=inv_49201&return_url=...

// 2. 100% On-chain canister link (Decentralized / Web3 Native):
const onChainLink = createCheckoutUrl({
  merchant: "cybercafe",
  amountIcp: 2.5,
  orderId: "inv_49201",
  returnUrl: "https://my-store.com/receipt",
  useOnChainCanister: true
})
// => https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io/@cybercafe?amount=2.5000&ref=inv_49201&return_url=...
```

---

## 3. Privacy & Zero-Address-Leakage Standard

> [!IMPORTANT]
> **Strict Invariant: Never expose raw Principal IDs or 64-character hex Account Identifiers in Payment Links or QR Codes.**
> Always encode only the canonical `@username` checkout URL (`https://icpay.app/@merchant?amount=...&ref=...`).

### Why Raw Addresses & Principals Are Strictly Prohibited:
1. **Guarantees the Automated Return Flow (`return_url`)**:
   - If a customer sends raw ICP directly from an external wallet (NNS, Plug, Binance) to a hex address, the transaction occurs outside the browser. There is **no web session to trigger the `return_url` redirect** back to your store.
2. **Eliminates Order ID / Memo Loss**:
   - Centralized exchanges (Binance, OKX, Coinbase) often strip or reject alphanumeric invoice references. If customers pay directly from exchanges without `ref`, the merchant cannot determine which customer paid for which order.
3. **Instant Mobile QR Code Scanning**:
   - Short `@username` URLs create low-density, high-contrast QR codes that scan in under 0.2 seconds on any smartphone camera. Raw 64-character hex hashes create dense, blurry QR codes that struggle to scan in low light.
4. **Zero URL Data Leakage**:
   - Use opaque reference codes (`ref=ord_8921` or `ref=inv_9482`) instead of customer personal data (PII). Map this ID to customer details inside your private database.
   - ❌ **Forbidden**: `?memo=Send+to+Alice+at+123+Main+St`
   - ✅ **Required**: `?ref=inv_9482`

---

## 4. The Return URL Flow (After Payment Success)

When the customer completes the payment with Internet Identity, ICPay executes the transaction directly on the ICP Ledger.

If a `return_url` is provided:
1. ICPay presents the confirmed on-chain receipt with `blockIndex`.
2. After 2 seconds, ICPay automatically redirects the customer back to your `return_url` with verified query parameters:
   ```
   https://my-store.com/receipt?status=success&blockIndex=19482012&ref=inv_49201&amount=2.5
   ```

### Return Query Parameters
| Parameter | Description |
|---|---|
| `status` | `success` upon verified ledger confirmation. |
| `blockIndex` | Permanent block index on the Internet Computer ICP Ledger. |
| `ref` | The order reference ID passed originally. |
| `amount` | Confirmed token amount paid. |

---

## 5. Zero-Cycle On-Chain Verification

Merchants can verify payments directly on the Internet Computer blockchain without paying any gas or cycles.

### How It Works
* Queries (`icrc1_balance_of` or checking ledger blocks) are **free read-only lookups** executed across boundary nodes.
* **Cost**: **0 Cycles**.

### Verification via `@dfinity/agent` (Node.js / Browser)
```ts
import { HttpAgent, Actor } from "@dfinity/agent"

// Official ICP Ledger Canister ID: ryjl3-hexaa-aaaaa-aaaba-cai
const agent = new HttpAgent({ host: "https://icp-api.io" })

// Free read-only query call (0 cycles burned)
export async function verifyOrderPayment(subaccountHex: string, expectedAmountE8s: bigint): Promise<boolean> {
  // Query merchant custodial subaccount on ledger...
  // Ledger returns confirmed balance or matching block index.
  return true
}
```

---

## 6. HTML Integration Options

### A. Simple Checkout Button
```html
<a 
  href="https://icpay.app/@cybercafe?amount=1.5&ref=inv_9921&return_url=https://store.com/success" 
  class="icpay-btn"
>
  ⚡ Pay with ICPay
</a>
```

### B. Point-of-Sale (POS) QR Code
Encode the canonical payment URL directly into any standard QR code:
* **QR Payload**: `https://icpay.app/@cybercafe?amount=1.5&ref=inv_9921` (Never raw hex addresses or principals).
* **Scan Action**: Customer scans the code with their standard mobile camera (iOS/Android):
  1. Opens the mobile browser directly to the merchant's ICPay checkout.
  2. Authenticates with 1-click FaceID/Passkey.
  3. ICPay executes the payment on-chain and automatically fires the `return_url` redirect.

---

## 7. Security Guarantees

* **Cryptographic Authorization**: Transactions are signed by the payer's Internet Identity passkey. Neither ICPay nor the merchant can forge transactions.
* **Deterministic Custodial Subaccounts**: Balances are held in distinct on-chain subaccounts derived strictly from principals.
* **No Chargeback Fraud**: Once confirmed in an IC ledger block, the transfer is immutable and final.
