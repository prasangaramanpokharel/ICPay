"use client"

import useSWR from "swr"
import { resolveTokenDisplayName } from "@/lib/wallet/utils"

const REGISTRY_URL = "https://icrc-api.internetcomputer.org/api/v2/ledgers?limit=100"

export type TokenMarket = {
  ledgerId: string
  symbol: string
  name: string
  decimals: number
  fee: bigint
  logo?: string
  priceUsd?: number
}

type RegistryRow = {
  ledger_canister_id?: string
  token_value?: { price?: number | null } | null
  icrc1_metadata?: Record<string, string | null> | null
}

function toRow(r: RegistryRow): TokenMarket | null {
  const ledgerId = r.ledger_canister_id
  const md = r.icrc1_metadata
  const symbol = md?.icrc1_symbol
  if (!ledgerId || !symbol) return null

  const decimals = Number(md?.icrc1_decimals)
  const price = r.token_value?.price
  const logo = md?.icrc1_logo

  return {
    ledgerId,
    symbol,
    name: resolveTokenDisplayName(symbol, md?.icrc1_name ?? undefined),
    decimals: Number.isFinite(decimals) ? decimals : 8,
    fee: md?.icrc1_fee ? BigInt(md.icrc1_fee) : 0n,
    logo: logo?.startsWith("https://") || logo?.startsWith("data:") ? logo : undefined,
    priceUsd: typeof price === "number" ? price : undefined,
  }
}

export async function fetchTokenRegistry(): Promise<Map<string, TokenMarket>> {
  if (!inFlight) {
    inFlight = loadRegistry().finally(() => {
      inFlight = null
    })
  }
  return inFlight
}

let inFlight: Promise<Map<string, TokenMarket>> | null = null

async function loadRegistry(): Promise<Map<string, TokenMarket>> {
  const res = await fetch(REGISTRY_URL)
  if (!res.ok) throw new Error(String(res.status))
  const json: { data?: RegistryRow[] } = await res.json()
  const rows = (json.data ?? []).flatMap((r) => {
    const row = toRow(r)
    return row ? [[row.ledgerId, row] as const] : []
  })
  return new Map(rows)
}

const REGISTRY_KEY = "token-registry"

export function useTokenRegistry(): Map<string, TokenMarket> | undefined {
  const { data } = useSWR(REGISTRY_KEY, fetchTokenRegistry, {
    dedupingInterval: 300_000,
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false,
  })

  return data
}
