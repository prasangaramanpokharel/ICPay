import { Actor, type Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import {
  encodeSnapshotId,
  IcManagementCanister,
  LogVisibility,
  type CanisterSettings,
} from "@icp-sdk/canisters/ic-management"
import { createAgent } from "@/services/icp"
import { parseCanisterId } from "@/services/cycles/topUp"
import {
  formatBytes,
  formatLogTimestamp,
  formatModuleHash,
  formatNsTimestamp,
  parseRunStatus,
  type CanisterRunStatus,
} from "@/lib/canister/format"
import { formatCycles } from "@/services/cycles/topUp"

export type CanisterStatusView = {
  canisterId: string
  runStatus: CanisterRunStatus
  cycles: bigint
  cyclesLabel: string
  memoryLabel: string
  idleBurnLabel: string
  idleCyclesBurnedPerDay?: bigint
  reservedLabel: string
  reservedCyclesLimit?: bigint
  reservedCyclesLimitLabel: string
  version: string
  moduleHash: string
  controllers: string[]
  isController: boolean
  freezingThreshold: string
  freezingThresholdSeconds?: bigint
  computeAllocation: string
  computeAllocationPercent?: bigint
  memoryAllocation: string
  memoryAllocationBytes?: bigint
  wasmMemory: string
  wasmMemoryLimitBytes?: bigint
  stableMemory: string
  snapshotsSize: string
  logVisibility?: "controllers" | "public"
}

export type SnapshotView = {
  id: string
  totalSizeLabel: string
  takenAtLabel: string
}

async function management(identity: Identity): Promise<IcManagementCanister> {
  const agent = await createAgent(identity)
  return IcManagementCanister.create({ agent })
}

async function tryQueryCanisterCycles(
  identity: Identity,
  canisterId: Principal
): Promise<bigint | null> {
  try {
    const agent = await createAgent(identity)
    const cyclesActor = Actor.createActor<{ get_cycles: () => Promise<bigint> }>(
      ({ IDL }) =>
        IDL.Service({
          get_cycles: IDL.Func([], [IDL.Nat], ["query"]),
        }),
      { agent, canisterId }
    )
    return await cyclesActor.get_cycles()
  } catch {
    return null
  }
}

export async function fetchCanisterStatus(
  identity: Identity,
  canisterIdText: string
): Promise<CanisterStatusView> {
  const canisterId = parseCanisterId(canisterIdText)
  try {
    const mgmt = await management(identity)
    const raw = await mgmt.canisterStatus({ canisterId, certified: false })
    const caller = identity.getPrincipal().toText()
    const controllers = raw.settings.controllers.map((p) => p.toText())

    const isLogPublic =
      raw.settings.log_visibility != null && "public" in raw.settings.log_visibility

    const rawReservedLimit = raw.settings.reserved_cycles_limit
    const reservedCyclesLimitLabel =
      rawReservedLimit === 0n ? "Unlimited (0)" : formatCycles(rawReservedLimit)

    return {
      canisterId: canisterId.toText(),
      runStatus: parseRunStatus(raw.status),
      cycles: raw.cycles,
      cyclesLabel: formatCycles(raw.cycles),
      memoryLabel: formatBytes(raw.memory_size),
      idleBurnLabel: `${formatCycles(raw.idle_cycles_burned_per_day)} / day`,
      idleCyclesBurnedPerDay: raw.idle_cycles_burned_per_day,
      reservedLabel: formatCycles(raw.reserved_cycles),
      reservedCyclesLimit: rawReservedLimit,
      reservedCyclesLimitLabel,
      version: raw.version.toString(),
      moduleHash: formatModuleHash(raw.module_hash[0] ?? null),
      controllers,
      isController: controllers.includes(caller),
      freezingThreshold: `${raw.settings.freezing_threshold.toString()} s`,
      freezingThresholdSeconds: raw.settings.freezing_threshold,
      computeAllocation: `${raw.settings.compute_allocation.toString()}%`,
      computeAllocationPercent: raw.settings.compute_allocation,
      memoryAllocation: formatBytes(raw.settings.memory_allocation),
      memoryAllocationBytes: raw.settings.memory_allocation,
      wasmMemory: formatBytes(raw.memory_metrics.wasm_memory_size),
      wasmMemoryLimitBytes: raw.settings.wasm_memory_limit,
      stableMemory: formatBytes(raw.memory_metrics.stable_memory_size),
      snapshotsSize: formatBytes(raw.memory_metrics.snapshots_size),
      logVisibility: isLogPublic ? "public" : "controllers",
    }
  } catch (err) {
    if (isControllerDenied(err)) {
      const publicCycles = await tryQueryCanisterCycles(identity, canisterId)
      if (publicCycles != null) {
        return {
          canisterId: canisterId.toText(),
          runStatus: "running",
          cycles: publicCycles,
          cyclesLabel: formatCycles(publicCycles),
          memoryLabel: "—",
          idleBurnLabel: "—",
          reservedLabel: "—",
          reservedCyclesLimit: 0n,
          reservedCyclesLimitLabel: "—",
          version: "—",
          moduleHash: "—",
          controllers: [],
          isController: false,
          freezingThreshold: "—",
          computeAllocation: "—",
          memoryAllocation: "—",
          wasmMemory: "—",
          stableMemory: "—",
          snapshotsSize: "—",
        }
      }
    }
    throw err
  }
}

function rejectDetails(err: unknown): { code?: number; text: string } {
  if (err && typeof err === "object" && "cause" in err) {
    const cause = (err as { cause?: { code?: { rejectCode?: number; rejectMessage?: string } } })
      .cause
    const code = cause?.code
    if (code && typeof code.rejectMessage === "string") {
      return { code: code.rejectCode, text: code.rejectMessage }
    }
  }
  const raw = err instanceof Error ? err.message : String(err ?? "")
  const codeMatch = raw.match(/Reject code:\s*(\d+)/i)
  const textMatch = raw.match(/Reject text:\s*([^\n]+)/i)
  return {
    code: codeMatch ? Number(codeMatch[1]) : undefined,
    text: textMatch?.[1]?.trim() || raw,
  }
}

export function isControllerDenied(err: unknown): boolean {
  const { text } = rejectDetails(err)
  const lower = text.toLowerCase()
  if (
    lower.includes("not a controller") ||
    lower.includes("only controllers") ||
    lower.includes("unauthorized") ||
    lower.includes("not authorized") ||
    lower.includes("not allowed to") ||
    lower.includes("is not allowed to") ||
    (lower.includes("caller") && lower.includes("canister status")) ||
    (lower.includes("caller") && lower.includes("controller"))
  ) {
    return true
  }
  return false
}

export function formatManageError(err: unknown): string {
  if (isControllerDenied(err)) {
    return "Your Internet Identity is not a controller of this canister."
  }
  const { text } = rejectDetails(err)
  const clean = text.replace(/\s+/g, " ").trim()
  if (!clean || /request id:|reject code:/i.test(clean)) {
    return "Request failed. Check the canister ID and try again."
  }
  return clean.length > 140 ? `${clean.slice(0, 140)}…` : clean
}

export async function addController(
  identity: Identity,
  canisterIdText: string,
  newControllerText: string
): Promise<string[]> {
  const canisterId = parseCanisterId(canisterIdText)
  const newController = Principal.fromText(newControllerText.trim())
  const mgmt = await management(identity)
  const raw = await mgmt.canisterStatus({ canisterId, certified: false })
  const current = raw.settings.controllers.map((p) => p.toText())
  if (current.includes(newController.toText())) {
    return current
  }
  const controllers = [...current, newController.toText()]
  await mgmt.updateSettings({ canisterId, settings: { controllers } })
  return controllers
}

export async function removeController(
  identity: Identity,
  canisterIdText: string,
  removeControllerText: string
): Promise<string[]> {
  const canisterId = parseCanisterId(canisterIdText)
  const target = Principal.fromText(removeControllerText.trim()).toText()
  const mgmt = await management(identity)
  const raw = await mgmt.canisterStatus({ canisterId, certified: false })
  const current = raw.settings.controllers.map((p) => p.toText())
  const controllers = current.filter((c) => c !== target)
  if (controllers.length === current.length) {
    return current
  }
  await mgmt.updateSettings({ canisterId, settings: { controllers } })
  return controllers
}

export async function updateCanisterSettings(
  identity: Identity,
  canisterIdText: string,
  settings: CanisterSettings
): Promise<void> {
  const canisterId = parseCanisterId(canisterIdText)
  const mgmt = await management(identity)
  await mgmt.updateSettings({ canisterId, settings })
}

export async function deleteCanister(identity: Identity, canisterIdText: string): Promise<void> {
  const mgmt = await management(identity)
  await mgmt.deleteCanister(parseCanisterId(canisterIdText))
}

export async function startCanister(identity: Identity, canisterIdText: string): Promise<void> {
  const mgmt = await management(identity)
  await mgmt.startCanister(parseCanisterId(canisterIdText))
}

export async function stopCanister(identity: Identity, canisterIdText: string): Promise<void> {
  const mgmt = await management(identity)
  await mgmt.stopCanister(parseCanisterId(canisterIdText))
}

export type CanisterLogEntry = {
  idx: string
  timestampNanos: bigint
  at: string
  time: string
  text: string
}

export async function fetchCanisterLogs(
  identity: Identity,
  canisterIdText: string
): Promise<CanisterLogEntry[]> {
  const mgmt = await management(identity)
  const res = await mgmt.fetchCanisterLogs(parseCanisterId(canisterIdText))
  return res.canister_log_records.map((row) => ({
    idx: row.idx.toString(),
    timestampNanos: row.timestamp_nanos,
    at: formatNsTimestamp(row.timestamp_nanos),
    time: formatLogTimestamp(row.timestamp_nanos),
    text: new TextDecoder("utf-8", { fatal: false }).decode(row.content),
  }))
}

export async function listSnapshots(
  identity: Identity,
  canisterIdText: string
): Promise<SnapshotView[]> {
  const mgmt = await management(identity)
  const list = await mgmt.listCanisterSnapshots({
    canisterId: parseCanisterId(canisterIdText),
  })
  return list.map((s) => ({
    id: encodeSnapshotId(s.id),
    totalSizeLabel: formatBytes(s.total_size),
    takenAtLabel: formatNsTimestamp(s.taken_at_timestamp),
  }))
}

export async function takeSnapshot(
  identity: Identity,
  canisterIdText: string
): Promise<SnapshotView> {
  const mgmt = await management(identity)
  const s = await mgmt.takeCanisterSnapshot({
    canisterId: parseCanisterId(canisterIdText),
  })
  return {
    id: encodeSnapshotId(s.id),
    totalSizeLabel: formatBytes(s.total_size),
    takenAtLabel: formatNsTimestamp(s.taken_at_timestamp),
  }
}

export async function loadSnapshot(
  identity: Identity,
  canisterIdText: string,
  snapshotId: string
): Promise<void> {
  const mgmt = await management(identity)
  await mgmt.loadCanisterSnapshot({
    canisterId: parseCanisterId(canisterIdText),
    snapshotId,
  })
}

export async function deleteSnapshot(
  identity: Identity,
  canisterIdText: string,
  snapshotId: string
): Promise<void> {
  const mgmt = await management(identity)
  await mgmt.deleteCanisterSnapshot({
    canisterId: parseCanisterId(canisterIdText),
    snapshotId,
  })
}

export type SnapshotDownloadProgress = {
  phase: "metadata" | "wasm_module" | "wasm_memory" | "stable_memory" | "done"
  bytesRead: number
  totalBytes: number
  percentage: number
}

export async function downloadSnapshotBundle(
  identity: Identity,
  canisterIdText: string,
  snapshotId: string,
  onProgress?: (progress: SnapshotDownloadProgress) => void
): Promise<Blob> {
  const mgmt = await management(identity)
  const canisterId = parseCanisterId(canisterIdText)

  onProgress?.({
    phase: "metadata",
    bytesRead: 0,
    totalBytes: 1,
    percentage: 0,
  })

  const meta = await mgmt.readCanisterSnapshotMetadata({
    canisterId,
    snapshotId,
  })

  const wasmModuleSize = Number(meta.wasmModuleSize)
  const wasmMemorySize = Number(meta.wasmMemorySize)
  const stableMemorySize = Number(meta.stableMemorySize)
  const totalBytes = Math.max(1, wasmModuleSize + wasmMemorySize + stableMemorySize)
  let bytesRead = 0

  const CHUNK_SIZE = 1024 * 1024 // 1 MB chunks

  const wasmModuleChunks: Uint8Array[] = []
  let offset = 0n
  while (offset < meta.wasmModuleSize) {
    const remaining = meta.wasmModuleSize - offset
    const chunkSize = BigInt(Math.min(CHUNK_SIZE, Number(remaining)))
    const res = await mgmt.readCanisterSnapshotData({
      canisterId,
      snapshotId,
      kind: { wasmModule: { offset, size: chunkSize } },
    })
    wasmModuleChunks.push(res.chunk)
    offset += BigInt(res.chunk.length)
    bytesRead += res.chunk.length
    onProgress?.({
      phase: "wasm_module",
      bytesRead,
      totalBytes,
      percentage: Math.min(99, Math.round((bytesRead / totalBytes) * 100)),
    })
    if (res.chunk.length === 0) break
  }

  const wasmMemoryChunks: Uint8Array[] = []
  offset = 0n
  while (offset < meta.wasmMemorySize) {
    const remaining = meta.wasmMemorySize - offset
    const chunkSize = BigInt(Math.min(CHUNK_SIZE, Number(remaining)))
    const res = await mgmt.readCanisterSnapshotData({
      canisterId,
      snapshotId,
      kind: { wasmMemory: { offset, size: chunkSize } },
    })
    wasmMemoryChunks.push(res.chunk)
    offset += BigInt(res.chunk.length)
    bytesRead += res.chunk.length
    onProgress?.({
      phase: "wasm_memory",
      bytesRead,
      totalBytes,
      percentage: Math.min(99, Math.round((bytesRead / totalBytes) * 100)),
    })
    if (res.chunk.length === 0) break
  }

  const stableMemoryChunks: Uint8Array[] = []
  offset = 0n
  while (offset < meta.stableMemorySize) {
    const remaining = meta.stableMemorySize - offset
    const chunkSize = BigInt(Math.min(CHUNK_SIZE, Number(remaining)))
    const res = await mgmt.readCanisterSnapshotData({
      canisterId,
      snapshotId,
      kind: { stableMemory: { offset, size: chunkSize } },
    })
    stableMemoryChunks.push(res.chunk)
    offset += BigInt(res.chunk.length)
    bytesRead += res.chunk.length
    onProgress?.({
      phase: "stable_memory",
      bytesRead,
      totalBytes,
      percentage: Math.min(99, Math.round((bytesRead / totalBytes) * 100)),
    })
    if (res.chunk.length === 0) break
  }

  const metadataHeader = {
    canisterId: canisterIdText,
    snapshotId,
    canisterVersion: meta.canisterVersion.toString(),
    takenAtTimestamp: meta.takenAtTimestamp.toString(),
    wasmModuleSize: meta.wasmModuleSize.toString(),
    wasmMemorySize: meta.wasmMemorySize.toString(),
    stableMemorySize: meta.stableMemorySize.toString(),
  }

  const headerBytes = new TextEncoder().encode(JSON.stringify(metadataHeader))
  const headerLengthBytes = new Uint8Array(4)
  new DataView(headerLengthBytes.buffer).setUint32(0, headerBytes.length, false)

  const blobParts: BlobPart[] = [
    headerLengthBytes,
    headerBytes,
    ...wasmModuleChunks.map((c) => c.buffer as ArrayBuffer),
    ...wasmMemoryChunks.map((c) => c.buffer as ArrayBuffer),
    ...stableMemoryChunks.map((c) => c.buffer as ArrayBuffer),
  ]

  const blob = new Blob(blobParts, { type: "application/octet-stream" })

  onProgress?.({
    phase: "done",
    bytesRead: totalBytes,
    totalBytes,
    percentage: 100,
  })

  return blob
}

export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export { Principal, LogVisibility }
export type { CanisterSettings }
