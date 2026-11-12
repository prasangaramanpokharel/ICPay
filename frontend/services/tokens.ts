import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { IcrcLedgerCanister, mapTokenMetadata } from "@icp-sdk/canisters/ledger/icrc"
import { createAgent } from "@/services/icp"
import { fetchSnsRegistryList } from "@/services/sns/registry"
import { query } from "@/services/client"
import { getCustomLedgerIdsSnapshot } from "@/lib/wallet/customTokens"
import { resolveTokenDisplayName } from "@/lib/wallet/utils"
import { getTokenByLedger, listTokens, statusOf } from "@/services/launch/launch"
import { fetchTokenRegistry, type TokenMarket } from "@/lib/token/registry"

export const ICP_LEDGER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai"

export const ICPAY_LEDGER_ID = "5fsnk-rqaaa-aaaan-q6m4q-cai"

export const PINNED_LEDGER_IDS = [
  ICP_LEDGER_ID,
  ICPAY_LEDGER_ID,
  "mxzaz-hqaaa-aaaar-qaada-cai",
  "ss2fx-dyaaa-aaaar-qacoq-cai",
  "xevnm-gaaaa-aaaar-qafnq-cai",
  "cngnf-vqaaa-aaaar-qag4q-cai",
]

const LAUNCHED_TOKEN_LIMIT = 50

export type TokenHolding = {
  ledgerId: string
  balance: bigint
  symbol: string
  name: string
  decimals: number
  fee: bigint
  logo?: string
}

export type TokenMetadata = Omit<TokenHolding, "balance">

export function metadataLedgerIds(balances: Map<string, bigint>): string[] {
  return [...balances.keys()].sort()
}

export function visibleMetadataLedgerIds(balances: Map<string, bigint>): string[] {
  return [...balances.entries()]
    .filter(([id, balance]) => balance > 0n || PINNED_LEDGER_IDS.includes(id))
    .map(([id]) => id)
    .sort()
}

export function mergeWalletLedgerIds(registryIds: string[], customLedgerIds: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of [...PINNED_LEDGER_IDS, ...registryIds, ...customLedgerIds]) {
    if (!seen.has(id)) {
      seen.add(id)
      out.push(id)
    }
  }
  return out.sort()
}

export function metadataFromRegistry(
  ledgerId: string,
  registry: Map<string, TokenMarket>
): TokenMetadata | null {
  const row = registry.get(ledgerId)
  if (!row) return null
  const { symbol, name, decimals, fee, logo } = row
  return { ledgerId, symbol, name, decimals, fee, logo }
}

export function custodialSubaccount(user: Principal): Uint8Array {
  const bytes = user.toUint8Array()
  const out = new Uint8Array(32)
  const padding = 32 - bytes.length - 1
  out[padding] = bytes.length
  out.set(bytes, padding + 1)
  return out
}

export function isLedgerSupported(
  identity: Identity | undefined,
  ledgerId: string
): Promise<boolean> {
  return query(identity, (actor) => actor.isLedgerSupported(ledgerId))
}

export async function canMoveToCustody(
  identity: Identity | undefined,
  ledgerId: string
): Promise<boolean> {
  if (await isLedgerSupported(identity, ledgerId)) return true
  const token = await getTokenByLedger(identity, ledgerId)
  if (token !== null && statusOf(token) === "active") return true
  if (identity) {
    const custom = getCustomLedgerIdsSnapshot(identity.getPrincipal().toText())
    if (custom.includes(ledgerId)) return true
  }
  return false
}

export function listLaunchedLedgerIds(identity?: Identity): Promise<string[]> {
  return (
    listTokens(identity, LAUNCHED_TOKEN_LIMIT, 0)
      .then((tokens) => tokens.flatMap((t) => t.ledgerId))
      .catch((): string[] => [])
  )
}

async function listSnsLedgerIds(identity?: Identity): Promise<string[]> {
  const rows = await fetchSnsRegistryList(identity)
  return rows.map((row) => row.ledgerId)
}

export async function listLedgerIds(identity?: Identity): Promise<string[]> {
  const [sns, launched] = await Promise.all([
    listSnsLedgerIds(identity),
    listLaunchedLedgerIds(identity),
  ])

  const seen = new Set(PINNED_LEDGER_IDS)
  return [
    ...PINNED_LEDGER_IDS,
    ...[...sns, ...launched].filter((id) => !seen.has(id) && seen.add(id)),
  ]
}

export async function fetchBalances(
  ledgerIds: string[],
  owner: Principal,
  subaccount: Uint8Array | undefined,
  identity?: Identity
): Promise<Map<string, bigint>> {
  const agent = await createAgent(identity)

  const entries = await Promise.all(
    ledgerIds.map(async (ledgerId): Promise<[string, bigint]> => {
      try {
        const ledger = IcrcLedgerCanister.create({
          agent,
          canisterId: Principal.fromText(ledgerId),
        })
        const balance = await ledger.balance({
          owner,
          subaccount,
          certified: false,
        })
        return [ledgerId, balance]
      } catch {
        return [ledgerId, 0n]
      }
    })
  )

  return new Map(entries)
}

export async function fetchTokenMetadata(
  ledgerId: string,
  identity?: Identity,
  registry?: Map<string, TokenMarket>
): Promise<TokenMetadata | null> {
  try {
    const reg = registry ?? (await fetchTokenRegistry())
    const fromRegistry = metadataFromRegistry(ledgerId, reg)
    if (fromRegistry) return fromRegistry
  } catch {}

  try {
    const agent = await createAgent(identity)
    const ledger = IcrcLedgerCanister.create({
      agent,
      canisterId: Principal.fromText(ledgerId),
    })
    const meta = mapTokenMetadata(await ledger.metadata({ certified: false }))
    if (!meta) return null

    return {
      ledgerId,
      symbol: meta.symbol,
      name: resolveTokenDisplayName(meta.symbol, meta.name),
      decimals: meta.decimals,
      fee: meta.fee,
      logo: meta.icon?.startsWith("data:") ? meta.icon : undefined,
    }
  } catch {
    return null
  }
}
