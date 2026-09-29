import { existsSync, readdirSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { createSign } from "node:crypto"
import { fileURLToPath } from "node:url"

// npm run ci seo:index [urls...] [--engine=all|google|yandex] [--delete]
//
// Submits one or multiple URLs to Google Indexing API and Yandex (IndexNow).
// If no URLs are provided, submits all core public ICPay pages and blog posts.
//
// Examples:
//   npm run ci seo:index                                  (indexes all on Google & Yandex)
//   npm run ci seo:index /blog/new-feature                (indexes single URL on both)
//   npm run ci seo:index /bucket /faq                     (indexes multiple URLs on both)
//   npm run ci seo:index /blog/post --engine=yandex       (indexes only on Yandex)
//   npm run ci seo:index /blog/post --engine=google       (indexes only on Google)
//   npm run ci seo:index /old-page --delete

const BASE_DOMAIN = "https://icpay.app"
const HOST = "icpay.app"

const DEFAULT_URLS = [
  "https://icpay.app/",
  "https://icpay.app/bucket",
  "https://icpay.app/bucket/pricing",
  "https://icpay.app/bucket/docs",
  "https://icpay.app/blog",
  "https://icpay.app/blog/on-chain-cloud-storage-icbucket-s3-guide",
  "https://icpay.app/blog/instant-crypto-payments-icpay",
  "https://icpay.app/blog/best-icp-wallet",
  "https://icpay.app/blog/how-to-send-icp",
  "https://icpay.app/blog/accept-icp-payments-ecommerce",
  "https://icpay.app/blog/address-poisoning-clipboard-hijacking-username-protection",
  "https://icpay.app/blog/icrc-1-token-standard",
  "https://icpay.app/blog/transparent-crypto-donations-on-chain",
  "https://icpay.app/blog/jackson-hole-2026-crypto-payments",
  "https://icpay.app/about",
  "https://icpay.app/faq",
  "https://icpay.app/terms",
  "https://icpay.app/privacy",
  "https://icpay.app/transparency",
]

type ServiceAccountKey = {
  client_email: string
  private_key: string
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

function findGoogleKey(): { path: string; key: ServiceAccountKey } | null {
  const candidateDirs = [
    join(root, "auto/seo/google"),
    join(root, "auto/seo"),
    join(root, "docs/index"),
  ]

  for (const dir of candidateDirs) {
    if (existsSync(dir)) {
      const files = readdirSync(dir)
      const jsonFile = files.find((f) => f.endsWith(".json"))
      if (jsonFile) {
        const fullPath = join(dir, jsonFile)
        try {
          const raw = JSON.parse(readFileSync(fullPath, "utf-8"))
          if (raw.client_email && raw.private_key) {
            return { path: fullPath, key: raw }
          }
        } catch {
          // continue checking
        }
      }
    }
  }

  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (envPath && existsSync(envPath)) {
    const raw = JSON.parse(readFileSync(envPath, "utf-8"))
    if (raw.client_email && raw.private_key) {
      return { path: envPath, key: raw }
    }
  }

  return null
}

function findIndexNowKey(): string | null {
  const yandexKeyPath = join(root, "auto/seo/yandex/indexnow_key.txt")
  if (existsSync(yandexKeyPath)) {
    return readFileSync(yandexKeyPath, "utf-8").trim()
  }

  const publicDir = join(root, "frontend/public")
  if (existsSync(publicDir)) {
    const files = readdirSync(publicDir)
    const keyFile = files.find((f) => f.endsWith(".txt") && /^[a-zA-Z0-9_-]{16,64}\.txt$/.test(f))
    if (keyFile) {
      return keyFile.replace(".txt", "").trim()
    }
  }

  return null
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

async function getGoogleToken(key: ServiceAccountKey): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signInput = `${encodedHeader}.${encodedPayload}`

  const signer = createSign("RSA-SHA256")
  signer.update(signInput)
  const signature = signer
    .sign(key.private_key, "base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")

  const jwt = `${signInput}.${signature}`

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  })

  const data = (await res.json()) as { access_token?: string; error?: string; error_description?: string }
  if (!res.ok || !data.access_token) {
    throw new Error(`Google Auth failed: ${data.error_description ?? data.error ?? res.statusText}`)
  }
  return data.access_token
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim()
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  return `${BASE_DOMAIN}${cleanPath}`
}

async function submitGoogleUrl(
  token: string,
  url: string,
  type: "URL_UPDATED" | "URL_DELETED"
): Promise<{ ok: boolean; status: number; message?: string }> {
  const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url, type }),
  })

  const data = (await res.json()) as { error?: { message?: string } }
  return {
    ok: res.ok,
    status: res.status,
    message: data.error?.message,
  }
}

async function submitIndexNowBatch(
  key: string,
  urls: string[]
): Promise<{ yandexStatus: number; yandexOk: boolean; yandexMsg?: string }> {
  const keyLocation = `${BASE_DOMAIN}/${key}.txt`
  const body = {
    host: HOST,
    key,
    keyLocation,
    urlList: urls,
  }

  // Ping Yandex IndexNow endpoint
  const yandexRes = await fetch("https://yandex.com/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  })

  const yandexOk = yandexRes.status === 200 || yandexRes.status === 202
  let yandexMsg: string | undefined
  if (!yandexOk) {
    try {
      const text = await yandexRes.text()
      yandexMsg = text || `HTTP ${yandexRes.status}`
    } catch {
      yandexMsg = `HTTP ${yandexRes.status}`
    }
  }

  return {
    yandexStatus: yandexRes.status,
    yandexOk,
    yandexMsg,
  }
}

// Parse command line arguments
const rawArgs = process.argv.slice(3) // skip node, cli.ts, "seo:index"
const isDelete = rawArgs.includes("--delete") || rawArgs.includes("-d")
const onlyGoogle = rawArgs.includes("--google") || rawArgs.includes("--engine=google")
const onlyYandex = rawArgs.includes("--yandex") || rawArgs.includes("--engine=yandex")

const urlArgs = rawArgs.filter((arg) => !arg.startsWith("-"))
const targetUrls = urlArgs.length > 0 ? urlArgs.map(normalizeUrl) : DEFAULT_URLS
const action = isDelete ? "URL_DELETED" : "URL_UPDATED"

console.log(`🌐 Target: ${targetUrls.length} URL(s) on ${HOST}`)

// 1. Google Indexing
if (!onlyYandex) {
  console.log("\n─── 1. Google Indexing API ──────────────────────────")
  const googleKeyData = findGoogleKey()
  if (!googleKeyData) {
    console.error("⚠️  Skipping Google: No service account key found in auto/seo/google/")
  } else {
    try {
      console.log(`📧 Account: ${googleKeyData.key.client_email}`)
      const token = await getGoogleToken(googleKeyData.key)
      let googleOk = 0
      let googleFail = 0

      for (const url of targetUrls) {
        const res = await submitGoogleUrl(token, url, action)
        if (res.ok) {
          console.log(`  🟢  [INDEXED]  ${url}`)
          googleOk++
        } else {
          console.error(`  🔴  [ERROR ${res.status}]  ${url}  (${res.message ?? "failed"})`)
          googleFail++
        }
        if (targetUrls.length > 1) await new Promise((r) => setTimeout(r, 200))
      }
      console.log(`Google result: ${googleOk} succeeded, ${googleFail} failed.`)
    } catch (e: unknown) {
      console.error("❌ Google Indexing error:", e instanceof Error ? e.message : e)
    }
  }
}

// 2. Yandex (IndexNow)
if (!onlyGoogle) {
  console.log("\n─── 2. Yandex & Bing (IndexNow) ─────────────────────")
  const indexNowKey = findIndexNowKey()
  if (!indexNowKey) {
    console.error("⚠️  Skipping Yandex: No IndexNow key found in auto/seo/yandex/indexnow_key.txt")
  } else {
    console.log(`🔑 Key: ${indexNowKey}`)
    console.log(`📍 Key Location: ${BASE_DOMAIN}/${indexNowKey}.txt`)
    console.log(`🚀 Sending batch of ${targetUrls.length} URL(s) to Yandex IndexNow...`)

    try {
      const { yandexStatus, yandexOk, yandexMsg } = await submitIndexNowBatch(indexNowKey, targetUrls)
      if (yandexOk) {
        console.log(`  🟢  [INDEXED ON YANDEX] HTTP ${yandexStatus} (Success - URLs queued for instant crawling)`)
        for (const u of targetUrls) {
          console.log(`      ✓ ${u}`)
        }
      } else {
        console.error(`  🔴  [YANDEX FAILED] HTTP ${yandexStatus}: ${yandexMsg ?? "Verification pending"}`)
        console.log(`      Ensure https://${HOST}/${indexNowKey}.txt is deployed and publicly reachable.`)
      }
    } catch (e: unknown) {
      console.error("❌ Yandex IndexNow error:", e instanceof Error ? e.message : e)
    }
  }
}

console.log("\n" + "═".repeat(50))
console.log("✅ Finished indexing cycle.")
console.log("═".repeat(50))
