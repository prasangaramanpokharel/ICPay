import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { AppIcon } from '@/components/ui/app-icon'
import { FileIcon } from '@/features/bucket/file-icon'
import { useLocalSearchParams } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { Sheet } from '@/components/ui/sheet'
import { BucketFileRow } from '@/features/bucket/bucket-file-row'
import { BucketFilePreviewSheet } from '@/features/bucket/bucket-file-preview-sheet'
import { BucketApiKeysSheet } from '@/features/bucket/bucket-api-keys-sheet'
import { BucketConnectSheet } from '@/features/bucket/bucket-connect-sheet'
import { useAuth } from '@/components/auth/auth-provider'
import { useBucketFiles, useBucketStats, useInvalidateBucketCache } from '@/hooks/use-bucket'
import { useRefreshWallet } from '@/hooks/use-wallet-data'
import { deleteFile, renewBucket } from '@/services/bucket/bucket'
import { getFileCategory, type FileCategory } from '@/lib/bucket/file-category'
import { formatBytes, isBucketActive, optionalText } from '@/lib/bucket/bucket'
import { normalizePublicFileUrl } from '@/lib/bucket/file-preview'
import { copyText, formatAmount } from '@/lib/wallet-utils'
import type { FilePublic } from '@/services/bucket/types'

export function BucketDetailScreen() {
  const t = useTranslations('bucket')
  const tc = useTranslations('common')
  const { id } = useLocalSearchParams<{ id: string }>()
  const bucketId = typeof id === 'string' ? decodeURIComponent(id) : ''
  const { identity } = useAuth()
  const { stats, isLoading, refresh } = useBucketStats(bucketId || null)
  const { files, refresh: refreshFiles } = useBucketFiles(bucketId || null, 0)
  const [category, setCategory] = useState<FileCategory>('all')
  const [renewOpen, setRenewOpen] = useState(false)
  const [keysOpen, setKeysOpen] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)
  const [preview, setPreview] = useState<FilePublic | null>(null)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const refreshWallet = useRefreshWallet()
  const invalidate = useInvalidateBucketCache()

  if (isLoading || !bucketId) {
    return (
      <View className="gap-4 pt-2">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </View>
    )
  }

  if (!stats) {
    return (
      <View className="gap-4 pt-2">
        <Alert variant="destructive">
          <AlertDescription>{t('notFound')}</AlertDescription>
        </Alert>
      </View>
    )
  }

  const active = isBucketActive(stats.status)
  const publicRaw = optionalText(stats.publicBaseUrl)
  const publicUrl = publicRaw ? normalizePublicFileUrl(publicRaw) : null
  const usagePct = Math.min(100, Math.max(0, Number(stats.usagePercent)))
  const daysRemaining = Number(stats.daysRemaining)
  const periodDays = Number(stats.periodDays || 30n)
  const expiryPct = active ? Math.min(100, Math.max(2, (daysRemaining / periodDays) * 100)) : 0

  const filteredFiles = files.filter((f) => {
    if (category === 'all') return true
    return getFileCategory(f.contentType, f.path) === category
  })

  const confirmRenew = async () => {
    setBusy(true)
    const result = await renewBucket(identity, bucketId)
    setBusy(false)
    if ('err' in result) return
    refreshWallet()
    await Promise.all([refresh(), invalidate()])
    setRenewOpen(false)
  }

  const handleCopy = async () => {
    if (!publicUrl) return
    await copyText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async (path: string) => {
    const result = await deleteFile(identity, bucketId, path)
    if ('err' in result) return result.err
    await Promise.all([refresh(), refreshFiles(), invalidate()])
    return null
  }

  return (
    <View className="gap-5 pt-2 pb-16">
      {/* Header Row */}
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-2xl font-bold tracking-tight text-foreground" numberOfLines={1}>
            {stats.name}
          </Text>
          <Text className="mt-0.5 text-xs text-muted-foreground">
            {stats.visibility && 'open' in stats.visibility ? t('public') : t('private')} ·{' '}
            <Text className={active ? 'text-emerald-500 font-semibold' : 'text-destructive font-semibold'}>
              {active ? t('active') : t('expired')}
            </Text>
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full px-3" onPress={() => setConnectOpen(true)}>
            Connect
          </Button>
          <Button variant="outline" size="sm" className="rounded-full px-3" onPress={() => setKeysOpen(true)}>
            API Keys
          </Button>
          <Button size="sm" className="rounded-full px-3.5" onPress={() => setRenewOpen(true)}>
            {t('renew')}
          </Button>
        </View>
      </View>

      {/* Dual Progress Stats Card */}
      <View className="gap-4 rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
        {/* Storage Bar */}
        <View className="gap-1.5">
          <View className="flex-row items-center justify-between text-xs">
            <Text className="text-xs font-semibold text-foreground">{t('usage')}</Text>
            <Text className="text-xs text-muted-foreground tabular-nums">
              {formatBytes(stats.storageUsed)}{' '}
              <Text className="text-muted-foreground/70">/ {formatBytes(stats.capacity)} ({usagePct}%)</Text>
            </Text>
          </View>
          <View className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <View className="h-full rounded-full bg-primary" style={{ width: `${Math.max(2, usagePct)}%` }} />
          </View>
        </View>

        {/* Expiry Bar */}
        <View className="gap-1.5">
          <View className="flex-row items-center justify-between text-xs">
            <Text className="text-xs font-semibold text-foreground">Plan Status</Text>
            <Text
              className={`text-xs tabular-nums font-semibold ${
                !active
                  ? 'text-destructive'
                  : daysRemaining <= 3
                    ? 'text-destructive'
                    : daysRemaining <= 7
                      ? 'text-amber-500'
                      : 'text-foreground'
              }`}
            >
              {active ? t('daysLeft', { days: daysRemaining }) : t('expired')}
            </Text>
          </View>
          <View className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <View
              className={`h-full rounded-full ${
                !active
                  ? 'bg-destructive'
                  : daysRemaining <= 3
                    ? 'bg-destructive'
                    : daysRemaining <= 7
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
              }`}
              style={{ width: `${expiryPct}%` }}
            />
          </View>
        </View>

        {/* Public CDN URL Row */}
        {publicUrl ? (
          <View className="flex-row items-center gap-2 rounded-2xl border border-border/50 bg-muted/40 p-2.5">
            <Text className="min-w-0 flex-1 font-mono text-xs text-muted-foreground" numberOfLines={1} ellipsizeMode="middle">
              {publicUrl}
            </Text>
            <Button
              variant="outline"
              size="icon-sm"
              className="size-8 rounded-xl"
              accessibilityLabel={copied ? tc('copied') : t('copyUrl')}
              onPress={() => void handleCopy()}
            >
              {copied ? <AppIcon name="check" size={14} /> : <FileIcon name="copy" size={14} />}
            </Button>
          </View>
        ) : null}
      </View>

      {/* Files Section */}
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-foreground">{t('files')}</Text>
          <Text className="text-xs text-muted-foreground tabular-nums">
            {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
          </Text>
        </View>

        {/* Category Filter Chips */}
        {files.length > 0 ? (
          <View className="flex-row flex-wrap gap-1.5">
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'images', label: 'Images' },
                { key: 'documents', label: 'Docs' },
                { key: 'media', label: 'Media' },
                { key: 'code', label: 'Code' },
                { key: 'archives', label: 'Archives' },
              ] as const
            ).map((cat) => {
              const activeCat = category === cat.key
              return (
                <Pressable
                  key={cat.key}
                  onPress={() => setCategory(cat.key)}
                  className={`rounded-full px-3 py-1 border ${
                    activeCat
                      ? 'bg-primary border-primary'
                      : 'bg-muted/40 border-border/60 active:bg-muted'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      activeCat ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        ) : null}

        {filteredFiles.length === 0 ? (
          <View className="items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 py-10">
            <Text className="text-sm font-medium text-muted-foreground">
              {files.length === 0 ? t('noFiles') : 'No files in this category'}
            </Text>
          </View>
        ) : (
          <View className="gap-2">
            {filteredFiles.map((file) => (
              <BucketFileRow key={file.id} file={file} onPreview={setPreview} />
            ))}
          </View>
        )}
      </View>

      <BucketFilePreviewSheet
        bucketId={bucketId}
        file={preview}
        open={preview !== null}
        onOpenChange={(next) => {
          if (!next) setPreview(null)
        }}
        onDelete={handleDelete}
      />
      <BucketApiKeysSheet bucketId={bucketId} open={keysOpen} onOpenChange={setKeysOpen} />
      <BucketConnectSheet
        bucketId={bucketId}
        stats={stats}
        open={connectOpen}
        onOpenChange={setConnectOpen}
        onOpenApiKeys={() => setKeysOpen(true)}
      />
      <Sheet open={renewOpen} onOpenChange={setRenewOpen} title={t('renewTitle')} description={t('renewBody')}>
        <Text className="text-sm leading-relaxed text-muted-foreground">
          {t('renewConfirm', { price: formatAmount(stats.renewPriceE8s) })}
        </Text>
        <Button size="lg" className="mt-5 w-full" disabled={busy} onPress={() => void confirmRenew()}>
          {busy ? t('renewing') : t('renew')}
        </Button>
      </Sheet>
    </View>
  )
}
