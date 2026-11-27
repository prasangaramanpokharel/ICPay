import test from "node:test"
import assert from "node:assert/strict"
import { computePriceImpact } from "../../lib/swap/icpswap"

test("computePriceImpact calculates severe pool impact matching mainnet ICP/ICPAY pool", () => {
  const sqrtPriceX96 = 536_581_376_530_323_676_588_783_266n
  const res = computePriceImpact(sqrtPriceX96, 3000, false, 20_000_00000000n, 6_766_945_32010700n)
  assert.ok(res)
  assert.ok(res.pct > 98 && res.pct < 99, `expected ~98.44%, got ${res.pct}`)
  assert.match(res.label, /^-98\.4\d%$/)
})

test("computePriceImpact reports minimal impact for small swap", () => {
  const sqrtPriceX96 = 536_581_376_530_323_676_588_783_266n
  const spotOut = 21_736_00000000n
  const res = computePriceImpact(sqrtPriceX96, 3000, false, 1_00000000n, spotOut)
  assert.ok(res)
  assert.ok(res.pct < 1, `expected < 1%, got ${res.pct}`)
})
