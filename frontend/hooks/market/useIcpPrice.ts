"use client"

import { useEffect } from "react"
import useSWR from "swr"
import type { IcpPrice } from "@/lib/market/icpPrice"
import { readIcpPriceCache, writeIcpPriceCache } from "@/lib/market/tradeCache"
import { fetchIcpPrice } from "@/services/market/icpPrice"

const PRICE_KEY = "icp-price"

export function useIcpPrice(
  opts?: { refreshInterval?: number }
): { price: IcpPrice | null; loading: boolean; refresh: () => Promise<void> } {
  const { data, isLoading, mutate } = useSWR<IcpPrice | null>(
    PRICE_KEY,
    () => fetchIcpPrice(),
    {
      dedupingInterval: 300_000,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
      onSuccess: (price) => {
        if (price) writeIcpPriceCache(price)
      },
      ...(opts?.refreshInterval ? { refreshInterval: opts.refreshInterval } : {}),
    }
  )

  useEffect(() => {
    if (data !== undefined) return
    const cached = readIcpPriceCache()
    if (cached) void mutate(cached, { revalidate: false })
  }, [data, mutate])

  const refresh = async () => {
    await mutate()
  }

  return { price: data ?? null, loading: isLoading, refresh }
}
