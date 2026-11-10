import { BACKEND, dfxOut, requireArg } from "../lib.ts"

const CANISTER = "iccron"

const rawRate = requireArg(0, "npm run ci -- iccron:set-rate <usd_micros> (e.g. 500 for $0.0005, 1000 for $0.001)")
const micros = Number(rawRate.replaceAll("_", ""))

if (!micros || Number.isNaN(micros) || micros <= 0) {
  console.error(`Invalid rate: "${rawRate}". Must be a positive integer in micro-USD (e.g. 500 for $0.0005, 1000 for $0.001)`)
  process.exit(1)
}

const rateDollars = (micros / 1_000_000).toFixed(6)
const per1kDollars = ((micros * 1_000) / 1_000_000).toFixed(2)

console.log(`Setting icCron execution rate to:`)
console.log(`• ${micros} micro-USD`)
console.log(`• $${rateDollars} per run ($${per1kDollars} per 1,000 runs)\n`)

try {
  const res = dfxOut(["canister", "call", CANISTER, "set_rate_per_run", `(${micros})`], BACKEND)
  console.log("Success:", res.trim())
} catch (err) {
  console.error("Failed to update execution rate:", err)
  process.exit(1)
}
