import { CANISTER, icpOut } from "../lib.ts"

// npm run ci users:count
//
// One free query (`getUsernameCount`). Counts claimed @handles only — accounts
// that logged in but never picked a username are not included.
const out = icpOut(["canister", "call", CANISTER, "getUsernameCount", "()", "--query"])
const n = Number(out.replace(/[^\d]/g, "") || "0")
console.log(`Usernames: ${n.toLocaleString("en-US")}`)
