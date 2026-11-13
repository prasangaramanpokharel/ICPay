import { USERNAME_FREE_MIN_LENGTH, type Tier } from "@/lib/profile/username"

const GOLD_MAX_LENGTH = 3

export type BadgeTier = "gold" | "blue"

export function premiumTier(name: string | null | undefined): BadgeTier | null {
  if (!name) return null
  const len = bareHandle(name).length
  if (len === 0 || len >= USERNAME_FREE_MIN_LENGTH) return null
  return len <= GOLD_MAX_LENGTH ? "gold" : "blue"
}

export function isPremiumHandle(name: string | null | undefined): boolean {
  return premiumTier(name) !== null
}

export const BADGE_RANGES: Record<BadgeTier, { min: number; max: number }> = {
  gold: { min: 1, max: GOLD_MAX_LENGTH },
  blue: { min: GOLD_MAX_LENGTH + 1, max: USERNAME_FREE_MIN_LENGTH - 1 },
}

const SUGGEST_RANK: Record<BadgeTier | "free", number> = { gold: 0, blue: 1, free: 2 }

export function compareBySuggestion(a: string, b: string): number {
  const na = bareHandle(a)
  const nb = bareHandle(b)
  const ra = SUGGEST_RANK[premiumTier(na) ?? "free"]
  const rb = SUGGEST_RANK[premiumTier(nb) ?? "free"]
  if (ra !== rb) return ra - rb
  if (ra !== SUGGEST_RANK.free && na.length !== nb.length) return na.length - nb.length
  return na.localeCompare(nb)
}

function bareHandle(name: string): string {
  return name.startsWith("@") ? name.slice(1) : name
}

export type BadgeSpan = { badge: BadgeTier; min: number; max: number }

export function tierBadgeSpans(tier: Tier): BadgeSpan[] {
  const spans: BadgeSpan[] = []
  for (const badge of ["gold", "blue"] as const) {
    const min = Math.max(tier.minLength, BADGE_RANGES[badge].min)
    const max = Math.min(tier.maxLength, BADGE_RANGES[badge].max)
    if (min <= max) spans.push({ badge, min, max })
  }
  return spans
}
