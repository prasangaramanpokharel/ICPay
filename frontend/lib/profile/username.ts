export const USERNAME_MIN_LENGTH = 1
export const USERNAME_MAX_LENGTH = 8
export const USERNAME_FREE_MIN_LENGTH = 5

const E8S = 100_000_000n

export const PRICE_ULTRA_PREMIUM = 10n * E8S
export const PRICE_PREMIUM = 5n * E8S
export const PRICE_STANDARD = 2n * E8S
export const PRICE_BASIC = 1n * E8S

export const PRICE_ULTRA_ICPAY = 160_000n * E8S
export const PRICE_PREMIUM_ICPAY = 85_000n * E8S
export const PRICE_STANDARD_ICPAY = 35_000n * E8S
export const PRICE_BASIC_ICPAY = 18_000n * E8S

export type CurrencyMode = "ICP" | "ICPAY"

export type TierPerks = {
  storageGb: number
  storageDurationMonths: number
  launchpadDiscountPercent: number
  badge: "gold" | "blue" | "standard" | "basic"
}

export type Tier = {
  labelKey: "ultra" | "premium" | "standard" | "basic"
  price: bigint
  priceIcp: bigint
  priceIcpay: bigint
  rangeKey: "ultraRange" | "premiumRange" | "standardRange" | "basicRange"
  minLength: number
  maxLength: number
  perks: TierPerks
}

export const TIERS: Tier[] = [
  {
    labelKey: "ultra",
    price: PRICE_ULTRA_PREMIUM,
    priceIcp: PRICE_ULTRA_PREMIUM,
    priceIcpay: PRICE_ULTRA_ICPAY,
    rangeKey: "ultraRange",
    minLength: USERNAME_MIN_LENGTH,
    maxLength: 3,
    perks: {
      storageGb: 5,
      storageDurationMonths: 12,
      launchpadDiscountPercent: 50,
      badge: "gold",
    },
  },
  {
    labelKey: "premium",
    price: PRICE_PREMIUM,
    priceIcp: PRICE_PREMIUM,
    priceIcpay: PRICE_PREMIUM_ICPAY,
    rangeKey: "premiumRange",
    minLength: 4,
    maxLength: 4,
    perks: {
      storageGb: 1,
      storageDurationMonths: 12,
      launchpadDiscountPercent: 25,
      badge: "blue",
    },
  },
  {
    labelKey: "standard",
    price: PRICE_STANDARD,
    priceIcp: PRICE_STANDARD,
    priceIcpay: PRICE_STANDARD_ICPAY,
    rangeKey: "standardRange",
    minLength: 5,
    maxLength: 5,
    perks: {
      storageGb: 0,
      storageDurationMonths: 0,
      launchpadDiscountPercent: 0,
      badge: "standard",
    },
  },
  {
    labelKey: "basic",
    price: PRICE_BASIC,
    priceIcp: PRICE_BASIC,
    priceIcpay: PRICE_BASIC_ICPAY,
    rangeKey: "basicRange",
    minLength: 6,
    maxLength: USERNAME_MAX_LENGTH,
    perks: {
      storageGb: 0,
      storageDurationMonths: 0,
      launchpadDiscountPercent: 0,
      badge: "basic",
    },
  },
]

export function priceFor(name: string, currency: CurrencyMode = "ICP"): bigint {
  const len = name.length
  if (currency === "ICPAY") {
    if (len <= 3) return PRICE_ULTRA_ICPAY
    if (len === 4) return PRICE_PREMIUM_ICPAY
    if (len === 5) return PRICE_STANDARD_ICPAY
    return PRICE_BASIC_ICPAY
  }
  if (len <= 3) return PRICE_ULTRA_PREMIUM
  if (len === 4) return PRICE_PREMIUM
  if (len === 5) return PRICE_STANDARD
  return PRICE_BASIC
}

export function tierFor(name: string): Tier {
  const len = name.length
  if (len <= 3) return TIERS[0]
  if (len === 4) return TIERS[1]
  if (len === 5) return TIERS[2]
  return TIERS[3]
}

const VALID_CHARS = /^[a-zA-Z0-9_]+$/

export type UsernameError = "required" | "tooLong" | "invalidChars" | "notFree"

export function validateUsername(name: string): UsernameError | null {
  if (name.length < USERNAME_MIN_LENGTH) return "required"
  if (name.length > USERNAME_MAX_LENGTH) return "tooLong"
  if (!VALID_CHARS.test(name)) return "invalidChars"
  return null
}

export function validateFreeUsername(name: string): UsernameError | null {
  const err = validateUsername(name)
  if (err) return err
  if (name.length < USERNAME_FREE_MIN_LENGTH) return "notFree"
  return null
}
