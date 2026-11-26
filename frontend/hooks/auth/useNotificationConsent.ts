"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import {
  fetchNotificationConsentStatus,
  requestDeviceNotificationConsent,
  revokeDeviceNotificationConsent,
  type NotificationConsentResult,
} from "@/services/auth/notifications"

export function useNotificationConsent() {
  const [isActionPending, setIsActionPending] = useState(false)

  const { data, mutate, isLoading } = useSWR(
    "auth-notification-consent",
    fetchNotificationConsentStatus,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  )

  const isSupported = data?.supported ?? true
  const isGranted = data?.granted ?? false

  const enableNotifications = useCallback(async (): Promise<NotificationConsentResult> => {
    setIsActionPending(true)
    try {
      const result = await requestDeviceNotificationConsent()
      await mutate(result, false)
      return result
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
