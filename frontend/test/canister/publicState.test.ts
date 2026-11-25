import test from "node:test"
import assert from "node:assert/strict"
import { fetchPublicCanisterState } from "../../services/canister/publicState"

test("fetchPublicCanisterState queries certified public state for wallet canister", async () => {
  const result = await fetchPublicCanisterState("6vbhm-nqaaa-aaaan-q6muq-cai")
  assert(Array.isArray(result.controllers))
  assert(result.controllers.length > 0)
  assert(typeof result.moduleHash === "string" || result.moduleHash === null)
  if (result.moduleHash) {
    assert.equal(result.moduleHash.length, 64)
  }
  if (result.time) {
    assert(result.time instanceof Date)
  }
})
