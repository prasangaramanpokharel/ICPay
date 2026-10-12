import { useState, useMemo } from 'react'
import { View, Pressable } from 'react-native'
import { ArrowRight01Icon, Message01Icon } from '@hugeicons/core-free-icons'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { UserAvatar } from '@/components/ui/user-avatar'
import { PremiumBadge } from '@/components/shared/premium-badge'
import { TransactionDetailSheet } from '@/features/transactions/transaction-detail-sheet'
import { useTransactions, useLedgerSymbol } from '@/hooks/use-wallet-data'
import {
  formatClockTime,
  formatTokenAmount,
  formatTransactionDateGroup,
  groupTransactionsByDate,
  isHexAccountId,
  shortenCounterparty,
  txStatusLabel,
  txTypeLabel,
} from '@/lib/wallet-utils'
import { cn } from '@/lib/utils'
import type { TransactionPublic } from '@/services/types'

const PAGE_SIZE = 20

export function TransactionsScreen() {
  const t = useTranslations('transactions')
  const td = useTranslations('dashboard')
  const [page, setPage] = useState(0)
  const { items, total, isLoading } = useTransactions(page, PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(Number(total) / PAGE_SIZE))
  const [selectedTx, setSelectedTx] = useState<TransactionPublic | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const groups = useMemo(() => groupTransactionsByDate(items), [items])

  return (
    <View className="gap-6 pb-12">
      <View>
        <Text className="text-2xl font-bold tracking-tight text-foreground">{t('title')}</Text>
        <Text className="text-sm text-muted-foreground">{t('subtitle')}</Text>
      </View>

      {isLoading && items.length === 0 ? (
        <View className="gap-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </View>
      ) : items.length === 0 ? (
        <View className="items-center justify-center rounded-3xl border border-dashed border-border/60 bg-muted/20 py-12 px-6 text-center">
          <Text className="text-sm font-medium text-muted-foreground">{td('noTransactions')}</Text>
          <Text className="mt-1 text-xs text-muted-foreground/70">{td('noTransactionsHint')}</Text>
        </View>
      ) : (
        <View className="gap-5">
          {groups.map((group) => (
            <View key={group.key} className="gap-2">
              <Text className="text-xs font-semibold tracking-wide text-muted-foreground uppercase px-1">
                {formatTransactionDateGroup(group.items[0].createdAt, {
                  today: t('dateToday'),
                  yesterday: t('dateYesterday'),
                })}
              </Text>
              <View className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
                {group.items.map((tx, idx) => (
                  <TransactionRowItem
                    key={tx.id}
                    tx={tx}
                    isLast={idx === group.items.length - 1}
                    onPress={() => {
                      setSelectedTx(tx)
                      setDetailOpen(true)
                    }}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {totalPages > 1 ? (
        <View className="flex-row items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-4"
            disabled={page === 0}
            onPress={() => setPage((p) => p - 1)}
          >
            {t('previous')}
          </Button>
          <Text className="text-xs text-muted-foreground tabular-nums">
            {t('page', { page: page + 1, total: totalPages })}
          </Text>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-4"
            disabled={page + 1 >= totalPages}
            onPress={() => setPage((p) => p + 1)}
          >
            {t('next')}
          </Button>
        </View>
      ) : null}

      <TransactionDetailSheet
        tx={selectedTx}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </View>
  )
}

function TransactionRowItem({
  tx,
  isLast,
  onPress,
}: {
  tx: TransactionPublic
  isLast: boolean
  onPress: () => void
}) {
  const t = useTranslations('transactions')
  const type = txTypeLabel(tx.txType)
  const incoming = type === 'deposit'
  const status = txStatusLabel(tx.status)
  const counterparty = incoming ? tx.from : tx.to
  const { symbol, decimals } = useLedgerSymbol(tx.ledgerId)
  const memo = tx.memo?.[0]
  const handle = counterparty.startsWith('@')
    ? counterparty.slice(1)
    : !isHexAccountId(counterparty) && !counterparty.includes('-')
      ? counterparty
      : null

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-3.5 px-4 py-3 active:bg-muted/40',
        !isLast && 'border-b border-border/40',
      )}
      accessibilityRole="button"
      accessibilityLabel={`${t(`type.${type}`)} ${formatTokenAmount(tx.amount, decimals, 4)} ${symbol}`}
    >
      <UserAvatar seed={counterparty} size={42} />

      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text
            className={cn(
              'text-sm font-semibold text-foreground truncate',
              !handle && 'font-mono text-xs tracking-tight',
            )}
            numberOfLines={1}
          >
            {handle ? `@${handle}` : shortenCounterparty(counterparty)}
          </Text>
          {handle ? <PremiumBadge name={handle} size={13} /> : null}
        </View>

        <Text className="mt-0.5 text-xs text-muted-foreground">
          {t(`type.${type}`)} · {formatClockTime(tx.createdAt)}
        </Text>

        {memo ? (
          <View className="mt-1 flex-row items-center gap-1">
            <Icon icon={Message01Icon} size={11} color="#888" />
            <Text className="text-xs text-muted-foreground truncate" numberOfLines={1}>
              {memo}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row items-center gap-2">
        <View className="items-end">
          <Text
            className={cn(
              'font-mono text-sm font-semibold tabular-nums',
              incoming ? 'text-success' : 'text-foreground',
            )}
          >
            {incoming ? '+' : '−'}
            {formatTokenAmount(tx.amount, decimals, 4)} {symbol}
          </Text>
          {status !== 'completed' ? (
            <Badge className="mt-0.5 text-[10px]">{t(`status.${status}`)}</Badge>
          ) : null}
        </View>

        <Icon icon={ArrowRight01Icon} size={14} color="#888" />
      </View>
    </Pressable>
  )
}
