"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { EyeIcon, ViewOffIcon } from "@hugeicons/core-free-icons"
import { PremiumBadge } from "@/components/verified/premium-badge"
import { CopyIconIndicator } from "@/components/ui/copy-button"
import { copyText } from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"
import type { IcpPrice } from "@/lib/market/icpPrice"
import { useFiatValue } from "@/hooks/fiat/useFiatValue"

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
  const [copied, setCopied] = useState(false)

  const usdValue = useMemo(() => {
    if (!price) return null
    return (Number(balanceE8s) / E8S_PER_ICP) * price.usd
  }, [balanceE8s, price])

  const fiat = useFiatValue(usdValue)

  const handleCopyUsername = async () => {
    if (!username) return
    await copyText(username)
    setCopied(true)
    toast.success("Username copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/95 p-5 text-card-foreground select-none shadow-sm sm:p-6 gap-0">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {username ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => void handleCopyUsername()}
              title="Click to copy username"
              className="group -ml-2 h-7 gap-1.5 font-mono text-sm font-semibold tracking-tight text-foreground"
            >
              <span className="truncate">{username}</span>
              <PremiumBadge name={username} className="size-3.5" />
              <CopyIconIndicator copied={copied} iconClassName="size-3 text-muted-foreground group-hover:text-foreground" />
            </Button>
          ) : (
            <span className="font-mono text-xs font-medium tracking-tight text-muted-foreground">
              ICPay Wallet
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-baseline justify-between gap-2">
        <Button
          variant="ghost"
          onClick={() => void onRefreshPrice()}
          title="Click to refresh balance & price"
          className="h-auto p-0 text-[clamp(1.85rem,8.5vw,2.85rem)] font-bold leading-none tracking-tight tabular-nums hover:bg-transparent hover:opacity-85 active:opacity-60 cursor-pointer text-foreground"
        >
          <AnimatePresence mode="wait" initial={false}>
            {hidden ? (
              <motion.span
                key="hidden"
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.18 }}
              >
                ••••••••
              </motion.span>
            ) : (
              <motion.span
                key={balance}
                initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="flex items-baseline"
              >
                <FormattedBalance value={balance} />
                <span className="ml-1.5 text-xs sm:text-sm font-semibold text-muted-foreground">ICP</span>
              </motion.span>
            )}
          </AnimatePresence>
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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
        <Button
          variant="outline"
          size="xs"
          onClick={() => void onRefreshPrice()}
          title="Click to refresh balance & price"
          className="font-medium tabular-nums transition-transform active:scale-95"
        >
          {hidden || !fiat.formatted ? "••••" : `≈ ${fiat.symbol} ${fiat.formatted}`}
        </Button>

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
          )}
        </div>
      </div>
    </Card>
  )
}

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
