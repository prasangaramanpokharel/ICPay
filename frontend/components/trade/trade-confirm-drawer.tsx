"use client"

import { useEffect, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Spinner } from "@/components/ui/spinner"
import { createAgent } from "@/services/icp"
import { DEFAULT_SLIPPAGE_BPS, requiredWalletDebit, SEVERE_PRICE_IMPACT_PCT } from "@/lib/trade/fees"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { useBalanceVisibility } from "@/components/wallet/balance-visibility-provider"
import type { TokenHolding } from "@/services/tokens"
import type { Identity } from "@icp-sdk/core/agent"

type TradeConfirmDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  identity: Identity | undefined
  tokenIn: TokenHolding | null
  tokenOut: TokenHolding | null
  amountIn: bigint | null
  amountOut: bigint | null
  priceImpact?: string | null
  priceImpactPct?: number | null
  trading: boolean
  onConfirm: () => void
}

export function TradeConfirmDrawer({
  open,
  onOpenChange,
  identity,
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  priceImpact,
  priceImpactPct,
  trading,
  onConfirm,
}: TradeConfirmDrawerProps) {
  const t = useTranslations("trade")

  const balancePreview = useMemo(() => {
    if (!tokenIn || !tokenOut || amountIn === null || amountOut === null) return null
    const tokenDebit = requiredWalletDebit(amountIn, tokenIn.fee)
    const afterIn = tokenIn.balance > tokenDebit ? tokenIn.balance - tokenDebit : 0n
    const afterOut = tokenOut.balance + amountOut
    return { afterIn, afterOut }
  }, [tokenIn, tokenOut, amountIn, amountOut])

  useEffect(() => {
    if (open && identity) void createAgent(identity)
  }, [open, identity])

  const handleOpenChange = (next: boolean) => {
    if (trading && !next) return
    onOpenChange(next)
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("confirmTitle")}</DrawerTitle>
          <DrawerDescription>{t("confirmBody")}</DrawerDescription>
        </DrawerHeader>

        {tokenIn && tokenOut && amountIn !== null && amountOut !== null && balancePreview && (
          <>
            <div className="mx-4 border-t border-border/70" />
            <div className="flex flex-col gap-3 px-4 py-4">
              <ConfirmRow
                label={t("youPay")}
                value={`${formatTokenAmount(amountIn, tokenIn.decimals)} ${tokenIn.symbol}`}
              />
              <ConfirmRow
                label={t("youReceive")}
                value={`${formatTokenAmount(amountOut, tokenOut.decimals)} ${tokenOut.symbol}`}
              />
              <ConfirmRow label={t("slippage")} value={`${Number(DEFAULT_SLIPPAGE_BPS) / 100}%`} />
              {priceImpact ? (
                <ConfirmRow
                  label={t("priceImpact")}
                  value={priceImpact}
                  highlight={
                    priceImpactPct !== null &&
                    priceImpactPct !== undefined &&
                    priceImpactPct >= SEVERE_PRICE_IMPACT_PCT
                  }
                />
              ) : null}
            </div>

            <div className="mx-4 border-t border-border/70" />
            <div className="flex flex-col gap-3 px-4 py-4">
              <p className="text-xs font-medium text-muted-foreground">{t("balanceAfter")}</p>
              <BalanceChangeRow
                symbol={tokenIn.symbol}
                decimals={tokenIn.decimals}
                before={tokenIn.balance}
                after={balancePreview.afterIn}
              />
              <BalanceChangeRow
                symbol={tokenOut.symbol}
                decimals={tokenOut.decimals}
                before={tokenOut.balance}
                after={balancePreview.afterOut}
              />
            </div>
          </>
        )}

        <DrawerFooter className="pb-6">
          <Button
            className="h-11 w-full rounded-xl"
            onClick={onConfirm}
            disabled={trading}
          >
            {trading && <Spinner data-icon="inline-start" />}
            {trading ? t("trading") : t("confirmTrade")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ConfirmRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium tabular-nums ${highlight ? "text-destructive" : ""}`}>
        {value}
      </span>
    </div>
  )
}

function BalanceChangeRow({
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
  const t = useTranslations("trade")
  const { hidden } = useBalanceVisibility()
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-medium">{symbol}</span>
      <div className="flex items-center gap-2 tabular-nums">
        <span className="text-muted-foreground">{hidden ? "••••••" : formatTokenAmount(before, decimals)}</span>
        <span className="text-muted-foreground/60">→</span>
        <span className="font-medium">{hidden ? "••••••" : formatTokenAmount(after, decimals)}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {t("afterLabel")}
        </span>
      </div>
    </div>
  )
}
