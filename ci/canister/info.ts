import { CANISTER, arg, dfx, resolveOwnedCanister } from "../lib.ts"

// Module hash and controllers -- the two facts that say what is running and who
// can change it.
const target = resolveOwnedCanister(arg(0)) ?? arg(0) ?? CANISTER
dfx(["canister", "info", target])
