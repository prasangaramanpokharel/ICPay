"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type { Identity } from "@icp-sdk/core/agent"
import {
  login as iiLogin,
  logout as iiLogout,
  createAuthClient,
  silentAuth,
  openBackendSession,
  type LoginOptions,
} from "@/services/auth/auth"
import { playLoginChime } from "@/lib/ui/successChime"

type AuthContextType = {
  identity: Identity | undefined
  isAuthenticated: boolean
  isLoading: boolean
  login: (options?: LoginOptions) => Promise<void>
  acceptIdentity: (identity: Identity) => Promise<void>
  logout: () => Promise<void>
}

const SOUND_KEY = "icpay:login-sound:"

function playLoginChimeOnce(principal: string) {
  const key = SOUND_KEY + principal
  if (localStorage.getItem(key)) return
  localStorage.setItem(key, "1")
  playLoginChime()
}

const AuthContext = createContext<AuthContextType>({
  identity: undefined,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  acceptIdentity: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<Identity | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let cancelled = false

    async function init() {
      try {
        const authClient = await createAuthClient()
        if (cancelled) return

        unsubscribe = authClient.subscribe(async () => {
          if (cancelled) return
          if (!authClient.isAuthenticated()) {
            setIdentity(undefined)
            return
          }
          try {
            const nextId = await authClient.getIdentity()
            if (!cancelled) {
              setIdentity(nextId)
            }
          } catch {
            if (!cancelled) {
              setIdentity(undefined)
            }
          }
        })

        let id: Identity | null = null
        if (authClient.isAuthenticated()) {
          id = await authClient.getIdentity()
        } else {
          id = await silentAuth()
        }
        if (cancelled || !id) return

        setIdentity(id)
        openBackendSession(id).catch((e) => {
          console.warn("Backend session sync warning:", e)
        })
      } catch (e) {
        console.error("Auth init error:", e)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    init()

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  const acceptIdentity = useCallback(async (id: Identity) => {
    try {
      await openBackendSession(id)
    } catch (e) {
      console.error("Backend login error:", e)
    }
    playLoginChimeOnce(id.getPrincipal().toText())
    setIdentity(id)
  }, [])

  const login = useCallback((options?: LoginOptions) => {
    return iiLogin(options).then((id) => {
      if (!id) return
      return acceptIdentity(id)
    })
  }, [acceptIdentity])

  const logout = useCallback(async () => {
    await iiLogout()
    window.location.replace("/login")
  }, [])

  return (
    <AuthContext.Provider
      value={{
        identity,
        isAuthenticated: !!identity,
        isLoading,
        login,
        acceptIdentity,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext)
}
