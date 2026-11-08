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

const CANISTER_NAME = "iccron"
const CREATE_CYCLES = "1000000000000"
const iccronDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../backend/rust/iccron")

if (!process.env.SDKROOT && process.platform === "darwin") {
  process.env.SDKROOT = "/Library/Developer/CommandLineTools/SDKs/MacOSX15.4.sdk"
}

if (process.env.HOME && !process.env.PATH?.includes(".cargo/bin")) {
  process.env.PATH = `${process.env.HOME}/.cargo/bin:${process.env.PATH}`
}

step("ICCRON TESTS")
run("cargo", ["test"], iccronDir)

step("ICCRON BUILD")
run("cargo", ["build", "--target", "wasm32-unknown-unknown", "--release"], iccronDir)

const ids = canisterIds()
const canisterId = ids[CANISTER_NAME]?.ic
const deployed = Boolean(canisterId)
const before = deployed ? moduleHash(CANISTER_NAME) : "not deployed"
console.log(`\nCurrent module hash: ${before}`)
console.log(`Cycles ledger: ${dfxOut(["cycles", "balance"])}`)
if (canisterId) console.log(`Canister id: ${canisterId}`)

confirm(deployed ? `upgrade ${CANISTER_NAME} on mainnet` : `create and install ${CANISTER_NAME} on mainnet`)

step("DEPLOY")
if (deployed) {
  dfx(["deploy", CANISTER_NAME, "--yes"], BACKEND)
} else {
  dfx(
    ["deploy", CANISTER_NAME, "--yes", "--with-cycles", CREATE_CYCLES],
    BACKEND,
  )
}

step("RESULT")
const after = moduleHash(CANISTER_NAME)
console.log(`after: ${after}`)
const id = canisterIds()[CANISTER_NAME]?.ic ?? canisterId ?? "(unknown)"
console.log(`\n${CANISTER_NAME} canister id: ${id}`)
console.log(`\nTop up: npm run ci cycles:topup 500000000000 ${CANISTER_NAME}`)
