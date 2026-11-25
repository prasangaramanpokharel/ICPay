"use client"

import { useEffect, useMemo } from "react"
import useSWR from "swr"
import { useSavedCanisters } from "@/hooks/canister/useSavedCanisters"
import { usePersistedSWR } from "@/hooks/cache/usePersistedSWR"
import { useEffectivePrincipal } from "@/lib/auth/lastPrincipal"
import { rememberCanister } from "@/lib/canister/savedCanisters"
import {
  fetchCanisterIndexMeta,
  fetchControlledCanisters,
  type ControlledCanister,
} from "@/services/canister/controlledCanisters"

const listCacheKey = (principal: string) => `icpay:canister:list:${principal}`

export function useMineCanisters(principal: string | null | undefined) {
  const { principal: effectivePrincipal } = useEffectivePrincipal()
  const key = principal?.trim() || effectivePrincipal || null
  const saved = useSavedCanisters(key)

  const { resolved: data, error, isLoading, isValidating, mutate } = usePersistedSWR(
    key ? (["controlled-canisters", key] as const) : null,
    () => fetchControlledCanisters(key!),
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      dedupingInterval: 60_000,
      keepPreviousData: true,
      cacheKey: key ? listCacheKey(key) : null,
      maxAgeMs: 5 * 60_000,
    }
  )

  useEffect(() => {
    if (!key || !data?.items.length) return
    for (const item of data.items) rememberCanister(key, item.canisterId)
  }, [key, data])

  const missingSavedIds = useMemo(() => {
    const controlledSet = new Set((data?.items ?? []).map((i) => i.canisterId))
    return saved.filter((id) => !controlledSet.has(id))
  }, [data, saved])

  const { data: extraMeta } = useSWR(
    missingSavedIds.length > 0
      ? (["saved-canister-meta", missingSavedIds.sort().join(",")] as const)
      : null,
    async ([, joined]) => {
      const ids = joined.split(",").filter(Boolean)
      const pairs = await Promise.all(
        ids.map(async (id) => {
          try {
            const meta = await fetchCanisterIndexMeta(id)
            return [id, meta] as const
          } catch {
            return [id, null] as const
          }
        })
      )
      return Object.fromEntries(pairs) as Record<string, ControlledCanister | null>
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 120_000,
    }
  )

  const metaById = useMemo(() => {
    const map = new Map<string, ControlledCanister>()
    for (const item of data?.items ?? []) map.set(item.canisterId, item)
    if (extraMeta) {
      for (const [id, meta] of Object.entries(extraMeta)) {
        if (meta && !map.has(id)) {
          map.set(id, meta)
        }
      }
    }
    return map
  }, [data, extraMeta])

  const ids = useMemo(() => {
    const seen = new Set<string>()
    const out: string[] = []
    for (const item of data?.items ?? []) {
      if (seen.has(item.canisterId)) continue
      seen.add(item.canisterId)
      out.push(item.canisterId)
    }
    for (const id of saved) {
      if (seen.has(id)) continue
      seen.add(id)
      out.push(id)
    }
    return out
  }, [data, saved])

  return {
    ids,
    metaById,
    networkTotal: data?.total ?? 0,
    isLoading: Boolean(key) && isLoading && !data,
    isValidating,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    refresh: () => mutate(),
  }
}
