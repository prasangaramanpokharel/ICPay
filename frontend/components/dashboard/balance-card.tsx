"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { EyeIcon, ViewOffIcon } from "@hugeicons/core-free-icons"
import { PremiumBadge } from "@/components/verified/premium-badge"
import { cn } from "@/lib/ui/utils"
import type { IcpPrice } from "@/lib/market/icpPrice"
import { useFiatValue } from "@/hooks/fiat/useFiatValue"

/** Number of e8s (10^-8 ICP) in one whole ICP token. */
const E8S_PER_ICP = 100_000_000

type BalanceCardProps = {
  balance: string
  balanceE8s: bigint
  price: IcpPrice | null
  hidden: boolean
  onToggleHidden: () => void
  onRefreshPrice: () => Promise<void>
  username?: string
}

export function BalanceCard({
  balance,
  balanceE8s,
  price,
  hidden,
  onToggleHidden,
  onRefreshPrice,
  username,
}: BalanceCardProps) {
  const t = useTranslations("dashboard")

  const usdValue = useMemo(() => {
    if (!price) return null
    return (Number(balanceE8s) / E8S_PER_ICP) * price.usd
  }, [balanceE8s, price])

  const fiat = useFiatValue(usdValue)

  return (
    <div className="relative overflow-hidden rounded-3xl bg-card dark:bg-background p-5 text-foreground   dark:border-primary/20 select-none sm:p-6">
      {/* Ambient specular lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-primary/10 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-12 -left-12 size-36 rounded-full bg-primary/5 blur-2xl"
      />

      {/* Top row: Chip + username + Network label */}
      <div className="relative z-10 flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <EmvChip />

          {username ? (
            <span className="flex min-w-0 items-center gap-1 font-mono text-sm font-semibold tracking-tight text-foreground">
              <span className="truncate">@{username}</span>
              <PremiumBadge name={username} className="size-3.5" />
            </span>
          ) : (
            <span className="font-mono text-xs font-medium tracking-tight text-muted-foreground">
              ICPay Wallet
            </span>
          )}
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Internet Computer
        </span>
      </div>

      {/* Center: Main Balance */}
      <div className="relative z-10 mt-6 flex items-baseline justify-between gap-2">
        <Button
          variant="ghost"
          onClick={() => void onRefreshPrice()}
          title="Click to refresh balance & price"
          className="h-auto p-0 text-[clamp(1.85rem,8.5vw,2.85rem)] font-bold leading-none tracking-tight tabular-nums hover:bg-transparent hover:opacity-85 active:opacity-60 cursor-pointer text-foreground"
        >
          {hidden ? (
            <span>••••••••</span>
          ) : (
            <span className="flex items-baseline">
              <FormattedBalance value={balance} />
              <span className="ml-1.5 text-xs sm:text-sm font-semibold text-muted-foreground">ICP</span>
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={hidden ? t("showBalance") : t("hideBalance")}
          onClick={onToggleHidden}
          className="size-8 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon icon={hidden ? ViewOffIcon : EyeIcon} className="size-4.5" strokeWidth={1.75} />
        </Button>
      </div>

      {/* Bottom row: Fiat valuation + 24h market status */}
      <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
        <button
          type="button"
          onClick={() => void onRefreshPrice()}
          title="Click to refresh balance & price"
          className="inline-flex items-center rounded-full bg-muted/60 hover:bg-muted px-3 py-1 text-xs font-medium tabular-nums text-foreground transition-all cursor-pointer border border-border/40"
        >
          {hidden || !fiat.formatted ? "••••" : `≈ ${fiat.symbol} ${fiat.formatted}`}
        </button>

        <div className="flex items-center gap-1.5 text-xs">
          {!hidden && price && (
            <span className="font-medium tabular-nums text-muted-foreground">
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
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                price.change24h > 0
                  ? "text-success"
                  : "text-destructive"
              )}
            >
              {price.change24h > 0 ? "+" : ""}
              {price.change24h.toFixed(2)}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Splits a balance string on its decimal point and renders the fractional
 * tail smaller and dimmed, so the eye lands on the whole-number amount
 * first — the same pattern Coinbase/Robinhood-style balances use.
 */
function FormattedBalance({ value }: { value: string }) {
  const dotIndex = value.indexOf(".")
  if (dotIndex === -1) return <>{value}</>

  const whole = value.slice(0, dotIndex)
  const decimals = value.slice(dotIndex)

  return (
    <>
      <span className="text-foreground">{whole}</span>
      <span className="text-[0.6em] font-medium text-muted-foreground">{decimals}</span>
    </>
  )
}

/** Metallic EMV-style chip icon shown next to the username. */
function EmvChip() {
  return (
    <span
      aria-hidden="true"
      className="relative flex h-5 w-7 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 p-0.5 shadow-xs border border-amber-500/40"
    >
      <span className="relative size-full rounded-[2px] border border-amber-700/30">
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-amber-700/30" />
        <span className="absolute inset-y-0 left-1/3 w-px bg-amber-700/30" />
        <span className="absolute inset-y-0 right-1/3 w-px bg-amber-700/30" />
      </span>
    </span>
  )
}