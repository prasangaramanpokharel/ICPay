import test from "node:test"
import assert from "node:assert/strict"
import { fetchPublicCanisterState } from "../../services/canister/publicState"
import { resolveCanisterSubnetId } from "../../services/canister/subnetResolver"

test("fetchPublicCanisterState recovers Candid interface for wallet canister", async () => {
  const state = await fetchPublicCanisterState("6vbhm-nqaaa-aaaan-q6muq-cai")
  assert(state.candid != null)
  assert(typeof state.candid === "string")
  assert(state.candid.length > 500)
  assert(state.candid.includes("service :"))
})

test("resolveCanisterSubnetId resolves certified subnet from boundary node", async () => {
  const subnetId = await resolveCanisterSubnetId("6vbhm-nqaaa-aaaan-q6muq-cai")
  assert(subnetId != null)
  assert.equal(typeof subnetId, "string")
  assert(subnetId.length > 10)
  assert.equal(subnetId, "cv73p-6v7zi-u67oy-7jc3h-qspsz-g5lrj-4fn7k-xrax3-thek2-sl46v-jae")
})
