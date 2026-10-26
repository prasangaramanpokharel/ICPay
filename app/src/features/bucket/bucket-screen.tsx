import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { AppIcon } from '@/components/ui/app-icon'
import { useBucketList } from '@/hooks/use-bucket'
import { formatBytes, isBucketActive, isPublicVisibility } from '@/lib/bucket/bucket'

export function BucketScreen() {
  const t = useTranslations('bucket')
  const router = useRouter()
  const { buckets, isLoading } = useBucketList()

  return (
    <View className="gap-6 pt-2 pb-16">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-2xl font-bold tracking-tight">{t('title')}</Text>
          <Text className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</Text>
        </View>
        <Button size="sm" className="rounded-full px-4" onPress={() => router.push('/bucket/new')}>
          {t('createCta')}
        </Button>
      </View>

      {!buckets?.length && !isLoading ? (
        <View className="gap-5 rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
          <View className="flex-row items-center gap-3.5">
            <View className="size-12 items-center justify-center rounded-2xl bg-primary/10">
              <AppIcon name="bucket" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">ICPay Cloud Storage</Text>
              <Text className="mt-0.5 text-xs text-muted-foreground">
                Decentralized on-chain blob storage with global edge CDN URLs
              </Text>
            </View>
          </View>

          <View className="gap-2.5 rounded-2xl border border-border/40 bg-muted/30 p-3.5">
            <View className="flex-row items-center gap-2.5">
              <Text className="text-xs font-bold text-primary">✓</Text>
              <Text className="flex-1 text-xs text-muted-foreground">
                Direct certified boundary node streaming (.raw.icp0.io)
              </Text>
            </View>
            <View className="flex-row items-center gap-2.5">
              <Text className="text-xs font-bold text-primary">✓</Text>
              <Text className="flex-1 text-xs text-muted-foreground">
                S3 & CLI integration with automated developer API keys
              </Text>
            </View>
            <View className="flex-row items-center gap-2.5">
              <Text className="text-xs font-bold text-primary">✓</Text>
              <Text className="flex-1 text-xs text-muted-foreground">
                Permanent cryptographic verification & tamper-proof custody
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2.5">
            <Button className="flex-1" onPress={() => router.push('/bucket/new')}>
              {t('createCta')}
            </Button>
            <Button variant="outline" className="flex-1" onPress={() => router.push('/bucket/pricing')}>
              View Plans
            </Button>
          </View>
        </View>
      ) : null}

      <Pressable onPress={() => router.push('/bucket/pricing')} className="min-h-11 flex-row items-center gap-1 active:opacity-70">
        <Text className="text-sm font-semibold text-primary">Storage Plans & Pricing →</Text>
      </Pressable>

      {buckets?.length ? (
        <View className="gap-3">
          {buckets.map((bucket) => (
            <Pressable key={bucket.id} onPress={() => router.push(`/bucket/${bucket.id}`)} className="active:opacity-70">
              <Card className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                <View className="flex-row items-center gap-3.5">
                  <View className="size-11 items-center justify-center rounded-xl bg-muted/60">
                    <AppIcon name="bucket" size={20} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                      {bucket.name}
                    </Text>
                    <Text className="mt-0.5 text-xs text-muted-foreground">
                      {formatBytes(bucket.storageUsed)} / {formatBytes(bucket.capacity)} ·{' '}
                      {isPublicVisibility(bucket.visibility) ? t('public') : t('private')} ·{' '}
                      <Text className={isBucketActive(bucket.status) ? 'text-emerald-500 font-semibold' : 'text-destructive'}>
                        {isBucketActive(bucket.status) ? t('active') : t('expired')}
                      </Text>
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  )
}
