import { readFileSync, existsSync } from "fs"
import { resolve } from "path"
import { BACKEND, canisterIds, dfx, step } from "../lib.ts"

const CANISTER_NAME = "icpay_notifier"
const ids = canisterIds()
const canisterId = ids[CANISTER_NAME]?.ic

if (!canisterId) {
  console.error(`Canister ${CANISTER_NAME} is not yet deployed on mainnet.`)
  process.exit(1)
}

// Read from backend/.env.notifier or process.env
let apiKey = process.env.RESEND_API_KEY
let fromEmail = process.env.RESEND_FROM

const envPath = resolve(BACKEND, ".env.notifier")
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf8").split("\n")
  for (const line of lines) {
    const matchKey = line.match(/^RESEND_API_KEY=["']?([^"'\r\n]+)["']?/)
    if (matchKey && !apiKey) apiKey = matchKey[1]
    const matchFrom = line.match(/^RESEND_FROM=["']?([^"'\r\n]+)["']?/)
    if (matchFrom && !fromEmail) fromEmail = matchFrom[1]
  }
}

if (!apiKey) {
  console.error("No RESEND_API_KEY found in environment or backend/.env.notifier")
  process.exit(1)
}

step("CONFIGURING NOTIFIER API KEY")
console.log(`Setting API Key (length: ${apiKey.length}, prefix: ${apiKey.slice(0, 7)}...) on ${canisterId}...`)
dfx(["canister", "call", CANISTER_NAME, "setApiKey", `("${apiKey}")`], BACKEND)

if (fromEmail) {
  console.log(`Setting From Email: ${fromEmail}...`)
  dfx(["canister", "call", CANISTER_NAME, "setFromEmail", `("${fromEmail}")`], BACKEND)
}

console.log("\n✅ Notifier canister configured successfully!")
