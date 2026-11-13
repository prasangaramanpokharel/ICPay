import type { Identity } from "@icp-sdk/core/agent"
import { call, query, type Outcome } from "@/services/client"
import { getWalletActor } from "@/services/wallet"
import type { UserPublic } from "@/services/types"

export function getProfile(
  identity: Identity | undefined
): Promise<UserPublic | null> {
  return query(identity, async (actor) => {
    const [user] = await actor.getUser()
    return user ?? null
  })
}

export function updateUsername(
  identity: Identity | undefined,
  username: string
): Promise<Outcome<UserPublic>> {
  return call(identity, "Failed to update username", (actor) =>
    actor.updateUsername(username)
  )
}

export function searchUsers(
  identity: Identity | undefined,
  search: string
): Promise<UserPublic[]> {
  return query(identity, (actor) => actor.searchUsers(search))
}

export async function resolveUsername(
  identity: Identity | undefined,
  name: string
): Promise<string | null> {
  const actor = await getWalletActor(identity)
  const [principal] = await actor.resolveUsername(name)
  return principal ? principal.toText() : null
}

export function claimProPerk(
  identity: Identity | undefined
): Promise<Outcome<boolean>> {
  return call<boolean>(identity, "Failed to claim perk", async (actor) => {
    const res = await actor.claim_pro_perk()
    if ("ok" in res && res.ok !== undefined) {
      return { ok: res.ok }
    }
    return { err: "err" in res && res.err ? res.err : "Failed to claim perk" }
  })
}

export function hasClaimedProPerk(
  identity: Identity | undefined
): Promise<boolean> {
  return query(identity, (actor) => actor.has_claimed_pro_perk())
}

