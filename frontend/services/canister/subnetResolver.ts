import { Principal } from "@icp-sdk/core/principal"
import type { Identity } from "@icp-sdk/core/agent"
import { createAgent } from "@/services/icp"

export async function resolveCanisterSubnetId(
  canisterIdInput: string | Principal,
  identity?: Identity
): Promise<string | null> {
  const canisterId =
    typeof canisterIdInput === "string"
      ? Principal.fromText(canisterIdInput.trim())
      : canisterIdInput

  try {
    const agent = await createAgent(identity)
    const subnetId = await agent.getSubnetIdFromCanister(canisterId)
    return subnetId ? subnetId.toText() : null
  } catch {
    return null
  }
}
