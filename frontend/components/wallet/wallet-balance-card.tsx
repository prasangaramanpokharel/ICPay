"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
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
import { formatAmount } from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"

type WalletBalanceCardProps = {
  balance?: bigint
  usdValue: number | null
  price?: IcpPrice | null
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

export function WalletBalanceCard({ balance, usdValue, price }: WalletBalanceCardProps) {
  const tDashboard = useTranslations("dashboard")
  const tCommon = useTranslations("common")
  const tFiat = useTranslations("fiat")
  const [hidden, setHidden] = useState(false)
  const fiat = useFiatValue(usdValue)
  const { currency, setCurrency } = useFiatCurrency()
  const loading = balance === undefined
  const formattedBalance = balance !== undefined ? formatAmount(balance) : "0.0"

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 text-card-foreground sm:p-6 gap-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          {loading ? (
            <Skeleton className="h-10 w-44 rounded-lg" />
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
                <span className="text-[clamp(1.85rem,8vw,2.75rem)] font-bold leading-none tracking-tight tabular-nums text-foreground">
                  {hidden ? "••••••" : <FormattedBalance value={formattedBalance} />}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">ICP</span>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="default"
            size="sm"
            nativeButton={false}
            render={<Link href="/deposit" />}
            className="h-8 gap-1.5 rounded-full px-3 text-xs font-semibold"
          >
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" strokeWidth={2} />
            <span>{tCommon("receive")}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/transfer" />}
            className="h-8 gap-1.5 rounded-full px-3 text-xs font-medium"
          >
            <HugeiconsIcon icon={ArrowUp01Icon} className="size-3.5" strokeWidth={2} />
            <span>{tCommon("send")}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setHidden((v) => !v)}
            aria-label={hidden ? tDashboard("showBalance") : tDashboard("hideBalance")}
            className="size-8 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={hidden ? ViewOffIcon : ViewIcon} className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={loading}
            className={cn(
              "inline-flex w-fit max-w-full items-center gap-1.5 self-start rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium tabular-nums cursor-pointer",
              "text-foreground outline-none transition-colors",
              "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:pointer-events-none disabled:opacity-60"
            )}
            aria-label={tFiat("select")}
          >
            <span className="truncate">
              {hidden || fiat.formatted === null ? "••••" : `≈ ${fiat.symbol}${fiat.formatted}`}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">{currency}</span>
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2} />
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

        {!hidden && price ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-medium tabular-nums text-muted-foreground">
              1 ICP ={" "}
              {price.usd.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}
            </span>
            {price.change24h !== 0 ? (
              <Badge
                variant={price.change24h > 0 ? "default" : "destructive"}
                className={cn(
                  "tabular-nums text-[11px]",
                  price.change24h > 0 && "bg-success/15 text-success border-transparent hover:bg-success/20"
                )}
              >
                {price.change24h > 0 ? "+" : ""}
                {price.change24h.toFixed(2)}%
              </Badge>
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  )
}
