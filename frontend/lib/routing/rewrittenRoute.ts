"use client"

import { useSyncExternalStore } from "react"
import { usePathname } from "next/navigation"

function lastSegment(path: string): string {
  const segments = path.split("/").filter(Boolean)
  if (segments.length === 0) return ""
  return decodeURIComponent(segments[segments.length - 1])
}

function tokenLedgerIdFromPath(path: string): string {
  const segments = path.split("/").filter(Boolean)
  const tokenIdx = segments.indexOf("token")
  if (tokenIdx < 0 || tokenIdx + 1 >= segments.length) return ""
  const ledgerId = decodeURIComponent(segments[tokenIdx + 1])
  return ledgerId === "token" ? "" : ledgerId
}

function channelSlugFromPath(path: string): string {
  const segments = path.split("/").filter(Boolean)
  const idx = segments.indexOf("channels")
  if (idx < 0 || idx + 1 >= segments.length) return ""
  const slug = decodeURIComponent(segments[idx + 1])
  if (slug === "join" || slug === "new") return ""
  return slug
}

function channelMessageIdFromPath(path: string): string {
  const segments = path.split("/").filter(Boolean)
  const idx = segments.indexOf("channels")
  if (idx < 0 || idx + 2 >= segments.length) return ""
  const raw = decodeURIComponent(segments[idx + 2])
  return /^\d+$/.test(raw) ? raw : ""
}

function getBrowserChannelSlug(): string {
  if (typeof window === "undefined") return ""
  try {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("id") || params.get("slug")
    if (id && id !== "new" && id !== "join") return id
  } catch { }
  return channelSlugFromPath(window.location.pathname)
}

function getBrowserChannelMessageId(): string {
  if (typeof window === "undefined") return ""
  try {
    const params = new URLSearchParams(window.location.search)
    const msg = params.get("messageId") || params.get("msg") || params.get("message")
    if (msg && /^\d+$/.test(msg)) return msg
  } catch { }
  return channelMessageIdFromPath(window.location.pathname)
}

function getBrowserLastSegment(): string {
  if (typeof window === "undefined") return ""
  try {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("id") || params.get("slug")
    if (id) return id
  } catch { }
  return lastSegment(window.location.pathname)
}

function getBrowserTokenLedgerId(): string {
  return tokenLedgerIdFromPath(window.location.pathname)
}


export function useRewrittenLastSegment(): string {
  const pathname = usePathname()
  void pathname

  return useSyncExternalStore(
    subscribe,
    getBrowserLastSegment,
    () => "",
  )
}

export function useTokenLedgerId(): string {
  const pathname = usePathname()
  void pathname

  return useSyncExternalStore(
    subscribe,
    getBrowserTokenLedgerId,
    () => "",
  )
}

export function useChannelSlug(): string {
  const pathname = usePathname()
  const browserSlug = useSyncExternalStore(subscribe, getBrowserChannelSlug, () => "")

  if (browserSlug && browserSlug !== "slug" && browserSlug !== "new" && browserSlug !== "join") {
    return browserSlug
  }
  const routerSlug = channelSlugFromPath(pathname)
  if (routerSlug && routerSlug !== "slug") return routerSlug
  return ""
}

export function useChannelMessageId(): string {
  const pathname = usePathname()
  const browserMsg = useSyncExternalStore(subscribe, getBrowserChannelMessageId, () => "")

  if (browserMsg && /^\d+$/.test(browserMsg)) {
    return browserMsg
  }
  const routerMessageId = channelMessageIdFromPath(pathname)
  if (routerMessageId && routerMessageId !== "message") return routerMessageId
  return ""
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange)
  window.addEventListener("hashchange", onStoreChange)
  return () => {
    window.removeEventListener("popstate", onStoreChange)
    window.removeEventListener("hashchange", onStoreChange)
  }
}
