import useSWR from "swr"
import type { Identity } from "@icp-sdk/core/agent"
import {
  listCanisterAssets,
  type CanisterAssetItem,
} from "@/services/canister/assetExplorer"

export type AssetCanisterState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; files: CanisterAssetItem[] }
  | { kind: "unsupported" }
  | { kind: "error"; error: string }

export function useAssetCanister(
  identity: Identity | null | undefined,
  canisterId: string | null | undefined,
  enabled = true
): {
  state: AssetCanisterState
  refresh: () => void
  isLoading: boolean
} {
  const trimmed = canisterId?.trim() ?? ""
  const key =
    enabled && identity && trimmed ? (["asset-canister-files", trimmed] as const) : null

  const { data, error, isLoading, mutate } = useSWR(
    key,
    ([, id]) =>
      identity
        ? listCanisterAssets(identity, id)
        : Promise.reject(new Error("No identity")),
    {
      revalidateOnFocus: false,
      dedupingInterval: 15_000,
    }
  )

  let state: AssetCanisterState
  if (!key) {
    state = { kind: "idle" }
  } else if (isLoading && !data) {
    state = { kind: "loading" }
  } else if (error) {
    const msg = error instanceof Error ? error.message : String(error)
    if (
      msg.toLowerCase().includes("has no query method") ||
      msg.toLowerCase().includes("has no update method") ||
      msg.toLowerCase().includes("method not found") ||
      msg.toLowerCase().includes("canister has no method")
    ) {
      state = { kind: "unsupported" }
    } else {
      state = { kind: "error", error: msg }
    }
  } else if (data) {
    state = { kind: "ok", files: data }
  } else {
    state = { kind: "idle" }
  }

  return {
    state,
    refresh: () => void mutate(),
    isLoading,
  }
}
