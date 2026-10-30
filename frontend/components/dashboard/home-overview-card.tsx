"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { IcpPrice } from "@/lib/market/icpPrice"
import { useFiatValue } from "@/hooks/fiat/useFiatValue"
import { PremiumBadge } from "@/components/verified/premium-badge"
import { CopyIconIndicator } from "@/components/ui/copy-button"
import { copyText } from "@/lib/wallet/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { ViewOffIcon, ViewIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/ui/utils"

const E8S = 100_000_000

type HomeOverviewCardProps = {
  balance: string
  balanceE8s: bigint
  price: IcpPrice | null
  hidden: boolean
  onToggleHidden: () => void
  onRefreshPrice: () => Promise<void>
  username?: string
}

export function HomeOverviewCard({
  balance,
  balanceE8s,
  price,
  hidden,
  onToggleHidden,
  onRefreshPrice,
  username,
}: HomeOverviewCardProps) {
  const t = useTranslations("dashboard")
  const tWallet = useTranslations("wallet")
  const tCommon = useTranslations("common")
  const [copied, setCopied] = useState(false)
  const usdValue = price ? (Number(balanceE8s) / E8S) * price.usd : null
  const fiat = useFiatValue(usdValue)

  const handleCopyUsername = async () => {
    if (!username) return
    await copyText(username)
    setCopied(true)
    toast.success("Username copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="hidden md:flex gap-0 py-0 overflow-hidden">
      <CardHeader className="border-b px-6 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{tWallet("subtitle")}</CardTitle>
            <CardDescription>{tWallet("tokens")}</CardDescription>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onToggleHidden} aria-label={hidden ? t("showBalance") : t("hideBalance")}>
            <HugeiconsIcon icon={hidden ? ViewOffIcon : ViewIcon} className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
        {username ? (
          <button
            type="button"
            onClick={() => void handleCopyUsername()}
            title="Click to copy username"
            className="group inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 -ml-2 font-mono text-sm font-semibold tracking-tight text-muted-foreground hover:text-foreground hover:bg-muted active:scale-98 transition-all cursor-pointer w-fit"
          >
            <span className="truncate">{username}</span>
            <PremiumBadge name={username} className="size-3.5" />
            <CopyIconIndicator copied={copied} iconClassName="size-3 text-muted-foreground group-hover:text-foreground" />
          </button>
        ) : null}
      </CardHeader>
      <CardContent className="px-6 py-5 space-y-4">
        <div>
          <Button
            variant="ghost"
            onClick={() => void onRefreshPrice()}
            title="Click to refresh balance & price"
            className="h-auto p-0 text-4xl font-semibold tracking-tight tabular-nums hover:bg-transparent hover:opacity-80 active:opacity-60 cursor-pointer text-foreground"
          >
            {hidden ? "•• •••• ••••" : balance}
            <span className="ml-2 text-lg font-medium text-muted-foreground">ICP</span>
          </Button>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => void onRefreshPrice()}
              title="Click to refresh balance & price"
              className="text-base font-medium tabular-nums text-foreground/80 hover:text-foreground cursor-pointer transition active:scale-95 text-left border-0 bg-transparent p-0"
            >
              {hidden || !fiat.formatted ? "••••" : `≈ ${fiat.symbol} ${fiat.formatted}`}
            </button>
            <div className="flex items-center gap-2">
              {!hidden && price && (
                <span className="text-sm font-medium tabular-nums text-muted-foreground">
                  1 ICP = {price.usd.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </span>
              )}
              {!hidden && price && price.change24h !== 0 && (
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    price.change24h > 0 ? "text-success" : "text-destructive"
                  )}
                >
                  {price.change24h > 0 ? "+" : ""}
                  {price.change24h.toFixed(2)}%
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button nativeButton={false} render={<Link href="/deposit" />}>
            {tCommon("receive")}
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/transfer" />}>
            {tCommon("send")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
