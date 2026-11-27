import test from "node:test"
import assert from "node:assert/strict"
import { isTransientWithdrawError, runWithWithdrawRetry } from "../../services/trade/trade"

test("runWithWithdrawRetry retries transient insufficient funds and succeeds silently", async () => {
  let calls = 0
  let preChecks = 0
  const result = await runWithWithdrawRetry(
    async () => {
      calls++
      if (calls < 3) {
        return { err: "Trade withdraw failed: insufficient funds: balance 0" }
      }
      return { ok: { blockIndex: 491n } }
    },
    async () => {
      preChecks++
    },
    0
  )

  assert.equal(calls, 3)
  assert.equal(preChecks, 3)
  assert.deepEqual(result, { ok: { blockIndex: 491n } })
})

test("runWithWithdrawRetry stops immediately on non-transient errors", async () => {
  let calls = 0
  const result = await runWithWithdrawRetry(
    async () => {
      calls++
      return { err: "Not authenticated" }
    },
    undefined,
    0
  )

  assert.equal(calls, 1)
  assert.deepEqual(result, { err: "Not authenticated" })
})

test("isTransientWithdrawError matches insufficient funds case-insensitively", () => {
  assert.equal(isTransientWithdrawError("Trade withdraw failed: insufficient funds: balance 0"), true)
  assert.equal(isTransientWithdrawError("Insufficient Funds"), true)
  assert.equal(isTransientWithdrawError("User not found"), false)
})
