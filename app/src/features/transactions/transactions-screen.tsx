import { useState, useMemo } from 'react'
import { View, Pressable, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  Message01Icon,
} from '@hugeicons/core-free-icons'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { UserAvatar } from '@/components/ui/user-avatar'
import { PremiumBadge } from '@/components/shared/premium-badge'
import { FiatAmount } from '@/components/shared/fiat-amount'
import { useTransactions, useLedgerSymbol } from '@/hooks/use-wallet-data'
import { useIcpPrice } from '@/hooks/use-icp-price'
import {
  copyText,
  explorerTxUrl,
  formatClockTime,
  formatDetailTime,
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
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
                    isExpanded={expandedId === tx.id}
                    onToggle={() =>
                      setExpandedId((prev) => (prev === tx.id ? null : tx.id))
                    }
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
    </View>
  )
}

function TransactionRowItem({
  tx,
  isLast,
  isExpanded,
  onToggle,
}: {
  tx: TransactionPublic
  isLast: boolean
  isExpanded: boolean
  onToggle: () => void
}) {
  const t = useTranslations('transactions')
  const tc = useTranslations('common')
  const router = useRouter()
  const type = txTypeLabel(tx.txType)
  const incoming = type === 'deposit'
  const status = txStatusLabel(tx.status)
  const counterparty = incoming ? tx.from : tx.to
  const { symbol, decimals } = useLedgerSymbol(tx.ledgerId)
  const { price } = useIcpPrice()
  const memo = tx.memo?.[0]
  const blockIndex = tx.blockIndex?.[0]
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handle = counterparty.startsWith('@')
    ? counterparty.slice(1)
    : !isHexAccountId(counterparty) && !counterparty.includes('-')
      ? counterparty
      : null

  const isIcp = tx.ledgerId.includes('ryjl3') || symbol === 'ICP'
  const usd = isIcp && price ? (Number(tx.amount) / 100_000_000) * price.usd : null

  const handleCopy = (val: string, field: string) => {
    void copyText(val)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleSendAgain = () => {
    const target = handle ?? counterparty
    router.push(`/transfer?to=${encodeURIComponent(target)}` as never)
  }

  return (
    <View className={cn(!isLast && 'border-b border-border/40')}>
      {/* Clickable Header Row */}
      <Pressable
        onPress={onToggle}
        className={cn(
          'flex-row items-center gap-3.5 px-4 py-3 active:bg-muted/40 transition-colors',
          isExpanded && 'bg-muted/30',
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

          {memo && !isExpanded ? (
            <View className="mt-1 flex-row items-center gap-1">
              <Icon icon={Message01Icon} size={11} color="#888" />
              <Text className="text-xs text-muted-foreground truncate" numberOfLines={1}>
                {memo}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row items-center gap-2.5">
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

          <View className="size-5 items-center justify-center">
            {isExpanded ? (
              <Icon icon={ArrowDown01Icon} size={14} color="#888" />
            ) : (
              <Icon icon={ArrowRight01Icon} size={14} color="#888" />
            )}
          </View>
        </View>
      </Pressable>

      {/* Dropdown In-Place Expansion */}
      {isExpanded ? (
        <View className="border-t border-border/40 bg-muted/20 px-4 py-4 gap-4">
          {/* Amount & Status Summary */}
          <View className="items-center rounded-2xl bg-card border border-border/50 py-4 px-3 shadow-sm">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {incoming ? t('amountReceived') : t('amountSent')}
            </Text>

            <Text
              className={cn(
                'mt-1 font-mono text-2xl font-bold tracking-tight',
                incoming ? 'text-success' : 'text-foreground',
              )}
            >
              {incoming ? '+' : '−'}
              {formatTokenAmount(tx.amount, decimals)} {symbol}
            </Text>

            {usd != null ? <FiatAmount usd={usd} className="mt-0.5" /> : null}

            <View className="mt-2.5 flex-row gap-2">
              <Badge variant="outline">{t(`type.${type}`)}</Badge>
              <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
                {t(`status.${status}`)}
              </Badge>
            </View>
          </View>

          {/* Detailed Info Card */}
          <View className="rounded-2xl border border-border/50 bg-card p-3.5 gap-3 shadow-sm">
            {/* Counterparty Row */}
            <DropdownRow
              label={incoming ? t('rowFrom') : t('rowTo')}
              content={
                <View className="flex-row items-center gap-1.5">
                  <Text className="font-mono text-xs text-foreground" numberOfLines={1}>
                    {handle ? `@${handle}` : shortenCounterparty(counterparty)}
                  </Text>
                  {handle ? <PremiumBadge name={handle} size={12} /> : null}
                </View>
              }
              copyValue={counterparty}
              copied={copiedField === 'counterparty'}
              onCopy={() => handleCopy(counterparty, 'counterparty')}
            />

            <View className="h-px bg-border/40" />

            {/* Transaction ID */}
            <DropdownRow
              label="Tx ID"
              content={
                <Text className="font-mono text-xs text-muted-foreground">
                  {tx.id.slice(0, 16)}…
                </Text>
              }
              copyValue={tx.id}
              copied={copiedField === 'id'}
              onCopy={() => handleCopy(tx.id, 'id')}
            />

            <View className="h-px bg-border/40" />

            {/* Date & Time */}
            <DropdownRow
              label={tc('time') || 'Date & Time'}
              content={
                <Text className="text-xs text-muted-foreground">
                  {formatDetailTime(tx.createdAt)}
                </Text>
              }
            />

            {/* Block Index */}
            {blockIndex !== undefined ? (
              <>
                <View className="h-px bg-border/40" />
                <DropdownRow
                  label="Block"
                  content={
                    <Pressable
                      onPress={() => void Linking.openURL(explorerTxUrl(blockIndex))}
                      className="flex-row items-center gap-1 active:opacity-70"
                    >
                      <Text className="font-mono text-xs text-primary font-medium">
                        #{blockIndex.toString()}
                      </Text>
                    </Pressable>
                  }
                  copyValue={blockIndex.toString()}
                  copied={copiedField === 'block'}
                  onCopy={() => handleCopy(blockIndex.toString(), 'block')}
                />
              </>
            ) : null}

            {/* Memo */}
            {memo ? (
              <>
                <View className="h-px bg-border/40" />
                <DropdownRow
                  label="Memo"
                  content={<Text className="text-xs text-foreground">{memo}</Text>}
                  copyValue={memo}
                  copied={copiedField === 'memo'}
                  onCopy={() => handleCopy(memo, 'memo')}
                />
              </>
            ) : null}
          </View>

          {/* Quick Action: Send Again */}
          {handle || counterparty ? (
            <Button
              size="sm"
              className="w-full rounded-xl"
              onPress={handleSendAgain}
            >
              {handle ? `Send to @${handle}` : t('sendAgain')}
            </Button>
          ) : null}
        </View>
      ) : null}
    </View>
  )
}

function DropdownRow({
  label,
  content,
  copyValue,
  copied,
  onCopy,
}: {
  label: string
  content: React.ReactNode
  copyValue?: string
  copied?: boolean
  onCopy?: () => void
}) {
  return (
    <View className="flex-row items-center justify-between gap-2">
      <Text className="text-xs text-muted-foreground shrink-0">{label}</Text>
      <View className="flex-row items-center gap-2 min-w-0">
        {content}
        {copyValue && onCopy ? (
          <Pressable
            onPress={onCopy}
            className="rounded-md bg-muted px-2 py-0.5 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel={`Copy ${label}`}
          >
            <Text className="text-[10px] font-medium text-muted-foreground">
              {copied ? 'Copied' : 'Copy'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}
