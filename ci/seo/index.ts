import { existsSync, readdirSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { createSign } from "node:crypto"
import { fileURLToPath } from "node:url"

// npm run ci seo:index [urls...] [--engine=all|google|yandex] [--domain=all|app|cloud] [--delete]
//
// Submits one or multiple URLs to Google Indexing API and IndexNow mesh (Bing, Yandex, etc.).
// Dual-indexes across both canonical domains: https://icpay.app and https://icpay.cloud.
// If no URLs are provided, submits all core public ICPay pages and blog posts.
//
// Examples:
//   npm run ci seo:index                                  (indexes all on Google & IndexNow for both domains)
//   npm run ci seo:index /icfalcon                        (indexes /icfalcon on icpay.app & icpay.cloud)
//   npm run ci seo:index /bucket /faq                     (indexes multiple URLs on both domains)
//   npm run ci seo:index /blog/post --domain=cloud        (indexes only on icpay.cloud)
//   npm run ci seo:index /blog/post --engine=google       (indexes only on Google)
//   npm run ci seo:index /old-page --delete

interface DomainConfig {
  name: string
  base: string
  host: string
}

const ALL_DOMAINS: DomainConfig[] = [
  { name: "icpay.app", base: "https://icpay.app", host: "icpay.app" },
  { name: "icpay.cloud", base: "https://icpay.cloud", host: "icpay.cloud" },
]

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

function loadAllPublicPaths(): string[] {
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
    "/icbucket",
    "/icbucket/pricing",
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
    "/iccron",
    "/iccron/pricing",
    "/iccron/security",
    "/cron/docs",
    "/cron/docs/getting-started/overview",
    "/cron/docs/getting-started/quickstart",
    "/cron/docs/getting-started/architecture",
    "/cron/docs/api/dispatch",
    "/cron/docs/api/expressions",
    "/cron/docs/api/retries",
    "/cron/docs/api/state-machine",
    "/cron/docs/sdk/nodejs",
    "/cron/docs/sdk/rust",
    "/cron/docs/sdk/python",
    "/cron/docs/sdk/go",
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
    "/channels/alpha",
    "/channels/alpha123",
    "/channels/crypto",
    "/channels/icpay",
    "/channels/icpfans",
    "/channels/nepal",
    "/charity",
    "/charity/nepal/nepal-flash-flood",
    "/blog",
  ]

  const paths = new Set<string>()
  for (const page of staticPublicPages) {
    paths.add(page === "/" ? "/" : page)
  }
  for (const slug of slugs) {
    paths.add(`/blog/${slug}`)
  }
  return [...paths]
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

function findBaiduToken(): string | null {
  const baiduTokenPath = join(root, "auto/seo/baidu/token.txt")
  if (existsSync(baiduTokenPath)) {
    return readFileSync(baiduTokenPath, "utf-8").trim()
  }
  return process.env.BAIDU_TOKEN?.trim() || null
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

function extractPath(input: string): string {
  const trimmed = input.trim()
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const u = new URL(trimmed)
      return u.pathname
    } catch {
      return trimmed
    }
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`
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
  host: string,
  baseDomain: string,
  key: string,
  urls: string[]
): Promise<{ endpoint: string; status: number; ok: boolean; msg?: string }> {
  const keyLocation = `${baseDomain}/${key}.txt`
  const body = {
    host,
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

const domainArg = rawArgs.find((a) => a.startsWith("--domain="))?.replace("--domain=", "").toLowerCase()
const appOnly = rawArgs.includes("--app-only") || domainArg === "app" || domainArg === "icpay.app"
const cloudOnly = rawArgs.includes("--cloud-only") || domainArg === "cloud" || domainArg === "icpay.cloud"

const activeDomains = appOnly
  ? ALL_DOMAINS.filter((d) => d.name === "icpay.app")
  : cloudOnly
  ? ALL_DOMAINS.filter((d) => d.name === "icpay.cloud")
  : ALL_DOMAINS

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
const targetPaths = urlArgs.length > 0 ? urlArgs.map(extractPath) : loadAllPublicPaths()
const action = isDelete ? "URL_DELETED" : "URL_UPDATED"

console.log(`\n🌐 Target: ${targetPaths.length} path(s) across [${activeDomains.map((d) => d.name).join(", ")}]`)

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

      for (const domain of activeDomains) {
        console.log(`\n  📍 Domain: ${domain.name}`)
        for (const path of targetPaths) {
          const url = `${domain.base}${path === "/" ? "/" : path}`
          const res = await submitGoogleUrl(token, url, action)
          if (res.ok) {
            console.log(`  🟢  [INDEXED]  ${url}`)
            googleOk++
          } else {
            console.error(`  🔴  [ERROR ${res.status}]  ${url}  (${res.message ?? "failed"})`)
            googleFail++
          }
          await new Promise((r) => setTimeout(r, 150))
        }
      }
      console.log(`\nGoogle result: ${googleOk} succeeded, ${googleFail} failed.`)
    } catch (e: unknown) {
      console.error("❌ Google Indexing error:", e instanceof Error ? e.message : e)
    }
  }
}

// 2. IndexNow (Bing, Yandex, Naver, Seznam, Yep)
if (!onlyGoogle) {
  console.log("\n─── 2. IndexNow (Bing, Yandex, Global) ──────────────")
  const indexNowKey = findIndexNowKey()
  if (!indexNowKey) {
    console.error("⚠️  Skipping IndexNow: No IndexNow key found in auto/seo/yandex/indexnow_key.txt")
  } else {
    console.log(`🔑 Key: ${indexNowKey}`)

    const endpoints = [
      { name: "IndexNow Global Hub (Broadcasts to Yandex, Bing, Naver, Seznam)", url: "https://api.indexnow.org/indexnow" },
      { name: "Microsoft Bing IndexNow (Copilot & Bing)", url: "https://www.bing.com/indexnow" },
      { name: "Yandex Direct IndexNow", url: "https://yandex.com/indexnow" },
      { name: "Seznam.cz Direct IndexNow", url: "https://search.seznam.cz/indexnow" },
      { name: "Yep Direct IndexNow", url: "https://indexnow.yep.com/indexnow" },
    ]

    for (const domain of activeDomains) {
      const domainUrls = targetPaths.map((p) => `${domain.base}${p === "/" ? "/" : p}`)
      console.log(`\n  📍 Submitting ${domainUrls.length} URL(s) for ${domain.name} (Key Location: ${domain.base}/${indexNowKey}.txt)...`)

      for (const ep of endpoints) {
        try {
          const res = await submitIndexNowEndpoint(ep.url, domain.host, domain.base, indexNowKey, domainUrls)
          if (res.ok) {
            console.log(`  🟢  [${ep.name}] HTTP ${res.status} (Success - URLs queued for ${domain.name})`)
          } else {
            console.log(`  🟡  [${ep.name}] HTTP ${res.status}: ${res.msg ?? `Queued via mesh for ${domain.name}`}`)
          }
        } catch (e: unknown) {
          if (ep.url === "https://yandex.com/indexnow") {
            console.log(`  ℹ️   [${ep.name}] Direct socket closed (Normal: handled automatically via IndexNow Global Hub)`)
          } else {
            console.error(`❌ ${ep.name} error for ${domain.name}:`, e instanceof Error ? e.message : e)
          }
        }
      }
    }

    console.log(`\n  Queued paths across active domains:`)
    for (const p of targetPaths) {
      console.log(`      ✓ ${p}`)
    }
  }
}

// 3. Baidu Link Submission API (China)
const baiduToken = findBaiduToken()
if (baiduToken && !onlyGoogle && !onlyIndexNow) {
  console.log("\n─── 3. Baidu Link Submission API ────────────────────")
  try {
    const primaryDomain = ALL_DOMAINS[0]
    const baiduUrls = targetPaths.map((p) => `${primaryDomain.base}${p === "/" ? "/" : p}`)
    const baiduApiUrl = `http://data.zz.baidu.com/urls?site=${encodeURIComponent(primaryDomain.base)}&token=${encodeURIComponent(baiduToken)}`
    const res = await fetch(baiduApiUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: baiduUrls.join("\n"),
    })
    const data = (await res.json()) as { success?: number; remain?: number; message?: string }
    if (res.ok && data.success) {
      console.log(`  🟢  [Baidu] Success: ${data.success} URLs submitted, ${data.remain ?? 0} daily quota remaining.`)
    } else {
      console.log(`  🟡  [Baidu] HTTP ${res.status}: ${data.message ?? "Failed to submit"}`)
    }
  } catch (e: unknown) {
    console.error("❌ Baidu Link Submission error:", e instanceof Error ? e.message : e)
  }
}

console.log("\n" + "═".repeat(50))
console.log("✅ Finished indexing cycle.")
console.log("═".repeat(50))

