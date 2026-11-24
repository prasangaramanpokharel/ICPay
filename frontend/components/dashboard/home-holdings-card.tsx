"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { TokenLogo } from "@/components/token/token-logo"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { useTokenHoldings } from "@/hooks/wallet/useWalletData"
import { useBalanceVisibility } from "@/components/wallet/balance-visibility-provider"
import { cn } from "@/lib/ui/utils"

export function HomeHoldingsCard({ hidden: hiddenProp }: { hidden?: boolean } = {}) {
  const t = useTranslations("wallet")
  const tDash = useTranslations("dashboard")
  const { hidden: globalHidden } = useBalanceVisibility()
  const hidden = hiddenProp ?? globalHidden
  const { holdings, isLoading } = useTokenHoldings()
  const top = holdings.slice(0, 5)

  return (
    <Card className="hidden md:flex gap-0 py-0 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b">
        <CardTitle className="text-base font-semibold leading-none">{t("tokens")}</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" className="h-7 px-0 text-xs text-muted-foreground hover:text-foreground" nativeButton={false} render={<Link href="/wallet" />}>
            {tDash("seeMore")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && top.length === 0 ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3">
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
        ) : top.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyTitle>{t("noTokens")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="divide-y divide-border">
            {top.map((token) => (
              <div key={token.ledgerId} className="px-6">
                <Link
                  href={`/wallet?token=${token.ledgerId}`}
                  className="flex items-center justify-between py-3 -mx-2 px-2 rounded-lg hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <TokenLogo token={token} className="size-8 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{token.symbol}</p>
                      <p className="truncate text-xs text-muted-foreground">{token.name}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-end">
                    <span
                      className={cn(
                        "text-sm font-medium tabular-nums",
                        token.balance === 0n ? "text-muted-foreground" : "text-foreground"
                      )}
                    >
                      {hidden ? "••••••" : formatTokenAmount(token.balance, token.decimals, 4)}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
