"use client"

import { useMemo } from "react"
import useSWR, { preload } from "swr"
import type { Identity } from "@icp-sdk/core/agent"
import {
  fetchCanisterStatus,
  formatManageError,
  isControllerDenied,
  type CanisterStatusView,
} from "@/services/canister/management"
import { rememberCanister } from "@/lib/canister/savedCanisters"

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
  const trimmed = canisterId.trim()
  const principal = identity?.getPrincipal().toText() ?? null
  const active = Boolean(enabled && identity && trimmed)

  const swrKey = active ? (["canister-status", trimmed, principal] as const) : null

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    async ([, id]) => {
      if (!identity) throw new Error("No identity")
      const result = await fetchCanisterStatus(identity, id)
      if (result.isController) rememberCanister(identity.getPrincipal().toText(), id)
      return result
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
      keepPreviousData: true,
    }
  )

  const state: CanisterStatusState = useMemo(() => {
    if (!active) return { kind: "idle" }
    if (isLoading && !data) return { kind: "loading" }
    if (error) {
      const message = formatManageError(error)
      return isControllerDenied(error)
        ? { kind: "denied", message }
        : { kind: "error", message }
    }
    if (data) return { kind: "ok", data }
    return { kind: "loading" }
  }, [active, isLoading, data, error])

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
