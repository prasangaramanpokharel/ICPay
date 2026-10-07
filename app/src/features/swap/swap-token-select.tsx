import { Pressable, View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { TokenLogo } from '@/components/shared/token-logo'
import { formatTokenAmount } from '@/lib/wallet-utils'
import type { TokenHolding } from '@/services/tokens'
import { cn } from '@/lib/utils'

export function SwapTokenSelect({
  label,
  token,
  amountText,
  onAmountChange,
  onPickToken,
  readOnly,
  balance,
  onMax,
  percentages,
  onPercent,
  className,
}: {
  label: string
  token: TokenHolding | null
  amountText: string
  onPickToken: () => void
  onAmountChange?: (value: string) => void
  readOnly?: boolean
  balance?: bigint
  onMax?: () => void
  percentages?: readonly number[]
  onPercent?: (p: number) => void
  className?: string
}) {
  const t = useTranslations('swap')

  return (
    <View className={cn('p-4 sm:p-5', className)}>
      {/* Header row: Label & Balance / Max */}
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-xs font-medium text-muted-foreground">{label}</Text>
        {!readOnly && token && balance !== undefined ? (
          <View className="flex-row items-center gap-2">
            <Text className="text-xs tabular-nums text-muted-foreground">
              {t('balance')}: {formatTokenAmount(balance, token.decimals)}
            </Text>
            {onMax ? (
              <Pressable accessibilityRole="button" onPress={onMax} className="py-0.5">
                <Text className="text-xs font-semibold text-primary">{t('max')}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Main row: Token Selector & Amount Input */}
      <View className="mt-3 flex-row items-center gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('selectToken')}
          onPress={onPickToken}
          className="flex-row items-center gap-2 rounded-full border border-border/70 bg-muted/60 py-1.5 pl-2 pr-3.5 shadow-sm active:opacity-80"
        >
          {token ? <TokenLogo token={token} size={28} /> : null}
          <Text className="text-sm font-semibold">{token?.symbol ?? t('selectToken')}</Text>
          <Text className="text-xs text-muted-foreground">▾</Text>
        </Pressable>

        {readOnly ? (
          <Text className="min-w-0 flex-1 text-right text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-foreground">
            {amountText}
          </Text>
        ) : (
          <Input
            value={amountText}
            onChangeText={onAmountChange}
            keyboardType="decimal-pad"
            placeholder="0"
            variant="ghost"
            className="h-10 min-w-0 flex-1 border-0 bg-transparent px-0 text-right text-2xl sm:text-3xl font-bold tracking-tight shadow-none"
          />
        )}
      </View>

      {/* Percentage chips */}
      {!readOnly && percentages && onPercent ? (
        <View className="mt-3.5 flex-row gap-1.5">
          {percentages.map((p) => (
            <Pressable
              key={p}
              accessibilityRole="button"
              onPress={() => onPercent(p)}
              className="flex-1 items-center justify-center rounded-xl bg-muted/40 py-2 active:bg-muted"
            >
              <Text className="text-xs font-medium text-muted-foreground">{p}%</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  )
}
