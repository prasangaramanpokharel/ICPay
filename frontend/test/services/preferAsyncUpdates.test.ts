import { preferAsyncUpdates } from "../../services/icp"
import type { HttpAgent, UpdateOptions } from "@icp-sdk/core/agent"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

const seen: UpdateOptions[] = []
const fake = {
  update: async (_id: string, fields: UpdateOptions) => {
    seen.push(fields)
    return { reply: new Uint8Array() }
  },
} as unknown as HttpAgent

preferAsyncUpdates(fake)
await fake.update("aaaaa-aa", { methodName: "x", arg: new Uint8Array(), effectiveCanisterId: "aaaaa-aa" })
assert(seen[0]?.callSync === false, "defaults callSync false")

seen.length = 0
await fake.update("aaaaa-aa", {
  methodName: "x",
  arg: new Uint8Array(),
  effectiveCanisterId: "aaaaa-aa",
  callSync: true,
})
assert(seen[0]?.callSync === true, "keeps explicit true")

const rejectFake = {
  update: async () => {
    const err = new Error("rejected") as Error & { code?: { callContext?: Record<string, unknown> } }
    err.code = {}
    throw err
  },
} as unknown as HttpAgent

preferAsyncUpdates(rejectFake)
let caughtCode: { callContext?: Record<string, unknown> } | undefined
try {
  await rejectFake.update("aaaaa-aa", { methodName: "m", arg: new Uint8Array() })
} catch (err) {
  caughtCode = (err as { code?: { callContext?: Record<string, unknown> } }).code
}
assert(Boolean(caughtCode?.callContext?.effectiveTarget), "populates missing effectiveTarget on reject error")

console.log("preferAsyncUpdates ok")
