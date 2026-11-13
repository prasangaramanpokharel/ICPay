import assert from "node:assert/strict"
import {
  priceFor,
  tierFor,
  PRICE_ULTRA_PREMIUM,
  PRICE_PREMIUM,
  PRICE_STANDARD,
  PRICE_BASIC,
  PRICE_ULTRA_ICPAY,
  PRICE_PREMIUM_ICPAY,
  PRICE_STANDARD_ICPAY,
  PRICE_BASIC_ICPAY,
} from "@/lib/profile/username"
import {
  getProPerkClaimStatus,
  isProPerkClaimed,
  markProPerkClaimed,
  resetProPerkClaim,
} from "@/lib/profile/claimPerk"

assert.equal(priceFor("ceo", "ICP"), PRICE_ULTRA_PREMIUM)
assert.equal(priceFor("elon", "ICP"), PRICE_PREMIUM)
assert.equal(priceFor("alice", "ICP"), PRICE_STANDARD)
assert.equal(priceFor("satoshi", "ICP"), PRICE_BASIC)

assert.equal(priceFor("ceo", "ICPAY"), PRICE_ULTRA_ICPAY)
assert.equal(priceFor("elon", "ICPAY"), PRICE_PREMIUM_ICPAY)
assert.equal(priceFor("alice", "ICPAY"), PRICE_STANDARD_ICPAY)
assert.equal(priceFor("satoshi", "ICPAY"), PRICE_BASIC_ICPAY)

const goldTier = tierFor("icp")
assert.equal(goldTier.labelKey, "ultra")
assert.equal(goldTier.perks.storageGb, 5)
assert.equal(goldTier.perks.storageDurationMonths, 12)
assert.equal(goldTier.perks.launchpadDiscountPercent, 50)
assert.equal(goldTier.perks.badge, "gold")

const blueTier = tierFor("fund")
assert.equal(blueTier.labelKey, "premium")
assert.equal(blueTier.perks.storageGb, 1)
assert.equal(blueTier.perks.storageDurationMonths, 12)
assert.equal(blueTier.perks.launchpadDiscountPercent, 25)
assert.equal(blueTier.perks.badge, "blue")

const standardTier = tierFor("token")
assert.equal(standardTier.labelKey, "standard")
assert.equal(standardTier.perks.storageGb, 0)
assert.equal(standardTier.perks.storageDurationMonths, 0)

const basicTier = tierFor("builder")
assert.equal(basicTier.labelKey, "basic")
assert.equal(basicTier.perks.storageGb, 0)
assert.equal(basicTier.perks.storageDurationMonths, 0)

assert.equal(getProPerkClaimStatus(undefined), 0)
assert.equal(getProPerkClaimStatus("user_abc"), 0)
assert.equal(isProPerkClaimed("user_abc"), false)

markProPerkClaimed("user_abc")
markProPerkClaimed(undefined)
resetProPerkClaim(undefined)

const mockStore: Record<string, string> = {}
globalThis.localStorage = {
  getItem: (k: string) => mockStore[k] ?? null,
  setItem: (k: string, v: string) => {
    mockStore[k] = v
  },
  removeItem: (k: string) => {
    delete mockStore[k]
  },
  clear: () => {
    for (const k of Object.keys(mockStore)) delete mockStore[k]
  },
  key: () => null,
  length: 0,
}

assert.equal(getProPerkClaimStatus("user_live"), 0)
assert.equal(isProPerkClaimed("user_live"), false)

markProPerkClaimed("user_live")
assert.equal(getProPerkClaimStatus("user_live"), 1)
assert.equal(isProPerkClaimed("user_live"), true)

resetProPerkClaim("user_live")
assert.equal(getProPerkClaimStatus("user_live"), 0)
assert.equal(isProPerkClaimed("user_live"), false)

console.log("PASS: username pricing and claimed=0/1 perk rules verified")
