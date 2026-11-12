const MASK24 = 0xffffffn
const MASK48 = 0xffffffffffffn
const SALT24 = 0xa3b7c9n
const KEYS24 = [0x9e3779n, 0x7f4a7cn, 0x3c6ef3n, 0xcaa6a9n]
const B36 = "0123456789abcdefghijklmnopqrstuvwxyz"

/**
 * 4-round Feistel round function for 24-bit half-blocks.
 * Maps sequential IDs to pseudorandom 48-bit integers without collisions.
 */
function round24(val: bigint, key: bigint): bigint {
  let x = (val ^ key) & MASK24
  x = (x * 0x5bd1e9n) & MASK24
  x = (x ^ (x >> 11n)) & MASK24
  x = (x * 0x85ebcan) & MASK24
  x = (x ^ (x >> 13n)) & MASK24
  return x
}

/**
 * Permutes a 48-bit integer using a 4-round reversible Feistel network.
 */
export function permute48(num: bigint): bigint {
  const v = (num ^ SALT24) & MASK48
  let l = (v >> 24n) & MASK24
  let r = v & MASK24
  for (let i = 0; i < 4; i++) {
    const nl = r
    const nr = (l ^ round24(r, KEYS24[i])) & MASK24
    l = nl
    r = nr
  }
  return (l << 24n) | r
}

/**
 * Reverses the 4-round Feistel permutation back to the sequential 48-bit integer.
 */
export function unpermute48(num: bigint): bigint {
  const v = num & MASK48
  let l = (v >> 24n) & MASK24
  let r = v & MASK24
  for (let i = 3; i >= 0; i--) {
    const nr = l
    const nl = (r ^ round24(l, KEYS24[i])) & MASK24
    l = nl
    r = nr
  }
  return ((l << 24n) | r) ^ SALT24
}

/**
 * Formats a sequential raw project ID into an 8-character Base36 string: `cr_xxxxxxxx`.
 */
export function formatProjectId(rawId: bigint | number | string | undefined | null): string {
  if (rawId === undefined || rawId === null) return "cr_00000000"
  let n: bigint
  try {
    if (typeof rawId === "bigint") {
      n = rawId
    } else if (typeof rawId === "number") {
      n = BigInt(Math.max(0, Math.floor(rawId)))
    } else {
      const trimmed = String(rawId).trim()
      if (trimmed.startsWith("cr_") || trimmed.startsWith("cron_")) {
        return trimmed
      }
      n = BigInt(trimmed)
    }
  } catch {
    return "cr_00000000"
  }
  const p = permute48(n)
  let str = ""
  let v = p
  while (v > 0n) {
    str = B36[Number(v % 36n)] + str
    v = v / 36n
  }
  while (str.length < 8) {
    str = "0" + str
  }
  return `cr_${str}`
}

/**
 * Parses an 8-character Base36 string (`cr_xxxxxxxx`) back to its original integer ID.
 */
export function parseProjectId(str: string | bigint | number | undefined | null): bigint {
  if (typeof str === "bigint") return str
  if (typeof str === "number") return BigInt(Math.max(0, Math.floor(str)))
  if (!str) return 0n
  let clean = String(str).trim().toLowerCase()
  if (clean.startsWith("cr_")) clean = clean.slice(3)
  else if (clean.startsWith("cron_")) clean = clean.slice(5)

  if (/^\d+$/.test(clean) && clean.length < 8) {
    try {
      return BigInt(clean)
    } catch {
      return 0n
    }
  }

  let v = 0n
  for (const ch of clean) {
    const idx = B36.indexOf(ch)
    if (idx === -1) {
      if (/^\d+$/.test(clean)) {
        try {
          return BigInt(clean)
        } catch {
          return 0n
        }
      }
      return 0n
    }
    v = v * 36n + BigInt(idx)
  }
  return unpermute48(v)
}
