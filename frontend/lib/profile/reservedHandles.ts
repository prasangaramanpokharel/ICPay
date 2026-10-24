const RESERVED = new Set([
  "login",
  "wallet",
  "deposit",
  "withdraw",
  "transfer",
  "profile",
  "settings",
  "icpverse",
  "username",
  "terms",
  "privacy",
  "api",
  "admin",
  "icpay",
  "support",
  "help",
  "about",
  "static",
  "public",
  "assets",
  "images",
  "audio",
  "well",
  "sitemap",
  "robots",
  "manifest",
  "favicon",
  "icon",
  "og",
  "u",
  "index",
  "404",
  "video",
])

export function isReservedHandle(name: string): boolean {
  return RESERVED.has(name.trim().toLowerCase())
}

export function isPossibleHandle(name: string): boolean {
  return /^[a-zA-Z0-9_]{1,8}$/.test(name.trim())
}
