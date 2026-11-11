"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { tradePairPath } from "@/lib/market/pairSlug"
import { canOpenTransfer, canSubmitTrade, type TradeOrderBlock } from "@/lib/market/tradeOrderBlock"
import { cn } from "@/lib/ui/utils"

export interface TradeSubmitButtonProps {
  cta: "wait" | "sign_in" | "trade"
  side: "buy" | "sell"
  orderType: "limit" | "market"
  status: "idle" | "error" | "placing_limit"
  rateLimitCooldown: number
  baseSymbol: string
  block: TradeOrderBlock
  needsImpactConfirm: boolean
  effectivePriceText: string
  limitBaseAmountText: string
  limitTotalText: string
  onSubmitLimitOrder: () => void
  onOpenWalletTrade: () => void
  onConfirmImpact: () => void
  onSubmitTrade: () => void
}

export function TradeSubmitButton({
  cta,
  side,
  orderType,
  status,
  rateLimitCooldown,
  baseSymbol,
  block,
  needsImpactConfirm,
  effectivePriceText,
  limitBaseAmountText,
  limitTotalText,
  onSubmitLimitOrder,
  onOpenWalletTrade,
  onConfirmImpact,
  onSubmitTrade,
}: TradeSubmitButtonProps) {
  const t = useTranslations("marketTrade")
  const isBuy = side === "buy"

  if (cta === "wait") {
    return (
      <Button variant="outline" size="lg" className="w-full" disabled>
        <Spinner className="size-4" />
      </Button>
    )
  }

  if (cta === "sign_in") {
    return (
      <Button
        variant="default"
        size="lg"
        className="w-full"
        nativeButton={false}
        render={
          <a
            href={`/login?next=${encodeURIComponent(tradePairPath(baseSymbol))}`}
          />
        }
      >
        {t("signIn")}
      </Button>
    )
  }

  const isDisabled =
    rateLimitCooldown > 0 ||
    (orderType === "limit"
      ? status === "placing_limit" ||
        !effectivePriceText.trim() ||
        !limitBaseAmountText.trim() ||
        !limitTotalText.trim()
      : !canOpenTransfer(block) && !canSubmitTrade(block))

  function handleClick() {
    if (rateLimitCooldown > 0) return
    if (orderType === "limit") {
      onSubmitLimitOrder()
      return
    }
    if (canOpenTransfer(block)) {
      onOpenWalletTrade()
      return
    }
    if (needsImpactConfirm) {
      onConfirmImpact()
      return
    }
    onSubmitTrade()
  }

  return (
    <Button
      variant="default"
      size="lg"
      className={cn(
        "w-full font-semibold shadow-xs transition-all active:scale-[0.99]",
        isBuy
          ? "bg-success hover:bg-success/90 text-success-foreground"
          : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
      )}
      disabled={isDisabled}
      onClick={handleClick}
    >
      {rateLimitCooldown > 0 ? (
        <span>{`Wait (${rateLimitCooldown}s)`}</span>
      ) : orderType === "limit" ? (
        status === "placing_limit" ? (
          t("placingOrder")
        ) : (
          t("placeLimitOrder")
        )
      ) : block === "need_transfer" || block === "insufficient" ? (
        t("notEnough")
      ) : needsImpactConfirm ? (
        t("confirmImpact")
      ) : isBuy ? (
        `${t("buy")} ${baseSymbol}`
      ) : (
        `${t("sell")} ${baseSymbol}`
      )}
    </Button>
  )
}
