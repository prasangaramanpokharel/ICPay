"use client"

import { useMemo } from "react"
import { preload } from "swr"
import type { Identity } from "@icp-sdk/core/agent"
import { usePersistedSWR } from "@/hooks/cache/usePersistedSWR"
import { useEffectivePrincipal } from "@/lib/auth/lastPrincipal"
import {
  fetchCanisterStatus,
  formatManageError,
  isControllerDenied,
  type CanisterStatusView,
} from "@/services/canister/management"
import { rememberCanister } from "@/lib/canister/savedCanisters"

const statusCacheKey = (principal: string, canisterId: string) =>
  `icpay:canister:status:${principal}:${canisterId}`

export type CanisterStatusState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; data: CanisterStatusView }
  | { kind: "denied"; message: string }
  | { kind: "error"; message: string }

export function useCanisterStatus(
  identity: Identity | null | undefined,
  canisterId: string,
  enabled: boolean
): CanisterStatusState & { refresh: () => void; isValidating: boolean } {
  const { principal: effectivePrincipal } = useEffectivePrincipal()
  const trimmed = canisterId.trim()
  const principal = identity?.getPrincipal().toText() ?? effectivePrincipal ?? null
  const active = Boolean(enabled && identity && trimmed)

  const swrKey = active ? (["canister-status", trimmed, principal] as const) : null

  const { resolved, error, isLoading, isValidating, mutate } = usePersistedSWR(
    swrKey,
    async () => {
      if (!identity) throw new Error("No identity")
      const result = await fetchCanisterStatus(identity, trimmed)
      if (result.isController) rememberCanister(identity.getPrincipal().toText(), trimmed)
      return result
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      dedupingInterval: 30_000,
      keepPreviousData: true,
      cacheKey: enabled && principal && trimmed ? statusCacheKey(principal, trimmed) : null,
      maxAgeMs: 2 * 60_000,
    }
  )

  const state: CanisterStatusState = useMemo(() => {
    if (!active && !resolved) return { kind: "idle" }
    if (isLoading && !resolved) return { kind: "loading" }
    if (error && !resolved) {
      const message = formatManageError(error)
      return isControllerDenied(error)
        ? { kind: "denied", message }
        : { kind: "error", message }
    }
    if (resolved) return { kind: "ok", data: resolved }
    return { kind: "loading" }
  }, [active, isLoading, resolved, error])

  return {
    ...state,
    refresh: () => void mutate(),
    isValidating,
  }
}

export function preloadCanisterStatus(identity: Identity, canisterId: string) {
  const trimmed = canisterId.trim()
  if (!trimmed) return
  const principal = identity.getPrincipal().toText()
  return preload(["canister-status", trimmed, principal], async () => {
    const result = await fetchCanisterStatus(identity, trimmed)
    if (result.isController) rememberCanister(principal, trimmed)
    return result
  })
}

export type { CanisterStatusView }
