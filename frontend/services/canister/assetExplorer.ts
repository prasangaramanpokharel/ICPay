import { Actor, type Identity } from "@icp-sdk/core/agent"
import { IDL } from "@icp-sdk/core/candid"
import { createAgent } from "@/services/icp"
import { parseCanisterId } from "@/services/cycles/topUp"
import { formatBytes, formatNsTimestamp } from "@/lib/canister/format"
import { triggerFileDownload } from "@/services/canister/management"

export type CanisterAssetItem = {
  key: string
  sizeBytes: bigint
  sizeLabel: string
  encoding: string
  modifiedNanos: bigint
  modifiedFormatted: string
  sha256Hex: string
  contentType: string
}

type RawAssetEncoding = {
  content_encoding: string
  sha256: [Uint8Array] | []
  length: bigint
  modified: bigint
}

type RawAssetSummary = {
  key: string
  content_type: string
  encodings: RawAssetEncoding[]
}

type RawAssetGet = {
  content: Uint8Array
  content_type: string
  content_encoding: string
  sha256: [Uint8Array] | []
  total_length: bigint
}

type BatchOperation =
  | {
      CreateAsset: {
        key: string
        content_type: string
        headers: []
        allow_raw_access: []
        max_age: []
        enable_aliasing: []
      }
    }
  | {
      SetAssetContent: {
        key: string
        sha256: [] | [Uint8Array]
        chunk_ids: bigint[]
        content_encoding: string
        last_chunk: []
      }
    }
  | { DeleteAsset: { key: string } }

interface AssetCanisterActor {
  list(args: { start: [] | [bigint]; length: [] | [bigint] }): Promise<RawAssetSummary[]>
  get(args: { key: string; accept_encodings: string[] }): Promise<RawAssetGet>
  get_chunk(args: {
    key: string
    content_encoding: string
    index: bigint
    sha256: [] | [Uint8Array]
  }): Promise<{ content: Uint8Array }>
  store(args: {
    key: string
    content_type: string
    content_encoding: string
    content: Uint8Array
    sha256: [] | [Uint8Array]
  }): Promise<void>
  create_batch(): Promise<{ batch_id: bigint }>
  create_chunk(args: { batch_id: bigint; content: Uint8Array }): Promise<{ chunk_id: bigint }>
  commit_batch(args: {
    batch_id: bigint
    operations: BatchOperation[]
  }): Promise<void>
  delete_asset(args: { key: string }): Promise<void>
}

const assetCanisterIdl: IDL.InterfaceFactory = ({ IDL: idl }) => {
  const Key = idl.Text
  const HeaderField = idl.Tuple(idl.Text, idl.Text)
  const ChunkId = idl.Nat
  const BatchId = idl.Nat

  const CreateAssetArguments = idl.Record({
    key: Key,
    content_type: idl.Text,
    headers: idl.Opt(idl.Vec(HeaderField)),
    allow_raw_access: idl.Opt(idl.Bool),
    max_age: idl.Opt(idl.Nat64),
    enable_aliasing: idl.Opt(idl.Bool),
  })

  const SetAssetContentArguments = idl.Record({
    key: Key,
    sha256: idl.Opt(idl.Vec(idl.Nat8)),
    chunk_ids: idl.Vec(ChunkId),
    content_encoding: idl.Text,
    last_chunk: idl.Opt(idl.Vec(idl.Nat8)),
  })

  const DeleteAssetArguments = idl.Record({ key: Key })

  const BatchOperationKind = idl.Variant({
    CreateAsset: CreateAssetArguments,
    SetAssetContent: SetAssetContentArguments,
    DeleteAsset: DeleteAssetArguments,
  })

  return idl.Service({
    list: idl.Func(
      [
        idl.Record({
          start: idl.Opt(idl.Nat),
          length: idl.Opt(idl.Nat),
        }),
      ],
      [
        idl.Vec(
          idl.Record({
            key: Key,
            content_type: idl.Text,
            encodings: idl.Vec(
              idl.Record({
                content_encoding: idl.Text,
                sha256: idl.Opt(idl.Vec(idl.Nat8)),
                length: idl.Nat,
                modified: idl.Int,
              })
            ),
          })
        ),
      ],
      ["query"]
    ),
    get: idl.Func(
      [
        idl.Record({
          key: Key,
          accept_encodings: idl.Vec(idl.Text),
        }),
      ],
      [
        idl.Record({
          content: idl.Vec(idl.Nat8),
          content_type: idl.Text,
          content_encoding: idl.Text,
          sha256: idl.Opt(idl.Vec(idl.Nat8)),
          total_length: idl.Nat,
        }),
      ],
      ["query"]
    ),
    get_chunk: idl.Func(
      [
        idl.Record({
          key: Key,
          content_encoding: idl.Text,
          index: idl.Nat,
          sha256: idl.Opt(idl.Vec(idl.Nat8)),
        }),
      ],
      [idl.Record({ content: idl.Vec(idl.Nat8) })],
      ["query"]
    ),
    store: idl.Func(
      [
        idl.Record({
          key: Key,
          content_type: idl.Text,
          content_encoding: idl.Text,
          content: idl.Vec(idl.Nat8),
          sha256: idl.Opt(idl.Vec(idl.Nat8)),
        }),
      ],
      [],
      []
    ),
    create_batch: idl.Func([], [idl.Record({ batch_id: BatchId })], []),
    create_chunk: idl.Func(
      [idl.Record({ batch_id: BatchId, content: idl.Vec(idl.Nat8) })],
      [idl.Record({ chunk_id: ChunkId })],
      []
    ),
    commit_batch: idl.Func(
      [
        idl.Record({
          batch_id: BatchId,
          operations: idl.Vec(BatchOperationKind),
        }),
      ],
      [],
      []
    ),
    delete_asset: idl.Func([DeleteAssetArguments], [], []),
  })
}

function guessContentType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? ""
  switch (ext) {
    case "html":
    case "htm":
      return "text/html"
    case "js":
    case "mjs":
      return "application/javascript"
    case "css":
      return "text/css"
    case "json":
      return "application/json"
    case "png":
      return "image/png"
    case "jpg":
    case "jpeg":
      return "image/jpeg"
    case "svg":
      return "image/svg+xml"
    case "webp":
      return "image/webp"
    case "ico":
      return "image/x-icon"
    case "wasm":
      return "application/wasm"
    case "txt":
      return "text/plain"
    default:
      return "application/octet-stream"
  }
}

function shaToHex(sha?: Uint8Array | null): string {
  if (!sha || sha.length === 0) return "—"
  return Array.from(sha)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

async function getAssetActor(
  identity: Identity,
  canisterIdText: string
): Promise<AssetCanisterActor> {
  const agent = await createAgent(identity)
  const canisterId = parseCanisterId(canisterIdText)
  return Actor.createActor(assetCanisterIdl, {
    agent,
    canisterId,
  }) as unknown as AssetCanisterActor
}

export async function listCanisterAssets(
  identity: Identity,
  canisterIdText: string
): Promise<CanisterAssetItem[]> {
  const actor = await getAssetActor(identity, canisterIdText)
  const rawList = await actor.list({ start: [], length: [] })

  const items: CanisterAssetItem[] = []

  for (const asset of rawList) {
    const key = asset.key
    const enc = asset.encodings[0]
    const sizeBytes = enc?.length ?? 0n
    const encoding = enc?.content_encoding ?? "identity"
    const modifiedNanos = enc?.modified ?? 0n
    const sha = enc?.sha256[0] ?? null

    items.push({
      key,
      sizeBytes,
      sizeLabel: formatBytes(sizeBytes),
      encoding,
      modifiedNanos,
      modifiedFormatted: formatNsTimestamp(modifiedNanos),
      sha256Hex: shaToHex(sha),
      contentType: asset.content_type || guessContentType(key),
    })
  }

  items.sort((a, b) => a.key.localeCompare(b.key))
  return items
}

export async function fetchCanisterAssetBlob(
  identity: Identity,
  canisterIdText: string,
  key: string
): Promise<{ blob: Blob; contentType: string }> {
  const actor = await getAssetActor(identity, canisterIdText)
  const res = await actor.get({
    key,
    accept_encodings: ["identity", "gzip"],
  })

  const chunks: Uint8Array[] = [res.content]
  let currentBytes = BigInt(res.content.length)

  let chunkIndex = 1n
  while (currentBytes < res.total_length) {
    const nextChunk = await actor.get_chunk({
      key,
      content_encoding: res.content_encoding,
      index: chunkIndex,
      sha256: res.sha256,
    })
    chunks.push(nextChunk.content)
    currentBytes += BigInt(nextChunk.content.length)
    chunkIndex += 1n
  }

  const blobParts = chunks.map((c) => c.buffer as ArrayBuffer)
  const rawBlob = new Blob(blobParts, {
    type: res.content_type || guessContentType(key),
  })

  if (res.content_encoding === "gzip" && typeof DecompressionStream !== "undefined") {
    try {
      const stream = rawBlob.stream().pipeThrough(new DecompressionStream("gzip"))
      const decompressedBlob = await new Response(stream).blob()
      return { blob: decompressedBlob, contentType: res.content_type || guessContentType(key) }
    } catch {
      return { blob: rawBlob, contentType: res.content_type || guessContentType(key) }
    }
  }

  return { blob: rawBlob, contentType: res.content_type || guessContentType(key) }
}

export async function fetchCanisterAssetText(
  identity: Identity,
  canisterIdText: string,
  key: string,
  maxBytes = 500_000
): Promise<{ text?: string; imageUrl?: string; isBinary?: boolean }> {
  const { blob, contentType } = await fetchCanisterAssetBlob(identity, canisterIdText, key)
  if (contentType.startsWith("image/")) {
    const imageUrl = URL.createObjectURL(blob)
    return { imageUrl }
  }

  const isTextLike =
    contentType.startsWith("text/") ||
    contentType.includes("json") ||
    contentType.includes("javascript") ||
    contentType.includes("xml") ||
    contentType.includes("html") ||
    contentType.includes("css") ||
    /\.(txt|json|js|mjs|cjs|ts|tsx|html|css|md|map|svg|env|yml|yaml|toml|lock)$/i.test(key)

  if (isTextLike) {
    if (blob.size > maxBytes) {
      const slice = blob.slice(0, maxBytes)
      const text = await slice.text()
      return { text: text + `\n\n… [Truncated: file is ${(blob.size / 1024).toFixed(1)} KB]` }
    }
    const text = await blob.text()
    return { text }
  }

  return { isBinary: true }
}

export async function downloadCanisterAsset(
  identity: Identity,
  canisterIdText: string,
  key: string
): Promise<void> {
  const { blob } = await fetchCanisterAssetBlob(identity, canisterIdText, key)
  const filename = key.split("/").pop() || "asset"
  triggerFileDownload(blob, filename)
}

const CHUNK_SIZE = 1500000

export async function uploadCanisterAsset(
  identity: Identity,
  canisterIdText: string,
  file: File,
  targetPath: string,
  onProgress?: (progress: { current: number; total: number }) => void
): Promise<string> {
  const actor = await getAssetActor(identity, canisterIdText)
  const cleanPath = targetPath.startsWith("/") ? targetPath : `/${targetPath}`
  const contentType = file.type || guessContentType(file.name)

  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  const shaBuffer = await crypto.subtle.digest("SHA-256", bytes)
  const shaBytes = new Uint8Array(shaBuffer)

  if (bytes.length <= CHUNK_SIZE) {
    try {
      await actor.store({
        key: cleanPath,
        content_type: contentType,
        content_encoding: "identity",
        content: bytes,
        sha256: [shaBytes],
      })
      onProgress?.({ current: 1, total: 1 })
      return cleanPath
    } catch {
      // Fall through to batch creation if store is unavailable
    }
  }

  const { batch_id } = await actor.create_batch()
  const chunkIds: bigint[] = []
  const totalChunks = Math.ceil(bytes.length / CHUNK_SIZE) || 1

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, bytes.length)
    const slice = bytes.slice(start, end)
    const { chunk_id } = await actor.create_chunk({
      batch_id,
      content: slice,
    })
    chunkIds.push(chunk_id)
    onProgress?.({ current: i + 1, total: totalChunks })
  }

  await actor.commit_batch({
    batch_id,
    operations: [
      {
        CreateAsset: {
          key: cleanPath,
          content_type: contentType,
          headers: [],
          allow_raw_access: [],
          max_age: [],
          enable_aliasing: [],
        },
      },
      {
        SetAssetContent: {
          key: cleanPath,
          sha256: [shaBytes],
          chunk_ids: chunkIds,
          content_encoding: "identity",
          last_chunk: [],
        },
      },
    ],
  })

  return cleanPath
}

export async function deleteCanisterAsset(
  identity: Identity,
  canisterIdText: string,
  key: string
): Promise<void> {
  const actor = await getAssetActor(identity, canisterIdText)
  await actor.delete_asset({ key })
}
