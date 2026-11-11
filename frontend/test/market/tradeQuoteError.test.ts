import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  formatTradeErrorMessage,
  isInsufficientBalanceError,
  classifyTradeExecError,
  extractRateLimitWaitSeconds,
} from "../../lib/market/tradeQuoteError"

describe("trade error formatting and classification", () => {
  it("formats IC replica rejection error for missing canister method", () => {
    const rawRejection = `The replica returned a rejection error:
  Request ID: cb9d3e99ebec10eb478c7f2e9df1530eed53962dded696f69bd6a4493450e774
  Reject code: 5
  Reject text: Error from Canister 6vbhm-nqaaa-aaaan-q6muq-cai: Canister has no update method 'executeTrade'..
Check that the method being called is exported by the target canister.
  Error code: IC0536`

    const formatted = formatTradeErrorMessage(rawRejection)
    assert.equal(
      formatted,
      "Trading canister method unavailable. Please refresh and try again."
    )
    assert.equal(classifyTradeExecError(rawRejection), "canister_method")
  })

  it("identifies rate limit errors and extracts wait seconds", () => {
    const rateLimitErr = "rate limit exceeded: too many requests. please wait 4s before retrying"
    assert.equal(classifyTradeExecError(rateLimitErr), "rate_limit")
    assert.equal(extractRateLimitWaitSeconds(rateLimitErr), 4)
    assert.equal(
      formatTradeErrorMessage(rateLimitErr),
      "Rate limit reached. Please wait 4s before submitting another trade."
    )

    const genericRateLimit = "rate limit exceeded"
    assert.equal(classifyTradeExecError(genericRateLimit), "rate_limit")
    assert.equal(extractRateLimitWaitSeconds(genericRateLimit), null)
    assert.equal(
      formatTradeErrorMessage(genericRateLimit),
      "Rate limit reached. Please wait a few seconds before submitting another trade."
    )
  })

  it("identifies allowance and user busy errors", () => {
    const allowanceErr = "icrc2_approve call failed: InsufficientAllowance"
    assert.equal(classifyTradeExecError(allowanceErr), "allowance")
    assert.equal(
      formatTradeErrorMessage(allowanceErr),
      "ICRC-2 token allowance failed. Ensure token allowance is approved."
    )

    const busyErr = "user busy: trade lock held"
    assert.equal(classifyTradeExecError(busyErr), "busy")
    assert.equal(
      formatTradeErrorMessage(busyErr),
      "A previous trade is still confirming on-chain. Please wait a moment."
    )
  })

  it("identifies insufficient trading balance errors correctly", () => {
    const err1 = "Insufficient trading balance to execute order"
    assert.equal(isInsufficientBalanceError(err1), true)
    assert.equal(
      formatTradeErrorMessage(err1),
      "Insufficient trading balance. Deposit funds into your trading balance to place this order."
    )
    assert.equal(classifyTradeExecError(err1), "balance")

    const err2 = "insufficient funds for transfer fee"
    assert.equal(isInsufficientBalanceError(err2), true)
    assert.equal(classifyTradeExecError(err2), "balance")
  })

  it("identifies slippage and pool liquidity errors", () => {
    const slippageErr = "AmountOut is less than amountOutMinimum"
    assert.equal(classifyTradeExecError(slippageErr), "slippage")
    assert.match(formatTradeErrorMessage(slippageErr), /Slippage tolerance exceeded/i)

    const liquidityErr = "No pool liquidity found"
    assert.equal(classifyTradeExecError(liquidityErr), "liquidity")
    assert.match(formatTradeErrorMessage(liquidityErr), /Insufficient pool liquidity/i)
  })

  it("handles timeout and authentication errors", () => {
    const timeoutErr = new Error("Call timed out after 30 seconds")
    assert.equal(classifyTradeExecError(timeoutErr), "timeout")
    assert.match(formatTradeErrorMessage(timeoutErr), /timed out on-chain/i)

    const authErr = new Error("Authentication required")
    assert.equal(classifyTradeExecError(authErr), "auth")
    assert.match(formatTradeErrorMessage(authErr), /Authentication required/i)
  })
})
