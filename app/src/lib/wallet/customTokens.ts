import { Principal } from '@icp-sdk/core/principal'
import type { TokenMetadata } from '@/services/tokens'
import { getItem, setItem } from '@/services/storage/kv'

const KEY = 'icpay:custom-tokens:'

type StoredMeta = {
  ledgerId: string
  symbol: string
  name: string
  decimals: number
  fee: string
  logo?: string
}

type Stored = { ids: string[]; meta: Record<string, StoredMeta> }

function parseStored(serialized: string): Stored {
  const parsed = JSON.parse(serialized) as unknown
  if (Array.isArray(parsed)) {
    return { ids: parsed.filter((id): id is string => typeof id === 'string'), meta: {} }
  }
  if (!parsed || typeof parsed !== 'object') return { ids: [], meta: {} }
  const row = parsed as Partial<Stored>
  const ids = Array.isArray(row.ids) ? row.ids.filter((id): id is string => typeof id === 'string') : []
  const meta: Record<string, StoredMeta> = {}
  if (row.meta && typeof row.meta === 'object') {
    for (const [id, value] of Object.entries(row.meta)) {
      if (!value || typeof value !== 'object') continue
      const m = value as Partial<StoredMeta>
      if (
        typeof m.ledgerId === 'string' &&
        typeof m.symbol === 'string' &&
        typeof m.name === 'string' &&
        typeof m.decimals === 'number' &&
        typeof m.fee === 'string'
      ) {
        meta[id] = {
          ledgerId: m.ledgerId,
          symbol: m.symbol,
          name: m.name,
          decimals: m.decimals,
          fee: m.fee,
          logo: typeof m.logo === 'string' ? m.logo : undefined,
        }
      }
    }
  }
  return { ids, meta }
}

function toTokenMeta(stored: StoredMeta): TokenMetadata {
  return {
    ledgerId: stored.ledgerId,
    symbol: stored.symbol,
    name: stored.name,
    decimals: stored.decimals,
    fee: BigInt(stored.fee),
    logo: stored.logo,
  }
}

function readStored(principal: string): Stored {
  const serialized = getItem(KEY + principal)
  if (!serialized) return { ids: [], meta: {} }
  try {
    return parseStored(serialized)
  } catch {
    return { ids: [], meta: {} }
  }
}

function writeStored(principal: string, stored: Stored) {
  setItem(KEY + principal, JSON.stringify(stored))
}

const EMPTY_IDS: string[] = []
const idsCache = new Map<string, { serialized: string | null; snapshot: string[] }>()

export function getCustomLedgerIdsSnapshot(principal: string | undefined): string[] {
  if (!principal) return EMPTY_IDS
  const serialized = getItem(KEY + principal)
  const cached = idsCache.get(principal)
  if (cached && cached.serialized === serialized) {
    return cached.snapshot
  }
  if (!serialized) {
    idsCache.set(principal, { serialized, snapshot: EMPTY_IDS })
    return EMPTY_IDS
  }
  try {
    const parsed = parseStored(serialized)
    const snapshot = parsed.ids
    idsCache.set(principal, { serialized, snapshot })
    return snapshot
  } catch {
    idsCache.set(principal, { serialized, snapshot: EMPTY_IDS })
    return EMPTY_IDS
  }
}

const EMPTY_META = new Map<string, TokenMetadata>()
const metaCache = new Map<string, { serialized: string | null; snapshot: Map<string, TokenMetadata> }>()

export function getCustomTokenMetaSnapshot(principal: string | undefined): Map<string, TokenMetadata> {
  if (!principal) return EMPTY_META
  const serialized = getItem(KEY + principal)
  const cached = metaCache.get(principal)
  if (cached && cached.serialized === serialized) {
    return cached.snapshot
  }
  if (!serialized) {
    metaCache.set(principal, { serialized, snapshot: EMPTY_META })
    return EMPTY_META
  }
  try {
    const stored = parseStored(serialized)
    const meta = new Map<string, TokenMetadata>()
    for (const id of stored.ids) {
      const row = stored.meta[id]
      if (row) meta.set(id, toTokenMeta(row))
    }
    metaCache.set(principal, { serialized, snapshot: meta })
    return meta
  } catch {
    metaCache.set(principal, { serialized, snapshot: EMPTY_META })
    return EMPTY_META
  }
}

export function normalizeLedgerId(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    return Principal.fromText(trimmed).toText()
  } catch {
    return null
  }
}

export function addCustomLedgerId(
  principal: string,
  ledgerId: string,
  meta?: TokenMetadata,
): string[] {
  const stored = readStored(principal)
  const ids = stored.ids.includes(ledgerId) ? stored.ids : [...stored.ids, ledgerId]
  if (meta) {
    stored.meta[ledgerId] = {
      ledgerId: meta.ledgerId,
      symbol: meta.symbol,
      name: meta.name,
      decimals: meta.decimals,
      fee: meta.fee.toString(),
      logo: meta.logo,
    }
  }
  writeStored(principal, { ids, meta: stored.meta })
  return ids
}
