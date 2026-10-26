import type { Identity } from "@icp-sdk/core/agent"
import { call, query, optional, type Outcome } from "@/services/client"
import type { TokenPublic, LaunchFee } from "@/services/types"
import { TOKEN_DECIMALS, normalizeSymbol } from "@/lib/token/launch"

export type LaunchInput = {
  name: string
  symbol: string
  description: string
  logo?: string
  website?: string
  telegram?: string
  twitter?: string
  totalSupply: bigint
  immutable: boolean
}

export function launchToken(
  identity: Identity | undefined,
  input: LaunchInput
): Promise<Outcome<TokenPublic>> {
  return call(identity, "Launch failed", (actor) =>
    actor.launchToken({
      name: input.name.trim(),
      symbol: normalizeSymbol(input.symbol),
      description: input.description.trim(),
      logo: optional(input.logo),
      website: optional(input.website?.trim()),
      telegram: optional(input.telegram?.trim()),
      twitter: optional(input.twitter?.trim()),
      decimals: TOKEN_DECIMALS,
      totalSupply: input.totalSupply,
      immutable: input.immutable,
    })
  )
}

export function isSymbolAvailable(
  identity: Identity | undefined,
  symbol: string
): Promise<boolean> {
  return query(identity, (actor) => actor.isSymbolAvailable(normalizeSymbol(symbol)))
}

export function getLaunchFee(identity: Identity | undefined): Promise<LaunchFee> {
  return query(identity, (actor) => actor.getLaunchFee())
}

export function isLaunchReady(identity: Identity | undefined): Promise<boolean> {
  return query(identity, (actor) => actor.isTokenLaunchReady())
}

export function getMyTokens(
  identity: Identity | undefined,
  limit: number,
  offset: number
): Promise<TokenPublic[]> {
  return query(identity, (actor) => actor.getMyTokens(BigInt(limit), BigInt(offset)))
}

export function listTokens(
  identity: Identity | undefined,
  limit: number,
  offset: number
): Promise<TokenPublic[]> {
  return query(identity, (actor) => actor.listTokens(BigInt(limit), BigInt(offset)))
}

export function getTokenById(
  identity: Identity | undefined,
  id: string
): Promise<TokenPublic | null> {
  return query(identity, async (actor) => {
    const [token] = await actor.getTokenById(id)
    return token ?? null
  })
}

export function getTokenByLedger(
  identity: Identity | undefined,
  canisterId: string
): Promise<TokenPublic | null> {
  return query(identity, async (actor) => {
    const [token] = await actor.getToken(canisterId)
    return token ?? null
  })
}

export type LaunchStatus = "pending" | "active" | "failed"

export function statusOf(token: TokenPublic): LaunchStatus {
  if ("active" in token.status) return "active"
  if ("failed" in token.status) return "failed"
  return "pending"
}

export function failureReason(token: TokenPublic): string | null {
  return "failed" in token.status ? token.status.failed : null
}
