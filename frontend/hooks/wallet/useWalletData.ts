"use client"

import { useEffect, useMemo } from "react"
import useSWR, { useSWRConfig } from "swr"
import useSWRImmutable from "swr/immutable"
import { Principal } from "@icp-sdk/core/principal"
import { useAuth } from "@/components/auth/auth-provider"
import { readHoldings, writeHoldings, patchHoldings, cachedBalanceMap } from "@/lib/wallet/holdingsCache"
import {
  loadDashboard,
  resolveDeposit,
  resolveProfile,
  walletKey,
  balancesCacheKey,
} from "@/lib/wallet/walletCache"
import { getCustomLedgerIdsSnapshot, getCustomTokenMetaSnapshot } from "@/lib/wallet/customTokens"
import { useWalletLedgerIds } from "@/hooks/wallet/useWalletLedgerIds"
import { useTokenRegistry } from "@/lib/token/registry"
import { requiredBalance, requiredIcpSwapBalance, icpServiceDebit } from "@/lib/swap/utils"
import type { DashboardData, UserPublic } from "@/services/types"
import { getTransactions, getTransactionDetail } from "@/services/transactions/transactions"
import { resolveUsername, searchUsers, hasClaimedProPerk } from "@/services/profile/profile"
import { listBookmarks } from "@/services/bookmark/bookmark"
import { USERNAME_MIN_LENGTH } from "@/lib/profile/username"
import { checkUsername, getUsernameTreasury } from "@/services/buy/buy"
import { compareBySuggestion } from "@/lib/verified/premiumTick"
import { fetchAccountStats, type AccountStats } from "@/services/account/account"
import {
  fetchBalances,
  fetchTokenMetadata,
  custodialSubaccount,
  ICP_LEDGER_ID,
  PINNED_LEDGER_IDS,
  ICPAY_LEDGER_ID,
  metadataFromRegistry,
  mergeWalletLedgerIds,
  canMoveToCustody,
  type TokenHolding,
  type TokenMetadata,
} from "@/services/tokens"
import { fetchWalletBalances } from "@/lib/wallet/balanceSweep"

const keyFor = walletKey

function fallbackWalletLedgerIds(
  customLedgerIds: string[],
  seeded?: TokenHolding[]
): string[] {
  return mergeWalletLedgerIds(
    seeded?.map((h) => h.ledgerId) ?? [],
    customLedgerIds
  )
}

function seededHoldingsForLoad(
  principal: string | undefined,
  customLedgerIds: string[]
): TokenHolding[] | undefined {
  if (!principal) return undefined
  const saved = readHoldings(principal)
  if (!saved?.length) return undefined
  const allowed = new Set(fallbackWalletLedgerIds(customLedgerIds, saved))
  return saved.filter((h) => allowed.has(h.ledgerId))
}

const FETCH_ONCE = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  keepPreviousData: true,
  dedupingInterval: 300_000,
  errorRetryCount: 3,
} as const

export function useDashboard() {
  const { identity } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    keyFor(identity, "dashboard", ICP_LEDGER_ID),
    () => loadDashboard(identity!),
    FETCH_ONCE
  )

  return {
    data: data as DashboardData | undefined,
    error,
    isLoading,
    refresh: mutate,
  }
}

function useCustodian(): Principal | undefined {
  const { data: deposit } = useDepositAddress()
  return deposit?.address.owner
}

function useLedgerBalance(ledgerId: string | null) {
  const { identity } = useAuth()
  const custodian = useCustodian()
  const { cache, mutate } = useSWRConfig()
  const principal = identity?.getPrincipal().toText()
  const cachedBalance =
    principal && ledgerId ? cachedBalanceMap(principal).get(ledgerId) : undefined

  const { data, isLoading } = useSWR(
    ledgerId && custodian && identity ? keyFor(identity, "token-balance", ledgerId) : null,
    async () => {
      if (principal && ledgerId) {
        for (const serialized of cache.keys()) {
          if (typeof serialized !== "string") continue
          if (!serialized.includes("token-balances") || !serialized.includes(principal)) continue
          const row = cache.get(serialized)?.data as Map<string, bigint> | undefined
          if (row?.has(ledgerId)) return row.get(ledgerId)!
        }
      }

      const balances = await fetchBalances(
        [ledgerId!],
        custodian!,
        custodialSubaccount(identity!.getPrincipal()),
        identity
      )
      const balance = balances.get(ledgerId!) ?? 0n
      if (identity && ledgerId) {
        const tokenKey = keyFor(identity, "token-balance", ledgerId)
        if (tokenKey) void mutate(tokenKey, balance, { revalidate: false })
      }
      return balance
    },
    { revalidateOnFocus: false, keepPreviousData: true, dedupingInterval: 60_000 }
  )

  return {
    balance: data ?? cachedBalance,
    isLoading: isLoading && data === undefined && cachedBalance === undefined,
  }
}

export function useLiveBalance() {
  return useLedgerBalance(ICP_LEDGER_ID).balance
}

export function useSelfCustodyBalance(ledgerId: string | null) {
  const { identity } = useAuth()

  const { data } = useSWR(
    ledgerId && identity ? keyFor(identity, "self-custody", ledgerId) : null,
    async () => {
      const balances = await fetchBalances(
        [ledgerId!],
        identity!.getPrincipal(),
        undefined,
        identity
      )
      return balances.get(ledgerId!) ?? 0n
    },
    { revalidateOnFocus: false, keepPreviousData: true, dedupingInterval: 60_000 }
  )

  return data
}

export function useLedgerSupported(ledgerId: string | null) {
  const { identity } = useAuth()
  const principal = identity?.getPrincipal().toText()
  const customKey = principal ? getCustomLedgerIdsSnapshot(principal).join(",") : ""

  const { data, isLoading } = useSWR(
    ledgerId && identity ? keyFor(identity, "ledger-supported", ledgerId, customKey) : null,
    () => canMoveToCustody(identity, ledgerId!),
    { revalidateOnFocus: false, dedupingInterval: 300_000 }
  )

  return { supported: data, isLoading }
}

export function useDepositAddress() {
  const { identity } = useAuth()

  const { data, error, isLoading } = useSWRImmutable(
    keyFor(identity, "deposit-address"),
    () => resolveDeposit(identity!)
  )

  return { data, error, isLoading }
}

export function useTransactions(page = 0, pageSize = 20) {
  const { identity } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    keyFor(identity, "transactions", String(page), String(pageSize)),
    () => getTransactions(identity, page, pageSize),
    FETCH_ONCE
  )

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0n,
    error,
    isLoading,
    refresh: mutate,
  }
}

export function useTransactionDetail(txId: string | null) {
  const { identity } = useAuth()

  const { data, error, isLoading } = useSWR(
    txId ? keyFor(identity, "transaction", txId) : null,
    () => getTransactionDetail(identity, txId!),
    FETCH_ONCE
  )

  return { tx: data, error, isLoading }
}

const FUNDS_KEYS = [
  "dashboard",
  "token-balance",
  "transactions",
  "token-balances",
  "self-custody",
]

export function useRefreshWallet() {
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()

  return () => {
    if (!identity) return
    const principal = identity.getPrincipal().toText()
    mutate(
      (key) =>
        Array.isArray(key) &&
        key[key.length - 1] === principal &&
        FUNDS_KEYS.includes(key[0] as string),
      undefined,
      { revalidate: true }
    )
  }
}

export type SwapBalanceUpdate = {
  tokenInId: string
  tokenOutId: string
  amountIn: bigint
  amountOut: bigint
  tokenInFee: bigint
  icpFee: bigint
}

export function useApplySwapBalances() {
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()
  const refreshWallet = useRefreshWallet()

  return (update: SwapBalanceUpdate) => {
    if (!identity) return
    const principal = identity.getPrincipal().toText()
    const serviceDebit = icpServiceDebit(update.icpFee)
    const tokenDebit =
      update.tokenInId === ICP_LEDGER_ID
        ? requiredIcpSwapBalance(update.amountIn, update.tokenInFee, serviceDebit)
        : requiredBalance(update.amountIn, update.tokenInFee)

    const patchBalanceMap = (map: Map<string, bigint> | undefined) => {
      if (!map) return map
      const next = new Map(map)
      next.set(update.tokenInId, (next.get(update.tokenInId) ?? 0n) - tokenDebit)
      next.set(update.tokenOutId, (next.get(update.tokenOutId) ?? 0n) + update.amountOut)
      if (update.tokenInId !== ICP_LEDGER_ID) {
        next.set(ICP_LEDGER_ID, (next.get(ICP_LEDGER_ID) ?? 0n) - serviceDebit)
      }
      return next
    }

    const balancesKey = balancesCacheKey(identity, [])
    if (balancesKey) {
      mutate(balancesKey, patchBalanceMap, { revalidate: false })
    }
    mutate(
      (key) =>
        Array.isArray(key) &&
        key[0] === "token-balances" &&
        key[key.length - 1] === principal,
      patchBalanceMap,
      { revalidate: false }
    )

    const inKey = keyFor(identity, "token-balance", update.tokenInId)
    const outKey = keyFor(identity, "token-balance", update.tokenOutId)
    const icpKey = keyFor(identity, "token-balance", ICP_LEDGER_ID)
    if (inKey) {
      mutate(inKey, (bal: bigint | undefined) => (bal ?? 0n) - tokenDebit, { revalidate: false })
    }
    if (outKey) {
      mutate(outKey, (bal: bigint | undefined) => (bal ?? 0n) + update.amountOut, {
        revalidate: false,
      })
    }
    if (icpKey && update.tokenInId !== ICP_LEDGER_ID) {
      mutate(icpKey, (bal: bigint | undefined) => (bal ?? 0n) - serviceDebit, { revalidate: false })
    }

    const patches = [
      { ledgerId: update.tokenInId, delta: -tokenDebit },
      { ledgerId: update.tokenOutId, delta: update.amountOut },
    ]
    if (update.tokenInId !== ICP_LEDGER_ID) {
      patches.push({ ledgerId: ICP_LEDGER_ID, delta: -serviceDebit })
    }
    patchHoldings(principal, patches)

    refreshWallet()
  }
}

export function usePatchDashboardUser() {
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()

  return (user: UserPublic) => {
    const key = keyFor(identity, "dashboard")
    if (!key) return
    mutate(
      key,
      (current: DashboardData | undefined) =>
        current ? { ...current, user } : current,
      { revalidate: false }
    )
  }
}

export function useResolvedUsername(name: string) {
  const { identity } = useAuth()
  const trimmed = name.trim().toLowerCase()
  const enabled = trimmed.length >= USERNAME_MIN_LENGTH

  const { data, isLoading } = useSWR(
    enabled ? (["resolve-username", trimmed] as const) : null,
    () => resolveUsername(identity, trimmed),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      keepPreviousData: false,
      dedupingInterval: 60_000,
    }
  )

  return { principal: data ?? null, isLoading: enabled && isLoading }
}

export function useRecipientProfile(username: string, principal: string | null) {
  const { identity } = useAuth()
  const trimmed = username.trim().toLowerCase()
  const enabled = trimmed.length >= USERNAME_MIN_LENGTH && principal !== null

  const { data } = useSWR(
    enabled ? keyFor(identity, "search-users", trimmed) : null,
    () => searchUsers(identity, trimmed),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      keepPreviousData: false,
      dedupingInterval: 120_000,
    }
  )

  if (!data) return null
  return data.find((u) => u.username[0]?.toLowerCase() === trimmed) ?? null
}

export function useRecipientTxCount(principal: string | null) {
  const { identity } = useAuth()
  const { data } = useSWR(
    principal ? (["recipient-tx-count", principal] as const) : null,
    () => fetchAccountStats(principal!, undefined, identity).then((s) => s.txCount),
    { revalidateOnFocus: false, revalidateIfStale: false, dedupingInterval: 120_000 }
  )
  return data ?? null
}

export function useUsernameAvailability(name: string) {
  const { identity } = useAuth()
  const trimmed = name.trim().toLowerCase()

  const { data, isLoading } = useSWR(
    trimmed ? keyFor(identity, "check-username", trimmed) : null,
    () => checkUsername(identity, trimmed),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      keepPreviousData: false,
      dedupingInterval: 30_000,
    }
  )

  return { available: data ?? null, isLoading: trimmed !== "" && isLoading }
}

export function useUsernameTreasury() {
  const { identity } = useAuth()
  const { data } = useSWRImmutable(
    identity ? (["username-treasury"] as const) : null,
    () => getUsernameTreasury(identity)
  )
  return data ?? null
}

export function useUserSearch(search: string, limit = 10) {
  const { identity } = useAuth()
  const trimmed = search.trim().toLowerCase()
  const ownId = useOwnUserId()

  const { data, isLoading } = useSWR(
    keyFor(identity, "search-users", trimmed),
    () => searchUsers(identity, trimmed),
    { revalidateOnFocus: true, keepPreviousData: true, dedupingInterval: 2_000 }
  )

  return {
    users: dedupeById(data ?? [])
      .filter((u) => u.username.length > 0 && u.id !== ownId)
      .sort((a, b) => compareBySuggestion(a.username[0] ?? "", b.username[0] ?? ""))
      .slice(0, limit),
    isLoading: isLoading || ownId === undefined,
  }
}

export function useOwnProfile() {
  const { identity } = useAuth()
  return useSWRImmutable(keyFor(identity, "profile"), () => resolveProfile(identity!))
}

export function useBookmarks() {
  const { identity } = useAuth()
  const { data, mutate } = useSWR(
    keyFor(identity, "bookmarks"),
    () => listBookmarks(identity),
    { revalidateOnFocus: false, dedupingInterval: 30_000 }
  )
  return { bookmarks: data ?? [], mutate }
}

function useOwnUserId(): string | undefined {
  return useOwnProfile().data?.id
}

function dedupeById(users: UserPublic[]): UserPublic[] {
  const seen = new Set<string>()
  return users.filter((u) => !seen.has(u.id) && seen.add(u.id))
}

export function useTokenHoldings(customLedgerIds: string[] = []) {
  const { identity } = useAuth()
  const custodian = useCustodian()
  const registry = useTokenRegistry()
  const { mutate: globalMutate } = useSWRConfig()
  const principal = identity?.getPrincipal().toText()
  const cachedBalances = useMemo(() => cachedBalanceMap(principal), [principal])
  const seededHoldings = seededHoldingsForLoad(principal, customLedgerIds)
  const { ledgerIds: registryLedgerIds, isLoading: loadingLedgerIds } = useWalletLedgerIds()
  const balancesKey =
    custodian && identity && registryLedgerIds
      ? balancesCacheKey(identity, customLedgerIds)
      : null

  const syncBalanceCaches = (map: Map<string, bigint>) => {
    if (balancesKey) void globalMutate(balancesKey, map, { revalidate: false })
    if (!identity) return
    for (const [id, balance] of map) {
      const tokenKey = keyFor(identity, "token-balance", id)
      if (tokenKey) void globalMutate(tokenKey, balance, { revalidate: false })
    }
  }

  const { data: balances, isLoading: loadingBalances, mutate } = useSWR(
    balancesKey,
    async () => {
      const map = await fetchWalletBalances(
        registryLedgerIds!,
        customLedgerIds,
        custodian!,
        custodialSubaccount(identity!.getPrincipal()),
        identity
      )
      syncBalanceCaches(map)
      return map
    },
    { revalidateOnFocus: false, keepPreviousData: true, dedupingInterval: 60_000 }
  )

  const displayIds = balances ? [...balances.keys()].sort() : []

  const customMeta = principal ? getCustomTokenMetaSnapshot(principal) : new Map()
  const { data: metadata, isLoading: loadingMetadata } = useSWRImmutable(
    displayIds.length ? (["token-metadata", displayIds.join(",")] as const) : null,
    async () => {
      const entries = await Promise.all(
        displayIds.map(async (id) => {
          const cached = customMeta.get(id)
          if (cached) return [id, cached] as const
          const fromRegistry = registry ? metadataFromRegistry(id, registry) : null
          if (fromRegistry) return [id, fromRegistry] as const
          const meta = await fetchTokenMetadata(id, identity, registry ?? undefined)
          return meta ? ([id, meta] as const) : null
        })
      )
      return new Map(entries.flatMap((entry) => (entry ? [entry] : [])))
    }
  )

  const holdings: TokenHolding[] = displayIds.flatMap((ledgerId) => {
    const meta =
      metadata?.get(ledgerId) ??
      customMeta.get(ledgerId) ??
      (registry ? metadataFromRegistry(ledgerId, registry) : null) ??
      seededHoldings?.find((h) => h.ledgerId === ledgerId)
    if (!meta) return []
    const balance = balances?.has(ledgerId)
      ? balances.get(ledgerId)!
      : (cachedBalances.get(ledgerId) ?? 0n)
    return [{ ...meta, balance }]
  })

  useEffect(() => {
    if (!principal || !balances || holdings.length === 0) return
    writeHoldings(principal, holdings)
  }, [principal, balances, holdings.map((h) => `${h.ledgerId}:${h.balance}`).join(",")]) // eslint-disable-line react-hooks/exhaustive-deps

  const seeded = holdings.length === 0 && seededHoldings?.length ? seededHoldings : undefined
  const shown = seeded ?? holdings

  return {
    holdings: shown.slice().sort((a, b) => {
      if (a.ledgerId === ICP_LEDGER_ID) return -1
      if (b.ledgerId === ICP_LEDGER_ID) return 1
      if (a.ledgerId === ICPAY_LEDGER_ID) return -1
      if (b.ledgerId === ICPAY_LEDGER_ID) return 1
      if (a.balance > 0n !== b.balance > 0n) return a.balance > 0n ? -1 : 1
      const pinnedA = PINNED_LEDGER_IDS.includes(a.ledgerId)
      if (pinnedA !== PINNED_LEDGER_IDS.includes(b.ledgerId)) return pinnedA ? -1 : 1
      return a.symbol.localeCompare(b.symbol)
    }),
    isLoading:
      shown.length === 0 &&
      (loadingBalances || loadingLedgerIds) &&
      !balances &&
      (loadingMetadata || displayIds.length === 0),
    refresh: () => void mutate(),
  }
}

function getMetaFromBatchCache(
  cache: ReturnType<typeof useSWRConfig>["cache"],
  ledgerId: string
): TokenMetadata | undefined {
  for (const key of cache.keys()) {
    if (typeof key !== "string") continue
    if (!key.includes("token-metadata") || key.includes("token-metadata-one")) continue
    const row = cache.get(key)?.data as Map<string, TokenMetadata> | undefined
    if (row instanceof Map && row.has(ledgerId)) return row.get(ledgerId)!
  }
  return undefined
}

export function useLedgerSymbol(ledgerId: string): { symbol: string; decimals: number } {
  const { identity } = useAuth()
  const { cache } = useSWRConfig()
  const registry = useTokenRegistry()
  const fromRegistry = registry ? metadataFromRegistry(ledgerId, registry) : null
  const fromBatch = getMetaFromBatchCache(cache, ledgerId)

  const { data } = useSWRImmutable(
    !fromRegistry && !fromBatch ? (["token-metadata-one", ledgerId] as const) : null,
    () => fetchTokenMetadata(ledgerId, identity, registry)
  )

  const principal = identity?.getPrincipal().toText()
  const cached = data
    ? undefined
    : principal
      ? readHoldings(principal)?.find((h) => h.ledgerId === ledgerId)
      : undefined
  const meta = fromRegistry ?? fromBatch ?? data ?? cached

  return { symbol: meta?.symbol ?? "ICP", decimals: meta?.decimals ?? 8 }
}

export function useTokenHolding(ledgerId: string | null) {
  const { identity } = useAuth()
  const { cache } = useSWRConfig()
  const registry = useTokenRegistry()
  const { balance, isLoading: loadingBalance } = useLedgerBalance(ledgerId)
  const fromRegistry = ledgerId && registry ? metadataFromRegistry(ledgerId, registry) : null
  const fromBatch = ledgerId ? getMetaFromBatchCache(cache, ledgerId) : undefined

  const { data: meta, isLoading: loadingMeta } = useSWRImmutable(
    ledgerId && !fromRegistry && !fromBatch ? (["token-metadata-one", ledgerId] as const) : null,
    () => fetchTokenMetadata(ledgerId!, identity, registry)
  )

  const principal = identity?.getPrincipal().toText()
  const cached =
    !meta && !fromBatch && ledgerId && principal
      ? readHoldings(principal)?.find((h) => h.ledgerId === ledgerId)
      : undefined

  const resolvedMeta = fromRegistry ?? fromBatch ?? meta
  const token: TokenHolding | undefined = resolvedMeta
    ? { ...resolvedMeta, balance: balance ?? cached?.balance ?? 0n }
    : cached

  return {
    token,
    isLoading: !cached && !fromBatch && (loadingMeta || (loadingBalance && balance === undefined)),
  }
}

export function useAccountStats(owner: string | null) {
  const { identity } = useAuth()
  const custodian = useCustodian()?.toText()

  const { data, isLoading } = useSWR(
    owner && custodian ? (["account-stats", owner, custodian] as const) : null,
    async () => {
      const stats = await fetchAccountStats(
        custodian!,
        custodialSubaccount(Principal.fromText(owner!)),
        identity
      )
      writeCachedStats(owner!, stats)
      return stats
    },
    {
      fallbackData: owner ? readCachedStats(owner) : undefined,
      revalidateOnFocus: false,
      keepPreviousData: false,
      dedupingInterval: 60_000,
    }
  )

  return { stats: data, isLoading: isLoading && !data }
}

const STATS_KEY = "icpay:stats:"

function readCachedStats(owner: string): AccountStats | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const raw = localStorage.getItem(STATS_KEY + owner)
    if (!raw) return undefined
    const j = JSON.parse(raw)
    return {
      balance: BigInt(j.balance),
      txCount: j.txCount,
      firstBlock: j.firstBlock === null ? undefined : BigInt(j.firstBlock),
      lastBlock: j.lastBlock === null ? undefined : BigInt(j.lastBlock),
    }
  } catch {
    return undefined
  }
}

function writeCachedStats(owner: string, s: AccountStats) {
  try {
    localStorage.setItem(
      STATS_KEY + owner,
      JSON.stringify({
        balance: s.balance.toString(),
        txCount: s.txCount,
        firstBlock: s.firstBlock?.toString() ?? null,
        lastBlock: s.lastBlock?.toString() ?? null,
      })
    )
  } catch {
  }
}

export function useTokenPrices(...args: unknown[]) {
  void args
  return { prices: new Map<string, { priceUsd: number }>(), isLoading: false }
}

export function useProPerkClaimed() {
  const { identity } = useAuth()
  const { data, isLoading, mutate } = useSWR(
    identity ? ["pro-perk-claimed", identity.getPrincipal().toText()] : null,
    () => hasClaimedProPerk(identity),
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  )
  return { claimed: data === true, isLoading, refresh: mutate }
}

