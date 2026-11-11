"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDataTransferHorizontalIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatTokenAmount, toPlainTokenAmount } from "@/lib/wallet/utils"
import { showWalletLine } from "@/lib/market/tradeAuthUi"
import { cn } from "@/lib/ui/utils"

export interface TradeOrderBalanceBarProps {
  orderType: "limit" | "market"
  onOrderTypeChange: (type: "limit" | "market") => void
  isAuthenticated: boolean
  tokenIn: { decimals: number; symbol?: string } | null | undefined
  tradingBal: bigint | null
  walletBal: bigint
  paySymbol: string
  onOpenDeposit: () => void
  onOpenTransfer: () => void
}

export function TradeOrderBalanceBar({
  orderType,
  onOrderTypeChange,
  isAuthenticated,
  tokenIn,
  tradingBal,
  walletBal,
  paySymbol,
  onOpenDeposit,
  onOpenTransfer,
}: TradeOrderBalanceBarProps) {
  const t = useTranslations("marketTrade")
  const tDeposit = useTranslations("deposit")

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <ToggleGroup
          value={[orderType]}
          onValueChange={(val) => {
            const mode = val[0] as "limit" | "market" | undefined
            if (!mode) return
            onOrderTypeChange(mode)
          }}
          className="justify-start gap-1 p-0"
        >
          <ToggleGroupItem
            value="limit"
            size="sm"
            className="h-6 rounded-md px-2 text-xs font-semibold data-[state=on]:bg-muted data-[state=on]:text-foreground"
          >
            {t("limit")}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="market"
            size="sm"
            className="h-6 rounded-md px-2 text-xs font-semibold data-[state=on]:bg-muted data-[state=on]:text-foreground"
          >
            {t("market")}
          </ToggleGroupItem>
        </ToggleGroup>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="xs"
            variant="ghost"
            className="h-6 px-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all cursor-pointer"
            onClick={onOpenDeposit}
            title={tDeposit("title")}
          >
            {tDeposit("title")}
          </Button>
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            aria-label={t("transfer")}
            title={t("transfer")}
            onClick={onOpenTransfer}
          >
            <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} className="size-3.5" strokeWidth={2} />
          </Button>
        </div>
      </div>

      {isAuthenticated && tokenIn && (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("balance")}</span>
            <span
              className={cn(
                "tabular-nums font-medium",
                (tradingBal ?? 0n) <= 0n && "text-muted-foreground"
              )}
              title={
                tradingBal !== null
                  ? `${toPlainTokenAmount(tradingBal, tokenIn.decimals)} ${paySymbol}`
                  : undefined
              }
            >
              {tradingBal !== null
                ? `${formatTokenAmount(tradingBal, tokenIn.decimals, 8)} ${paySymbol}`
                : "—"}
            </span>
          </div>
          {showWalletLine(walletBal) ? (
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{t("mainWallet")}</span>
              <span
                className="tabular-nums"
                title={`${toPlainTokenAmount(walletBal, tokenIn.decimals)} ${paySymbol}`}
              >
                {formatTokenAmount(walletBal, tokenIn.decimals, 8)} {paySymbol}
              </span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
