"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { TokenLogo } from "@/components/token/token-logo"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { useTokenHoldings } from "@/hooks/wallet/useWalletData"

export function HomeHoldingsCard({ hidden = false }: { hidden?: boolean }) {
  const t = useTranslations("wallet")
  const tDash = useTranslations("dashboard")
  const { holdings, isLoading } = useTokenHoldings()
  const top = holdings.slice(0, 5)

  return (
    <Card className="hidden md:flex">
      <CardHeader className="border-b">
        <CardTitle>{t("tokens")}</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/wallet" />}>
            {tDash("seeMore")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="p-3">
        {isLoading && top.length === 0 ? (
          <div className="space-y-3 p-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : top.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyTitle>{t("noTokens")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <ItemGroup className="gap-1">
            {top.map((token) => (
              <Item
                key={token.ledgerId}
                size="sm"
                className="rounded-xl px-3 py-2.5 hover:bg-muted/50 transition-colors"
                render={<Link href={`/wallet?token=${token.ledgerId}`} />}
              >
                <ItemMedia>
                  <TokenLogo token={token} className="size-8" />
                </ItemMedia>
                <ItemContent className="min-w-0 flex-1 gap-0">
                  <ItemTitle className="text-sm font-medium">{token.symbol}</ItemTitle>
                  <ItemDescription className="text-xs text-muted-foreground">{token.name}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <span className="font-mono text-sm tabular-nums text-foreground/90">
                    {hidden ? "••••" : formatTokenAmount(token.balance, token.decimals, 4)}
                  </span>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  )
}
