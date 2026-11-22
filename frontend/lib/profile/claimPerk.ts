const CLAIM_STORAGE_KEY_PREFIX = "icpay_pro_perk_claimed_"

export type ClaimStatus = 0 | 1

function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage
  }
  if (typeof localStorage !== "undefined") {
    return localStorage
  }
  return null
}

export function getProPerkClaimStatus(userId: string | undefined): ClaimStatus {
  if (!userId) return 0
  const storage = getStorage()
  if (!storage) return 0
  const val = storage.getItem(`${CLAIM_STORAGE_KEY_PREFIX}${userId}`)
  return val === "1" ? 1 : 0
}

export function isProPerkClaimed(userId: string | undefined): boolean {
  return getProPerkClaimStatus(userId) === 1
}

export function markProPerkClaimed(userId: string | undefined): void {
  if (!userId) return
  const storage = getStorage()
  if (!storage) return
  storage.setItem(`${CLAIM_STORAGE_KEY_PREFIX}${userId}`, "1")
}

export function resetProPerkClaim(userId: string | undefined): void {
  if (!userId) return
  const storage = getStorage()
  if (!storage) return
  storage.setItem(`${CLAIM_STORAGE_KEY_PREFIX}${userId}`, "0")
}
