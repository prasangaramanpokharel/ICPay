"use client"

import { useEffect, useSyncExternalStore } from "react"
import { useAuth } from "@/components/auth/auth-provider"

const LAST_PRINCIPAL_KEY = "icpay:auth:last-principal"
const LAST_PRINCIPAL_EVENT = "icpay-auth-last-principal"

export function getLastPrincipalSnapshot(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(LAST_PRINCIPAL_KEY)
  } catch {
    return null
  }
}

export function getLastPrincipalServerSnapshot(): string | null {
  return null
}

export function subscribeLastPrincipal(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  const onStorage = (e: StorageEvent) => {
    if (e.key === LAST_PRINCIPAL_KEY) cb()
  }
  window.addEventListener("storage", onStorage)
  window.addEventListener(LAST_PRINCIPAL_EVENT, cb)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(LAST_PRINCIPAL_EVENT, cb)
  }
}

export function writeLastPrincipal(principal: string): void {
  if (typeof window === "undefined") return
  try {
    if (localStorage.getItem(LAST_PRINCIPAL_KEY) === principal) return
    localStorage.setItem(LAST_PRINCIPAL_KEY, principal)
    window.dispatchEvent(new Event(LAST_PRINCIPAL_EVENT))
  } catch {
  }
}

export function clearLastPrincipal(): void {
  if (typeof window === "undefined") return
  try {
    if (localStorage.getItem(LAST_PRINCIPAL_KEY) === null) return
    localStorage.removeItem(LAST_PRINCIPAL_KEY)
    window.dispatchEvent(new Event(LAST_PRINCIPAL_EVENT))
  } catch {
  }
}

export function useEffectivePrincipal(): {
  principal: string | null
  isCachedSession: boolean
} {
  const { identity, isAuthenticated, isLoading } = useAuth()
  const lastPrincipal = useSyncExternalStore(
    subscribeLastPrincipal,
    getLastPrincipalSnapshot,
    getLastPrincipalServerSnapshot
  )

  useEffect(() => {
    if (identity) {
      writeLastPrincipal(identity.getPrincipal().toText())
    } else if (!isLoading && !isAuthenticated) {
      clearLastPrincipal()
    }
  }, [identity, isAuthenticated, isLoading])

  if (identity) {
    return { principal: identity.getPrincipal().toText(), isCachedSession: false }
  }
  if (isLoading && lastPrincipal) {
    return { principal: lastPrincipal, isCachedSession: true }
  }
  return { principal: null, isCachedSession: false }
}
