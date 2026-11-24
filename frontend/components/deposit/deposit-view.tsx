"use client"

import { DepositAddressCard } from "@/components/deposit/deposit-address-card"
import { useTranslations } from "next-intl"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { useDepositAddress } from "@/hooks/wallet/useWalletData"
import { useAuth } from "@/components/auth/auth-provider"
import { ICP_LEDGER_ID } from "@/services/tokens"
import { resolveTokenIcon } from "@/lib/token/icon"
import { useTokenRegistry } from "@/lib/token/registry"
import { icrc1Account } from "@/lib/wallet/accountId"
import { copyText } from "@/lib/wallet/utils"

export function DepositView() {
  const t = useTranslations("deposit")
  const { data, error, isLoading } = useDepositAddress()
  const { identity } = useAuth()
  const registry = useTokenRegistry()
  const icpIcon = resolveTokenIcon(ICP_LEDGER_ID, undefined, registry)

  const icrcAddress = data ? icrc1Account(data.address.owner, data.address.subaccount[0]) : ""
  const accountId = data?.accountId ?? ""

  return (
    <AppPage title={t("title")} description={t("subtitle")}>
      {isLoading ? (
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
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : t("loadFailed")}
          </AlertDescription>
        </Alert>
      ) : (
        <DepositAddressCard
          accountId={accountId}
          icrcAddress={icrcAddress}
          principal={identity?.getPrincipal().toText()}
          logo={icpIcon}
          onCopy={copyText}
        />
      )}
    </AppPage>
  )
}
