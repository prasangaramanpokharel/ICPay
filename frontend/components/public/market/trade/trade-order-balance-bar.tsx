"use client"

import { useTranslations } from "next-intl"
import { ReplaceGlassIcon, SlidersHorizontalGlassIcon } from "@thesvg/ui-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DEFAULT_SLIPPAGE_BPS } from "@/lib/trade/fees"
import { formatTokenAmount, toPlainTokenAmount } from "@/lib/wallet/utils"
import { showWalletLine } from "@/lib/market/tradeAuthUi"
import { cn } from "@/lib/ui/utils"

const SLIPPAGE_PRESETS: Array<{ bps: bigint; label: string }> = [
  { bps: 50n, label: "0.5%" },
  { bps: 100n, label: "1%" },
  { bps: 200n, label: "2%" },
  { bps: 300n, label: "3%" },
]

export interface TradeOrderBalanceBarProps {
  orderType: "limit" | "market"
  onOrderTypeChange: (type: "limit" | "market") => void
  isAuthenticated: boolean
  tokenIn: { decimals: number; symbol?: string } | null | undefined
  tradingBal: bigint | null
  walletBal: bigint
  paySymbol: string
  slippageBps?: bigint
  onSlippageChange?: (bps: bigint) => void
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
  slippageBps = DEFAULT_SLIPPAGE_BPS,
  onSlippageChange,
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
          {orderType === "market" && onSlippageChange ? (
            <Popover>
              <PopoverTrigger
                aria-label={t("slippage")}
                title={t("slippage")}
                className="inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-[10px] font-medium tabular-nums text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground cursor-pointer"
              >
                <SlidersHorizontalGlassIcon className="size-3" />
                <span>{(Number(slippageBps) / 100).toFixed(Number(slippageBps) % 100 === 0 ? 0 : 1)}%</span>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-52 space-y-2 p-3">
                <p className="text-[11px] font-semibold text-foreground">{t("slippage")}</p>
                <div className="grid grid-cols-4 gap-1">
                  {SLIPPAGE_PRESETS.map((preset) => (
                    <Button
                      key={preset.bps.toString()}
                      type="button"
                      size="xs"
                      variant={slippageBps === preset.bps ? "default" : "outline"}
                      className="h-6 px-1 text-[10px] font-medium tabular-nums cursor-pointer"
                      onClick={() => onSlippageChange(preset.bps)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          ) : null}
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
            <ReplaceGlassIcon className="size-3.5" />
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
