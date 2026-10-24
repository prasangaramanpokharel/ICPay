import type { Identity } from "@icp-sdk/core/agent"
import { call, query, type Outcome } from "@/services/client"
import type { Purchase } from "@/services/types"

export function getUsernameTreasury(identity: Identity | undefined): Promise<string> {
  return query(identity, async (actor) => (await actor.getUsernameTreasury()).toText())
}

export function purchaseUsername(
  identity: Identity | undefined,
  name: string
): Promise<Outcome<Purchase>> {
  return call(identity, "Purchase failed", (actor) => actor.purchaseUsername(name))
}

export function getUsernamePrice(
  identity: Identity | undefined,
  name: string
): Promise<bigint> {
  return query(identity, (actor) => actor.getUsernamePrice(name))
}

export function checkUsername(
  identity: Identity | undefined,
  name: string
): Promise<boolean> {
  return query(identity, (actor) => actor.checkUsername(name))
}
