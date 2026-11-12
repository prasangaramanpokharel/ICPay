"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { avatarUriFor } from "@/lib/profile/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import { InboxIcon, Message01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { PremiumBadge } from "@/components/verified/premium-badge"
import type { TransactionPublic } from "@/services/types"
import {
  formatTokenAmount,
  formatTime,
  getTxStatusVariant,
  isIncomingTx,
  shortenCounterparty,
  txStatusLabel,
  txTypeKey,
} from "@/lib/wallet/utils"
import { useLedgerSymbol } from "@/hooks/wallet/useWalletData"
import { cn } from "@/lib/ui/utils"

type RecentTransactionsProps = {
  transactions: TransactionPublic[]
  embedded?: boolean
}

export function RecentTransactions({ transactions, embedded }: RecentTransactionsProps) {
  const t = useTranslations("dashboard")
  const hasTransactions = transactions.length > 0

  return (
    <section className={embedded ? "space-y-0" : "space-y-3"}>
      {!embedded && (
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-balance">{t("latestTransactions")}</h2>
          {hasTransactions && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs"
              nativeButton={false}
              render={<Link href="/transactions" />}
            >
              {t("seeMore")}
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" strokeWidth={1.75} />
            </Button>
          )}
        </div>
      )}

      {hasTransactions ? (
        <ItemGroup className={cn("gap-0 divide-y divide-border rounded-2xl border overflow-hidden", embedded && "rounded-none border-0")}>
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </ItemGroup>
      ) : (
        <Empty className={cn("rounded-2xl border border-dashed py-8", embedded && "border-0 rounded-none")}>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={InboxIcon} className="size-5 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>{t("noTransactions")}</EmptyTitle>
            <EmptyDescription>{t("noTransactionsHint")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </section>
  )
}

function TransactionRow({ tx }: { tx: TransactionPublic }) {
  const t = useTranslations("transactions")
  const { symbol, decimals } = useLedgerSymbol(tx.ledgerId)

  const incoming = isIncomingTx(tx.txType)
  const status = txStatusLabel(tx.status)
  const counterparty = incoming ? tx.from : tx.to
  const handle = counterparty.startsWith("@") ? counterparty.slice(1) : null
  const memo = tx.memo?.[0]

  const avatarUri = useMemo(() => avatarUriFor(counterparty), [counterparty])

  return (
    <Item
      size="sm"
      className="rounded-none border-0 px-4 py-2.5 transition-colors hover:bg-muted/50 active:bg-muted/70 [content-visibility:auto] [contain-intrinsic-size:auto_64px]"
      render={<Link href={`/transactions?id=${encodeURIComponent(tx.id)}`} prefetch />}
    >
      <ItemMedia>
        <Avatar className="size-10 shrink-0">
          <AvatarImage src={avatarUri} alt="" />
          <AvatarFallback className="bg-muted text-xs">
            {counterparty.replace(/^@/, "").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>

      <ItemContent className="min-w-0 flex-1 gap-0.5">
        <ItemTitle className={cn("text-sm font-medium", !handle && "font-mono tracking-tight")}>
          {handle ?? shortenCounterparty(counterparty)}
          <PremiumBadge name={handle} className="size-3.5" />
        </ItemTitle>
        <ItemDescription className="text-xs text-muted-foreground">
          {t(`type.${txTypeKey(tx.txType)}`)} · {formatTime(tx.createdAt)}
        </ItemDescription>
        {memo && (
          <div className="mt-1 flex items-center">
            <span className="inline-flex max-w-[220px] items-center gap-1 rounded-md border border-border/60 bg-muted/70 px-2 py-0.5 text-[11px] font-medium text-foreground/85">
              <HugeiconsIcon icon={Message01Icon} className="size-3 shrink-0 text-muted-foreground" />
              <span className="truncate">{memo}</span>
            </span>
          </div>
        )}
      </ItemContent>

      <ItemActions className="shrink-0 gap-2">
        <div className="text-right">
          <p
            className={cn(
              "font-mono text-sm font-semibold tabular-nums",
              incoming ? "text-success" : "text-foreground"
            )}
          >
            {incoming ? "+" : "−"}
            {formatTokenAmount(tx.amount, decimals, 4)} {symbol}
          </p>
          {status !== "completed" && (
            <Badge variant={getTxStatusVariant(tx.status)} className="mt-0.5 text-[10px]">
              {t(`status.${status}`)}
            </Badge>
          )}
        </div>
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
      </ItemActions>
    </Item>
  )
}