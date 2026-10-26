import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { useBucketPricingTiers } from '@/hooks/use-bucket'
import { useIcpPrice } from '@/hooks/use-icp-price'
import { CAPACITY_TIERS_GB } from '@/lib/bucket/bucket'
import { BUCKET_POPULAR_TIER_GB } from '@/lib/bucket/pricing'
import { formatAmount } from '@/lib/wallet-utils'
import { formatUsd } from '@/lib/icp-price'
import { cn } from '@/lib/utils'

const FEATURE_KEYS = [
  'pricingFeaturePublic',
  'pricingFeatureEncrypted',
  'pricingFeatureCdn',
  'pricingFeatureWebp',
  'pricingFeatureFormats',
  'pricingFeatureReadOnly',
  'pricingFeatureRenew',
] as const

export function BucketPricingScreen() {
  const t = useTranslations('bucket')
  const router = useRouter()
  const { tiers, isLoading } = useBucketPricingTiers()
  const { price: icpPrice } = useIcpPrice()

  const tierRows = CAPACITY_TIERS_GB.map((gb) => {
    const tier = tiers.find((row) => row.gb === gb)
    return { gb, tier, popular: gb === BUCKET_POPULAR_TIER_GB }
  })

  return (
    <View className="gap-5 pt-2 pb-16">
      {/* Header */}
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-2xl font-bold tracking-tight text-foreground">{t('pricingTitle')}</Text>
          <Text className="mt-1 text-sm text-muted-foreground">{t('pricingSubtitle')}</Text>
        </View>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full px-3.5"
          onPress={() => router.push('/bucket')}
        >
          {t('myBuckets')}
        </Button>
      </View>

      {/* Pricing Table Card */}
      <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card p-0 shadow-sm">
        {/* Table Header */}
        <View className="flex-row items-center justify-between border-b border-border/50 bg-muted/40 px-4 py-3">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('pricingColTier')}
          </Text>
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('pricingColPrice')}
          </Text>
        </View>

        {/* Rows */}
        <View className="divide-y divide-border/40">
          {tierRows.map(({ gb, tier, popular }) => {
            const usdFormatted =
              tier && icpPrice?.usd
                ? formatUsd((Number(tier.priceE8s) / 1e8) * icpPrice.usd)
                : null

            return (
              <View
                key={gb}
                className={cn(
                  'flex-row items-center justify-between px-4 py-3.5',
                  popular && 'bg-primary/5',
                )}
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-semibold text-foreground">{gb} GB</Text>
                  {popular ? (
                    <Badge variant="secondary" className="text-[10px] font-semibold">
                      {t('pricingPopular')}
                    </Badge>
                  ) : null}
                </View>

                <View className="items-end">
                  {isLoading && !tier ? (
                    <Skeleton className="h-5 w-24 rounded-md" />
                  ) : tier ? (
                    <View className="items-end">
                      <View className="flex-row items-baseline gap-1.5">
                        {tier.listPriceE8s > tier.priceE8s ? (
                          <Text className="text-xs text-muted-foreground line-through tabular-nums">
                            {formatAmount(tier.listPriceE8s)} ICP
                          </Text>
                        ) : null}
                        <Text className="font-mono text-sm font-bold tabular-nums text-foreground">
                          {formatAmount(tier.priceE8s)} ICP
                        </Text>
                      </View>
                      {usdFormatted ? (
                        <Text className="text-[11px] text-muted-foreground">
                          ≈ {usdFormatted} / 30d
                        </Text>
                      ) : (
                        <Text className="text-[11px] text-muted-foreground">/ 30d</Text>
                      )}
                    </View>
                  ) : (
                    <Text className="text-sm text-muted-foreground">—</Text>
                  )}
                </View>
              </View>
            )
          })}
        </View>

        {/* Breakdown Note */}
        <View className="border-t border-border/50 bg-muted/20 px-4 py-3">
          <Text className="text-xs leading-relaxed text-muted-foreground">
            {t('pricingBreakdownNote')}
          </Text>
        </View>
      </Card>

      {/* Feature Highlights */}
      <Card className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm gap-3">
        <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t('pricingAllPlansTitle')}
        </Text>
        <View className="gap-2">
          {FEATURE_KEYS.map((key) => (
            <View key={key} className="flex-row items-center gap-2">
              <Text className="text-xs font-bold text-primary">·</Text>
              <Text className="text-xs text-muted-foreground">{t(key)}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Explanatory Footer */}
      <Text className="text-xs leading-relaxed text-muted-foreground">
        {t('pricingFooter')}
      </Text>

      {/* CTA Button */}
      <Button
        size="lg"
        className="w-full rounded-2xl"
        onPress={() => router.push('/bucket/new')}
      >
        {t('createCta')}
      </Button>
    </View>
  )
}

