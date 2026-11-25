import { describe, it, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"
import {
  deserializeWithBigInt,
  readCache,
  readCacheMap,
  removeCache,
  serializeWithBigInt,
  writeCache,
  writeCacheMap,
} from "../../lib/cache/persistCache"

function installMemoryStorage() {
  const store = new Map<string, string>()
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v)
    },
    removeItem: (k: string) => {
      store.delete(k)
    },
    clear: () => store.clear(),
  }
  Object.defineProperty(globalThis, "window", { value: globalThis, configurable: true })
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true })
  return store
}

describe("persistCache", () => {
  let store: Map<string, string>

  beforeEach(() => {
    store = installMemoryStorage()
  })

  afterEach(() => {
    store.clear()
  })

  it("roundtrips nested BigInt values without precision loss", () => {
    const input = {
      balance: 12345678901234567890n,
      nested: { fee: 10000n, items: [0n, 999n] },
      label: "ICP",
    }
    const raw = serializeWithBigInt(input)
    const parsed = deserializeWithBigInt<typeof input>(raw)
    assert.deepEqual(parsed, input)
    assert.equal(typeof parsed?.balance, "bigint")
  })

  it("writes and reads cached values within TTL", () => {
    writeCache("test:dash", { cycles: 5_000_000_000_000n, name: "icpay" })
    const hit = readCache<{ cycles: bigint; name: string }>("test:dash", 60_000)
    assert.deepEqual(hit, { cycles: 5_000_000_000_000n, name: "icpay" })
  })

  it("returns undefined when cache entry is expired", () => {
    store.set(
      "test:expired",
      serializeWithBigInt({ at: Date.now() - 120_000, data: { count: 1n } })
    )
    const hit = readCache("test:expired", 60_000)
    assert.equal(hit, undefined)
  })

  it("returns undefined gracefully on corrupted JSON", () => {
    store.set("test:bad", "{not-valid-json")
    assert.equal(readCache("test:bad", 60_000), undefined)
  })

  it("roundtrips Map<string, bigint> via readCacheMap and writeCacheMap", () => {
    const map = new Map<string, bigint>([
      ["ryjl3-tyaaa-aaaaa-aaaba-cai", 500_000_000n],
      ["5fsnk-rqaaa-aaaan-q6m4q-cai", 1_000_000n],
    ])
    writeCacheMap("test:map", map)
    const loaded = readCacheMap<string, bigint>("test:map", 60_000)
    assert.ok(loaded instanceof Map)
    assert.equal(loaded.get("ryjl3-tyaaa-aaaaa-aaaba-cai"), 500_000_000n)
    assert.equal(loaded.get("5fsnk-rqaaa-aaaan-q6m4q-cai"), 1_000_000n)
  })

  it("removes cache entries cleanly", () => {
    writeCache("test:rm", { ok: true })
    removeCache("test:rm")
    assert.equal(readCache("test:rm", 60_000), undefined)
  })
})
