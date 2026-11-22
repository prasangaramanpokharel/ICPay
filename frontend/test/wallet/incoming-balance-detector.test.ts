import assert from "node:assert/strict"
import { detectBalanceIncreases } from "@/hooks/wallet/useIncomingBalanceDetector"
import { formatTokenAmount } from "@/lib/wallet/utils"

const ICP_LEDGER = "ryjl3-tyaaa-aaaaa-aaaba-cai"
const ICPAY_LEDGER = "5fsnk-rqaaa-aaaan-q6m4q-cai"
const USDC_LEDGER = "xevnm-gaaaa-aaaar-qafnq-cai"

const metaMap = new Map([
  [ICP_LEDGER, { symbol: "ICP", decimals: 8 }],
  [ICPAY_LEDGER, { symbol: "$ICPAY", decimals: 8 }],
  [USDC_LEDGER, { symbol: "ckUSDC", decimals: 6 }],
])

// 1. Detect single ICP incoming transfer (+2.5 ICP)
const prev1 = new Map([
  [ICP_LEDGER, 100_000_000n], // 1.0 ICP
])
const curr1 = new Map([
  [ICP_LEDGER, 350_000_000n], // 3.5 ICP (+2.5 ICP)
])

const res1 = detectBalanceIncreases(prev1, curr1, metaMap)
assert.equal(res1.length, 1)
assert.equal(res1[0].symbol, "ICP")
assert.equal(res1[0].decimals, 8)
assert.equal(res1[0].delta, 250_000_000n)
assert.equal(formatTokenAmount(res1[0].delta, res1[0].decimals, 4), "2.5")

// 2. Outgoing transfer (balance decreased from 3.5 ICP to 1.5 ICP) -> No increase
const curr2 = new Map([
  [ICP_LEDGER, 150_000_000n],
])
const res2 = detectBalanceIncreases(curr1, curr2, metaMap)
assert.equal(res2.length, 0, "outgoing transfer must never trigger incoming alert")

// 3. Multi-token arrival ($ICPAY and ckUSDC arriving simultaneously)
const prev3 = new Map([
  [ICP_LEDGER, 150_000_000n],
  [ICPAY_LEDGER, 10_000_000_000n], // 100 $ICPAY
  [USDC_LEDGER, 5_000_000n],        // 5 ckUSDC (6 decimals)
])
const curr3 = new Map([
  [ICP_LEDGER, 150_000_000n],        // unchanged
  [ICPAY_LEDGER, 90_000_000_000n], // +800 $ICPAY
  [USDC_LEDGER, 25_000_000n],       // +20 ckUSDC
])

const res3 = detectBalanceIncreases(prev3, curr3, metaMap)
assert.equal(res3.length, 2)

const icpayInc = res3.find((r) => r.symbol === "$ICPAY")
assert.ok(icpayInc)
assert.equal(icpayInc.delta, 80_000_000_000n)
assert.equal(formatTokenAmount(icpayInc.delta, icpayInc.decimals, 0), "800")

const usdcInc = res3.find((r) => r.symbol === "ckUSDC")
assert.ok(usdcInc)
assert.equal(usdcInc.decimals, 6)
assert.equal(usdcInc.delta, 20_000_000n)
assert.equal(formatTokenAmount(usdcInc.delta, usdcInc.decimals, 2), "20")

// 4. Zero balance change
const res4 = detectBalanceIncreases(curr3, curr3, metaMap)
assert.equal(res4.length, 0, "identical balance must produce zero notifications")

console.log("PASS: incoming balance detector logic and multi-token delta calculations verified")
