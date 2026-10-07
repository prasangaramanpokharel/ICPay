import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { useBucketPricingTiers } from '@/hooks/use-bucket'
import { CAPACITY_TIERS_GB } from '@/lib/bucket/bucket'
import { BUCKET_POPULAR_TIER_GB } from '@/lib/bucket/pricing'
import { formatAmount } from '@/lib/wallet-utils'

export function BucketPricingScreen() {
  const t = useTranslations('bucket')
  const router = useRouter()
  const { tiers, isLoading } = useBucketPricingTiers()

  return (
    <View className="gap-5 pt-2 pb-16">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-2xl font-bold tracking-tight">{t('pricingTitle')}</Text>
          <Text className="mt-1 text-sm text-muted-foreground">{t('pricingSubtitle')}</Text>
        </View>
        <Button variant="outline" size="sm" className="rounded-full px-3.5" onPress={() => router.push('/bucket')}>
          {t('myBuckets')}
        </Button>
      </View>

      {/* Feature Highlights */}
      <View className="gap-2.5 rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
        <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t('pricingAllPlansTitle')}
        </Text>
        <View className="grid grid-cols-2 gap-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-xs font-bold text-primary">✓</Text>
            <Text className="text-xs text-muted-foreground">{t('pricingFeatureCdn')}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-xs font-bold text-primary">✓</Text>
            <Text className="text-xs text-muted-foreground">{t('pricingFeatureEncrypted')}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-xs font-bold text-primary">✓</Text>
            <Text className="text-xs text-muted-foreground">{t('pricingFeaturePublic')}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-xs font-bold text-primary">✓</Text>
            <Text className="text-xs text-muted-foreground">{t('pricingFeatureRenew')}</Text>
          </View>
        </View>
      </View>

      {/* Capacity Tiers */}
      <View className="gap-3">
        {CAPACITY_TIERS_GB.map((gb) => {
          const tier = tiers.find((row) => row.gb === gb)
          const popular = gb === BUCKET_POPULAR_TIER_GB
          return (
            <Card
              key={gb}
              className={`rounded-2xl border p-4 shadow-sm ${
                popular ? 'border-primary/50 bg-primary/5' : 'border-border/60 bg-card'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                  <Text className="text-base font-bold text-foreground">{gb} GB</Text>
                  {popular ? (
                    <Badge variant="default" className="rounded-full px-2 py-0.5 text-[10px] font-bold">
                      {t('pricingPopular')}
                    </Badge>
                  ) : null}
                </View>
                {isLoading && !tier ? (
                  <Skeleton className="h-6 w-20 rounded-md" />
                ) : tier ? (
                  <View className="flex-row items-baseline gap-2">
                    {tier.listPriceE8s > tier.priceE8s ? (
                      <Text className="text-xs text-muted-foreground line-through">
                        {formatAmount(tier.listPriceE8s)} ICP
                      </Text>
                    ) : null}
                    <Text className="text-base font-bold tabular-nums text-foreground">
                      {formatAmount(tier.priceE8s)} ICP
                    </Text>
                    <Text className="text-xs text-muted-foreground">/ 30d</Text>
                  </View>
                ) : (
                  <Text className="text-sm text-muted-foreground">—</Text>
                )}
              </View>
            </Card>
          )
        })}
      </View>

      <Button size="lg" className="w-full" onPress={() => router.push('/bucket/new')}>
        {t('createCta')}
      </Button>
    </View>
  )
}
