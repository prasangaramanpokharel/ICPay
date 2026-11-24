"use client"

import { useTranslations } from "next-intl"
import { BalanceCard } from "@/components/dashboard/balance-card"
import { DashboardActions } from "@/components/dashboard/dashboard-actions"
import { HomeHoldingsCard } from "@/components/dashboard/home-holdings-card"
import { HomeOverviewCard } from "@/components/dashboard/home-overview-card"
import { HomeRecentCard } from "@/components/dashboard/home-recent-card"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { UsernamePrompt } from "@/components/dashboard/username-prompt"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatE8s } from "@/lib/wallet/utils"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import { useDashboard, useLiveBalance, useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { useBalanceVisibility } from "@/components/wallet/balance-visibility-provider"

export function DashboardView() {
  const { price, refresh: refreshPrice } = useIcpPrice()
  const { data, error, isLoading, refresh: refreshDashboard } = useDashboard()
  const liveBalance = useLiveBalance()
  const refreshWallet = useRefreshWallet()
  const { hidden, toggleVisibility } = useBalanceVisibility()
  const t = useTranslations()

  const handleRefreshBalanceAndPrice = async () => {
    refreshWallet()
    void refreshDashboard()
    await refreshPrice()
  }

  if (isLoading && !data) return <DashboardSkeleton />

  if (error && !data) {
    return (
      <AppPage>
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : t("dashboard.loadFailed")}
          </AlertDescription>
        </Alert>
      </AppPage>
    )
  }

  if (!data) return null

  const balance = formatE8s(liveBalance ?? 0n)
  const username = data.user.username?.[0]

  return (
    <AppPage>
      <UsernamePrompt username={username} />

      <div className="space-y-6 md:hidden">
        <BalanceCard
          balance={balance}
          balanceE8s={liveBalance ?? 0n}
          price={price}
          hidden={hidden}
          onToggleHidden={toggleVisibility}
          onRefreshPrice={handleRefreshBalanceAndPrice}
          username={username}
        />
        <DashboardActions />
        <RecentTransactions transactions={data.recentTransactions} />
      </div>

      <div className="hidden gap-6 md:grid md:grid-cols-3">
        <div className="col-span-2 space-y-6">
          <HomeOverviewCard
            balance={balance}
            balanceE8s={liveBalance ?? 0n}
            price={price}
            hidden={hidden}
            onToggleHidden={toggleVisibility}
            onRefreshPrice={handleRefreshBalanceAndPrice}
            username={username}
          />
          <HomeHoldingsCard hidden={hidden} />
        </div>
        <div className="space-y-6">
          <HomeRecentCard transactions={data.recentTransactions} />
        </div>
      </div>
    </AppPage>
  )
}

function DashboardSkeleton() {
  return (
    <AppPage>
      <div className="space-y-6 md:hidden">
        <div className="rounded-(--radius) border border-border/70 bg-card/60 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="size-6 rounded-md" />
          </div>
          <div className="mt-5 space-y-2">
            <Skeleton className="h-10 w-44 rounded-lg" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
          <div className="mt-8 flex justify-around px-2">
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="size-11 rounded-full" />
              <Skeleton className="h-3 w-10 rounded-md" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="size-11 rounded-full" />
              <Skeleton className="h-3 w-12 rounded-md" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="size-11 rounded-full" />
              <Skeleton className="h-3 w-10 rounded-md" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-(--radius)" />
          ))}
        </div>
        <div className="rounded-(--radius) border border-border/70 bg-card/60 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden gap-6 md:grid md:grid-cols-3">
        <div className="col-span-2 space-y-6">
          <div className="rounded-(--radius) border border-border/70 bg-card/60 p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-28 rounded-md" />
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-4 w-32 rounded-md" />
              </div>
              <Skeleton className="size-28 rounded-full" />
            </div>
            <div className="mt-4 flex items-center justify-between pt-1">
              <Skeleton className="h-8 w-36 rounded-lg" />
              <Skeleton className="h-8 w-44 rounded-lg" />
            </div>
          </div>

          <div className="rounded-(--radius) border border-border/70 bg-card/60 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-md" />
            </div>
            <div className="p-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg p-2.5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-20 rounded-md" />
                      <Skeleton className="h-3 w-28 rounded-md" />
                    </div>
                  </div>
                  <div className="space-y-1.5 text-right flex flex-col items-end">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-(--radius) border border-border/70 bg-card/60 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
            <div className="p-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg p-2.5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-24 rounded-md" />
                      <Skeleton className="h-3 w-16 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppPage>
  )
}
