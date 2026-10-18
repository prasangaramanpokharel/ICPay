import { WALLET_CANISTER_ID } from "@/services/icp"

/** Production CDN host — proxied to the canister /cloud/ route. */
export const BUCKET_CDN_ORIGIN = "https://cdn.icpay.app"

const LEGACY_GATEWAY =
  /^https:\/\/a4gq6-oaaaa-aaaab-qaa4q-cai\.raw\.icp0\.io(\/cloud\/[^?]+)\?id=6vbhm-nqaaa-aaaan-q6muq-cai/

const RAW_CLOUD_RE = new RegExp(
  `^https://(?:[a-z0-9-]+\\.)?raw\\.icp0\\.io/cloud/([^?#]+)`
)

/**
 * CDN base for bucket URLs. Defaults to https://cdn.icpay.app.
 * Can be overridden via NEXT_PUBLIC_BUCKET_CDN_URL.
 */
export function getBucketCdnBase(): string {
  const explicit = process.env.NEXT_PUBLIC_BUCKET_CDN_URL
  if (explicit !== undefined) {
    const trimmed = explicit.trim()
    if (trimmed) return trimmed.replace(/\/$/, "")
  }
  return BUCKET_CDN_ORIGIN
}

export function rawCloudTail(url: string): string | null {
  const legacy = url.match(LEGACY_GATEWAY)
  if (legacy) return legacy[1].replace(/^\/cloud\//, "")

  const raw = url.match(RAW_CLOUD_RE)
  if (raw) return raw[1]

  for (const origin of [BUCKET_CDN_ORIGIN, "https://cloud.icpay.app", "https://cdn.icpay.app"]) {
    if (url.startsWith(`${origin}/cloud/`)) {
      return url.slice(origin.length + "/cloud/".length)
    }
  }

  return null
}

/** Map any bucket URL form to the canister raw /cloud/ URL. */
export function toRawCanisterUrl(url: string): string {
  const tail = rawCloudTail(url)
  if (tail) return `https://${WALLET_CANISTER_ID}.raw.icp0.io/cloud/${tail}`

  const legacy = url.match(LEGACY_GATEWAY)
  if (legacy) {
    return `https://${WALLET_CANISTER_ID}.raw.icp0.io${legacy[1]}`
  }
  return url
}

/** Map any bucket URL form to the edge CDN /cloud/ URL. */
export function toCdnUrl(url: string): string {
  const cdnBase = getBucketCdnBase()
  const tail = rawCloudTail(url)
  if (tail) return `${cdnBase}/cloud/${tail}`
  return url.replace(/https?:\/\/cloud\.icpay\.app\b/g, cdnBase)
}

export type BucketUrlMode = "cdn" | "raw"

/** Resolve a bucket URL to the CDN host by default, or the raw canister host. */
export function resolvePublicFileUrl(url: string, mode: BucketUrlMode = "cdn"): string {
  if (mode === "raw") return toRawCanisterUrl(url)
  return toCdnUrl(url)
}

/** CDN base for a bucket, e.g. https://cdn.icpay.app/cloud/{bucketName}. */
export function bucketCdnBaseUrl(bucketName: string): string {
  const cdnBase = getBucketCdnBase()
  return `${cdnBase}/cloud/${bucketName}`
}

/** Raw canister base for a bucket, e.g. https://{canisterId}.raw.icp0.io/cloud/{bucketName}. */
export function bucketRawBaseUrl(bucketName: string): string {
  return `https://${WALLET_CANISTER_ID}.raw.icp0.io/cloud/${bucketName}`
}

/** CDN URL for a file, e.g. https://cdn.icpay.app/cloud/{bucketName}/{path}. */
export function bucketCdnFileUrl(bucketName: string, path: string): string {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path
  const cdnBase = getBucketCdnBase()
  return `${cdnBase}/cloud/${bucketName}/${cleanPath}`
}

/** Raw canister URL for a file, e.g. https://{canisterId}.raw.icp0.io/cloud/{bucketName}/{path}. */
export function bucketRawFileUrl(bucketName: string, path: string): string {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path
  return `https://${WALLET_CANISTER_ID}.raw.icp0.io/cloud/${bucketName}/${cleanPath}`
}
