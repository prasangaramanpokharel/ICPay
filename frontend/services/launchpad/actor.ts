import { Actor, type Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { createAgent, clearAgentCache, LAUNCHPAD_CANISTER_ID } from "@/services/icp"
import type { LaunchpadActor } from "@/services/launchpad/types"
import { launchpadIdl } from "@/services/launchpad/idl"

let cachedActor: LaunchpadActor | null = null
let cachedIdentity: Identity | null = null

export async function getLaunchpadActor(identity?: Identity): Promise<LaunchpadActor | null> {
  if (!LAUNCHPAD_CANISTER_ID || !LAUNCHPAD_CANISTER_ID.trim()) {
    return null
  }

  let canisterPrincipal: Principal
  try {
    canisterPrincipal = Principal.fromText(LAUNCHPAD_CANISTER_ID.trim())
  } catch {
    return null
  }

  if (cachedActor && cachedIdentity === identity) {
    return cachedActor
  }

  const agent = await createAgent(identity)
  const actor = Actor.createActor<LaunchpadActor>(launchpadIdl, {
    agent,
    canisterId: canisterPrincipal,
  })

  cachedActor = actor
  cachedIdentity = identity ?? null
  return actor
}

export function clearLaunchpadActorCache(): void {
  cachedActor = null
  cachedIdentity = null
  clearAgentCache()
}
