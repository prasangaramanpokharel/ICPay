import type { BucketPublic } from "@/services/bucket/types"

const CLAIM_STORAGE_KEY_PREFIX = "icpay_pro_perk_claimed_"

export function isProPerkClaimed(userId: string | undefined, buckets?: BucketPublic[]): boolean {
  if (!userId) return false
  if (buckets && buckets.length > 0) {
    return true
  }
  if (typeof window !== "undefined") {
    if (localStorage.getItem(`${CLAIM_STORAGE_KEY_PREFIX}${userId}`) === "true") {
      return true
    }
  }
  return false
}

export function markProPerkClaimed(userId: string | undefined): void {
  if (!userId || typeof window === "undefined") return
  localStorage.setItem(`${CLAIM_STORAGE_KEY_PREFIX}${userId}`, "true")
}
