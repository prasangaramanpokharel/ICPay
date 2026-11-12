"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { avatarUriFor } from "@/lib/profile/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, InboxIcon, Message01Icon } from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { PremiumBadge } from "@/components/verified/premium-badge"
import { TransactionDetailDrawer } from "@/components/transactions/transaction-detail-drawer"
import type { TransactionPublic } from "@/services/types"
import {
  formatClockTime,
  formatTokenAmount,
  formatTransactionDateGroup,
  getTxStatusVariant,
  groupTransactionsByDate,
  isIncomingTx,
  shortenCounterparty,
  txStatusLabel,
  txTypeKey,
} from "@/lib/wallet/utils"
import { useLedgerSymbol } from "@/hooks/wallet/useWalletData"
import { cn } from "@/lib/ui/utils"

type TransactionListProps = {
  transactions: TransactionPublic[]
  total: bigint
  page: number
  pageSize: number
  initialSelectedTxId?: string | null
  onPageChange: (page: number) => void
}

export function TransactionList({
  transactions,
  total,
  page,
  pageSize,
  initialSelectedTxId,
  onPageChange,
}: TransactionListProps) {
  const t = useTranslations("transactions")
  const td = useTranslations("dashboard")
  const [selectedTxId, setSelectedTxId] = useState<string | null | false>(null)

  const effectiveTxId = selectedTxId === false ? null : (selectedTxId ?? initialSelectedTxId ?? null)
  const selectedTx = useMemo(
    () => (effectiveTxId ? transactions.find((item) => item.id === effectiveTxId) ?? null : null),
    [effectiveTxId, transactions]
  )

  const totalPages = Math.max(1, Math.ceil(Number(total) / pageSize))
  const hasNext = page < totalPages - 1
  const hasPrev = page > 0

  const groups = useMemo(() => groupTransactionsByDate(transactions), [transactions])
  const dateLabels = useMemo(
    () => ({ today: t("dateToday"), yesterday: t("dateYesterday") }),
    [t]
  )

  if (transactions.length === 0) {
    return (
      <Empty className="rounded-2xl border border-dashed border-border/70 p-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={InboxIcon} className="size-6 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>{td("noTransactions")}</EmptyTitle>
          <EmptyDescription>{td("noTransactionsHint")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-5">
        {groups.map((group) => (
          <section key={group.key}>
            <h2 className="mb-2 px-1 text-xs font-semibold tracking-wide text-muted-foreground text-balance">
              {formatTransactionDateGroup(group.items[0].createdAt, dateLabels)}
            </h2>
            <ItemGroup className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card gap-0">
              {group.items.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  onSelect={() => setSelectedTxId(tx.id)}
                />
              ))}
            </ItemGroup>
          </section>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {t("page", { page: page + 1, total: totalPages })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrev}
              onClick={() => onPageChange(page - 1)}
            >
              {t("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext}
              onClick={() => onPageChange(page + 1)}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}

      <TransactionDetailDrawer
        tx={selectedTx}
        txId={effectiveTxId}
        open={!!effectiveTxId}
        onOpenChange={(next) => {
          if (!next) setSelectedTxId(false)
        }}
      />
    </div>
  )
}

function TransactionRow({
  tx,
  onSelect,
}: {
  tx: TransactionPublic
  onSelect: () => void
}) {
  const t = useTranslations("transactions")
  const type = txTypeKey(tx.txType)
  const incoming = isIncomingTx(tx.txType)
  const status = txStatusLabel(tx.status)
  const counterparty = incoming ? tx.from : tx.to
  const memo = tx.memo?.[0]
  const { symbol, decimals } = useLedgerSymbol(tx.ledgerId)

  const avatarUri = useMemo(() => avatarUriFor(counterparty), [counterparty])

  const handle = counterparty.startsWith("@") ? counterparty.slice(1) : null

  return (
    <Item
      size="sm"
      onClick={onSelect}
      render={<button type="button" />}
      className="w-full rounded-none border-0 px-4 py-3.5 text-left transition-colors hover:bg-muted/40 active:bg-muted/60 cursor-pointer select-none [content-visibility:auto] [contain-intrinsic-size:auto_68px]"
    >
      <ItemMedia>
        <Avatar className="size-11 shrink-0">
          <AvatarImage src={avatarUri} alt="" />
          <AvatarFallback className="bg-muted text-xs">
            {counterparty.replace(/^@/, "").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>

      <ItemContent className="min-w-0 flex-1 gap-0.5">
        <ItemTitle
          className={cn(
            "flex items-center gap-1 truncate text-sm font-medium text-foreground",
            !handle && "font-mono tracking-tight"
          )}
        >
          {handle ?? shortenCounterparty(counterparty)}
          <PremiumBadge name={handle} className="size-3.5" />
        </ItemTitle>
        <ItemDescription className="text-xs text-muted-foreground">
          <span>{t(`type.${type}`)}</span> · {formatClockTime(tx.createdAt)}
        </ItemDescription>
        {memo ? (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <HugeiconsIcon icon={Message01Icon} className="size-3 shrink-0" />
            <span className="truncate">{memo}</span>
          </p>
        ) : null}
      </ItemContent>

      <ItemActions className="shrink-0 gap-2">
        <div className="text-right">
          <p
            className={cn(
              "text-sm font-semibold font-mono tabular-nums",
              incoming ? "text-success" : "text-foreground"
            )}
          >
            {incoming ? "+" : "−"}
            {formatTokenAmount(tx.amount, decimals, 4)} {symbol}
          </p>
          {status !== "completed" ? (
            <Badge variant={getTxStatusVariant(tx.status)} className="mt-0.5 text-[10px]">
              {t(`status.${status}`)}
            </Badge>
          ) : null}
        </div>
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground" strokeWidth={1.75} />
      </ItemActions>
    </Item>
  )
}
