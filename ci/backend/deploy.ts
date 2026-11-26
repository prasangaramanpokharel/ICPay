import { BACKEND, CANISTER, confirm, dfx, moduleHash, network, run, step } from "../lib.ts"
import { spawnSync } from "node:child_process"

// Upgrade, never reinstall: reinstall wipes every user, balance record and
// transaction. There is deliberately no flag for it here -- if it is ever truly
// needed it should be typed by hand, with the consequence in front of you.

step("TESTS")
run("bash", ["scripts/run-tests.sh"], BACKEND)

if (network() === "local") {
  step("LOCAL ENVIRONMENT CHECK")
  const ping = spawnSync("icp", ["network", "ping", "local"], { cwd: BACKEND, encoding: "utf8" })
  if (ping.status !== 0) {
    console.error("\nError: Local network is not running.")
    console.error("Start it in another terminal with:")
    console.error("  cd backend && icp network start -d\n")
    process.exit(1)
  }
  step("CANISTER INIT (LOCAL)")
  try {
    icp(["canister", "create", CANISTER])
  } catch {}
}

step("BUILD")
dfx(["build", CANISTER])

const before = moduleHash()
console.log(`\nCurrent module hash: ${before}`)

confirm("upgrade the mainnet canister holding live user funds")

step("DEPLOY")
dfx(["deploy", CANISTER, "--yes"])

step("RESULT")
const after = moduleHash()
console.log(`before: ${before}`)
console.log(`after:  ${after}`)
if (before === after) {
  console.log("\nModule hash unchanged -- nothing was deployed.")
} else {
  console.log(`\nRollback with:\n  npm run ci backend:rollback <previous-commit> ${before}`)
}
