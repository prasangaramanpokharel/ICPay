"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadialMeter } from "@/components/ui/radial-meter"
import type { IcpPrice } from "@/lib/market/icpPrice"
import { useFiatValue } from "@/hooks/fiat/useFiatValue"
import { PremiumBadge } from "@/components/verified/premium-badge"
import { CopyIconIndicator } from "@/components/ui/copy-button"
import { copyText } from "@/lib/wallet/utils"
import { useTokenHoldings } from "@/hooks/wallet/useWalletData"
import { useTokenPrices } from "@/hooks/market/useTokenPrices"
import { HugeiconsIcon } from "@hugeicons/react"
import { ViewOffIcon, ViewIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/ui/utils"

const E8S = 100_000_000
const CHART_PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

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
  const [hovered, setHovered] = useState<number | null>(null)
  const { holdings } = useTokenHoldings()
  const ledgerIds = useMemo(() => holdings.map((h) => h.ledgerId), [holdings])
  const { prices: tokenPrices } = useTokenPrices(ledgerIds)
  const usdValue = price ? (Number(balanceE8s) / E8S) * price.usd : null
  const fiat = useFiatValue(usdValue)

  const tokenItems = useMemo(() => {
    const map = new Map<string, number>()

    const icpAmount = Number(balanceE8s) / E8S
    const icpUsd = price ? icpAmount * price.usd : icpAmount
    map.set("ICP", icpUsd > 0 ? icpUsd : (icpAmount > 0 ? icpAmount : 0))

    for (const h of holdings) {
      if (h.symbol === "ICP") continue
      const amt = Number(h.balance) / 10 ** h.decimals
      if (amt <= 0) continue
      const p = tokenPrices.get(h.ledgerId)?.priceUsd
      const val = p ? amt * p : amt
      map.set(h.symbol, (map.get(h.symbol) ?? 0) + val)
    }

    const sorted: { label: string; value: number }[] = []
    for (const [label, value] of map.entries()) {
      if (value > 0 || label === "ICP") {
        sorted.push({ label, value })
      }
    }
    sorted.sort((a, b) => b.value - a.value)

    const total = sorted.reduce((sum, item) => sum + item.value, 0)

    if (total === 0) {
      return [
        {
          label: "ICP",
          value: 1,
          color: CHART_PALETTE[0],
          maxValue: 1,
        },
      ]
    }

    const top5 = sorted.slice(0, 5)
    const rest = sorted.slice(5)
    const restSum = rest.reduce((sum, item) => sum + item.value, 0)

    const items = top5.map((item, idx) => ({
      label: item.label,
      value: Number(item.value.toFixed(4)),
      color: CHART_PALETTE[idx % CHART_PALETTE.length],
      maxValue: total,
    }))

    if (rest.length > 0 && restSum > 0) {
      items.push({
        label: "More",
        value: Number(restSum.toFixed(4)),
        color: "var(--muted-foreground)",
        maxValue: total,
      })
    }

    return items
  }, [balanceE8s, price, holdings, tokenPrices])

  const totalValue = useMemo(
    () => tokenItems.reduce((acc, curr) => acc + curr.value, 0),
    [tokenItems]
  )

  const activeItem = hovered !== null ? tokenItems[hovered] : null
  const displayValue = activeItem ? activeItem.value : totalValue
  const displayLabel = activeItem ? activeItem.label : "Assets"
  const activeColor = activeItem ? activeItem.color : "var(--chart-1)"

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
          <Button
            variant="ghost"
            size="xs"
            onClick={() => void handleCopyUsername()}
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4">
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
              <div className="mt-1.5 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => void onRefreshPrice()}
                  title="Click to refresh balance & price"
                  className="h-auto p-0 text-base font-medium tabular-nums text-foreground/80 hover:bg-transparent hover:text-foreground"
                >
                  {hidden || !fiat.formatted ? "••••" : `≈ ${fiat.symbol} ${fiat.formatted}`}
                </Button>
              </div>
            </div>

            <ButtonGroup>
              <Button nativeButton={false} render={<Link href="/deposit" />}>
                {tCommon("receive")}
              </Button>
              <Button variant="outline" nativeButton={false} render={<Link href="/transfer" />}>
                {tCommon("send")}
              </Button>
            </ButtonGroup>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 shrink-0 self-center lg:self-auto">
            <RadialMeter
              value={totalValue > 0 ? (activeItem ? activeItem.value : totalValue) : 1}
              max={totalValue > 0 ? totalValue : 1}
              color={activeColor}
              innerRadius={44}
              outerRadius={62}
              polarRadius={[56, 50]}
              centerValue={
                hidden
                  ? "••••"
                  : displayValue < 0.01 && displayValue > 0
                    ? "<0.01"
                    : displayValue.toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })
              }
              centerLabel={displayLabel}
              width={140}
              height={140}
              valueClassName="fill-foreground font-semibold text-sm tabular-nums"
              labelClassName="fill-muted-foreground text-[10px]"
            />
            <div className="w-36 sm:w-44 space-y-1">
              {tokenItems.map((item, index) => {
                const isHovered = hovered === index
                const isFaded = hovered !== null && hovered !== index
                return (
                  <div
                    key={`legend-${item.label}-${index}`}
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-xs transition-all duration-150 cursor-pointer",
                      isHovered
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                      isFaded && "opacity-40"
                    )}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate font-medium">{item.label}</span>
                    </div>
                    <span className="font-mono tabular-nums shrink-0 text-[11px]">
                      {hidden
                        ? "••••"
                        : item.value < 0.01 && item.value > 0
                          ? "<0.01"
                          : item.value.toLocaleString("en-US", {
                              maximumFractionDigits: 2,
                            })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
