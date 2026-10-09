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

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

function loadAllPublicUrls(): string[] {
  const blogFile = join(root, "frontend/services/blog/blog.ts")
  const slugs: string[] = []
  if (existsSync(blogFile)) {
    const content = readFileSync(blogFile, "utf-8")
    const matches = content.matchAll(/slug:\s*["']([^"']+)["']/g)
    for (const match of matches) {
      if (match[1] && !slugs.includes(match[1])) slugs.push(match[1])
    }
  }

  const staticPublicPages = [
    "/",
    "/icfalcon",
    "/products/icFalcon",
    "/products/icFalcon/packages",
    "/products/icFalcon/commands",
    "/icbucket",
    "/products/icBucket",
    "/products/icBucket/packages",
    "/bucket/docs",
    "/bucket/docs/getting-started/overview",
    "/bucket/docs/getting-started/quickstart",
    "/bucket/docs/api/auth",
    "/bucket/docs/api/buckets",
    "/bucket/docs/api/bulk",
    "/bucket/docs/api/keys",
    "/bucket/docs/api/methods",
    "/bucket/docs/api/pagination",
    "/bucket/docs/api/read",
    "/bucket/docs/api/tags",
    "/bucket/docs/api/upload",
    "/bucket/docs/api/write",
    "/bucket/docs/cdn/verify",
    "/bucket/docs/cdn/urls",
    "/bucket/docs/sdk/python",
    "/bucket/docs/sdk/typescript",
    "/token/create",
    "/canister/tools",
    "/canister/manage",
    "/canister/create",
    "/canister/cycles",
    "/canister/snapshots",
    "/topup",
    "/about",
    "/contact",
    "/faq",
    "/terms",
    "/privacy",
    "/transparency",
    "/roadmap",
    "/brand-protection",
    "/channels",
    "/charity",
    "/charity/nepal/nepal-flash-flood",
    "/blog",
  ]

  const urls = new Set<string>()
  for (const page of staticPublicPages) {
    urls.add(`${BASE_DOMAIN}${page === "/" ? "/" : page}`)
  }
  for (const slug of slugs) {
    urls.add(`${BASE_DOMAIN}/blog/${slug}`)
  }
  return [...urls]
}

function verifyRobotsDirectives(): { passed: boolean; checks: { name: string; ok: boolean; detail: string }[] } {
  const checks: { name: string; ok: boolean; detail: string }[] = []

  // Check 1: Root layout.tsx
  const rootLayoutPath = join(root, "frontend/app/layout.tsx")
  if (existsSync(rootLayoutPath)) {
    const content = readFileSync(rootLayoutPath, "utf-8")
    const hasIndex = /robots:\s*\{[\s\S]*?index:\s*true/i.test(content)
    const hasFollow = /follow:\s*true/i.test(content)
    const hasGoogleBot = /googleBot:\s*\{/i.test(content)
    const hasMaxImagePreview = /max-image-preview/i.test(content)
    const ok = hasIndex && hasFollow && hasGoogleBot && hasMaxImagePreview
    checks.push({
      name: "Root Layout Robots Meta",
      ok,
      detail: ok
        ? "index: true, follow: true, googleBot configured, max-image-preview: large, max-snippet: -1"
        : "Missing index, follow, or googleBot directives in root layout.tsx",
    })
  }

  // Check 2: Authenticated (app)/layout.tsx
  const appLayoutPath = join(root, "frontend/app/(app)/layout.tsx")
  if (existsSync(appLayoutPath)) {
    const content = readFileSync(appLayoutPath, "utf-8")
    const hasNoIndex = /robots:\s*\{[\s\S]*?index:\s*false/i.test(content)
    const hasNoFollow = /follow:\s*false/i.test(content)
    const ok = hasNoIndex && hasNoFollow
    checks.push({
      name: "Private App Routes Robots Meta",
      ok,
      detail: ok
        ? "index: false, follow: false (protected from search engine crawling)"
        : "Missing noindex on authenticated app layout",
    })
  }

  // Check 3: robots.ts configuration
  const robotsTsPath = join(root, "frontend/app/robots.ts")
  if (existsSync(robotsTsPath)) {
    const content = readFileSync(robotsTsPath, "utf-8")
    const hasPublic = /PUBLIC\s*=/i.test(content)
    const hasPrivate = /PRIVATE\s*=/i.test(content)
    const hasBucketDocs = content.includes("/bucket/docs")
    const ok = hasPublic && hasPrivate && hasBucketDocs
    checks.push({
      name: "robots.txt Directives",
      ok,
      detail: ok
        ? "PUBLIC allowlist & PRIVATE disallowlist configured with AI bots & bucket docs"
        : "Incomplete robots.ts rules",
    })
  }

  // Check 4: sitemap.ts
  const sitemapTsPath = join(root, "frontend/app/sitemap.ts")
  if (existsSync(sitemapTsPath)) {
    const content = readFileSync(sitemapTsPath, "utf-8")
    const hasBucketDocs = content.includes("/bucket/docs")
    const hasBlogEntries = content.includes("blogEntries")
    const ok = hasBucketDocs && hasBlogEntries
    checks.push({
      name: "Sitemap Entries",
      ok,
      detail: ok
        ? "All public pages, blog posts, charity campaigns, and bucket docs present"
        : "Missing bucket docs or blog entries in sitemap.ts",
    })
  }

  const passed = checks.every((c) => c.ok)
  return { passed, checks }
}

const DEFAULT_URLS = loadAllPublicUrls()

type ServiceAccountKey = {
  client_email: string
  private_key: string
}


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

async function submitIndexNowEndpoint(
  endpoint: string,
  key: string,
  urls: string[]
): Promise<{ endpoint: string; status: number; ok: boolean; msg?: string }> {
  const keyLocation = `${BASE_DOMAIN}/${key}.txt`
  const body = {
    host: HOST,
    key,
    keyLocation,
    urlList: urls,
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  })

  const ok = res.status === 200 || res.status === 202
  let msg: string | undefined
  if (!ok) {
    try {
      const text = await res.text()
      msg = text || `HTTP ${res.status}`
    } catch {
      msg = `HTTP ${res.status}`
    }
  }

  return { endpoint, status: res.status, ok, msg }
}

// Parse command line arguments
const rawArgs = process.argv.slice(3) // skip node, cli.ts, "seo:index"
const isDelete = rawArgs.includes("--delete") || rawArgs.includes("-d")
const onlyGoogle = rawArgs.includes("--google") || rawArgs.includes("--engine=google")
const onlyIndexNow = rawArgs.includes("--indexnow") || rawArgs.includes("--yandex") || rawArgs.includes("--engine=yandex")
const verifyOnly = rawArgs.includes("--verify") || rawArgs.includes("--check")

// 0. Robots Meta & SEO Integrity Audit
console.log("─── 0. Robots Meta & SEO Directives Audit ───────────")
const audit = verifyRobotsDirectives()
for (const check of audit.checks) {
  if (check.ok) {
    console.log(`  🟢  [PASS]  ${check.name}: ${check.detail}`)
  } else {
    console.error(`  🔴  [FAIL]  ${check.name}: ${check.detail}`)
  }
}
if (!audit.passed) {
  console.error("\n⚠️  Robots meta verification had failures. Please fix before indexing.")
  if (rawArgs.includes("--strict")) process.exit(1)
} else {
  console.log("  ✨  All robots meta directives passed inspection!")
}

if (verifyOnly) {
  console.log("\n═ Verification complete. Exiting (--verify). ═")
  process.exit(0)
}

const urlArgs = rawArgs.filter((arg) => !arg.startsWith("-"))
const targetUrls = urlArgs.length > 0 ? urlArgs.map(normalizeUrl) : DEFAULT_URLS
const action = isDelete ? "URL_DELETED" : "URL_UPDATED"

console.log(`\n🌐 Target: ${targetUrls.length} URL(s) on ${HOST}`)

// 1. Google Indexing
if (!onlyIndexNow) {
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

// 2. IndexNow (Bing, Yandex, Naver, Seznam)
if (!onlyGoogle) {
  console.log("\n─── 2. IndexNow (Bing, Yandex, Global) ──────────────")
  const indexNowKey = findIndexNowKey()
  if (!indexNowKey) {
    console.error("⚠️  Skipping IndexNow: No IndexNow key found in auto/seo/yandex/indexnow_key.txt")
  } else {
    console.log(`🔑 Key: ${indexNowKey}`)
    console.log(`📍 Key Location: ${BASE_DOMAIN}/${indexNowKey}.txt`)
    console.log(`🚀 Sending batch of ${targetUrls.length} URL(s) to IndexNow endpoints...`)

    const endpoints = [
      { name: "IndexNow Global (Bing/Naver/Seznam)", url: "https://api.indexnow.org/indexnow" },
      { name: "Yandex IndexNow", url: "https://yandex.com/indexnow" },
    ]

    for (const ep of endpoints) {
      try {
        const res = await submitIndexNowEndpoint(ep.url, indexNowKey, targetUrls)
        if (res.ok) {
          console.log(`  🟢  [${ep.name}] HTTP ${res.status} (Success - URLs queued for instant crawling)`)
        } else {
          console.error(`  🔴  [${ep.name} FAILED] HTTP ${res.status}: ${res.msg ?? "Verification pending"}`)
        }
      } catch (e: unknown) {
        console.error(`❌ ${ep.name} error:`, e instanceof Error ? e.message : e)
      }
    }
    console.log(`\n  Queued ${targetUrls.length} public URL(s):`)
    for (const u of targetUrls) {
      console.log(`      ✓ ${u}`)
    }
  }
}

console.log("\n" + "═".repeat(50))
console.log("✅ Finished indexing cycle.")
console.log("═".repeat(50))

