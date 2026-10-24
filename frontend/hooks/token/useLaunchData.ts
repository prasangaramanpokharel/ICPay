"use client"

import useSWR from "swr"
import useSWRImmutable from "swr/immutable"
import type { Identity } from "@icp-sdk/core/agent"
import { useAuth } from "@/components/auth/auth-provider"
import type { TokenPublic } from "@/services/types"
import {
  isSymbolAvailable,
  getLaunchFee,
  isLaunchReady,
  getMyTokens,
  getTokenById,
} from "@/services/launch/launch"
import { normalizeSymbol, validateSymbol } from "@/lib/token/launch"

const keyFor = (identity: Identity | undefined, ...parts: string[]) =>
  identity ? ([...parts, identity.getPrincipal().toText()] as const) : null

const QUERY = {
  revalidateOnFocus: false,
  revalidateIfStale: false,
  errorRetryCount: 3,
} as const

export function useSymbolAvailability(symbol: string) {
  const { identity } = useAuth()
  const normalized = normalizeSymbol(symbol)
  const wellFormed = normalized !== "" && validateSymbol(normalized) === null

  const { data, isLoading } = useSWR(
    wellFormed ? keyFor(identity, "symbol-available", normalized) : null,
    () => isSymbolAvailable(identity, normalized),
    {
      ...QUERY,
      keepPreviousData: false,
      dedupingInterval: 30_000,
    }
  )

  return { available: data ?? null, isLoading: wellFormed && isLoading }
}

export function useLaunchFee() {
  const { identity } = useAuth()

  const { data, isLoading } = useSWRImmutable(keyFor(identity, "launch-fee"), () =>
    getLaunchFee(identity)
  )

  return { fee: data, isLoading }
}

export function useLaunchReady() {
  const { identity } = useAuth()

  const { data, isLoading } = useSWR(
    keyFor(identity, "launch-ready"),
    () => isLaunchReady(identity),
    { ...QUERY, dedupingInterval: 60_000 }
  )

  return { ready: data, isLoading }
}

export function useMyTokens(limit = 50) {
  const { identity } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    keyFor(identity, "my-tokens", String(limit)),
    () => getMyTokens(identity, limit, 0),
    { ...QUERY, keepPreviousData: true }
  )

  return { tokens: (data ?? []) as TokenPublic[], error, isLoading, refresh: mutate }
}

export function useToken(id: string | null) {
  const { identity } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    id ? keyFor(identity, "token", id) : null,
    () => getTokenById(identity, id!),
    {
      ...QUERY,
      keepPreviousData: true,
      refreshInterval: (token) => (token && "pending" in token.status ? 5_000 : 0),
    }
  )

  return { token: data ?? null, error, isLoading, refresh: mutate }
}
