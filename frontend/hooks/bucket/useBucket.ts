"use client"

import { useCallback } from "react"
import useSWR from "swr"
import useSWRImmutable from "swr/immutable"
import { useSWRConfig } from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { FILES_PAGE_SIZE } from "@/lib/bucket/bucket"
import {
  bucketAllFilesKey,
  bucketCycleKey,
  bucketFilesKey,
  bucketListKey,
  bucketSearchKey,
  bucketStatsKey,
  isBucketCacheKey,
} from "@/lib/bucket/cacheKeys"
import { CAPACITY_TIERS_GB } from "@/lib/bucket/bucket"
import {
  buildEstimatedPricingTiers,
  buildEstimatedYearlyPricingTiers,
  buildPricingTier,
  buildYearlyPricingTier,
  calculatePriceE8s,
  calculateYearlyPriceE8s,
  type BucketPricingTier,
} from "@/lib/bucket/pricing"
import {
  getBucketCycleStatus,
  getBucketPrice,
  getBucketYearlyPrice,
  getBucketStats,
  getRenewQuote,
  listBuckets,
  listFiles,
  listFolder,
  searchFiles,
} from "@/services/bucket/bucket"
import type { BucketBillingPeriod, FileListPage, FilePublic } from "@/services/bucket/types"
import { apiListFolderPrefix } from "@/lib/bucket/folderPath"

export const BUCKET_QUERY = {
  revalidateOnFocus: true,
  revalidateIfStale: true,
  revalidateOnMount: true,
  errorRetryCount: 3,
} as const

export function useInvalidateBucketCache() {
  const { mutate } = useSWRConfig()
  const { identity } = useAuth()

  return useCallback(async () => {
    if (!identity) return
    await mutate((key) => isBucketCacheKey(key, identity))
  }, [identity, mutate])
}

export function useBucketList() {
  const { identity } = useAuth()

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    bucketListKey(identity),
    () => listBuckets(identity),
    { ...BUCKET_QUERY, keepPreviousData: true, dedupingInterval: 4_000 }
  )

  return { buckets: data ?? [], error, isLoading, isValidating, refresh: mutate }
}

export function useBucketStats(bucketId: string | null) {
  const { identity } = useAuth()

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    bucketId ? bucketStatsKey(identity, bucketId) : null,
    () => getBucketStats(identity!, bucketId!),
    { ...BUCKET_QUERY, keepPreviousData: true, dedupingInterval: 2_000 }
  )

  const initialLoad = isLoading && data === undefined

  return { stats: data ?? null, error, isLoading: initialLoad, isValidating, refresh: mutate }
}

export function useBucketFiles(bucketId: string | null, prefix: string, page: number) {
  const { identity } = useAuth()
  const apiPrefix = apiListFolderPrefix(prefix)

  const { data, error, isLoading, mutate } = useSWR(
    bucketId ? bucketFilesKey(identity, bucketId, apiPrefix, page) : null,
    () => listFolder(identity!, bucketId!, apiPrefix, page, FILES_PAGE_SIZE),
    { ...BUCKET_QUERY, keepPreviousData: true, dedupingInterval: 2_000 }
  )

  const total = data ? Number(data.total) : 0
  const pageSize = data ? Number(data.pageSize) : FILES_PAGE_SIZE
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1
  const initialLoad = isLoading && data === undefined

  return {
    files: data?.items ?? [],
    folders: data?.folders ?? [],
    total,
    page: data ? Number(data.page) : page,
    pageSize,
    totalPages,
    error,
    isLoading: initialLoad,
    refresh: mutate,
  }
}

export function useBucketAllFiles(bucketId: string | null) {
  const { identity } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    bucketId ? bucketAllFilesKey(identity, bucketId) : null,
    async () => {
      if (!identity || !bucketId) return []
      const firstPage = await listFiles(identity, bucketId, 0, 50)
      const items: FilePublic[] = firstPage?.items ? [...firstPage.items] : []
      const total = firstPage?.total ? Number(firstPage.total) : 0
      const pageSize = firstPage?.pageSize ? Number(firstPage.pageSize) : 50
      if (total <= items.length || pageSize <= 0) {
        return items
      }
      const totalPages = Math.ceil(total / pageSize)
      const maxPagesToFetch = Math.min(totalPages, 20)
      const remainingPromises: Promise<FileListPage>[] = []
      for (let p = 1; p < maxPagesToFetch; p++) {
        remainingPromises.push(listFiles(identity, bucketId, p, pageSize))
      }
      const remainingPages = await Promise.all(remainingPromises)
      for (const page of remainingPages) {
        if (page?.items) {
          items.push(...page.items)
        }
      }
      return items
    },
    { ...BUCKET_QUERY, keepPreviousData: true, dedupingInterval: 4_000 }
  )

  return {
    allFiles: data ?? [],
    isLoading: isLoading && data === undefined,
    error,
    refresh: mutate,
  }
}

export function useBucketSearch(
  bucketId: string | null,
  searchQuery: string,
  page: number
) {
  const { identity } = useAuth()
  const trimmed = searchQuery.trim()

  const { data, error, isLoading, mutate } = useSWR(
    bucketId && trimmed ? bucketSearchKey(identity, bucketId, trimmed, page) : null,
    () => searchFiles(identity!, bucketId!, trimmed, page, FILES_PAGE_SIZE),
    { ...BUCKET_QUERY, keepPreviousData: true, dedupingInterval: 2_000 }
  )

  const total = data ? Number(data.total) : 0
  const pageSize = data ? Number(data.pageSize) : FILES_PAGE_SIZE
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1
  const initialLoad = isLoading && data === undefined

  return {
    files: data?.items ?? [],
    total,
    page: data ? Number(data.page) : page,
    pageSize,
    totalPages,
    error,
    isLoading: initialLoad,
    refresh: mutate,
  }
}

export function useBucketPrice(
  capacityGB: number | null,
  period: BucketBillingPeriod = "monthly"
) {
  const { identity } = useAuth()

  const { data, isLoading } = useSWR(
    capacityGB !== null ? ["bucket-price", String(capacityGB), period] as const : null,
    async () => {
      if (period === "yearly") {
        return getBucketYearlyPrice(identity, capacityGB!)
      }
      return getBucketPrice(identity, capacityGB!)
    },
    { ...BUCKET_QUERY, dedupingInterval: 60_000 }
  )

  const price =
    data && "ok" in data
      ? data.ok
      : capacityGB !== null
        ? period === "yearly"
          ? calculateYearlyPriceE8s(capacityGB)
          : calculatePriceE8s(capacityGB)
        : null
  const priceError = data && "err" in data ? data.err : null
  const fromCanister = Boolean(data && "ok" in data)

  return {
    price,
    priceError,
    fromCanister,
    isLoading: capacityGB !== null && isLoading && !data,
  }
}

export function useBucketPricingTiers(period: BucketBillingPeriod = "monthly") {
  const { identity } = useAuth()

  const { data, error, isLoading } = useSWRImmutable(
    ["bucket-pricing-table", period] as const,
    async (): Promise<BucketPricingTier[]> => {
      const rows = await Promise.all(
        CAPACITY_TIERS_GB.map(async (gb) => {
          if (period === "yearly") {
            const res = await getBucketYearlyPrice(identity, gb)
            const priceE8s =
              "ok" in res ? res.ok : calculateYearlyPriceE8s(gb)
            return buildYearlyPricingTier(gb, priceE8s)
          }
          const res = await getBucketPrice(identity, gb)
          const priceE8s =
            "ok" in res ? res.ok : calculatePriceE8s(gb)
          return buildPricingTier(gb, priceE8s)
        })
      )
      return rows
    },
    {
      ...BUCKET_QUERY,
      dedupingInterval: 300_000,
      fallbackData:
        period === "yearly"
          ? buildEstimatedYearlyPricingTiers()
          : buildEstimatedPricingTiers(),
    }
  )

  return {
    tiers:
      data ??
      (period === "yearly"
        ? buildEstimatedYearlyPricingTiers()
        : buildEstimatedPricingTiers()),
    error,
    isLoading: isLoading && !data,
  }
}

export function useRenewQuote(
  bucketId: string | null,
  enabled: boolean,
  period: BucketBillingPeriod = "monthly"
) {
  const { identity } = useAuth()

  const { data, isLoading, mutate } = useSWR(
    enabled && bucketId
      ? (["bucket-renew-quote", bucketId, period, identity?.getPrincipal().toText()] as const)
      : null,
    () => getRenewQuote(identity!, bucketId!, period),
    { ...BUCKET_QUERY, dedupingInterval: 5_000 }
  )

  return { quote: data ?? null, isLoading: enabled && isLoading, refresh: mutate }
}

export function useBucketCycleStatus() {
  const { identity } = useAuth()

  const { data, isLoading } = useSWRImmutable(bucketCycleKey(identity), () =>
    getBucketCycleStatus(identity)
  )

  return { cycleStatus: data ?? null, isLoading }
}
