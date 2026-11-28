import test from "node:test"
import assert from "node:assert/strict"
import { Principal } from "@icp-sdk/core/principal"
import { icrc1Account } from "../../lib/wallet/accountId"
import { parsePrincipalOrIcrc1 } from "../../services/sweep/sweep"

test("parsePrincipalOrIcrc1 parses valid principal with empty subaccount", () => {
  const parsed = parsePrincipalOrIcrc1("6vbhm-nqaaa-aaaan-q6muq-cai")
  assert.ok(parsed)
  assert.equal(parsed.owner.toText(), "6vbhm-nqaaa-aaaan-q6muq-cai")
  assert.equal(parsed.subaccount.length, 0)
})

test("parsePrincipalOrIcrc1 parses valid ICRC-1 extended account", () => {
  const sub = new Uint8Array(32)
  sub[31] = 1
  const icrc1 = icrc1Account(Principal.fromText("6vbhm-nqaaa-aaaan-q6muq-cai"), sub)
  const parsed = parsePrincipalOrIcrc1(icrc1)
  assert.ok(parsed)
  assert.equal(parsed.owner.toText(), "6vbhm-nqaaa-aaaan-q6muq-cai")
  assert.equal(parsed.subaccount.length, 1)
  assert.equal(parsed.subaccount[0]?.[31], 1)
})

test("parsePrincipalOrIcrc1 rejects usernames, account IDs, and garbage", () => {
  assert.equal(parsePrincipalOrIcrc1("@alice"), null)
  assert.equal(parsePrincipalOrIcrc1("alice"), null)
  assert.equal(
    parsePrincipalOrIcrc1("1abffdb8bbd52ba3996e8dda6e1c1ad295cf689911485a7d776b45203056e1e8"),
    null
  )
  assert.equal(parsePrincipalOrIcrc1("not-an-address"), null)
})
