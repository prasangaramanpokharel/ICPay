---
name: icpay-seo
description: Search engine optimization and automated URL indexing for ICPay (Google Indexing API and Yandex/Bing IndexNow via npm run ci seo:index). Read when managing SEO, sitemaps, submitting URLs for indexing, or troubleshooting search console verification.
---

# ICPay SEO & Search Engine Indexing

Automated indexing and search engine optimization workflows for `https://icpay.app` and `https://icpay.cloud`.

The project uses a unified CLI command to push instant crawl and index requests to:
1. **Google Indexing API** (instant indexing for pages, updates, and deletes across both `icpay.app` and `icpay.cloud`)
2. **IndexNow Mesh** (instant index distribution across Microsoft Bing, Copilot, DuckDuckGo, Yandex, Naver, Seznam.cz, and Yep)
3. **Baidu Link Submission** (instant push via Baidu Ziyuan Token API if configured)
4. **AI & LLM Crawlers** (`OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `Bravebot` via `robots.ts` and `llms.txt`)

---

## 1. Quick Start / CLI Usage

The operations CLI entry point is `npm run ci -- seo:index`. By default, it submits URLs to **both** `icpay.app` and `icpay.cloud`.

> ⚠️ **Important:** Always pass the bare `--` before arguments (e.g., `npm run ci -- seo:index ...`). Otherwise, npm swallows flags like `--google` or `--yandex`.

```bash
# Submit all core public pages and blog posts across both icpay.app and icpay.cloud
npm run ci -- seo:index

# Submit a single page (e.g. icFalcon) across both domains
npm run ci -- seo:index /icfalcon

# Submit multiple pages
npm run ci -- seo:index /icfalcon /products/icFalcon /products/icFalcon/packages

# Target only a single domain
npm run ci -- seo:index /icfalcon --domain=cloud   # only icpay.cloud
npm run ci -- seo:index /icfalcon --domain=app     # only icpay.app

# Submit only to Google
npm run ci -- seo:index /icfalcon --google

# Submit only to IndexNow (Bing, Yandex, etc.)
npm run ci -- seo:index /icfalcon --yandex

# Notify search engines that a page was removed/deleted
npm run ci -- seo:index /outdated-page --delete
```

Relative paths (e.g., `/icfalcon`, `/bucket`, `/blog/instant-crypto-payments-icpay`) are automatically expanded to both `https://icpay.app/<path>` and `https://icpay.cloud/<path>`.

---

## 2. System Architecture & File Locations

| Path | Purpose |
|---|---|
| `ci/seo/index.ts` | The core indexing engine script. Handles Google RS256 JWT auth + IndexNow protocol payload. |
| `ci/cli.ts` | CLI dispatcher registering `seo:index`. |
| `auto/seo/google/*.json` | Google Cloud Service Account credentials (gitignored, kept local). |
| `auto/seo/yandex/indexnow_key.txt` | IndexNow API key (gitignored, kept local). |
| `frontend/public/<key>.txt` | The public verification file for IndexNow (e.g., `e4b1c8f309a74d28b6d51c72e3984af1.txt`). Must match the key in `indexnow_key.txt`. |
| `frontend/app/sitemap.ts` | Next.js sitemap definition (`https://icpay.app/sitemap.xml`). |
| `frontend/app/robots.ts` | Next.js robots file (`https://icpay.app/robots.txt`). |

---

## 3. How Google Indexing Works

- **Endpoint**: `https://indexing.googleapis.com/v3/urlNotifications:publish`
- **Authentication**: Google Service Account JSON key stored in `auto/seo/google/`.
  - The script constructs an RS256 JWT assertion with scope `https://www.googleapis.com/auth/indexing` and fetches an access token from `https://oauth2.googleapis.com/token`.
- **Search Console Permission**:
  - The service account email (e.g. `icpay-indexer@lithe-camp-450404-t4.iam.gserviceaccount.com`) **must** be listed as an **Owner** in Google Search Console under the property `https://icpay.app/`.
- **Action types**: `URL_UPDATED` (default) or `URL_DELETED` (with `--delete`).

---

## 4. How Yandex & Bing (IndexNow) Works

- **Endpoints**:
  - `POST https://yandex.com/indexnow` (batch submission)
  - `GET https://yandex.com/indexnow?url=<url>&key=<key>[&keyLocation=<url>]` (single URL)
- **Batch POST Payload Structure**:
  ```json
  {
    "host": "icpay.app",
    "key": "e4b1c8f309a74d28b6d51c72e3984af1",
    "keyLocation": "https://icpay.app/e4b1c8f309a74d28b6d51c72e3984af1.txt",
    "urlList": [
      "https://icpay.app/icfalcon",
      "https://icpay.app/bucket"
    ]
  }
  ```

### Parameter Specifications (per Yandex Docs)

| Parameter | Type | Required | Rules & Limits |
|---|---|---|---|
| `host` | String | Yes | Root site domain (e.g. `icpay.app`). |
| `key` | String | Yes | 8 to 128 characters. Allowed chars: `a-zA-Z0-9-`. |
| `keyLocation` | String | No | URL to key file. Optional if key file is placed at root (`https://icpay.app/<key>.txt`). |
| `urlList` | Array<String> | Yes | Up to 10,000 URLs per request. Valid RFC 3986 URLs. |

### Response Codes & Diagnostic Guide

| HTTP Code | Reason | Meaning & Troubleshooting |
|---|---|---|
| **200** | OK | URLs successfully submitted and queued for immediate crawling. |
| **202** | Accepted | Key is awaiting background verification. Once verified, subsequent calls return 200. |
| **400** | Invalid params | Bad JSON format or unrecognized structure. |
| **403** | Invalid key | The key file could not be loaded at `https://icpay.app/<key>.txt` or does not match. **Ensure `frontend/public/<key>.txt` is committed and deployed to production before submitting.** |
| **405** | Method not allowed | Only GET and POST are supported. |
| **422** | Unprocessable Entity | Validation error. Specific causes: <br>• Key length < 8 or > 128 characters <br>• Key contains invalid characters <br>• Missing `host`, `key`, or `urlList` <br>• `urlList` is not an array, is empty, or exceeds 10,000 URLs <br>• Invalid RFC 3986 URL |
| **429** | Too Many Requests | Rate limit exceeded for the requesting IP. |

### Yandex IndexNow Operational Rules

- **Frequency**: There is no hard limit on request volume, but repeating submissions for the same unchanged URL should be spaced by at least 10 minutes.
- **Deletions & Redirects**: IndexNow can be used to report HTTP 404/410 removed pages as well as 301/302 redirects.

---

## 5. Adding New Pages or Blogs to Default Indexing

When creating new public landing pages or blog posts:
1. Ensure the URL is registered in `frontend/app/sitemap.ts`.
2. Add canonical URL to `DEFAULT_URLS` in `ci/seo/index.ts` if it is a major landing page or pillar content.
3. Once deployed, run `npm run ci -- seo:index /your-new-slug` to request instant crawling.
