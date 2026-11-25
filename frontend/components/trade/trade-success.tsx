"use client"

import { useEffect, useMemo, useRef } from "react"
import { useTranslations } from "next-intl"
import { motion, type Variants } from "motion/react"
import { Icon } from "@/components/ui/icon"
import { CheckGlassOutlineIcon } from "@thesvg/ui-react"
import { Button } from "@/components/ui/button"
import { requiredWalletDebit } from "@/lib/trade/fees"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { useBalanceVisibility } from "@/components/wallet/balance-visibility-provider"
import { playSuccessChime } from "@/lib/ui/successChime"
import type { TokenHolding } from "@/services/tokens"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
}

const checkBadgeVariants: Variants = {
  hidden: { scale: 0.4, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 24,
    },
  },
}

const checkIconVariants: Variants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      delay: 0.08,
      type: "spring",
      stiffness: 500,
      damping: 25,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 30,
    },
  },
}

export function TradeSuccessView({
  amountIn,
  amountOut,
  tokenIn,
  tokenOut,
  beforeIn,
  beforeOut,
  onDone,
}: {
  amountIn: bigint
  amountOut: bigint
  tokenIn: TokenHolding
  tokenOut: TokenHolding
  beforeIn: bigint
  beforeOut: bigint
  onDone: () => void
}) {
  const t = useTranslations("trade")
  const tc = useTranslations("common")

  const chimed = useRef(false)
  useEffect(() => {
    if (chimed.current) return
    chimed.current = true
    playSuccessChime()
  }, [])

  const { afterIn, afterOut } = useMemo(() => {
    const tokenDebit = requiredWalletDebit(amountIn, tokenIn.fee)
    return {
      afterIn: beforeIn > tokenDebit ? beforeIn - tokenDebit : 0n,
      afterOut: beforeOut + amountOut,
    }
  }, [amountIn, amountOut, beforeIn, beforeOut, tokenIn.fee])

  const paid = `${formatTokenAmount(amountIn, tokenIn.decimals)} ${tokenIn.symbol}`
  const received = `${formatTokenAmount(amountOut, tokenOut.decimals)} ${tokenOut.symbol}`

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center px-1 pt-4 text-center sm:pt-6"
    >
      <motion.div
        variants={checkBadgeVariants}
        className="mb-5 flex size-18 items-center justify-center rounded-full bg-success/10"
      >
        <motion.span
          variants={checkIconVariants}
          className="flex size-13 items-center justify-center rounded-full bg-success text-success-foreground shadow-sm"
        >
          <Icon icon={CheckGlassOutlineIcon} className="size-8 text-success-foreground" strokeWidth={3} />
        </motion.span>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight">{t("successTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("successBody")}</p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-8 w-full rounded-3xl border border-border/60 bg-card p-5 shadow-sm"
      >
        <p className="text-xs font-medium text-muted-foreground">{t("youReceive")}</p>
        <p className="mt-1 text-[clamp(1.75rem,7vw,2.25rem)] font-bold tracking-tight tabular-nums">
          {received}
        </p>
        <p className="mt-3 text-sm text-muted-foreground tabular-nums">
          {t("youPay")}: {paid}
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-6 w-full text-left">
        <p className="text-xs text-muted-foreground">{t("balanceAfter")}</p>
        <div className="mt-3 space-y-2 rounded-2xl border border-border/50 bg-muted/30 p-4">
          <BalanceLine
            symbol={tokenIn.symbol}
            decimals={tokenIn.decimals}
            before={beforeIn}
            after={afterIn}
          />
          <BalanceLine
            symbol={tokenOut.symbol}
            decimals={tokenOut.decimals}
            before={beforeOut}
            after={afterOut}
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-8 w-full">
        <Button className="h-12 w-full rounded-full text-base font-semibold" onClick={onDone}>
          {tc("done")}
        </Button>
      </motion.div>
    </motion.div>
  )
}

function BalanceLine({
  symbol,
  decimals,
  before,
  after,
}: {
  symbol: string
  decimals: number
  before: bigint
  after: bigint
}) {
  const { hidden } = useBalanceVisibility()
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-medium">{symbol}</span>
      <span className="tabular-nums text-muted-foreground">
        {hidden ? "••••••" : formatTokenAmount(before, decimals)} →{" "}
        <span className="font-medium text-foreground">{hidden ? "••••••" : formatTokenAmount(after, decimals)}</span>
      </span>
    </div>
  )
}
