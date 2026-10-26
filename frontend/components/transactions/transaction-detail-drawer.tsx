"use client"

import { useMemo, type ReactNode } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TokenFiatHint } from "@/components/token/token-fiat-hint"
import { PremiumBadge } from "@/components/verified/premium-badge"
import { useLedgerSymbol, useTransactionDetail } from "@/hooks/wallet/useWalletData"
import { useIsMobile } from "@/hooks/use-mobile"
import type { TransactionPublic } from "@/services/types"
import {
  explorerTxUrl,
  formatDetailTime,
  formatTokenAmount,
  isIncomingTx,
  shortenCounterparty,
  txStatusLabel,
  txTypeKey,
} from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"

type TransactionDetailDrawerProps = {
  tx: TransactionPublic | null
  txId?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionDetailDrawer({
  tx: initialTx,
  txId,
  open,
  onOpenChange,
}: TransactionDetailDrawerProps) {
  const t = useTranslations("transactions")
  const isMobile = useIsMobile()

  // Fetch full details if only txId is provided or if initialTx needs refresh
  const resolvedId = initialTx?.id ?? txId ?? null
  const { tx: fetchedTx, error, isLoading } = useTransactionDetail(
    !initialTx && resolvedId ? resolvedId : null
  )
  const tx = initialTx ?? fetchedTx ?? null

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose()
        else onOpenChange(next)
      }}
      showSwipeHandle={isMobile}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent className="max-h-[min(100dvh,720px)] sm:max-h-none sm:max-w-md md:max-w-lg border-border/60 bg-card p-0 focus:outline-none">
        {/* Header Bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-3.5">
          <div className="min-w-0">
            <DrawerTitle className="text-sm font-semibold text-foreground">
              {t("title")}
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              Transaction details and on-chain verification
            </DrawerDescription>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            onClick={handleClose}
            aria-label="Close drawer"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-4" strokeWidth={2} />
          </Button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 space-y-6">
          {isLoading && !tx ? (
            <div className="flex justify-center py-20">
              <Spinner className="size-6 text-muted-foreground" />
            </div>
          ) : error || !tx ? (
            <Alert variant="destructive">
              <AlertDescription>{t("notFound")}</AlertDescription>
            </Alert>
          ) : (
            <TransactionDrawerBody tx={tx} />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function TransactionDrawerBody({ tx }: { tx: TransactionPublic }) {
  const t = useTranslations("transactions")
  const type = txTypeKey(tx.txType)
  const incoming = isIncomingTx(tx.txType)
  const status = txStatusLabel(tx.status)
  const counterparty = incoming ? tx.from : tx.to
  const memo = tx.memo?.[0]
  const { symbol, decimals } = useLedgerSymbol(tx.ledgerId)
  const blockIndex = tx.blockIndex?.[0]
  const showAction = type === "transfer" || type === "withdraw" || type === "deposit"
  const transferTarget = counterparty.replace(/^@/, "")
  const transferHref = `/transfer?to=${encodeURIComponent(transferTarget)}`
  const handle = counterparty.startsWith("@") ? counterparty.slice(1) : null

  const avatarUri = useMemo(
    () => createAvatar(adventurer, { seed: counterparty }).toDataUri(),
    [counterparty]
  )

  return (
    <>
      {/* Hero Summary */}
      <div className="text-center pt-1">
        <Avatar className="mx-auto size-16 shadow-xs">
          <AvatarImage src={avatarUri} alt="" />
          <AvatarFallback className="bg-muted text-sm">
            {counterparty.replace(/^@/, "").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <p className="mt-3 flex items-center justify-center gap-1 text-sm font-semibold">
          {handle ? (
            <Link href={`/icpverse?id=${encodeURIComponent(handle)}`} className="hover:underline text-foreground">
              @{handle}
            </Link>
          ) : (
            <span className="font-mono text-sm tracking-tight text-foreground">
              {shortenCounterparty(counterparty)}
            </span>
          )}
          <PremiumBadge name={handle} className="size-3.5" />
        </p>

        <p className="mt-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {incoming ? t("amountReceived") : t("amountSent")}
        </p>
        <p
          className={cn(
            "mt-1 text-3xl font-extrabold leading-tight tabular-nums tracking-tight sm:text-4xl",
            incoming ? "text-success" : "text-foreground"
          )}
        >
          {incoming ? "+" : "−"}
          {formatTokenAmount(tx.amount, decimals, decimals)} {symbol}
        </p>
        <TokenFiatHint
          ledgerId={tx.ledgerId}
          amount={tx.amount}
          decimals={decimals}
          className="mt-1 text-sm font-medium text-muted-foreground tabular-nums"
        />
        <p
          className={cn(
            "mt-2 inline-flex items-center gap-1.5 text-xs font-semibold",
            status === "completed" ? "text-success" : "text-muted-foreground"
          )}
        >
          {status === "completed" ? (
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" strokeWidth={2} />
          ) : null}
          {t(`status.${status}`)}
        </p>
      </div>

      {/* Action Button */}
      {showAction ? (
        <Button
          variant="secondary"
          className="h-10 w-full rounded-xl text-xs font-semibold cursor-pointer"
          nativeButton={false}
          render={<Link href={transferHref} />}
        >
          {incoming ? t("repay") : t("sendAgain")}
        </Button>
      ) : null}

      {/* Breakdown Details */}
      <div className="rounded-2xl border border-border/60 bg-muted/15 p-4 divide-y divide-border/60">
        <DetailRow
          label={t("rowAmount")}
          value={`${formatTokenAmount(tx.amount, decimals, decimals)} ${symbol}`}
        />
        <DetailRow
          label={t("rowNetworkFee")}
          value={`${formatTokenAmount(tx.fee, decimals, decimals)} ${symbol}`}
        />
        <DetailRow label={t("rowDate")} value={formatDetailTime(tx.createdAt)} />
        <DetailRow label={t("rowNetwork")} value={t("networkIcp")} />
        <DetailRow label={t("rowFrom")} value={tx.from} copyable mono />
        <DetailRow label={t("rowTo")} value={tx.to} copyable mono />
        {memo ? <DetailRow label={t("rowMemo")} value={memo} /> : null}
        <DetailRow label={t("rowId")} value={tx.id} copyable mono />
        {blockIndex !== undefined ? (
          <DetailRow
            label={t("rowBlock")}
            value={blockIndex.toString()}
            copyable
            mono
            href={explorerTxUrl(blockIndex)}
          />
        ) : null}
      </div>
    </>
  )
}

function DetailRow({
  label,
  value,
  mono,
  copyable,
  href,
  children,
}: {
  label: string
  value?: string
  mono?: boolean
  copyable?: boolean
  href?: string
  children?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-xs first:pt-0 last:pb-0">
      <span className="shrink-0 text-muted-foreground font-medium">{label}</span>
      {children ?? (
        <DetailValue value={value ?? ""} mono={mono} copyable={copyable} href={href} />
      )}
    </div>
  )
}

function DetailValue({
  value,
  mono,
  copyable,
  href,
}: {
  value: string
  mono?: boolean
  copyable?: boolean
  href?: string
}) {
  const tc = useTranslations("common")

  return (
    <div className="flex min-w-0 items-start justify-end gap-1.5">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "min-w-0 break-all text-right underline underline-offset-2 hover:text-foreground",
            mono && "font-mono text-xs"
          )}
        >
          {value}
        </a>
      ) : (
        <span className={cn("min-w-0 break-all text-right text-foreground", mono && "font-mono text-xs")}>
          {value}
        </span>
      )}
      {copyable ? (
        <CopyButton
          value={value}
          aria-label={tc("copy")}
          className="size-5 text-muted-foreground hover:text-foreground"
          iconClassName="size-3"
        />
      ) : null}
    </div>
  )
}
