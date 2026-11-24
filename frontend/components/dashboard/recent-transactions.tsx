"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { motion } from "motion/react"
import { avatarUriFor } from "@/lib/profile/avatar"
import { Icon } from "@/components/ui/icon"
import { InboxGlassIcon, ArrowRightGlassIcon } from "@thesvg/ui-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { PremiumBadge } from "@/components/verified/premium-badge"
import type { TransactionPublic } from "@/services/types"
import {
  formatTokenAmount,
  formatDetailTime,
  formatRelativeTime,
  getTxStatusVariant,
  isIncomingTx,
  shortenCounterparty,
  txStatusLabel,
  txTypeKey,
} from "@/lib/wallet/utils"
import { useLedgerSymbol } from "@/hooks/wallet/useWalletData"
import { useBalanceVisibility } from "@/components/wallet/balance-visibility-provider"
import { cn } from "@/lib/ui/utils"

type RecentTransactionsProps = {
  transactions: TransactionPublic[]
  embedded?: boolean
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
}

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 400, damping: 32 } },
}

export function RecentTransactions({ transactions, embedded }: RecentTransactionsProps) {
  const t = useTranslations("dashboard")
  const hasTransactions = transactions.length > 0
  const visible = embedded ? transactions : transactions.slice(0, 9)

  return (
    <section className={embedded ? "space-y-0" : "space-y-2"}>
      {!embedded && (
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-foreground">
            {t("latestTransactions")}
          </h2>
          {hasTransactions && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs text-muted-foreground hover:text-foreground h-7 px-2"
              nativeButton={false}
              render={<Link href="/transactions" />}
            >
              {t("seeMore")}
              <Icon icon={ArrowRightGlassIcon} className="size-3" strokeWidth={1.75} />
            </Button>
          )}
        </div>
      )}

      {hasTransactions ? (
        <motion.div
          className="overflow-hidden rounded-2xl bg-card/60"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          {visible.map((tx, i) => (
            <motion.div
              key={tx.id}
              variants={rowVariants}
              className={cn(i < visible.length - 1 && "border-b border-border/40")}
            >
              <TransactionRow tx={tx} embedded={embedded} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Empty className={cn("rounded-(--radius) border border-dashed py-8", embedded && "border-0 rounded-none")}>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon={InboxGlassIcon} className="size-5 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>{t("noTransactions")}</EmptyTitle>
            <EmptyDescription>{t("noTransactionsHint")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </section>
  )
}

function TransactionRow({ tx, embedded }: { tx: TransactionPublic; embedded?: boolean }) {
  const t = useTranslations("transactions")
  const { symbol, decimals } = useLedgerSymbol(tx.ledgerId)
  const { hidden } = useBalanceVisibility()

  const incoming = isIncomingTx(tx.txType)
  const status = txStatusLabel(tx.status)
  const counterparty = incoming ? tx.from : tx.to
  const handle = counterparty.startsWith("@") ? counterparty.slice(1) : null
  const memo = tx.memo?.[0]

  const avatarUri = useMemo(() => avatarUriFor(counterparty), [counterparty])

  return (
    <Item
      size="sm"
      className={cn(
        "rounded-none border-0 transition-all hover:bg-muted/40 active:bg-muted/60 active:scale-[0.985] [content-visibility:auto] [contain-intrinsic-size:auto_60px]",
        embedded ? "px-6 py-3.5" : "px-3 py-3"
      )}
      render={<Link href={`/transactions?id=${encodeURIComponent(tx.id)}`} prefetch />}
    >
      <ItemMedia>
        <Avatar className="size-9 shrink-0">
          <AvatarImage src={avatarUri} alt="" />
          <AvatarFallback className="bg-muted text-[11px] font-semibold">
            {counterparty.replace(/^@/, "").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>

      <ItemContent className="min-w-0 flex-1 gap-0">
        <ItemTitle className={cn("text-[13px] font-semibold leading-snug", !handle && "font-mono text-xs tracking-tight")}>
          {handle ?? shortenCounterparty(counterparty)}
          {handle ? <PremiumBadge name={handle} className="size-3" /> : null}
        </ItemTitle>
        <ItemDescription className="text-[11px] text-muted-foreground leading-snug" title={formatDetailTime(tx.createdAt)}>
          {t(`type.${txTypeKey(tx.txType)}`)} · {formatRelativeTime(tx.createdAt)}
        </ItemDescription>
        {memo && (
          <p className="mt-0.5 max-w-[240px] truncate text-[11px] text-muted-foreground">
            {memo}
          </p>
        )}
      </ItemContent>

      <ItemActions className="shrink-0 items-center gap-1.5">
        <div className="text-right">
          <p
            className={cn(
              "text-[13px] font-semibold tabular-nums leading-snug",
              incoming ? "text-success" : "text-foreground"
            )}
          >
            {hidden ? "••••••" : `${incoming ? "+" : "−"}${formatTokenAmount(tx.amount, decimals, 4)} ${symbol}`}
          </p>
          {status !== "completed" && (
            <Badge variant={getTxStatusVariant(tx.status)} className="mt-0.5 text-[10px]">
              {t(`status.${status}`)}
            </Badge>
          )}
        </div>
        <Icon icon={ArrowRightGlassIcon} className="size-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-active:translate-x-1" strokeWidth={1.75} />
      </ItemActions>
    </Item>
  )
}