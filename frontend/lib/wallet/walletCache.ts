import { mutate as globalMutate } from "swr"
import type { Identity } from "@icp-sdk/core/agent"
import type { DashboardData, UserPublic } from "@/services/types"
import type { DepositAddress } from "@/services/deposit/deposit"
import { getDashboard } from "@/services/dashboard/dashboard"
import { getDepositAddress } from "@/services/deposit/deposit"
import { ICP_LEDGER_ID } from "@/services/tokens"

export function walletKey(identity: Identity | undefined, ...parts: string[]) {
  return identity ? ([...parts, identity.getPrincipal().toText()] as const) : null
}

export function balancesCacheKey(identity: Identity, customLedgerIds: string[]) {
  const customKey = [...customLedgerIds].sort().join(",")
  return walletKey(identity, "token-balances", customKey)
}

// In-memory cache keeps pre-resolved addresses and profiles available synchronously
// without relying on private or unstable SWR internals.
const inMemoryCache = new Map<string, unknown>()

function cacheKeyToString(key: readonly string[]): string {
  return key.join(":")
}

function readCached<T>(key: readonly string[]): T | undefined {
  return inMemoryCache.get(cacheKeyToString(key)) as T | undefined
}

function writeCached<T>(key: readonly string[], data: T): void {
  inMemoryCache.set(cacheKeyToString(key), data)
}

export function depositFromDashboard(data: DashboardData): DepositAddress {
  return {
    address: data.depositAddress,
    accountId: data.depositAccountIdentifier,
  }
}

export function seedDepositAndProfile(identity: Identity, data: DashboardData) {
  const depositKey = walletKey(identity, "deposit-address")
  const profileKey = walletKey(identity, "profile")
  const dashKey = walletKey(identity, "dashboard")
  const dashLedgerKey = walletKey(identity, "dashboard", ICP_LEDGER_ID)
  const deposit = depositFromDashboard(data)

  if (dashKey) writeCached(dashKey, data)
  if (dashLedgerKey) writeCached(dashLedgerKey, data)

  if (depositKey) {
    writeCached(depositKey, deposit)
    void globalMutate(depositKey, deposit, { revalidate: false })
  }
  if (profileKey) {
    writeCached(profileKey, data.user)
    void globalMutate(profileKey, data.user, { revalidate: false })
  }
}

export async function loadDashboard(identity: Identity): Promise<DashboardData> {
  const data = await getDashboard(identity)
  seedDepositAndProfile(identity, data)
  return data
}

function getCachedDashboard(identity: Identity): DashboardData | undefined {
  const dashKey = walletKey(identity, "dashboard")
  if (dashKey) {
    const cached = readCached<DashboardData>(dashKey)
    if (cached) return cached
  }
  const dashLedgerKey = walletKey(identity, "dashboard", ICP_LEDGER_ID)
  if (dashLedgerKey) {
    return readCached<DashboardData>(dashLedgerKey)
  }
  return undefined
}

export async function resolveDeposit(identity: Identity): Promise<DepositAddress> {
  const key = walletKey(identity, "deposit-address")
  if (!key) return getDepositAddress(identity)

  const cached = readCached<DepositAddress>(key)
  if (cached) return cached

  const cachedDash = getCachedDashboard(identity)
  if (cachedDash) {
    const deposit = depositFromDashboard(cachedDash)
    seedDepositAndProfile(identity, cachedDash)
    return deposit
  }

  const data = await getDashboard(identity)
  seedDepositAndProfile(identity, data)
  return depositFromDashboard(data)
}

export async function resolveProfile(identity: Identity): Promise<UserPublic | null> {
  const key = walletKey(identity, "profile")
  if (!key) {
    const { getProfile } = await import("@/services/profile/profile")
    return getProfile(identity)
  }

  const cached = readCached<UserPublic | null>(key)
  if (cached) return cached

  const cachedDash = getCachedDashboard(identity)
  if (cachedDash) {
    writeCached(key, cachedDash.user)
    void globalMutate(key, cachedDash.user, { revalidate: false })
    return cachedDash.user
  }

  const { getProfile } = await import("@/services/profile/profile")
  const user = await getProfile(identity)
  writeCached(key, user)
  void globalMutate(key, user, { revalidate: false })
  return user
}
