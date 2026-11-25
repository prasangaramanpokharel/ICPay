"use client"

import type { Identity } from "@icp-sdk/core/agent"
import { usePersistedSWR } from "@/hooks/cache/usePersistedSWR"
import { useEffectivePrincipal } from "@/lib/auth/lastPrincipal"
import {
  fetchCanisterStatus,
  isControllerDenied,
  type CanisterStatusView,
} from "@/services/canister/management"

const MAX_PREVIEW = 12
const statusMapCacheKey = (principal: string) => `icpay:canister:status-map:${principal}`

export type MineRowStatus =
  | { kind: "ok"; data: CanisterStatusView }
  | { kind: "denied" }
  | { kind: "error" }

export function useMineStatusMap(
  identity: Identity | null | undefined,
  ids: string[],
  enabled: boolean
) {
  const { principal } = useEffectivePrincipal()
  const capped = ids.slice(0, MAX_PREVIEW)
  const key =
    enabled && identity && capped.length > 0
      ? (["mine-status-map", identity.getPrincipal().toText(), capped.join("|")] as const)
      : null

  const { resolved, isInitialLoading, mutate } = usePersistedSWR(
    key,
    async () => {
      const pairs = await Promise.all(
        capped.map(async (id) => {
          try {
            const view = await fetchCanisterStatus(identity!, id)
            return [id, { kind: "ok", data: view } satisfies MineRowStatus] as const
          } catch (e) {
            const state: MineRowStatus = isControllerDenied(e)
              ? { kind: "denied" }
              : { kind: "error" }
            return [id, state] as const
          }
        })
      )
      return Object.fromEntries(pairs) as Record<string, MineRowStatus>
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      dedupingInterval: 60_000,
      keepPreviousData: true,
      cacheKey: principal ? statusMapCacheKey(principal) : null,
      maxAgeMs: 2 * 60_000,
    }
  )

  return { map: resolved ?? {}, isLoading: isInitialLoading, refresh: () => mutate() }
}
