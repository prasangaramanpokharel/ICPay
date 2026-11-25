import { CanisterStatus, type Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { createAgent } from "@/services/icp"

export type PublicCanisterState = {
  controllers: string[]
  moduleHash: string | null
  time: Date | null
  candid: string | null
}

export async function fetchPublicCanisterState(
  canisterIdInput: string | Principal,
  identity?: Identity
): Promise<PublicCanisterState> {
  const canisterId =
    typeof canisterIdInput === "string"
      ? Principal.fromText(canisterIdInput)
      : canisterIdInput

  const agent = await createAgent(identity)

  const status = await CanisterStatus.request({
    agent,
    canisterId,
    paths: ["controllers", "module_hash", "time", "candid"],
  })

  const rawControllers = status.get("controllers") as Principal[] | undefined
  const controllers = rawControllers ? rawControllers.map((p) => p.toText()) : []

  const rawHash = status.get("module_hash")
  let moduleHash: string | null = null
  if (typeof rawHash === "string") {
    moduleHash = rawHash
  } else if (rawHash instanceof Uint8Array || rawHash instanceof ArrayBuffer) {
    const bytes = rawHash instanceof Uint8Array ? rawHash : new Uint8Array(rawHash)
    moduleHash = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }

  const rawTime = status.get("time") as Date | undefined
  const time = rawTime instanceof Date ? rawTime : null

  const rawCandid = status.get("candid") as string | undefined
  const candid = typeof rawCandid === "string" ? rawCandid : null

  return {
    controllers,
    moduleHash,
    time,
    candid,
  }
}
