"use client"

import { useMemo } from "react"
import useSWR, { type Key, type SWRConfiguration, type SWRResponse } from "swr"
import { readCache, writeCache } from "@/lib/cache/persistCache"

export type PersistedSWROptions<T> = SWRConfiguration<T> & {
  cacheKey: string | null
  maxAgeMs: number
  authPending?: boolean
  shouldPersist?: (data: T) => boolean
}

export function usePersistedSWR<T>(
  swrKey: Key,
  fetcher: (() => Promise<T>) | null,
  options: PersistedSWROptions<T>
): SWRResponse<T> & { resolved: T | undefined; isInitialLoading: boolean } {
  const { cacheKey, maxAgeMs, authPending = false, shouldPersist, onSuccess, ...swrOpts } = options

  const cached = useMemo(
    () => (cacheKey ? readCache<T>(cacheKey, maxAgeMs) : undefined),
    [cacheKey, maxAgeMs]
  )

  const swr = useSWR<T>(swrKey, fetcher, {
    ...swrOpts,
    fallbackData: cached,
    onSuccess: (data, key, config) => {
      if (cacheKey && data !== undefined && (!shouldPersist || shouldPersist(data))) {
        writeCache(cacheKey, data)
      }
      onSuccess?.(data, key, config)
    },
  })

  const resolved = swr.data ?? cached
  const isInitialLoading = (swr.isLoading || authPending) && resolved === undefined

  return {
    ...swr,
    resolved,
    isInitialLoading,
  }
}
