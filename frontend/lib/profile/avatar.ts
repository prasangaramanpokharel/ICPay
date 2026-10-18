import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"

const avatarCache = new Map<string, string>()
const MAX_AVATAR_CACHE = 500

// Seeded by username so the same person renders identically everywhere they
// appear -- search results, transfer preview, profile -- without needing their
// principal, which searchUsers does not return.
export function avatarUriFor(seed: string): string {
  const cached = avatarCache.get(seed)
  if (cached) return cached

  const uri = createAvatar(adventurer, { seed }).toDataUri()
  if (avatarCache.size >= MAX_AVATAR_CACHE) {
    const firstKey = avatarCache.keys().next().value
    if (firstKey) avatarCache.delete(firstKey)
  }
  avatarCache.set(seed, uri)
  return uri
}

