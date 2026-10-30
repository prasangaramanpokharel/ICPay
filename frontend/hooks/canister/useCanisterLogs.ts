"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Identity } from "@icp-sdk/core/agent"
import {
  fetchCanisterLogs,
  isControllerDenied,
  formatManageError,
  type CanisterLogEntry,
} from "@/services/canister/management"

export function useCanisterLogs(
  identity: Identity | null | undefined,
  canisterId: string,
  options: {
    enabled?: boolean
    autoRefresh?: boolean
    pollIntervalMs?: number
  } = {}
) {
  const { enabled = true, autoRefresh = true, pollIntervalMs = 3000 } = options
  const [logs, setLogs] = useState<CanisterLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [denied, setDenied] = useState(false)
  const [isLive, setIsLive] = useState(autoRefresh)
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null)

  const inFlightRef = useRef(false)
  const isMountedRef = useRef(true)

  const fetchLogs = useCallback(
    async (isBackground = false) => {
      if (!identity || !canisterId || !enabled) return
      if (inFlightRef.current) return
      inFlightRef.current = true

      if (!isBackground) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }

      try {
        const rows = await fetchCanisterLogs(identity, canisterId)
        if (!isMountedRef.current) return
        setLogs(rows)
        setError(null)
        setDenied(false)
        setLastFetchedAt(new Date())
      } catch (err) {
        if (!isMountedRef.current) return
        if (isControllerDenied(err)) {
          setDenied(true)
          setError("Viewing execution logs requires controller permissions or Public Log Visibility.")
        } else {
          setError(formatManageError(err))
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
        inFlightRef.current = false
      }
    },
    [identity, canisterId, enabled]
  )

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!enabled || !identity || !canisterId) return
    const timer = window.setTimeout(() => {
      void fetchLogs(false)
    }, 0)
    return () => {
      window.clearTimeout(timer)
    }
  }, [enabled, identity, canisterId, fetchLogs])

  useEffect(() => {
    if (!enabled || !isLive || !identity || !canisterId || denied) return

    const timer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return
      void fetchLogs(true)
    }, pollIntervalMs)

    return () => clearInterval(timer)
  }, [enabled, isLive, identity, canisterId, denied, pollIntervalMs, fetchLogs])

  const clear = useCallback(() => {
    setLogs([])
  }, [])

  const toggleLive = useCallback(() => {
    setIsLive((prev) => !prev)
  }, [])

  return {
    logs,
    isLoading,
    isRefreshing,
    error,
    denied,
    isLive,
    lastFetchedAt,
    refresh: () => fetchLogs(false),
    clear,
    toggleLive,
    setIsLive,
  }
}
