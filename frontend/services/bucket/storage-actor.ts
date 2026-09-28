import { Actor, type Identity } from "@icp-sdk/core/agent"
import { createAgent } from "@/services/icp"
import { IDL } from "@icp-sdk/core/candid"

export const storageIdlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text)
  const HttpRequest = IDL.Record({
    method: IDL.Text,
    url: IDL.Text,
    headers: IDL.Vec(HeaderField),
    body: IDL.Vec(IDL.Nat8),
  })
  const HttpResponse = IDL.Record({
    status_code: IDL.Nat16,
    headers: IDL.Vec(HeaderField),
    body: IDL.Vec(IDL.Nat8),
    streaming_strategy: IDL.Opt(IDL.Null),
  })
  return IDL.Service({
    putBlob: IDL.Func([IDL.Text, IDL.Vec(IDL.Nat8)], [], []),
    putBlobWithMeta: IDL.Func([IDL.Text, IDL.Vec(IDL.Nat8), IDL.Text], [], []),
    getBlob: IDL.Func([IDL.Text], [IDL.Opt(IDL.Vec(IDL.Nat8))], ["query"]),
    fetchBlob: IDL.Func([IDL.Text], [IDL.Opt(IDL.Vec(IDL.Nat8))], ["composite_query"]),
    getContentType: IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ["query"]),
    deleteBlob: IDL.Func([IDL.Text], [IDL.Bool], []),
    beginSession: IDL.Func([IDL.Text, IDL.Nat, IDL.Nat, IDL.Text], [IDL.Bool], []),
    putChunk: IDL.Func([IDL.Text, IDL.Nat, IDL.Vec(IDL.Nat8)], [IDL.Bool], []),
    commitSession: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    cancelSession: IDL.Func([IDL.Text], [IDL.Bool], []),
    http_request: IDL.Func([HttpRequest], [HttpResponse], ["query"]),
    stats: IDL.Func([], [IDL.Record({ count: IDL.Nat, bytes: IDL.Nat })], ["query"]),
    getCapacityLimit: IDL.Func([], [IDL.Nat], ["query"]),
    setCapacityLimit: IDL.Func([IDL.Nat], [], []),
    setAuthorized: IDL.Func([IDL.Principal], [], []),
  })
}

export type StorageActor = {
  putBlob: (id: string, data: Uint8Array) => Promise<void>
  putBlobWithMeta: (id: string, data: Uint8Array, contentType: string) => Promise<void>
  getBlob: (id: string) => Promise<[] | [Uint8Array]>
  fetchBlob: (id: string) => Promise<[] | [Uint8Array]>
  getContentType: (id: string) => Promise<[] | [string]>
  deleteBlob: (id: string) => Promise<boolean>
  beginSession: (
    uploadId: string,
    totalBytes: bigint,
    totalChunks: bigint,
    contentType: string
  ) => Promise<boolean>
  putChunk: (uploadId: string, chunkIndex: bigint, chunkData: Uint8Array) => Promise<boolean>
  commitSession: (uploadId: string, targetBlobId: string) => Promise<boolean>
  cancelSession: (uploadId: string) => Promise<boolean>
  http_request: (request: {
    method: string
    url: string
    headers: [string, string][]
    body: Uint8Array
  }) => Promise<{
    status_code: number
    headers: [string, string][]
    body: Uint8Array
    streaming_strategy: [] | [null]
  }>
  stats: () => Promise<{ count: bigint; bytes: bigint }>
  getCapacityLimit: () => Promise<bigint>
  setCapacityLimit: (limit: bigint) => Promise<void>
  setAuthorized: (principal: { toText: () => string }) => Promise<void>
}

export async function getStorageActor(
  canisterId: string,
  identity?: Identity
): Promise<StorageActor> {
  const agent = await createAgent(identity)

  return Actor.createActor(storageIdlFactory, {
    agent,
    canisterId,
  }) as unknown as StorageActor
}

/** Direct CDN URL to the storage canister via certified boundary nodes */
export function getDirectStorageUrl(canisterId: string, blobId: string): string {
  const cleanId = blobId.startsWith("/") ? blobId.slice(1) : blobId
  return `https://${canisterId}.raw.icp0.io/${cleanId}`
}
