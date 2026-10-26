import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"

const avatarCache = new Map<string, string>()
const MAX_AVATAR_CACHE = 500

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

