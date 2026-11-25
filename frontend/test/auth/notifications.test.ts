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
