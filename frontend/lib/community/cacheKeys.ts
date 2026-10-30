import type { Identity } from "@icp-sdk/core/agent"

export function communityPublicListKey(identity: Identity | undefined) {
  const p = identity ? identity.getPrincipal().toText() : "anonymous"
  return ["community-public", p] as const
}

export function communityMineKey(identity: Identity | undefined) {
  return identity ? (["community-mine", identity.getPrincipal().toText()] as const) : null
}

export function communityChannelKey(identity: Identity | undefined, slug: string) {
  if (!slug || slug === "slug") return null
  const p = identity ? identity.getPrincipal().toText() : "anonymous"
  return ["community-channel", slug, p] as const
}

export function communityMessagesKey(identity: Identity | undefined, slug: string) {
  if (!slug || slug === "slug") return null
  const p = identity ? identity.getPrincipal().toText() : "anonymous"
  return ["community-messages", slug, p] as const
}

export function communityMemberKey(identity: Identity | undefined, slug: string) {
  return identity ? (["community-member", slug, identity.getPrincipal().toText()] as const) : null
}
