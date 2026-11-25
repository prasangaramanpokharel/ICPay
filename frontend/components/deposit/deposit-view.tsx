"use client"

import { useMemo, useEffect } from "react"
import { DepositAddressCard } from "@/components/deposit/deposit-address-card"
import { useTranslations } from "next-intl"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { useDepositAddress } from "@/hooks/wallet/useWalletData"
import { useAuth } from "@/components/auth/auth-provider"
import { useEffectivePrincipal } from "@/lib/auth/lastPrincipal"
import { readCache, writeCache } from "@/lib/cache/persistCache"
import { ICP_LEDGER_ID } from "@/services/tokens"
import { resolveTokenIcon } from "@/lib/token/icon"
import { useTokenRegistry } from "@/lib/token/registry"
import { icrc1Account } from "@/lib/wallet/accountId"
import { copyText } from "@/lib/wallet/utils"

type CachedDeposit = {
  icrcAddress: string
  accountId: string
}

const DEPOSIT_CACHE_TTL = 30 * 24 * 60 * 60 * 1000

export function DepositView() {
  const t = useTranslations("deposit")
  const { data, error, isLoading } = useDepositAddress()
  const { identity, isLoading: authLoading } = useAuth()
  const { principal } = useEffectivePrincipal()
  const registry = useTokenRegistry()
  const icpIcon = resolveTokenIcon(ICP_LEDGER_ID, undefined, registry)

  const cacheKey = principal ? `icpay:wallet:deposit-strings:${principal}` : null

  const cached = useMemo(() => {
    if (!cacheKey) return undefined
    return readCache<CachedDeposit>(cacheKey, DEPOSIT_CACHE_TTL)
  }, [cacheKey])

  const icrcAddress = data
    ? icrc1Account(data.address.owner, data.address.subaccount[0])
    : cached?.icrcAddress ?? ""

  const accountId = data?.accountId ?? cached?.accountId ?? ""

  useEffect(() => {
    if (cacheKey && data) {
      const derivedIcrc = icrc1Account(data.address.owner, data.address.subaccount[0])
      writeCache(cacheKey, {
        icrcAddress: derivedIcrc,
        accountId: data.accountId,
      })
    }
  }, [cacheKey, data])

  const hasAddress = Boolean(icrcAddress)
  const isResolving = (isLoading || authLoading) && !hasAddress && !error

  return (
    <AppPage title={t("title")} description={t("subtitle")}>
      {isResolving ? (
        <div className="mx-auto w-full max-w-md space-y-4 rounded-(--radius) border border-border/70 bg-card p-6 shadow-xs">
          <Skeleton className="h-9 w-full rounded-(--radius)" />
          <div className="flex flex-col items-center justify-center p-4">
            <Skeleton className="size-48 rounded-(--radius)" />
          </div>
          <div className="space-y-2 rounded-(--radius) bg-muted/40 p-3.5">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
          </div>
          <Skeleton className="h-9 w-full rounded-(--radius)" />
        </div>
      ) : error && !hasAddress ? (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : t("loadFailed")}
          </AlertDescription>
        </Alert>
      ) : (
        <DepositAddressCard
          accountId={accountId}
          icrcAddress={icrcAddress}
          principal={principal ?? identity?.getPrincipal().toText()}
          logo={icpIcon}
          onCopy={copyText}
        />
      )}
    </AppPage>
  )
}
