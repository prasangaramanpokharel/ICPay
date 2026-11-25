type Envelope<T> = {
  at: number
  data: T
}

export function serializeWithBigInt(value: unknown): string {
  return JSON.stringify(value, (_key, val) =>
    typeof val === "bigint" ? { __bi: val.toString() } : val
  )
}

export function deserializeWithBigInt<T>(raw: string): T | undefined {
  return JSON.parse(raw, (_key, val) =>
    val && typeof val === "object" && "__bi" in val && typeof val.__bi === "string"
      ? BigInt(val.__bi)
      : val
  ) as T
}

export function readCache<T>(key: string, maxAgeMs: number): T | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return undefined
    const parsed = deserializeWithBigInt<Envelope<T>>(raw)
    if (!parsed || typeof parsed.at !== "number") return undefined
    if (Date.now() - parsed.at > maxAgeMs) return undefined
    return parsed.data
  } catch {
    return undefined
  }
}

export function writeCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return
  try {
    const payload: Envelope<T> = { at: Date.now(), data }
    localStorage.setItem(key, serializeWithBigInt(payload))
  } catch {
  }
}

export function removeCache(key: string): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(key)
  } catch {
  }
}

export function readCacheMap<K, V>(key: string, maxAgeMs: number): Map<K, V> | undefined {
  const entries = readCache<[K, V][]>(key, maxAgeMs)
  if (!entries) return undefined
  return new Map(entries)
}

export function writeCacheMap<K, V>(key: string, map: Map<K, V>): void {
  writeCache(key, Array.from(map.entries()))
}
