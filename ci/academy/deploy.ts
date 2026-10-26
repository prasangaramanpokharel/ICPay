import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import {
  BACKEND,
  canisterIds,
  confirm,
  dfx,
  dfxOut,
  moduleHash,
  run,
  step,
} from "../lib.ts"

const ACADEMY = "icpay_academy"
const CREATE_CYCLES = "1000000000000"
const academyDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../backend/rust/academy")

if (!process.env.SDKROOT && process.platform === "darwin") {
  process.env.SDKROOT = "/Library/Developer/CommandLineTools/SDKs/MacOSX15.4.sdk"
}

step("ACADEMY CHECK")
run("cargo", ["check"], academyDir)

step("ACADEMY BUILD")
run("cargo", ["build", "--target", "wasm32-unknown-unknown", "--release"], academyDir)

const ids = canisterIds()
const canisterId = ids[ACADEMY]?.ic
const deployed = Boolean(canisterId)
const before = deployed ? moduleHash(ACADEMY) : "not deployed"
console.log(`\nCurrent module hash: ${before}`)
console.log(`Cycles ledger: ${dfxOut(["cycles", "balance"])}`)
if (canisterId) console.log(`Canister id: ${canisterId}`)

confirm(deployed ? "upgrade icpay_academy on mainnet" : "create and install icpay_academy on mainnet")

step("DEPLOY")
if (deployed) {
  dfx(["deploy", ACADEMY, "--yes"], BACKEND)
} else {
  dfx(
    ["deploy", ACADEMY, "--yes", "--with-cycles", CREATE_CYCLES],
    BACKEND,
  )
}

step("RESULT")
const after = moduleHash(ACADEMY)
console.log(`after: ${after}`)
const id = canisterIds()[ACADEMY]?.ic ?? canisterId ?? "(unknown)"
console.log(`\nicpay_academy canister id: ${id}`)
console.log(`\nTop up: npm run ci cycles:topup 500000000000 icpay_academy`)
