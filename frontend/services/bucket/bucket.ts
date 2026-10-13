import type { Identity } from "@icp-sdk/core/agent"
import { call, query, unwrap, type Outcome } from "@/services/client"
import { storeFile } from "@/services/bucket/store-file"

export { storeFile, type StoreFileOptions } from "@/services/bucket/store-file"
export {
  getStorageActor,
  getDirectStorageUrl,
  type StorageActor,
} from "@/services/bucket/storage-actor"
import type {
  ApiKeyCreateResult,
  ApiKeyPermissions,
  ApiKeyPublic,
  BucketPublic,
  BucketStats,
  BucketRenewQuote,
  BucketRenewResult,
  BucketVisibilityVariant,
  FileListPage,
  BucketCycleStatus,
  BucketBillingPeriod,
  BucketBillingPeriodVariant,
} from "@/services/bucket/types"

export type {
  ApiKeyCreateResult,
  ApiKeyPermissions,
  ApiKeyPublic,
  BucketPublic,
  BucketStats,
  BucketRenewQuote,
  BucketRenewResult,
  BucketVisibilityVariant,
  FilePublic,
  FileListPage,
  BucketCycleStatus,
  BucketBillingPeriod,
  BucketBillingPeriodVariant,
} from "@/services/bucket/types"

/** Query — no auth required; uses an anonymous agent when logged out. */
export async function getBucketPrice(
  identity: Identity | undefined,
  capacityGB: number
): Promise<Outcome<bigint>> {
  try {
    const { getWalletActor } = await import("@/services/wallet")
    const actor = await getWalletActor(identity)
    return (await actor.getBucketPrice(BigInt(capacityGB))) as Outcome<bigint>
  } catch (e) {
    console.error(e)
    return { err: "Failed to load price" }
  }
}

/** Query yearly price (365 days / 2 months free) — no auth required. */
export async function getBucketYearlyPrice(
  identity: Identity | undefined,
  capacityGB: number
): Promise<Outcome<bigint>> {
  try {
    const { getWalletActor } = await import("@/services/wallet")
    const actor = await getWalletActor(identity)
    if (actor.getBucketYearlyPrice) {
      return (await actor.getBucketYearlyPrice(BigInt(capacityGB))) as Outcome<bigint>
    }
    const monthly = (await actor.getBucketPrice(BigInt(capacityGB))) as Outcome<bigint>
    if ("ok" in monthly) {
      return { ok: monthly.ok * 10n }
    }
    return monthly
  } catch (e) {
    console.error(e)
    return { err: "Failed to load yearly price" }
  }
}

export function createBucket(
  identity: Identity | undefined,
  name: string,
  capacityGB: number,
  visibility: BucketVisibilityVariant,
  period: BucketBillingPeriod = "monthly"
): Promise<Outcome<string>> {
  const periodVariant: BucketBillingPeriodVariant =
    period === "yearly" ? { Yearly: null } : { Monthly: null }
  return call(identity, "Failed to create bucket", (actor) => {
    if (period === "yearly" && actor.createBucketPlan) {
      return actor.createBucketPlan(
        name,
        BigInt(capacityGB),
        visibility,
        periodVariant
      ) as Promise<Outcome<string>>
    }
    return actor.createBucket(name, BigInt(capacityGB), visibility) as Promise<Outcome<string>>
  })
}

export function listBuckets(identity: Identity | undefined): Promise<BucketPublic[]> {
  return query(identity, async (actor) => {
    const res = (await actor.listBuckets()) as Outcome<BucketPublic[]>
    return unwrap(res)
  })
}

export function getBucketStats(
  identity: Identity | undefined,
  bucketId: string
): Promise<BucketStats> {
  return query(identity, async (actor) => {
    const res = (await actor.getBucketStats(bucketId)) as Outcome<BucketStats>
    return unwrap(res)
  })
}

export function getRenewQuote(
  identity: Identity | undefined,
  bucketId: string,
  period: BucketBillingPeriod = "monthly"
): Promise<BucketRenewQuote> {
  const periodVariant: BucketBillingPeriodVariant =
    period === "yearly" ? { Yearly: null } : { Monthly: null }
  return query(identity, async (actor) => {
    if (period === "yearly" && actor.getRenewQuotePlan) {
      const res = (await actor.getRenewQuotePlan(bucketId, periodVariant)) as Outcome<BucketRenewQuote>
      return unwrap(res)
    }
    const res = (await actor.getRenewQuote(bucketId)) as Outcome<BucketRenewQuote>
    return unwrap(res)
  })
}

export function renewBucket(
  identity: Identity | undefined,
  bucketId: string,
  period: BucketBillingPeriod = "monthly"
): Promise<Outcome<BucketRenewResult>> {
  const periodVariant: BucketBillingPeriodVariant =
    period === "yearly" ? { Yearly: null } : { Monthly: null }
  return call(identity, "Renew failed", (actor) => {
    if (period === "yearly" && actor.renewBucketPlan) {
      return actor.renewBucketPlan(bucketId, periodVariant) as Promise<Outcome<BucketRenewResult>>
    }
    return actor.renewBucket(bucketId) as Promise<Outcome<BucketRenewResult>>
  })
}

export function listFiles(
  identity: Identity | undefined,
  bucketId: string,
  page: number,
  pageSize: number,
  apiKey?: string
): Promise<FileListPage> {
  return query(identity, async (actor) => {
    const res = (await actor.listFiles(
      bucketId,
      BigInt(page),
      BigInt(pageSize),
      apiKey ? [apiKey] : []
    )) as Outcome<FileListPage>
    return unwrap(res)
  })
}

export function listFolder(
  identity: Identity | undefined,
  bucketId: string,
  folderPrefix: string,
  page: number,
  pageSize: number,
  apiKey?: string
): Promise<FileListPage> {
  return query(identity, async (actor) => {
    const res = (await actor.listFolder(
      bucketId,
      folderPrefix,
      BigInt(page),
      BigInt(pageSize),
      apiKey ? [apiKey] : []
    )) as Outcome<FileListPage>
    return unwrap(res)
  })
}

export function searchFiles(
  identity: Identity | undefined,
  bucketId: string,
  searchQuery: string,
  page: number,
  pageSize: number,
  apiKey?: string
): Promise<FileListPage> {
  return query(identity, async (actor) => {
    const res = (await actor.searchFiles(
      bucketId,
      searchQuery,
      BigInt(page),
      BigInt(pageSize),
      apiKey ? [apiKey] : []
    )) as Outcome<FileListPage>
    return unwrap(res)
  })
}

export function createFolder(
  identity: Identity | undefined,
  bucketId: string,
  path: string,
  apiKey?: string
): Promise<Outcome<string>> {
  return call(identity, "Failed to create folder", (actor) =>
    actor.createFolder(bucketId, path, apiKey ? [apiKey] : []) as Promise<Outcome<string>>
  )
}

export function deleteFolder(
  identity: Identity | undefined,
  bucketId: string,
  path: string,
  apiKey?: string
): Promise<Outcome<null>> {
  return call(identity, "Failed to delete folder", (actor) =>
    actor.deleteFolder(bucketId, path, apiKey ? [apiKey] : []) as Promise<Outcome<null>>
  )
}

export function uploadFile(
  identity: Identity | undefined,
  bucketId: string,
  path: string,
  file: File,
  onProgress?: (pct: number) => void,
  contentType?: string,
  apiKey?: string
): Promise<Outcome<string>> {
  return storeFile(identity, file, {
    bucketId,
    path,
    contentType,
    apiKey,
    onProgress,
  })
}

export function deleteFile(
  identity: Identity | undefined,
  bucketId: string,
  path: string,
  apiKey?: string
): Promise<Outcome<null>> {
  return call(identity, "Delete failed", (actor) =>
    actor.deleteFile(bucketId, path, apiKey ? [apiKey] : []) as Promise<Outcome<null>>
  )
}

const BULK_DELETE_MAX = 20

export async function bulkDeleteFiles(
  identity: Identity | undefined,
  bucketId: string,
  paths: string[],
  apiKey?: string
): Promise<Outcome<bigint>> {
  if (paths.length === 0) return { ok: 0n }
  let deleted = 0n
  for (let i = 0; i < paths.length; i += BULK_DELETE_MAX) {
    const chunk = paths.slice(i, i + BULK_DELETE_MAX)
    const res = await call(identity, "Delete failed", (actor) =>
      actor.bulkDeleteFiles(bucketId, chunk, apiKey ? [apiKey] : []) as Promise<Outcome<bigint>>
    )
    if ("err" in res) return res
    deleted += res.ok
  }
  return { ok: deleted }
}

export function downloadFileBlob(
  identity: Identity | undefined,
  bucketId: string,
  path: string,
  apiKey?: string
): Promise<Uint8Array> {
  return query(identity, async (actor) => {
    const res = (await actor.downloadFile(
      bucketId,
      path,
      apiKey ? [apiKey] : []
    )) as Outcome<Uint8Array>
    return unwrap(res)
  })
}

export function getPublicFileUrl(
  identity: Identity | undefined,
  bucketId: string,
  path: string
): Promise<string> {
  return query(identity, async (actor) => {
    const res = (await actor.getPublicFileUrl(bucketId, path)) as Outcome<string>
    return unwrap(res)
  })
}

export function getBucketCycleStatus(
  identity: Identity | undefined
): Promise<BucketCycleStatus> {
  return query(identity, async (actor) => {
    const res = (await actor.getBucketCycleStatus()) as Outcome<BucketCycleStatus>
    return unwrap(res)
  })
}

export function createApiKey(
  identity: Identity | undefined,
  bucketId: string,
  name: string,
  permissions: ApiKeyPermissions
): Promise<Outcome<ApiKeyCreateResult>> {
  return call(identity, "Failed to create API key", (actor) =>
    actor.createApiKey(bucketId, name, permissions) as Promise<Outcome<ApiKeyCreateResult>>
  )
}

export function listApiKeys(
  identity: Identity | undefined,
  bucketId: string
): Promise<ApiKeyPublic[]> {
  return query(identity, async (actor) => {
    const res = (await actor.listApiKeys(bucketId)) as Outcome<ApiKeyPublic[]>
    return unwrap(res)
  })
}

export function revokeApiKey(
  identity: Identity | undefined,
  bucketId: string,
  keyId: string
): Promise<Outcome<null>> {
  return call(identity, "Failed to revoke API key", (actor) =>
    actor.revokeApiKey(bucketId, keyId) as Promise<Outcome<null>>
  )
}

export function getApiKey(
  identity: Identity | undefined,
  bucketId: string,
  keyId: string
): Promise<ApiKeyPublic> {
  return query(identity, async (actor) => {
    const res = (await actor.getApiKey(bucketId, keyId)) as Outcome<ApiKeyPublic>
    return unwrap(res)
  })
}

export function updateApiKey(
  identity: Identity | undefined,
  bucketId: string,
  keyId: string,
  opts: { name?: string; permissions?: ApiKeyPermissions }
): Promise<Outcome<ApiKeyPublic>> {
  return call(identity, "Failed to update API key", (actor) =>
    actor.updateApiKey(
      bucketId,
      keyId,
      opts.name !== undefined ? [opts.name] : [],
      opts.permissions !== undefined ? [opts.permissions] : []
    ) as Promise<Outcome<ApiKeyPublic>>
  )
}

export function regenerateApiKey(
  identity: Identity | undefined,
  bucketId: string,
  keyId: string
): Promise<Outcome<ApiKeyCreateResult>> {
  return call(identity, "Failed to regenerate API key", (actor) =>
    actor.regenerateApiKey(bucketId, keyId) as Promise<Outcome<ApiKeyCreateResult>>
  )
}

export function updateBucket(
  identity: Identity | undefined,
  bucketId: string,
  opts: {
    name?: string
    visibility?: BucketVisibilityVariant
  }
): Promise<Outcome<BucketPublic>> {
  return call(identity, "Failed to update bucket", (actor) => {
    if (!actor.updateBucket) throw new Error("updateBucket not supported")
    return actor.updateBucket(
      bucketId,
      opts.name !== undefined ? [opts.name] : [],
      opts.visibility !== undefined ? [opts.visibility] : []
    ) as Promise<Outcome<BucketPublic>>
  })
}
