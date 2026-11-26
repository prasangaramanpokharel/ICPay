import test from "node:test"
import assert from "node:assert/strict"
import {
  fetchNotificationConsentStatus,
  requestDeviceNotificationConsent,
  revokeDeviceNotificationConsent,
} from "../../services/auth/notifications"
import { memoizeRedirectState } from "../../services/auth/auth"

test("fetchNotificationConsentStatus handles non-browser environments gracefully", async () => {
  const result = await fetchNotificationConsentStatus()
  assert.equal(typeof result.supported, "boolean")
  assert.equal(result.granted, false)
})

test("requestDeviceNotificationConsent handles non-browser environments gracefully", async () => {
  const result = await requestDeviceNotificationConsent()
  assert.equal(typeof result.supported, "boolean")
  assert.equal(result.granted, false)
})

test("revokeDeviceNotificationConsent succeeds idempotently in non-browser environments", async () => {
  const success = await revokeDeviceNotificationConsent()
  assert.equal(success, true)
})

test("memoizeRedirectState executes producer function cleanly", async () => {
  const value = await memoizeRedirectState(() => "/bucket/uploads?tab=keys")
  assert.equal(value, "/bucket/uploads?tab=keys")
})

test("fetchNotificationConsentStatus detects iOS browser requiring PWA", async () => {
  const originalWindow = globalThis.window
  const originalNavigatorDesc = Object.getOwnPropertyDescriptor(globalThis, "navigator")
  try {
    globalThis.window = {
      matchMedia: () => ({ matches: false } as unknown as MediaQueryList),
    } as unknown as Window & typeof globalThis

    Object.defineProperty(globalThis, "navigator", {
      value: {
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
        platform: "iPhone",
        maxTouchPoints: 5,
      },
      configurable: true,
      writable: true,
    })

    const result = await fetchNotificationConsentStatus()
    assert.equal(result.supported, true)
    assert.equal(result.granted, false)
    assert.equal(result.needsPwaPrompt, true)
  } finally {
    globalThis.window = originalWindow
    if (originalNavigatorDesc) {
      Object.defineProperty(globalThis, "navigator", originalNavigatorDesc)
    }
  }
})

test("requestDeviceNotificationConsent prompts PWA on iOS Safari without standalone", async () => {
  const originalWindow = globalThis.window
  const originalNavigatorDesc = Object.getOwnPropertyDescriptor(globalThis, "navigator")
  try {
    globalThis.window = {
      matchMedia: () => ({ matches: false } as unknown as MediaQueryList),
    } as unknown as Window & typeof globalThis

    Object.defineProperty(globalThis, "navigator", {
      value: {
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
        platform: "iPhone",
        maxTouchPoints: 5,
      },
      configurable: true,
      writable: true,
    })

    const result = await requestDeviceNotificationConsent()
    assert.equal(result.supported, true)
    assert.equal(result.granted, false)
    assert.equal(result.needsPwaPrompt, true)
    assert.equal(result.error, "ios_pwa_required")
  } finally {
    globalThis.window = originalWindow
    if (originalNavigatorDesc) {
      Object.defineProperty(globalThis, "navigator", originalNavigatorDesc)
    }
  }
})
