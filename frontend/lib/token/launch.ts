export const NAME_MAX_LENGTH = 32
export const SYMBOL_MIN_LENGTH = 2
export const SYMBOL_MAX_LENGTH = 8
export const DESCRIPTION_MAX_LENGTH = 500
export const LINK_MAX_LENGTH = 256
export const LOGO_MAX_BYTES = 32_000

export const TOKEN_DECIMALS = 8

const MAX_SUPPLY = 1_000_000_000_000_000n

export type LaunchError =
  | "nameRequired"
  | "nameTooLong"
  | "symbolTooShort"
  | "symbolTooLong"
  | "symbolCharset"
  | "descriptionTooLong"
  | "supplyRequired"
  | "supplyTooLarge"
  | "linkScheme"
  | "linkTooLong"

export function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase()
}

export function validateName(name: string): LaunchError | null {
  const trimmed = name.trim()
  if (!trimmed) return "nameRequired"
  if (trimmed.length > NAME_MAX_LENGTH) return "nameTooLong"
  return null
}

export function validateSymbol(symbol: string): LaunchError | null {
  const up = normalizeSymbol(symbol)
  if (up.length < SYMBOL_MIN_LENGTH) return "symbolTooShort"
  if (up.length > SYMBOL_MAX_LENGTH) return "symbolTooLong"
  if (!/^[A-Z0-9]+$/.test(up)) return "symbolCharset"
  return null
}

export function validateDescription(description: string): LaunchError | null {
  if (description.length > DESCRIPTION_MAX_LENGTH) return "descriptionTooLong"
  return null
}

export function validateLink(link: string): LaunchError | null {
  const trimmed = link.trim()
  if (!trimmed) return null
  if (trimmed.length > LINK_MAX_LENGTH) return "linkTooLong"
  if (!trimmed.startsWith("https://")) return "linkScheme"
  return null
}

export function parseSupply(value: string): bigint | null {
  const trimmed = value.trim().replace(/,/g, "")
  if (!/^\d+$/.test(trimmed)) return null
  const whole = BigInt(trimmed)
  if (whole === 0n) return null
  return whole * 10n ** BigInt(TOKEN_DECIMALS)
}

export function validateSupply(value: string): LaunchError | null {
  const base = parseSupply(value)
  if (base === null) return "supplyRequired"
  if (base > MAX_SUPPLY * 10n ** BigInt(TOKEN_DECIMALS)) return "supplyTooLarge"
  return null
}

export function formatSupply(value: string): string {
  const digits = value.trim().replace(/[^\d]/g, "")
  return digits ? BigInt(digits).toLocaleString("en-US") : ""
}
