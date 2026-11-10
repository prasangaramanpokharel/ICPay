import { Style, Avatar, type StyleDefinition } from "@dicebear/core"
import voxelDefinition from "@dicebear/styles/voxel-art.json" with { type: "json" }
import glassDefinition from "@dicebear/styles/glass.json" with { type: "json" }

const voxelStyle = new Style(voxelDefinition as unknown as StyleDefinition)
const glassStyle = new Style(glassDefinition as unknown as StyleDefinition)

const avatarCache = new Map<string, string>()
const projectAvatarCache = new Map<string, string>()
const MAX_AVATAR_CACHE = 500

export function avatarUriFor(seed: string): string {
  const cached = avatarCache.get(seed)
  if (cached) return cached

  const avatar = new Avatar(voxelStyle, {
    tags: ["animation"],
    seed,
  })
  const uri = avatar.toDataUri()
  if (avatarCache.size >= MAX_AVATAR_CACHE) {
    const firstKey = avatarCache.keys().next().value
    if (firstKey) avatarCache.delete(firstKey)
  }
  avatarCache.set(seed, uri)
  return uri
}

export function avatarSvgFor(seed: string): string {
  const avatar = new Avatar(voxelStyle, {
    tags: ["animation"],
    seed,
  })
  return avatar.toString()
}

export function projectAvatarUriFor(seed: string): string {
  const cached = projectAvatarCache.get(seed)
  if (cached) return cached

  const avatar = new Avatar(glassStyle, {
    seed,
  })
  const uri = avatar.toDataUri()
  if (projectAvatarCache.size >= MAX_AVATAR_CACHE) {
    const firstKey = projectAvatarCache.keys().next().value
    if (firstKey) projectAvatarCache.delete(firstKey)
  }
  projectAvatarCache.set(seed, uri)
  return uri
}

export function projectAvatarSvgFor(seed: string): string {
  const avatar = new Avatar(glassStyle, {
    seed,
  })
  return avatar.toString()
}

