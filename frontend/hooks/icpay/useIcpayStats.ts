"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { fetchIcpayStats, type IcpayStats } from "@/services/icpay/icpay"

export function useIcpayStats(): { stats: IcpayStats | undefined; isLoading: boolean } {
  const { identity } = useAuth()

  const { data, isLoading } = useSWR("icpay-stats", () => fetchIcpayStats(identity), {
    dedupingInterval: 300_000,
    refreshInterval: 300_000,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false,
  })

  return { stats: data, isLoading }
}
