# ICPay Payment Links — Architecture & Implementation Plan

Minimal, non-breaking plan to elevate ICPay payment links into a decentralized checkout gateway with zero backend changes.

---

## 1. Core Invariants & Constraints

* **Zero Backend Canister Changes**: Uses existing `transferByUsername(ledgerId, username, amount, memo)` endpoint on `icp_wallet_backend`.
* **Zero Address & Principal Leakage**: QR codes and payment URLs must strictly encode `@username` URLs (`https://icpay.app/@merchant?...`). Raw 64-char hex account identifiers and 63-char principals must **never** be exposed in payment links or merchant QR codes.
  * *Reason 1*: Exposing raw addresses encourages off-platform transfers from exchanges, breaking the `return_url` redirect and stripping order `ref` IDs.
  * *Reason 2*: Short username URLs generate low-density, high-contrast QR codes that scan instantly on all mobile cameras.
* **Static Export Constraint**: Runs within Next.js static export (`output: "export"`). All URL parsing and redirect logic executes purely on the client side.
* **Authentication**: Internet Identity only (FaceID, TouchID, YubiKey passkeys). No passwords, seed phrases, or merchant secret keys.
* **0-Cycle Verification**: Ledger lookups execute as read-only boundary node queries, consuming zero canister cycles.

---

## 2. URL Specification & Multi-Environment Support

### Supported URL Formats

Payment links work interchangeably across both the custom production domain and the **100% on-chain asset canister**:

| Environment | Supported Syntax | Example |
|---|---|---|
| **Production Domain** | `https://icpay.app/@<username>`<br>`https://icpay.app/<username>` | `https://icpay.app/@cybercafe?amount=1.5&ref=inv_9843` |
| **On-Chain Canister** | `https://<canister_id>.icp0.io/@<username>`<br>`https://<canister_id>.icp0.io/<username>` | `https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io/@cybercafe?amount=1.5&ref=inv_9843` |

* **Leading `@` Flexibility**: Both `@store` and `store` in the URL path route to the same profile shell.
* **On-Chain Shell Routing**: In the asset canister, `onchain-shell.js` intercepts `/^\/@?[A-Za-z0-9_]{1,8}$/`, loads `/u.html`, and dynamically mounts the checkout UI.

### Parameters
| Param | Required | Description |
|---|---|---|
| `@username` | **Yes** | The merchant / recipient handle in the pathname (`@store` or `store`). |
| `amount` | No | Preset amount in tokens (e.g. `2.5`). If omitted, customer inputs amount. |
| `ref` | No | Opaque order or invoice ID (e.g. `inv_984321`). Replaces raw memo to prevent privacy leakage. |
| `memo` | No | Backward-compatible alias for `ref` (max 32 bytes on ledger). |
| `return_url` | No | URL to redirect the customer back to upon confirmed on-chain payment. |
| `#note` | No | Client-side hash fragment for user-to-user notes. Never sent over HTTP headers. |

---

## 3. Minimal Frontend Enhancements

### A. Extended Query Parser (`services/pay/pay.ts`)
* Extend `PaymentRequest` type to include:
  ```ts
  export type PaymentRequest = {
    username: string
    amount?: bigint
    ref?: string
    returnUrl?: string
  }
  ```
* Support parsing `ref`, `memo`, and `return_url`.
* **Security Guard against Open Redirects**:
  * Verify `return_url` starts with `https://` (or `http://localhost` in dev).
  * Block `javascript:`, data URIs, and malformed protocols.

### B. Checkout Success Flow (`public-profile.tsx`)
* When `handlePay` completes successfully on-chain:
  * Capture `blockIndex: bigint` and `txId: string`.
  * If `return_url` is present:
    * Display a 2-second countdown: *"Payment confirmed! Redirecting back to merchant..."* with a manual *"Return Now"* fallback button.
    * Append return query params:
      ```
      <return_url>?status=success&blockIndex=<block>&ref=<order_id>&amount=<amount>
      ```
    * Safely navigate via `window.location.assign(validatedUrl.toString())`.

### C. Clean Merchant Payment Modal
* Provide a dynamic QR code for desktop-to-mobile scanning.
* Display verified recipient avatar, handle, token amount, and fiat estimate.
* Prominent 1-click *"Pay with Internet Identity"* button.

---

## 4. Merchant Verification Blueprint

Merchants verify payments without running an ICPay backend:
1. **Redirect Parameter Check**: Read `blockIndex` and `ref` from the callback URL.
2. **0-Cycle On-Chain Lookup**: Query the standard ICP Ledger canister via boundary node:
   ```bash
   dfx canister --network ic call ryjl3-hexaa-aaaaa-aaaba-cai icrc1_balance_of '(record { owner = principal "..." })'
   ```
   Or query the transaction index for matching `blockIndex` and `memo`.

---

## 5. Implementation Checklist

- [ ] Add `return_url` and `ref` parsing to `frontend/services/pay/pay.ts`.
- [ ] Add redirect safety validator in `frontend/lib/wallet/url.ts`.
- [ ] Update `frontend/app/(profile)/[username]/public-profile.tsx` with callback redirect handling on payment success.
- [ ] Verify statically: `npm --prefix frontend run typecheck` and `npm --prefix frontend run lint`.
