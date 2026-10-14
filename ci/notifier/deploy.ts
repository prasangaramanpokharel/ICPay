import { BACKEND, WALLET_CANISTER_ID, canisterIds, confirm, dfx, dfxOut, moduleHash, step } from "../lib.ts"

const CANISTER_NAME = "icpay_notifier"
const CREATE_CYCLES = "1000000000000" // 1.0 TC initial funding

const ids = canisterIds()
const canisterId = ids[CANISTER_NAME]?.ic
const deployed = Boolean(canisterId)
const before = deployed ? moduleHash(CANISTER_NAME) : "not deployed"

step("BUILD")
if (deployed) {
  dfx(["build", CANISTER_NAME], BACKEND)
} else {
  dfx(["build", CANISTER_NAME, "--check"], BACKEND)
}

console.log(`\nCurrent module hash: ${before}`)
console.log(`Cycles ledger: ${dfxOut(["cycles", "balance"])}`)
if (canisterId) console.log(`Canister id: ${canisterId}`)

confirm(deployed ? `upgrade ${CANISTER_NAME} on mainnet` : `create and install ${CANISTER_NAME} on mainnet`)

step("DEPLOY")
const initArg = `(principal "${WALLET_CANISTER_ID}")`
if (deployed) {
  dfx([
    "deploy",
    CANISTER_NAME,
    "--mode",
    "reinstall",
    "--argument",
    initArg,
    "--yes",
  ], BACKEND)
} else {
  dfx([
    "deploy",
    CANISTER_NAME,
    "--with-cycles",
    CREATE_CYCLES,
    "--argument",
    initArg,
    "--yes",
  ], BACKEND)
}

step("RESULT")
console.log(`before: ${before}`)
console.log(`after:  ${moduleHash(CANISTER_NAME)}`)
console.log(`\nTo push Resend credentials to the live canister, run:`)
console.log(`  npm run ci notifier:config`)
