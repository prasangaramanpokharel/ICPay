"use client"

import { useTranslations } from "next-intl"
import { TriangleAlertGlassIcon, XGlassIcon } from "@thesvg/ui-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { isInsufficientBalanceError } from "@/lib/market/tradeQuoteError"
import { cn } from "@/lib/ui/utils"

export interface TradeOrderAlertsProps {
  orderType: "limit" | "market"
  guard: { key: string; values?: Record<string, string | number | Date>; destructive?: boolean } | null
  status: "idle" | "error" | "placing_limit"
  tradeError: string | null
  onDismissError: () => void
  onOpenDeposit: () => void
}

export function TradeOrderAlerts({
  orderType,
  guard,
  status,
  tradeError,
  onDismissError,
  onOpenDeposit,
}: TradeOrderAlertsProps) {
  const t = useTranslations("marketTrade")
  const tDeposit = useTranslations("deposit")

  if (orderType === "market" && guard) {
    return (
      <div
        className={cn(
          "px-0.5 py-0.5 text-xs",
          guard.destructive ? "font-medium text-destructive" : "text-muted-foreground"
        )}
      >
        {guard.values && "pct" in guard.values
          ? t(guard.key as "highPriceImpact", guard.values)
          : guard.values && "icp" in guard.values
            ? t("minTradeIcp", guard.values)
            : guard.values && "usd" in guard.values
              ? t("minTradeUsd", guard.values)
              : t(guard.key as "cannotTrade")}
      </div>
    )
  }

  if (status === "error" && tradeError) {
    return (
      <Alert
        variant="destructive"
        className="border-destructive/30 bg-destructive/10 text-destructive dark:bg-destructive/15 py-2.5 px-3"
      >
        <div className="flex items-start gap-2">
          <TriangleAlertGlassIcon className="size-4 shrink-0 mt-0.5 text-destructive" />
          <div className="flex-1 space-y-1.5">
            <AlertDescription className="text-xs leading-relaxed font-medium text-destructive">
              {tradeError}
            </AlertDescription>
            {isInsufficientBalanceError(tradeError) && (
              <div className="pt-0.5">
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  className="h-6 gap-1 px-2 text-[11px] font-semibold border-destructive/40 text-destructive hover:bg-destructive/20 hover:text-destructive cursor-pointer"
                  onClick={() => {
                    onOpenDeposit()
                    onDismissError()
                  }}
                >
                  <span>{tDeposit("title")}</span>
                </Button>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onDismissError}
            className="size-5 text-destructive/70 hover:text-destructive hover:bg-destructive/20 text-xs p-0.5 -mr-1 -mt-0.5 rounded cursor-pointer transition-colors"
            aria-label="Dismiss error"
          >
            <XGlassIcon className="size-3.5" />
          </Button>
        </div>
      </Alert>
    )
  }

  return null
}
