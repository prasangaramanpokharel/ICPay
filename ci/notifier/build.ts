import { BACKEND, canisterIds, dfx, step } from "../lib.ts"

const CANISTER = "icpay_notifier"

step("BUILD NOTIFIER")
const ids = canisterIds()
const deployed = Boolean(ids[CANISTER]?.ic)
if (deployed) {
  dfx(["build", CANISTER], BACKEND)
} else {
  dfx(["build", CANISTER, "--check"], BACKEND)
}
