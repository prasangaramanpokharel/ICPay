"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { motion } from "motion/react"
import { avatarUriFor } from "@/lib/profile/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import { InboxIcon, Message01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
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
  const visible = embedded ? transactions : transactions.slice(0, 3)

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
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" strokeWidth={1.75} />
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
              <TransactionRow tx={tx} />
            </motion.div>
          ))}
        </motion.div>
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
      className="rounded-none border-0 px-3 py-3 transition-all hover:bg-muted/40 active:bg-muted/60 active:scale-[0.985] [content-visibility:auto] [contain-intrinsic-size:auto_60px]"
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
          <PremiumBadge name={handle} className="size-3" />
        </ItemTitle>
        <ItemDescription className="text-[11px] text-muted-foreground leading-snug">
          {t(`type.${txTypeKey(tx.txType)}`)} · {formatTime(tx.createdAt)}
        </ItemDescription>
        {memo && (
          <div className="mt-1 flex items-center">
            <span className="inline-flex max-w-[200px] items-center gap-1 rounded-md border border-border/50 bg-muted/50 px-1.5 py-px text-[10px] font-medium text-foreground/80">
              <HugeiconsIcon icon={Message01Icon} className="size-2.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{memo}</span>
            </span>
          </div>
        )}
      </ItemContent>

      <ItemActions className="shrink-0 items-center gap-1.5">
        <div className="text-right">
          <p
            className={cn(
              "font-mono text-[13px] font-semibold tabular-nums leading-snug",
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
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-active:translate-x-1" strokeWidth={1.75} />
      </ItemActions>
    </Item>
  )
}