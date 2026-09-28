import { BACKEND, WALLET_CANISTER_ID, confirm, dfx, moduleHash, step } from "../lib.ts"

const CANISTER = "icp_blob_store"

step("BUILD")
dfx(["build", CANISTER])

const before = moduleHash(CANISTER)
console.log(`\nCurrent module hash: ${before}`)

confirm("upgrade the mainnet blob store canister")

step("DEPLOY")
const initArg = `(principal "${WALLET_CANISTER_ID}")`
dfx(["deploy", CANISTER, "--mode", "upgrade", "--argument", initArg, "--yes"])

step("RESULT")
const after = moduleHash(CANISTER)
console.log(`before: ${before}`)
console.log(`after:  ${after}`)
