"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import type { TransactionPublic } from "@/services/types"

export function HomeRecentCard({ transactions }: { transactions: TransactionPublic[] }) {
  const t = useTranslations("dashboard")

  return (
    <Card className="hidden md:flex md:flex-col gap-0 py-0 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b">
        <CardTitle className="text-base font-semibold leading-none">{t("latestTransactions")}</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" className="h-7 px-0 text-xs text-muted-foreground hover:text-foreground" nativeButton={false} render={<Link href="/transactions" />}>
            {t("seeMore")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-auto p-0">
        <RecentTransactions transactions={transactions} embedded />
      </CardContent>
    </Card>
  )
}
