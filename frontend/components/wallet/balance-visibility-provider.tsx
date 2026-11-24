"use client"

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react"

export const BALANCE_VISIBILITY_KEY = "icpay_balance_visibility"
export const BALANCE_MASK = "••••••"

type BalanceVisibilityContextType = {
  hidden: boolean
  toggleVisibility: () => void
  setVisibility: (hidden: boolean) => void
  mask: string
  maskAmount: (amount: string | number | undefined | null) => string
}

const BalanceVisibilityContext = createContext<BalanceVisibilityContextType>({
  hidden: false,
  toggleVisibility: () => {},
  setVisibility: () => {},
  mask: BALANCE_MASK,
  maskAmount: (amount) => (amount !== undefined && amount !== null ? String(amount) : ""),
})

const listeners = new Set<() => void>()

function subscribe(fn: () => void) {
  listeners.add(fn)
  window.addEventListener("storage", fn)
  return () => {
    listeners.delete(fn)
    window.removeEventListener("storage", fn)
  }
}

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false
  const stored = localStorage.getItem(BALANCE_VISIBILITY_KEY)
  return stored === "hidden" || stored === "true"
}

function getServerSnapshot(): boolean {
  return false
}

export function BalanceVisibilityProvider({ children }: { children: ReactNode }) {
  const hidden = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setVisibility = useCallback((nextHidden: boolean) => {
    localStorage.setItem(BALANCE_VISIBILITY_KEY, nextHidden ? "hidden" : "visible")
    listeners.forEach((fn) => fn())
  }, [])

  const toggleVisibility = useCallback(() => {
    const nextHidden = !getSnapshot()
    localStorage.setItem(BALANCE_VISIBILITY_KEY, nextHidden ? "hidden" : "visible")
    listeners.forEach((fn) => fn())
  }, [])

  const maskAmount = useCallback(
    (amount: string | number | undefined | null) => {
      if (hidden) return BALANCE_MASK
      return amount !== undefined && amount !== null ? String(amount) : ""
    },
    [hidden]
  )

  return (
    <BalanceVisibilityContext.Provider
      value={{
        hidden,
        toggleVisibility,
        setVisibility,
        mask: BALANCE_MASK,
        maskAmount,
      }}
    >
      {children}
    </BalanceVisibilityContext.Provider>
  )
}

export function useBalanceVisibility(): BalanceVisibilityContextType {
  return useContext(BalanceVisibilityContext)
}
