import { CANISTER, arg, dfx, resolveOwnedCanister } from "../lib.ts"

const target = resolveOwnedCanister(arg(0)) ?? arg(0) ?? CANISTER
dfx(["canister", "id", target])
