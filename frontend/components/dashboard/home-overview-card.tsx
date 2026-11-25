"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletAllocation } from "@/components/wallet/wallet-allocation"
import type { Holding, UnpricedHolding } from "@/lib/allocation"
import type { IcpPrice } from "@/lib/market/icpPrice"
import { useFiatValue } from "@/hooks/fiat/useFiatValue"
import { PremiumBadge } from "@/components/verified/premium-badge"
import { CopyIconIndicator } from "@/components/ui/copy-button"
import { copyText, formatTokenAmount } from "@/lib/wallet/utils"
import { useTokenHoldings } from "@/hooks/wallet/useWalletData"
import { useTokenRegistry } from "@/lib/token/registry"
import { Icon } from "@/components/ui/icon"
import { EyeGlassIcon, EyeOffGlassIcon } from "@thesvg/ui-react"

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
  const tQuickPay = useTranslations("quickPay.purposes")
  const [copied, setCopied] = useState(false)
  const { holdings } = useTokenHoldings()
  const registry = useTokenRegistry()
  const usdValue = price ? (Number(balanceE8s) / E8S) * price.usd : null
  const fiat = useFiatValue(usdValue)

  const pricedHoldings = useMemo<Holding[]>(() => {
    const list: Holding[] = []
    const rate = fiat.rate ?? 1
    const icpAmount = Number(balanceE8s) / E8S
    const icpVal = price && price.usd > 0 ? icpAmount * price.usd * rate : 0
    if (icpVal > 0) {
      list.push({ symbol: "ICP", value: icpVal })
    }

    for (const h of holdings) {
      if (h.symbol === "ICP") continue
      const amt = Number(h.balance) / 10 ** h.decimals
      if (amt <= 0) continue
      const p = registry?.get(h.ledgerId)?.priceUsd
      if (!p || p <= 0) continue
      list.push({ symbol: h.symbol, value: amt * p * rate })
    }
    return list
  }, [balanceE8s, price, holdings, registry, fiat.rate])

  const unpricedHoldings = useMemo<UnpricedHolding[]>(() => {
    const list: UnpricedHolding[] = []
    for (const h of holdings) {
      if (h.symbol === "ICP") continue
      if (h.balance <= 0n) continue
      const p = registry?.get(h.ledgerId)?.priceUsd
      if (!p || p <= 0) {
        list.push({
          symbol: h.symbol,
          amount: formatTokenAmount(h.balance, h.decimals, 4),
        })
      }
    }
    return list
  }, [holdings, registry])

  const handleCopyUsername = async () => {
    if (!username) return
    await copyText(username)
    setCopied(true)
    toast.success("Username copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const displayBalance = formatTokenAmount(balanceE8s, 8, 4)

  return (
    <Card className="hidden md:flex gap-0 py-0 overflow-hidden">
      <CardHeader className="border-b px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold leading-none">{tWallet("title")}</CardTitle>
          <Button variant="ghost" size="icon-sm" onClick={onToggleHidden} aria-label={hidden ? t("showBalance") : t("hideBalance")}>
            <Icon icon={hidden ? EyeOffGlassIcon : EyeGlassIcon} className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
        {username ? (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => void handleCopyUsername()}
            aria-label="Copy username"
            title="Click to copy username"
            className="group -ml-2 h-7 w-fit gap-1.5 font-mono text-sm font-semibold tracking-tight text-muted-foreground hover:text-foreground"
          >
            <span className="truncate">{username}</span>
            <PremiumBadge name={username} className="size-3.5" />
            <CopyIconIndicator copied={copied} iconClassName="size-3 text-muted-foreground group-hover:text-foreground" />
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="px-6 py-5">
        <div className="grid gap-6 lg:grid-cols-2 items-center">
          <div className="space-y-4">
            <div>
              <Button
                variant="ghost"
                onClick={() => void onRefreshPrice()}
                title="Click to refresh balance & price"
                className="h-auto p-0 inline-flex items-baseline text-4xl font-semibold tracking-tight tabular-nums hover:bg-transparent hover:opacity-80 active:opacity-60 cursor-pointer text-foreground"
              >
                <span>{hidden ? "••••••" : displayBalance}</span>
                <span className="ml-2 text-lg font-medium text-muted-foreground">ICP</span>
              </Button>
              <div className="mt-1.5 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => void onRefreshPrice()}
                  title="Click to refresh balance & price"
                  className="h-auto p-0 text-base font-medium tabular-nums text-foreground/80 hover:bg-transparent hover:text-foreground"
                >
                  {hidden || !fiat.formatted ? "••••••" : `${fiat.symbol}${fiat.formatted}`}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button nativeButton={false} render={<Link href="/transfer" />}>
                {tCommon("send")}
              </Button>
              <Button variant="outline" nativeButton={false} render={<Link href="/deposit" />}>
                {tCommon("receive")}
              </Button>
              <Button variant="outline" nativeButton={false} render={<Link href="/trade" />}>
                {tCommon("swap")}
              </Button>
            </div>
          </div>

          <div className="w-full">
            <WalletAllocation
              holdings={pricedHoldings}
              unpricedHoldings={unpricedHoldings}
              hidden={hidden}
              formatValue={(val) =>
                fiat.symbol ? `${fiat.symbol}${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${val.toFixed(2)}`
              }
              formatTotal={(val) =>
                fiat.symbol ? `${fiat.symbol}${val >= 1000 ? (val / 1000).toFixed(1) + "k" : val.toFixed(2)}` : `$${val.toFixed(2)}`
              }
              otherLabel={tQuickPay("other")}
              totalLabel={tCommon("total")}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
