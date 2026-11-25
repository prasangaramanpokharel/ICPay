"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { motion, type Variants } from "motion/react"
import { Icon } from "@/components/ui/icon"
import { ExternalLinkGlassIcon, CheckGlassOutlineIcon } from "@thesvg/ui-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatTokenAmount, explorerTxUrl } from "@/lib/wallet/utils"
import { ReceiptPreview } from "@/components/wallet/receipt-preview"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import { playSuccessChime } from "@/lib/ui/successChime"
import { avatarUriFor } from "@/lib/profile/avatar"
import { cn } from "@/lib/ui/utils"

const checkBadgeVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 450,
      damping: 25,
    },
  },
}

type SendSuccessProps = {
  amount: bigint
  recipient: string
  blockIndex: bigint
  memo?: string
  kind?: "send" | "tip" | "purchase" | "icpayBuy"
  symbol?: string
  decimals?: number
  onDone: () => void
}

export function SendSuccess({
  amount,
  recipient,
  blockIndex,
  memo,
  kind = "send",
  symbol = "ICP",
  decimals = 8,
  onDone,
}: SendSuccessProps) {
  const t = useTranslations("success")
  const tc = useTranslations("common")
  const [previewOpen, setPreviewOpen] = useState(false)
  const { price } = useIcpPrice()

  const chimed = useRef(false)
  useEffect(() => {
    if (chimed.current) return
    chimed.current = true
    playSuccessChime()
  }, [])

  const avatarUri = useMemo(
    () => avatarUriFor(recipient),
    [recipient]
  )

  const receipt = useMemo(
    () => ({
      amount,
      recipient,
      blockIndex,
      memo,
      symbol,
      decimals,
      usdPrice: symbol === "ICP" ? price?.usd : undefined,
    }),
    [amount, recipient, blockIndex, memo, symbol, decimals, price?.usd]
  )

  const label = recipient.startsWith("@")
    ? recipient
    : recipient.length > 16
      ? `${recipient.slice(0, 6)}…${recipient.slice(-4)}`
      : recipient

  return (
    <div className="flex flex-col items-center pt-6 text-center">
      <motion.div
        variants={checkBadgeVariants}
        initial="hidden"
        animate="visible"
        className="mb-5 flex size-18 items-center justify-center rounded-full bg-success/10"
      >
        <span className="flex size-13 items-center justify-center rounded-full bg-success text-success-foreground shadow-sm">
          <Icon icon={CheckGlassOutlineIcon} className="size-8 text-success-foreground" strokeWidth={3} />
        </span>
      </motion.div>

      <div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{t(kind)}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t(`${kind}Body`, { name: label, symbol })}
        </p>
      </div>

      <div className="mt-8">
        <p className="text-xs text-muted-foreground">{t("total")}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
          {formatTokenAmount(amount, decimals, decimals)} {symbol}
        </p>
      </div>

      <div className="mt-8 w-full border-t border-dashed pt-6 text-left">
        <p className="text-xs text-muted-foreground">
          {kind === "purchase"
            ? t("username")
            : kind === "icpayBuy"
              ? t("destination")
              : t("recipient")}
        </p>
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-muted/50 p-3">
          <Avatar className="size-11 shrink-0">
            <AvatarImage src={avatarUri} alt="" />
            <AvatarFallback className="text-xs">
              {recipient.replace(/^@/, "").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className={cn("truncate text-sm font-medium", !recipient.startsWith("@") && "font-mono text-xs")}>
              {label}
            </p>
            <a
              href={explorerTxUrl(blockIndex)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2"
            >
              {t("viewOnDashboard")}
              <Icon icon={ExternalLinkGlassIcon} className="size-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 flex w-full items-center gap-2">
        <Button className="flex-1" onClick={onDone}>
          {tc("done")}
        </Button>
        {kind !== "purchase" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              className="shrink-0"
            >
              {t("shareReceipt")}
            </Button>
            <ReceiptPreview
              open={previewOpen}
              onOpenChange={setPreviewOpen}
              receipt={receipt}
            />
          </>
        )}
      </div>
    </div>
  )
}
