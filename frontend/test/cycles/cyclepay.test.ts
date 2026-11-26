import test from "node:test"
import assert from "node:assert/strict"
import {
  calculateStripeFee,
  estimateCardCycles,
  getCyclePayGuestUrl,
  formatUsdCents,
} from "../../services/cycles/cyclepay"

test("calculateStripeFee calculates accurate 2.9% + 30 cents fee", () => {
  assert.equal(calculateStripeFee(0n), 0n)

  // $10.00 = 1000 cents -> 1000 * 0.029 = 29 cents + 30 cents = 59 cents ($0.59)
  assert.equal(calculateStripeFee(1000n), 59n)

  // $25.00 = 2500 cents -> 2500 * 0.029 = 72.5 + 30 = 102.5 -> rounds to 103 cents ($1.03)
  assert.equal(calculateStripeFee(2500n), 103n)

  // $100.00 = 10000 cents -> 10000 * 0.029 = 290 + 30 = 320 cents ($3.20)
  assert.equal(calculateStripeFee(10000n), 320n)
})

test("estimateCardCycles converts net USD to trillions of cycles based on XDR rate", () => {
  // At $1.3450 per XDR (13450 permyriad)
  const rate = 13450n

  // $25.00 has 103 cents fee -> Net = 2397 cents ($23.97)
  // 2397 * 100 * 1T / 13450 = 17,821,561,338,289 cycles (~17.82 T)
  const est25 = estimateCardCycles(2500n, rate)
  assert.ok(est25 > 17_000_000_000_000n)
  assert.ok(est25 < 18_000_000_000_000n)

  // 0 or negative gives 0n
  assert.equal(estimateCardCycles(0n, rate), 0n)
  assert.equal(estimateCardCycles(2500n, 0n), 0n)
})

test("getCyclePayGuestUrl generates valid guest payment URLs and bounds USD", () => {
  const canister = "6vbhm-nqaaa-aaaan-q6muq-cai"
  assert.equal(
    getCyclePayGuestUrl(canister, 25),
    "https://www.cyclepay.org/c/6vbhm-nqaaa-aaaan-q6muq-cai/25"
  )

  // Clamps minimum to $5 and maximum to $100
  assert.equal(
    getCyclePayGuestUrl(canister, 1),
    "https://www.cyclepay.org/c/6vbhm-nqaaa-aaaan-q6muq-cai/5"
  )
  assert.equal(
    getCyclePayGuestUrl(canister, 500),
    "https://www.cyclepay.org/c/6vbhm-nqaaa-aaaan-q6muq-cai/100"
  )
})

test("formatUsdCents formats cents to currency strings accurately", () => {
  assert.equal(formatUsdCents(2500n), "$25.00")
  assert.equal(formatUsdCents(103n), "$1.03")
  assert.equal(formatUsdCents(10000n), "$100.00")
})
