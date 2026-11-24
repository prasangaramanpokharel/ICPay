"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "motion/react"
import { Icon } from "@/components/ui/icon"
import { ArrowDownLeftGlassIcon, ArrowUpRightGlassIcon, EyeGlassIcon, EyeOffGlassIcon } from "@thesvg/ui-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useBalanceVisibility } from "@/components/wallet/balance-visibility-provider"
import { WalletAllocation } from "@/components/wallet/wallet-allocation"
import type { Holding, UnpricedHolding } from "@/lib/allocation"
import { useTokenRegistry } from "@/lib/token/registry"
import { type TokenHolding } from "@/services/tokens"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { useFiatValue } from "@/hooks/fiat/useFiatValue"
import { useFiatCurrency } from "@/components/fiat/fiat-provider"
import { CURRENCIES, type FiatCurrency } from "@/lib/fiat/config"
import type { IcpPrice } from "@/lib/market/icpPrice"
import { formatAmount, formatTokenAmount, E8S } from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"

type WalletBalanceCardProps = {
  balance?: bigint
  usdValue: number | null
  price?: IcpPrice | null
  holdings?: TokenHolding[]
}

function FormattedBalance({ value }: { value: string }) {
  const dotIndex = value.indexOf(".")
  if (dotIndex === -1) return <>{value}</>

  const whole = value.slice(0, dotIndex)
  const decimals = value.slice(dotIndex)

  return (
    <>
      <span className="text-foreground">{whole}</span>
      <span className="text-[0.62em] font-medium text-muted-foreground">{decimals}</span>
    </>
  )
}

export function WalletBalanceCard({ balance, usdValue, price, holdings = [] }: WalletBalanceCardProps) {
  const tDashboard = useTranslations("dashboard")
  const tWallet = useTranslations("wallet")
  const tCommon = useTranslations("common")
  const tFiat = useTranslations("fiat")
  const tQuickPay = useTranslations("quickPay.purposes")
  const { hidden, toggleVisibility } = useBalanceVisibility()
  const fiat = useFiatValue(usdValue)
  const { currency, setCurrency } = useFiatCurrency()
  const registry = useTokenRegistry()
  const loading = balance === undefined
  const formattedBalance = balance !== undefined ? formatAmount(balance) : "0.0"

  const pricedHoldings = useMemo<Holding[]>(() => {
    const list: Holding[] = []
    const rate = fiat.rate ?? 1
    const icpAmount = Number(balance ?? 0n) / Number(E8S)
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
  }, [balance, price, holdings, registry, fiat.rate])

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

  return (
    <Card className="relative overflow-hidden rounded-(--radius) border border-border/60 bg-card p-5 text-card-foreground gap-0">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          {tWallet("totalIcpBalance")}
        </p>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleVisibility}
          aria-label={hidden ? tDashboard("showBalance") : tDashboard("hideBalance")}
          className="h-7 gap-1.5 rounded-full px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Icon icon={hidden ? EyeOffGlassIcon : EyeGlassIcon} className="size-3.5" strokeWidth={1.75} />
          <span>{hidden ? tDashboard("showBalance") : tDashboard("hideBalance")}</span>
        </Button>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4">
          <div>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <Skeleton className="h-10 w-48 rounded-lg" />
              ) : (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={hidden ? "hidden" : "visible"}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-baseline gap-x-2"
                  >
                    <span className="text-[clamp(2rem,7vw,2.75rem)] font-bold leading-none tracking-tight tabular-nums text-foreground">
                      {hidden ? "••••••" : <FormattedBalance value={formattedBalance} />}
                    </span>
                    <span className="text-base font-semibold text-muted-foreground">ICP</span>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            <div className="mt-1.5 flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  disabled={loading}
                  className={cn(
                    "text-xs font-medium tabular-nums text-muted-foreground cursor-pointer outline-none transition-colors",
                    "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring rounded-xs",
                    "disabled:pointer-events-none disabled:opacity-60"
                  )}
                  aria-label={tFiat("select")}
                >
                  {hidden || fiat.formatted === null ? "••••••" : `${fiat.symbol}${fiat.formatted} ${fiat.currency}`}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 max-h-72 overflow-y-auto p-1">
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup
                      value={currency}
                      onValueChange={(value) => setCurrency(value as FiatCurrency)}
                    >
                      {CURRENCIES.map((item) => (
                        <DropdownMenuRadioItem
                          key={item.code}
                          value={item.code}
                          className="cursor-pointer rounded-xl py-1.5 pl-2.5 pr-8"
                        >
                          <Item size="xs" className="w-full gap-2.5 border-0 bg-transparent p-0">
                            <ItemMedia>
                              <span className="flex size-6.5 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/60 text-xs font-semibold text-foreground">
                                {item.symbol}
                              </span>
                            </ItemMedia>
                            <ItemContent className="min-w-0 flex-1 gap-0 text-left">
                              <ItemTitle className="truncate text-xs font-medium text-foreground leading-tight">
                                {item.label}
                              </ItemTitle>
                              <ItemDescription className="text-[10px] font-mono text-muted-foreground leading-tight">
                                {item.code}
                              </ItemDescription>
                            </ItemContent>
                          </Item>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/transfer" />}
              className="h-8 gap-1.5 rounded-full px-3.5 text-xs font-medium hover:bg-muted"
            >
              <Icon icon={ArrowUpRightGlassIcon} className="size-3.5" strokeWidth={2} />
              <span>{tCommon("send")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/deposit" />}
              className="h-8 gap-1.5 rounded-full px-3.5 text-xs font-medium hover:bg-muted"
            >
              <Icon icon={ArrowDownLeftGlassIcon} className="size-3.5" strokeWidth={2} />
              <span>{tCommon("receive")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/trade" />}
              className="h-8 gap-1.5 rounded-full px-3.5 text-xs font-medium hover:bg-muted"
            >
              <span>{tCommon("swap")}</span>
            </Button>
          </div>
        </div>

        <div className="w-full flex items-center justify-center lg:justify-end">
          <WalletAllocation
            holdings={pricedHoldings}
            unpricedHoldings={unpricedHoldings}
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
    </Card>
  )
}
