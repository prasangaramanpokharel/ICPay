import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { Image } from 'expo-image'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { AppIcon } from '@/components/ui/app-icon'
import { FileIcon } from '@/features/bucket/file-icon'
import { Text } from '@/components/ui/text'
import { fileDisplayName, ellipsizeFileName, normalizePublicFileUrl } from '@/lib/bucket/file-preview'
import { fileIconName } from '@/lib/bucket/file-kind'
import { getFileBadge, formatFileDate, getFileCategory } from '@/lib/bucket/file-category'
import { copyText } from '@/lib/wallet-utils'
import { formatBytes, optionalText } from '@/lib/bucket/bucket'
import type { FilePublic } from '@/services/bucket/types'

export function BucketFileRow({
  file,
  onPreview,
}: {
  file: FilePublic
  onPreview: (file: FilePublic) => void
}) {
  const t = useTranslations('bucket')
  const tc = useTranslations('common')
  const [copied, setCopied] = useState(false)
  const publicRaw = optionalText(file.publicUrl)
  const publicUrl = publicRaw ? normalizePublicFileUrl(publicRaw) : null
  const fileName = fileDisplayName(file.path, file.name)
  const kind = fileIconName(file.contentType, file.path)
  const category = getFileCategory(file.contentType, file.path)
  const badge = getFileBadge(file.contentType, file.path)
  const dateStr = formatFileDate(file.createdAt)
  const isImage = category === 'images' && !!publicUrl

  const handleCopy = async () => {
    if (!publicUrl) return
    await copyText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
      <Pressable
        onPress={() => onPreview(file)}
        className="size-11 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-muted/60"
      >
        {isImage ? (
          <Image
            source={{ uri: publicUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <FileIcon name={kind} size={22} />
        )}
      </Pressable>

      <Pressable onPress={() => onPreview(file)} className="min-w-0 flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-sm font-semibold text-foreground" numberOfLines={1} ellipsizeMode="middle">
            {ellipsizeFileName(fileName)}
          </Text>
          <View className="rounded-md bg-muted px-1.5 py-0.5">
            <Text className="text-[10px] font-bold text-muted-foreground uppercase">{badge}</Text>
          </View>
        </View>
        <Text className="mt-0.5 text-xs text-muted-foreground" numberOfLines={1}>
          {formatBytes(file.size)}
          {dateStr ? ` · ${dateStr}` : ''}
        </Text>
      </Pressable>

      {publicUrl ? (
        <Button
          variant="outline"
          size="icon-sm"
          className="size-8 rounded-xl"
          accessibilityLabel={copied ? tc('copied') : t('copyUrl')}
          onPress={() => void handleCopy()}
        >
          {copied ? <AppIcon name="check" size={14} /> : <FileIcon name="copy" size={14} />}
        </Button>
      ) : null}
    </View>
  )
}
