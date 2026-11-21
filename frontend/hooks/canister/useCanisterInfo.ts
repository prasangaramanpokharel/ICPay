import useSWR from "swr"
import type { Identity } from "@icp-sdk/core/agent"
import {
  fetchCanisterAuditInfo,
  type CanisterAuditInfo,
} from "@/services/canister/canisterInfo"

export type CanisterAuditState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; data: CanisterAuditInfo }
  | { kind: "error"; error: string }

export function useCanisterInfo(
  identity: Identity | null | undefined,
  canisterId: string | null | undefined,
  enabled = true
): {
  state: CanisterAuditState
  refresh: () => void
  isLoading: boolean
} {
  const trimmed = canisterId?.trim() ?? ""
  const key =
    enabled && identity && trimmed ? (["canister-audit-info", trimmed] as const) : null

  const { data, error, isLoading, mutate } = useSWR(
    key,
    ([, id]) =>
      identity
        ? fetchCanisterAuditInfo(identity, id)
        : Promise.reject(new Error("No identity")),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
    }
  )

  let state: CanisterAuditState
  if (!key) {
    state = { kind: "idle" }
  } else if (isLoading && !data) {
    state = { kind: "loading" }
  } else if (error) {
    state = {
      kind: "error",
      error: error instanceof Error ? error.message : String(error),
    }
  } else if (data) {
    state = { kind: "ok", data }
  } else {
    state = { kind: "idle" }
  }

  return {
    state,
    refresh: () => void mutate(),
    isLoading,
  }
}
