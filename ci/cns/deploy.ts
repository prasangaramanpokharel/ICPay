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

const CNS = "cnsmangment"
const CREATE_CYCLES = "1000000000000"
const cnsDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../backend/rust/cnsmangment")

step("CNS CHECK")
run("cargo", ["check", "--target", "wasm32-unknown-unknown"], cnsDir)

step("CNS BUILD")
run("cargo", ["build", "--target", "wasm32-unknown-unknown", "--release"], cnsDir)

const ids = canisterIds()
const canisterId = ids[CNS]?.ic
const deployed = Boolean(canisterId)
const before = deployed ? moduleHash(CNS) : "not deployed"
console.log(`\nCurrent module hash: ${before}`)
console.log(`Cycles ledger: ${dfxOut(["cycles", "balance"])}`)
if (canisterId) console.log(`Canister id: ${canisterId}`)

confirm(deployed ? "upgrade cnsmangment on mainnet" : "create and install cnsmangment on mainnet")

step("DEPLOY")
if (deployed) {
  dfx(["deploy", CNS, "--yes"], BACKEND)
} else {
  dfx(
    ["deploy", CNS, "--yes", "--with-cycles", CREATE_CYCLES],
    BACKEND,
  )
}

step("RESULT")
const after = moduleHash(CNS)
console.log(`after: ${after}`)
const id = canisterIds()[CNS]?.ic ?? canisterId ?? "(unknown)"
console.log(`\ncnsmangment canister id: ${id}`)
console.log(`\nTop up: npm run ci cycles:topup 500000000000 cnsmangment`)
