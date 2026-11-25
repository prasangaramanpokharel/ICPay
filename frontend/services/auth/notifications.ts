import { createAuthClient } from "@/services/auth/auth"
import { NotificationsUnsupportedError } from "@icp-sdk/auth/client"

export type NotificationConsentResult = {
  supported: boolean
  granted: boolean
}

export async function fetchNotificationConsentStatus(): Promise<NotificationConsentResult> {
  if (typeof window === "undefined") {
    return { supported: false, granted: false }
  }
  try {
    const authClient = await createAuthClient()
    if (!authClient.isAuthenticated()) {
      return { supported: true, granted: false }
    }
    const status = await authClient.getNotificationConsentStatus()
    return { supported: true, granted: status.granted }
  } catch (error) {
    if (error instanceof NotificationsUnsupportedError) {
      return { supported: false, granted: false }
    }
    return { supported: true, granted: false }
  }
}

export async function requestDeviceNotificationConsent(): Promise<NotificationConsentResult> {
  if (typeof window === "undefined") {
    return { supported: false, granted: false }
  }
  try {
    const authClient = await createAuthClient()
    if (!authClient.isAuthenticated()) {
      return { supported: true, granted: false }
    }
    const status = await authClient.requestNotificationConsent()
    return { supported: true, granted: status.granted }
  } catch (error) {
    if (error instanceof NotificationsUnsupportedError) {
      return { supported: false, granted: false }
    }
    console.error("Failed to request notification consent:", error)
    return { supported: true, granted: false }
  }
}

export async function revokeDeviceNotificationConsent(): Promise<boolean> {
  if (typeof window === "undefined") {
    return true
  }
  try {
    const authClient = await createAuthClient()
    if (!authClient.isAuthenticated()) return true
    await authClient.revokeNotificationConsent()
    return true
  } catch (error) {
    console.error("Failed to revoke notification consent:", error)
    return false
  }
}
