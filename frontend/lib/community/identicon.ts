import { Style, Avatar, type StyleDefinition } from "@dicebear/core"
import definition from "@dicebear/styles/identicon.json" with { type: "json" }
import { communityAvatarSeed } from "@/lib/community/avatar"

const style = new Style(definition as unknown as StyleDefinition)

const IDENTICON_ROW_COLORS = [
  "0ea5e9",
  "6366f1",
  "8b5cf6",
  "14b8a6",
  "22d3ee",
  "f97316",
] as const

export function communityIdenticonSvg(slug: string, pixels = 512): string {
  const avatar = new Avatar(style, {
    seed: communityAvatarSeed(slug),
    size: pixels,
    rowColor: [...IDENTICON_ROW_COLORS],
  })
  return avatar.toString()
}
