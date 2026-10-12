import { Image } from 'expo-image'
import { Pressable, View } from 'react-native'
import { EyeIcon, ViewOffIcon } from '@hugeicons/core-free-icons'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Text } from '@/components/ui/text'
import { PremiumBadge } from '@/components/shared/premium-badge'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { useFiatValue } from '@/hooks/use-fiat-value'
import type { IcpPrice } from '@/lib/icp-price'

const E8S = 100_000_000

export function BalanceCard({
  balance,
  balanceE8s,
  price,
  hidden,
  onToggleHidden,
  username,
}: {
  balance: string
  balanceE8s: bigint
  price: IcpPrice | null
  hidden: boolean
  onToggleHidden: () => void
  username?: string
}) {
  const t = useTranslations('dashboard')
  const usdValue = price ? (Number(balanceE8s) / E8S) * price.usd : null
  const fiat = useFiatValue(usdValue)

  return (
    <View className="rounded-3xl bg-primary/25 pt-2 shadow-2xl">
      <View className="relative mt-1 rounded-3xl bg-primary p-5 shadow-xl">
        <View className="flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-row items-center gap-2.5">
            <CardChip />
            {username ? (
              <View className="min-w-0 flex-row items-center gap-1">
                <Text className="truncate font-mono text-sm text-primary-foreground/80">{username}</Text>
                <PremiumBadge name={username} />
              </View>
            ) : null}
          </View>
          <View className="flex-row items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
            <Image source={images.logo} className="size-4" />
            <Text className="text-[11px] font-semibold text-primary-foreground">ICP</Text>
          </View>
        </View>
        <View className="mt-8 flex-row items-center gap-2">
          <Text className="text-4xl font-semibold leading-none text-primary-foreground">
            {hidden ? '•• •••• ••••' : balance}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? t('showBalance') : t('hideBalance')}
            onPress={onToggleHidden}
            hitSlop={10}
            className="size-8 items-center justify-center rounded-full active:opacity-70 active:bg-white/10"
          >
            <Icon
              icon={hidden ? ViewOffIcon : EyeIcon}
              size={20}
              strokeWidth={1.8}
              color="rgba(255,255,255,0.85)"
            />
          </Pressable>
        </View>
        <View className="mt-6 flex-row items-center justify-between gap-2">
          <View className="rounded-full bg-white/15 px-3 py-1">
            <Text className="text-sm font-medium text-primary-foreground">
              {hidden || !fiat.formatted ? '••••' : `≈ ${fiat.symbol} ${fiat.formatted}`}
            </Text>
          </View>
          {!hidden && price ? (
            <View className="flex-row items-center gap-1.5">
              <Text className="text-xs font-medium text-primary-foreground/80">
                1 ICP = {price.usd.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}
              </Text>
              {price.change24h !== 0 ? (
                <View
                  className={`rounded-md px-1.5 py-0.5 ${
                    price.change24h > 0 ? 'bg-emerald-500/25' : 'bg-rose-500/25'
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold ${
                      price.change24h > 0 ? 'text-emerald-300' : 'text-rose-300'
                    }`}
                  >
                    {price.change24h > 0 ? '+' : ''}
                    {price.change24h.toFixed(2)}%
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <Text className="text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/40">
              Internet Computer
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}

function CardChip() {
  return (
    <View className="h-7 w-9 overflow-hidden rounded-md bg-amber-300">
      <View
        className="absolute rounded-[2px] border border-amber-900/40"
        style={{ top: 3, right: 3, bottom: 3, left: 3 }}
      />
      <View className="absolute bg-amber-900/45" style={{ left: 3, right: 3, top: 13, height: 1 }} />
      <View className="absolute bg-amber-900/45" style={{ top: 3, bottom: 3, left: 12, width: 1 }} />
      <View className="absolute bg-amber-900/45" style={{ top: 3, bottom: 3, left: 22, width: 1 }} />
    </View>
  )
}
