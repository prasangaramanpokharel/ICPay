import { createAuthClient } from "@/services/auth/auth"
import { NotificationsUnsupportedError } from "@icp-sdk/auth/client"

export type NotificationConsentResult = {
  supported: boolean
  granted: boolean
  error?: "permission_denied" | "ios_pwa_required" | "request_failed" | "unsupported"
  needsPwaPrompt?: boolean
}

const STORAGE_KEY = "icpay_device_notifications"

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent || ""
  const platform = navigator.platform || ""
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === "MacIntel" && (navigator.maxTouchPoints ?? 0) > 1)
  )
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  const matchStandalone = typeof window.matchMedia === "function" && window.matchMedia("(display-mode: standalone)").matches
  const nav = typeof navigator !== "undefined" ? (navigator as unknown as { standalone?: boolean }) : undefined
  return Boolean(matchStandalone || nav?.standalone)
}

function hasNativeNotification(): boolean {
  return typeof window !== "undefined" && "Notification" in window
}

export async function fetchNotificationConsentStatus(): Promise<NotificationConsentResult> {
  if (typeof window === "undefined") {
    return { supported: false, granted: false }
  }

  const ios = isIOS()
  const standalone = isStandalone()
  const hasNotif = hasNativeNotification()

  if (ios && !standalone && !hasNotif) {
    return { supported: true, granted: false, needsPwaPrompt: true }
  }

  if (!hasNotif && !ios) {
    return { supported: false, granted: false }
  }

  const localPref = localStorage.getItem(STORAGE_KEY)
  const isBrowserGranted = hasNotif && Notification.permission === "granted"
  const isAllowed = localPref !== "false" && isBrowserGranted

  return {
    supported: true,
    granted: isAllowed,
    needsPwaPrompt: ios && !standalone,
  }
}

export async function requestDeviceNotificationConsent(): Promise<NotificationConsentResult> {
  if (typeof window === "undefined") {
    return { supported: false, granted: false }
  }

  const ios = isIOS()
  const standalone = isStandalone()
  const hasNotif = hasNativeNotification()

  if (ios && !standalone && !hasNotif) {
    return {
      supported: true,
      granted: false,
      needsPwaPrompt: true,
      error: "ios_pwa_required",
    }
  }

  if (!hasNotif) {
    return {
      supported: false,
      granted: false,
      error: "unsupported",
    }
  }

  if (Notification.permission === "denied") {
    localStorage.setItem(STORAGE_KEY, "false")
    return {
      supported: true,
      granted: false,
      error: "permission_denied",
    }
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      localStorage.setItem(STORAGE_KEY, "true")

      try {
        const authClient = await createAuthClient()
        if (authClient.isAuthenticated()) {
          await authClient.requestNotificationConsent().catch(() => null)
        }
      } catch {}

      return { supported: true, granted: true }
    } else {
      localStorage.setItem(STORAGE_KEY, "false")
      return {
        supported: true,
        granted: false,
        error: "permission_denied",
      }
    }
  } catch (error) {
    if (error instanceof NotificationsUnsupportedError) {
      return { supported: false, granted: false, error: "unsupported" }
    }
    console.error("Failed to request notification consent:", error)
    return { supported: true, granted: false, error: "request_failed" }
  }
}

export async function revokeDeviceNotificationConsent(): Promise<boolean> {
  if (typeof window === "undefined") {
    return true
  }
  try {
    localStorage.setItem(STORAGE_KEY, "false")
    try {
      const authClient = await createAuthClient()
      if (authClient.isAuthenticated()) {
        await authClient.revokeNotificationConsent().catch(() => null)
      }
    } catch {}
    return true
  } catch (error) {
    console.error("Failed to revoke notification consent:", error)
    return false
  }
}
