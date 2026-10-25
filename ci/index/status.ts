import { BACKEND, canisterIds, dfx, dfxOut, ICPAY_LEDGER_ID, step } from "../lib.ts"

const CANISTER_NAME = "icpay_index"
const ids = canisterIds()
const canisterId = ids[CANISTER_NAME]?.ic

if (!canisterId) {
  console.error("ICPAY Index canister is not deployed yet.")
  process.exit(1)
}

step("ICPAY INDEX STATUS")
console.log(`Canister ID: ${canisterId}`)
console.log(`Ledger ID:   ${ICPAY_LEDGER_ID}`)

try {
  const ledgerId = dfxOut(["canister", "call", CANISTER_NAME, "ledger_id"], BACKEND)
  console.log(`Configured Ledger: ${ledgerId}`)
  
  const status = dfxOut(["canister", "call", CANISTER_NAME, "status"], BACKEND)
  console.log(`Sync Status: ${status}`)
} catch (e) {
  console.error("Failed to query index canister:", e)
}
