"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
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
    <div className="select-none px-1">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {username ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => void handleCopyUsername()}
              title="Click to copy username"
              className="group -ml-1 h-6 gap-1 font-mono text-xs font-semibold tracking-tight text-muted-foreground hover:text-foreground"
            >
              <span className="truncate">{username}</span>
              <PremiumBadge name={username} className="size-3" />
              <CopyIconIndicator copied={copied} iconClassName="size-3 text-muted-foreground group-hover:text-foreground" />
            </Button>
          ) : (
            <span className="font-mono text-xs font-medium tracking-tight text-muted-foreground">
              ICP Wallet
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={hidden ? t("showBalance") : t("hideBalance")}
          onClick={onToggleHidden}
          className="size-7 shrink-0 rounded-full text-muted-foreground/60 hover:bg-transparent hover:text-muted-foreground"
        >
          <HugeiconsIcon icon={hidden ? ViewOffIcon : EyeIcon} className="size-4" strokeWidth={1.75} />
        </Button>
      </div>

      <div className="mt-5">
        <Button
          variant="ghost"
          onClick={() => void onRefreshPrice()}
          title="Click to refresh balance & price"
          className="h-auto p-0 text-[clamp(2.4rem,10vw,3.2rem)] font-bold leading-none tracking-tight tabular-nums hover:bg-transparent hover:opacity-80 active:opacity-50 cursor-pointer text-foreground"
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
                className="flex items-baseline gap-2"
              >
                <FormattedBalance value={balance} />
                <span className="text-sm font-semibold text-muted-foreground">ICP</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Button>

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <button
            onClick={() => void onRefreshPrice()}
            title="Click to refresh price"
            className="text-sm font-semibold tabular-nums text-success transition-opacity hover:opacity-70 active:opacity-40 cursor-pointer"
          >
            {hidden || !fiat.formatted ? "••••" : `${fiat.symbol}${fiat.formatted}`}
          </button>

          {!hidden && price && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium tabular-nums text-muted-foreground/60">
                {price.usd.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}
                {" "}ICP
              </span>
              {price.change24h !== 0 && (
                <span
                  className={cn(
                    "text-[11px] font-semibold tabular-nums",
                    price.change24h > 0 ? "text-success" : "text-destructive"
                  )}
                >
                  {price.change24h > 0 ? "+" : ""}
                  {price.change24h.toFixed(2)}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
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
