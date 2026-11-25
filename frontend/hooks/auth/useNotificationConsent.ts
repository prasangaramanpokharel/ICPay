"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import {
  fetchNotificationConsentStatus,
  requestDeviceNotificationConsent,
  revokeDeviceNotificationConsent,
} from "@/services/auth/notifications"

export function useNotificationConsent() {
  const { isAuthenticated } = useAuth()
  const [isActionPending, setIsActionPending] = useState(false)

  const { data, mutate, isLoading } = useSWR(
    isAuthenticated ? "auth-notification-consent" : null,
    fetchNotificationConsentStatus,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  )

  const isSupported = data?.supported ?? true
  const isGranted = data?.granted ?? false

  const enableNotifications = useCallback(async (): Promise<boolean> => {
    setIsActionPending(true)
    try {
      const result = await requestDeviceNotificationConsent()
      await mutate(result, false)
      return result.granted
    } finally {
      setIsActionPending(false)
    }
  }, [mutate])

  const disableNotifications = useCallback(async (): Promise<void> => {
    setIsActionPending(true)
    try {
      const success = await revokeDeviceNotificationConsent()
      if (success) {
        await mutate({ supported: isSupported, granted: false }, false)
      }
    } finally {
      setIsActionPending(false)
    }
  }, [isSupported, mutate])

  return {
    isSupported,
    isGranted,
    isLoading: isLoading || isActionPending,
    refreshStatus: mutate,
    enableNotifications,
    disableNotifications,
  }
}
