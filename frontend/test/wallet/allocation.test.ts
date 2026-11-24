import { test } from "node:test"
import assert from "node:assert/strict"
import {
  computeAllocation,
  formatPercent,
  percentOf,
  type Holding,
} from "../../lib/allocation.js"

test("allocation helpers", async (t) => {
  await t.test("percentOf calculates accurate percentage", () => {
    assert.equal(percentOf(50, 100), 50)
    assert.equal(percentOf(0, 100), 0)
    assert.equal(percentOf(10, 0), 0)
  })

  await t.test("formatPercent handles boundary values", () => {
    assert.equal(formatPercent(0), "0%")
    assert.equal(formatPercent(0.04), "<0.1%")
    assert.equal(formatPercent(99.98), "100%")
    assert.equal(formatPercent(54.36), "54.4%")
  })

  await t.test("computeAllocation filters non-priced and groups rest into other", () => {
    const holdings: Holding[] = [
      { symbol: "ICPAY", value: 12 },
      { symbol: "ICP", value: 5 },
      { symbol: "ckBTC", value: 3 },
      { symbol: "ckETH", value: 2 },
      { symbol: "CHAT", value: 1 },
      { symbol: "UNPRICED", value: 0 },
      { symbol: "NAN", value: NaN },
    ]

    const { slices, total } = computeAllocation(holdings, "Other")
    assert.equal(total, 23)
    assert.equal(slices.length, 5)
    assert.equal(slices[0].symbol, "ICPAY")
    assert.equal(slices[4].symbol, "Other")
    assert.equal(slices[4].isOther, true)
    assert.equal(slices[4].value, 1)

    const sumPercents = slices.reduce((sum, s) => sum + s.percent, 0)
    assert.ok(Math.abs(sumPercents - 100) < 0.001)
  })

  await t.test("computeAllocation handles empty or single asset", () => {
    assert.deepEqual(computeAllocation([], "Other"), { slices: [], total: 0 })
    const single = computeAllocation([{ symbol: "ICP", value: 10 }], "Other")
    assert.equal(single.slices.length, 1)
    assert.equal(single.slices[0].percent, 100)
  })
})
