"use client"

import { useSyncExternalStore } from "react"
import useSWR from "swr"
import type { Identity } from "@icp-sdk/core/agent"
import {
  fetchRemoteLinkedCanisters,
  batchSyncLocalCanistersToCloud,
} from "@/services/canister/cnsClient"
import {
  listSavedCanisterEntries,
  listSavedCanisters,
  mergeRemoteCanisters,
  subscribeSavedCanisters,
  type SavedCanister,
} from "@/lib/canister/savedCanisters"

export function useSavedCanisters(principal: string | null | undefined): string[] {
  const key = principal ?? ""
  const snapshot = useSyncExternalStore(
    subscribeSavedCanisters,
    () => listSavedCanisters(key).join("\n"),
    () => ""
  )
  if (!snapshot) return []
  return snapshot.split("\n")
}

export function useSavedCanisterEntries(
  principal: string | null | undefined
): SavedCanister[] {
  const key = principal ?? ""
  const snapshot = useSyncExternalStore(
    subscribeSavedCanisters,
    () =>
      JSON.stringify(
        listSavedCanisterEntries(key).map((e) => ({ id: e.id, name: e.name }))
      ),
    () => "[]"
  )
  try {
    const parsed = JSON.parse(snapshot) as SavedCanister[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useSyncCloudCanisters(identity: Identity | null | undefined): void {
  const principal = identity?.getPrincipal().toText() ?? ""

  useSWR(
    principal && identity ? (["cloud-linked-canisters", principal] as const) : null,
    async () => {
      if (!identity || !principal) return null
      const remote = await fetchRemoteLinkedCanisters(identity)
      if (remote && remote.length > 0) {
        mergeRemoteCanisters(principal, remote)
      }
      const currentLocal = listSavedCanisterEntries(principal)
      const remoteIds = new Set((remote ?? []).map((r) => r.id))
      const toSync = currentLocal.filter((l) => !remoteIds.has(l.id))
      if (toSync.length > 0) {
        await batchSyncLocalCanistersToCloud(identity, toSync)
      }
      return remote
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  )
}
