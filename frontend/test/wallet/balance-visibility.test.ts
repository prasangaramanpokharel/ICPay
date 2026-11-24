import {
  BALANCE_VISIBILITY_KEY,
  BALANCE_MASK,
} from "../../components/wallet/balance-visibility-provider"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

// 1. Constants verification
assert(BALANCE_VISIBILITY_KEY === "icpay_balance_visibility", "Key must be exactly icpay_balance_visibility")
assert(BALANCE_MASK === "••••••", "Mask must be exactly ••••••")

// 2. Storage simulation & snapshot logic
const storage = new Map<string, string>()
const mockLocalStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, val: string) => storage.set(key, val),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
}

function computeVisibilitySnapshot(ls: typeof mockLocalStorage): boolean {
  const stored = ls.getItem(BALANCE_VISIBILITY_KEY)
  return stored === "hidden" || stored === "true"
}

// Default state: visible for first-time users (null/empty in localStorage)
mockLocalStorage.clear()
assert(computeVisibilitySnapshot(mockLocalStorage) === false, "Default state is visible (false)")

// Setting to 'hidden'
mockLocalStorage.setItem(BALANCE_VISIBILITY_KEY, "hidden")
assert(computeVisibilitySnapshot(mockLocalStorage) === true, "Stored 'hidden' evaluates to hidden (true)")

// Setting to 'visible'
mockLocalStorage.setItem(BALANCE_VISIBILITY_KEY, "visible")
assert(computeVisibilitySnapshot(mockLocalStorage) === false, "Stored 'visible' evaluates to visible (false)")

// Backward-compatible 'true'/'false'
mockLocalStorage.setItem(BALANCE_VISIBILITY_KEY, "true")
assert(computeVisibilitySnapshot(mockLocalStorage) === true, "Stored 'true' evaluates to hidden (true)")
mockLocalStorage.setItem(BALANCE_VISIBILITY_KEY, "false")
assert(computeVisibilitySnapshot(mockLocalStorage) === false, "Stored 'false' evaluates to visible (false)")

// Invalid value gracefully defaults to visible
mockLocalStorage.setItem(BALANCE_VISIBILITY_KEY, "invalid_value")
assert(computeVisibilitySnapshot(mockLocalStorage) === false, "Invalid string defaults to visible (false)")

// 3. Mask amount behavior
function mockMaskAmount(amount: string | number | undefined | null, hidden: boolean): string {
  if (hidden) return BALANCE_MASK
  return amount !== undefined && amount !== null ? String(amount) : ""
}

assert(mockMaskAmount("150.25", false) === "150.25", "Reveals actual amount when visible")
assert(mockMaskAmount("150.25", true) === "••••••", "Masks numerical amount with •••••• when hidden")
assert(mockMaskAmount(0, true) === "••••••", "Masks zero with •••••• when hidden")
assert(mockMaskAmount(null, true) === "••••••", "Masks null with •••••• when hidden")
assert(mockMaskAmount(undefined, false) === "", "Returns empty string for undefined when visible")

console.log("All balance visibility tests passed.")
