"use client"

import { useEffect } from "react"
import useSWR from "swr"
import { terminalPairKey } from "@/lib/market/tradePairs"
import {
  fetchTerminalPairs,
  fetchTradePairSnapshot,
} from "@/services/market/tradePairSnapshot"
import { ohlcWindowQuery, type ChartWindow } from "@/lib/market/ohlc"
import {
  readOhlcCache,
  readPairSnapshotCache,
  readWatchlistCache,
  writeOhlcCache,
  writePairSnapshotCache,
  writeWatchlistCache,
} from "@/lib/market/tradeCache"
import { fetchIcpswapOhlc } from "@/services/market/icpswapChart"
import type { IcpswapTokenStats } from "@/services/market/icpswapStats"

export function useTerminalWatchlist() {
  const { data, error, isLoading, mutate } = useSWR("terminal-watchlist", fetchTerminalPairs, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true,
    dedupingInterval: 300_000,
    keepPreviousData: true,
    onSuccess: writeWatchlistCache,
  })

  useEffect(() => {
    if (data !== undefined) return
    const cached = readWatchlistCache()
    if (cached) void mutate(cached, { revalidate: false })
  }, [data, mutate])

  return { rows: data ?? [], isLoading, error }
}

export function useIcpswapOhlc(ledgerId: string | undefined, window: ChartWindow) {
  const { level, limit } = ohlcWindowQuery(window)
  const { data, error, isLoading, mutate } = useSWR(
    ledgerId ? (["icpswap-ohlc", ledgerId, level, String(limit)] as const) : null,
    () => fetchIcpswapOhlc(ledgerId!, level, limit),
    {
      revalidateOnFocus: false,
      dedupingInterval: 120_000,
      keepPreviousData: true,
      onSuccess: (bars) => {
        if (ledgerId) writeOhlcCache(ledgerId, window, bars)
      },
    }
  )

  useEffect(() => {
    if (!ledgerId || data !== undefined) return
    const cached = readOhlcCache(ledgerId, window)
    if (cached) void mutate(cached, { revalidate: false })
  }, [ledgerId, window, data, mutate])

  return { bars: data ?? [], isLoading, error }
}

export function useTradePairSnapshot(
  baseLedgerId: string | null,
  cachedStats?: IcpswapTokenStats | null
) {
  const key = baseLedgerId ? terminalPairKey(baseLedgerId) : null
  const { data, error, isLoading, mutate } = useSWR(
    key ? ["terminal-pair", key] : null,
    () => fetchTradePairSnapshot(baseLedgerId!, cachedStats),
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      dedupingInterval: 60_000,
      keepPreviousData: true,
      onSuccess: (snap) => {
        if (baseLedgerId) writePairSnapshotCache(baseLedgerId, snap)
      },
    }
  )

  useEffect(() => {
    if (!baseLedgerId || data !== undefined) return
    const cached = readPairSnapshotCache(baseLedgerId)
    if (cached) void mutate(cached, { revalidate: false })
  }, [baseLedgerId, data, mutate])

  return { snapshot: data, isLoading, error, refresh: mutate }
}

export { TERMINAL_QUOTE_LEDGER_ID } from "@/lib/market/tradePairs"
