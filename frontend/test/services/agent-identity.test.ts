import test from "node:test"
import assert from "node:assert/strict"
import { createAgent, clearAgentCache } from "../../services/icp"
import { Identity, type HttpAgentRequest } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"

test("createAgent returns cached instance and hot-swaps identity in-place", async () => {
  clearAgentCache()

  const agent1 = await createAgent()
  const principal1 = await agent1.getPrincipal()
  assert.equal(principal1.isAnonymous(), true)

  const fakeIdentity: Identity = {
    getPrincipal: () => Principal.fromText("2vxsx-fae"),
    transformRequest: (req: HttpAgentRequest) => Promise.resolve(req),
  }

  const agent2 = await createAgent(fakeIdentity)
  assert.equal(agent1, agent2)
  const principal2 = await agent2.getPrincipal()
  assert.equal(principal2.toText(), "2vxsx-fae")

  const agent3 = await createAgent()
  assert.equal(agent1, agent3)
  const principal3 = await agent3.getPrincipal()
  assert.equal(principal3.isAnonymous(), true)

  clearAgentCache()
})
