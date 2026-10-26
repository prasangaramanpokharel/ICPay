import { BACKEND, canisterIds, confirm, dfx, dfxOut, ICPAY_LEDGER_ID, moduleHash, step } from "../lib.ts"

const CANISTER_NAME = "icpay_index"
const CREATE_CYCLES = "800000000000" // 0.8 TC initial funding

const ids = canisterIds()
const canisterId = ids[CANISTER_NAME]?.ic
const deployed = Boolean(canisterId)
const before = deployed ? moduleHash(CANISTER_NAME) : "not deployed"

console.log(`\nCurrent module hash: ${before}`)
console.log(`Cycles ledger: ${dfxOut(["cycles", "balance"])}`)
if (canisterId) console.log(`Canister id: ${canisterId}`)

confirm(deployed ? `upgrade ${CANISTER_NAME} on mainnet` : `create and install ${CANISTER_NAME} on mainnet`)

step("DEPLOY")
const initArg = `(opt variant { Init = record { ledger_id = principal "${ICPAY_LEDGER_ID}" } })`
const upgradeArg = `(opt variant { Upgrade = record { ledger_id = opt principal "${ICPAY_LEDGER_ID}"; retrieve_blocks_from_ledger_interval_seconds = null; min_retrieve_blocks_from_ledger_interval_seconds = null; max_retrieve_blocks_from_ledger_interval_seconds = null } })`

if (deployed) {
  dfx([
    "deploy",
    CANISTER_NAME,
    "--mode",
    "upgrade",
    "--argument",
    upgradeArg,
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
const finalId = canisterIds()[CANISTER_NAME]?.ic
console.log(`\nICPAY Index canister id: ${finalId}`)
