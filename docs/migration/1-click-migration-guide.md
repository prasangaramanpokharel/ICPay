# 1-Day Migration & Integration Guide: Migrating to ICPay

This guide is designed for external engineering teams, dApp developers, and Web3 infrastructure operators looking to migrate into the ICPay ecosystem in **a single day**.

---

## 1. Zero-Click / 1-Click Authentication Handshake (`@icp-sdk/auth`)

If your users already authenticate with Internet Identity anywhere on their device or in your dApp, you can hand off to ICPay without forcing them to re-click login buttons, re-enter biometric passkeys, or endure popups.

### How it Works
ICPay leverages `@icp-sdk/auth` v11's silent background authorization protocol:

```ts
import { AuthClient } from "@icp-sdk/auth/client"

// When redirecting users to ICPay or embedding actions:
const authClient = await AuthClient.create({
  derivationOrigin: "https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io",
})

// Attempts background session acquisition in 0 clicks:
const identity = await authClient.signIn({
  prompt: "none",
  resumable: true,
  maxTimeToLive: BigInt(30 * 24 * 60 * 60 * 1_000_000_000), // 30 days
  maxTimeToIdle: BigInt(30 * 24 * 60 * 60 * 1_000_000_000), // 30 days
})
```

- **If II has an active session**: Identity delegates silently in the background in `<150ms`. The user lands immediately logged in.
- **If II session expired**: ICPay falls back gracefully to standard passkey login without breaking the flow.

---

## 2. 1-Click Canister Cycles Top-Up Deep Links

Replace complex `dfx ledger top-up` and cycles-wallet maintenance in your docs, alerts, and GitHub READMEs with standard 1-click links:

### URL Schema
```
https://icpay.app/canister?action=topup&canister=<CANISTER_ID>
```

### Optional Pre-Fill Parameters
- `canister`: Target Canister ID (e.g. `6vbhm-nqaaa-aaaan-q6muq-cai`)
- `action`: Set to `topup` to automatically trigger the Top-Up Cycles dialog
- `amount`: Preset USD or ICP amount (e.g. `25`)

### Example Integration (HTML / Markdown Button)
```markdown
[![Top up Canister with Card or ICP](https://img.shields.io/badge/ICPay-Top--Up%20Canister-blue?style=for-the-badge&logo=internetcomputer)](https://icpay.app/canister?action=topup&canister=YOUR_CANISTER_ID)
```

When users click this button:
1. They arrive at ICPay with their canister pre-loaded.
2. The Top-Up dialog opens immediately with live conversion rates.
3. They can pay with ICP or Stripe Card/Apple Pay. Cycles mint directly into the canister.

---

## 3. Drop-in Migration from AWS S3 / Cloudflare R2 to icBucket

icBucket provides decentralized, 100% on-chain file storage with built-in CDN delivery.

### 3-Line Migration (TypeScript / Node.js)

#### Before (AWS S3):
```ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
const s3 = new S3Client({ region: "us-east-1" })
await s3.send(new PutObjectCommand({ Bucket: "my-bucket", Key: "file.png", Body: file }))
```

#### After (ICPay Bucket SDK):
```ts
import { BucketClient } from "icpay-bucket"
const bucket = new BucketClient({ apiKey: process.env.ICPAY_BUCKET_KEY })
await bucket.upload("my-bucket", "file.png", file)
```

### Public CDN URL Format
Uploaded assets are instantly accessible over global high-speed HTTP gateways:
```
https://{canister_id}.raw.icp0.io/cloud/{bucket_id}/{file_path}
```

---

## 4. Migrating from Vercel / Cloud Scheduler to icCron

Eliminate cloud server fees and cron maintenance by moving scheduled tasks directly onto Internet Computer canister timers.

### 1-Click Deep Link for Webhook Scheduling
```
https://icpay.app/cron/create?url=https%3A%2F%2Fapi.yourapp.com%2Ftasks%2Fprocess&schedule=0+0+*+*+*
```

- **Guaranteed On-Chain Execution**: No serverless cold-start timeouts.
- **Pay as You Go**: ~$0.0005 per run with no monthly base fees.

---

## 5. Security & Invariant Guarantees

When migrating to ICPay:
1. **Zero Secret Storage**: Never store private keys or API secrets on the client. All authentication uses Internet Identity cryptographic delegations.
2. **Derivation Origin Stability**: ICPay permanently pins `https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io` so user principals never change.
3. **Decentralized Custody**: Each user retains complete subaccount isolation derived directly from their caller principal.
