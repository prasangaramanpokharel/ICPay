import { Actor, type Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { createAgent } from "@/services/icp"
import type { SavedCanister } from "@/lib/canister/savedCanisters"

export const CNSMANAGEMENT_CANISTER_ID =
  process.env.NEXT_PUBLIC_CNSMANAGEMENT_CANISTER_ID?.trim() || "6jtj7-4qaaa-aaaan-q6tta-cai"

export type RemoteLinkedCanister = {
  canister_id: Principal
  name: string
  description: [] | [string]
  linked_at: bigint
  updated_at: bigint
}

type LinkArgs = {
  canister_id: Principal
  name: string
  description: [] | [string]
}

type CnsService = {
  get_linked_canisters: () => Promise<RemoteLinkedCanister[]>
  link_canister: (args: LinkArgs) => Promise<{ Ok: RemoteLinkedCanister } | { Err: string }>
  unlink_canister: (canisterId: Principal) => Promise<{ Ok: null } | { Err: string }>
  update_canister_name: (
    canisterId: Principal,
    name: string
  ) => Promise<{ Ok: null } | { Err: string }>
  batch_sync_canisters: (
    entries: LinkArgs[]
  ) => Promise<{ Ok: RemoteLinkedCanister[] } | { Err: string }>
}

function getCnsActor(identity: Identity, canisterIdText: string): Promise<CnsService> {
  return createAgent(identity).then((agent) =>
    Actor.createActor<CnsService>(
      ({ IDL }) => {
        const LinkedCanister = IDL.Record({
          canister_id: IDL.Principal,
          name: IDL.Text,
          description: IDL.Opt(IDL.Text),
          linked_at: IDL.Nat64,
          updated_at: IDL.Nat64,
        })
        const LinkCanisterArgs = IDL.Record({
          canister_id: IDL.Principal,
          name: IDL.Text,
          description: IDL.Opt(IDL.Text),
        })
        const Result = IDL.Variant({ Ok: IDL.Null, Err: IDL.Text })
        const ResultRecord = IDL.Variant({ Ok: LinkedCanister, Err: IDL.Text })
        const ResultList = IDL.Variant({
          Ok: IDL.Vec(LinkedCanister),
          Err: IDL.Text,
        })

        return IDL.Service({
          get_linked_canisters: IDL.Func([], [IDL.Vec(LinkedCanister)], ["query"]),
          link_canister: IDL.Func([LinkCanisterArgs], [ResultRecord], []),
          unlink_canister: IDL.Func([IDL.Principal], [Result], []),
          update_canister_name: IDL.Func([IDL.Principal, IDL.Text], [Result], []),
          batch_sync_canisters: IDL.Func([IDL.Vec(LinkCanisterArgs)], [ResultList], []),
        })
      },
      {
        agent,
        canisterId: Principal.fromText(canisterIdText),
      }
    )
  )
}

export function isCnsServiceConfigured(): boolean {
  return Boolean(CNSMANAGEMENT_CANISTER_ID)
}

export async function fetchRemoteLinkedCanisters(
  identity: Identity | null | undefined
): Promise<SavedCanister[] | null> {
  if (!identity || !CNSMANAGEMENT_CANISTER_ID) return null
  try {
    const actor = await getCnsActor(identity, CNSMANAGEMENT_CANISTER_ID)
    const records = await actor.get_linked_canisters()
    return records.map((r) => ({
      id: r.canister_id.toText(),
      name: r.name,
    }))
  } catch (err) {
    console.debug("[cnsClient] fetchRemoteLinkedCanisters unavailable:", err)
    return null
  }
}

export async function syncCanisterToCloud(
  identity: Identity | null | undefined,
  canisterIdText: string,
  name?: string | null
): Promise<void> {
  if (!identity || !CNSMANAGEMENT_CANISTER_ID) return
  try {
    const actor = await getCnsActor(identity, CNSMANAGEMENT_CANISTER_ID)
    const canister_id = Principal.fromText(canisterIdText.trim())
    await actor.link_canister({
      canister_id,
      name: (name ?? "").trim(),
      description: [],
    })
  } catch (err) {
    console.debug("[cnsClient] syncCanisterToCloud error:", err)
  }
}

export async function removeCanisterFromCloud(
  identity: Identity | null | undefined,
  canisterIdText: string
): Promise<void> {
  if (!identity || !CNSMANAGEMENT_CANISTER_ID) return
  try {
    const actor = await getCnsActor(identity, CNSMANAGEMENT_CANISTER_ID)
    const canister_id = Principal.fromText(canisterIdText.trim())
    await actor.unlink_canister(canister_id)
  } catch (err) {
    console.debug("[cnsClient] removeCanisterFromCloud error:", err)
  }
}

export async function batchSyncLocalCanistersToCloud(
  identity: Identity | null | undefined,
  entries: SavedCanister[]
): Promise<void> {
  if (!identity || !CNSMANAGEMENT_CANISTER_ID || entries.length === 0) return
  try {
    const actor = await getCnsActor(identity, CNSMANAGEMENT_CANISTER_ID)
    const linkArgs: LinkArgs[] = entries
      .filter((e) => Boolean(e.id.trim()))
      .map((e) => ({
        canister_id: Principal.fromText(e.id.trim()),
        name: e.name.trim(),
        description: [],
      }))
    await actor.batch_sync_canisters(linkArgs)
  } catch (err) {
    console.debug("[cnsClient] batchSyncLocalCanistersToCloud error:", err)
  }
}

export async function updateCanisterNameOnCloud(
  identity: Identity | null | undefined,
  canisterIdText: string,
  name: string
): Promise<boolean> {
  if (!identity || !CNSMANAGEMENT_CANISTER_ID) return false
  const cleanName = name.trim()
  try {
    const actor = await getCnsActor(identity, CNSMANAGEMENT_CANISTER_ID)
    const canister_id = Principal.fromText(canisterIdText.trim())
    const res = await actor.update_canister_name(canister_id, cleanName)
    if ("Err" in res) {
      const linkRes = await actor.link_canister({
        canister_id,
        name: cleanName,
        description: [],
      })
      return "Ok" in linkRes
    }
    return true
  } catch (err) {
    console.debug("[cnsClient] updateCanisterNameOnCloud error:", err)
    return false
  }
}
