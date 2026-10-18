import { View, Pressable } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Text } from '@/components/ui/text'
import { Spinner } from '@/components/ui/spinner'
import { UserAvatar } from '@/components/ui/user-avatar'
import { PremiumBadge } from '@/components/shared/premium-badge'
import { ScoreCircle } from '@/features/transfer/trust-signals'
import { useRecipientProfile, useRecipientTxCount } from '@/hooks/use-wallet-data'
import { shortPrincipal } from '@/lib/wallet-utils'
import { cn } from '@/lib/utils'

const USERNAME_MIN_LENGTH = 1

export function RecipientCard({
  username,
  principal,
  className,
  onPress,
}: {
  username: string
  principal?: string | null
  className?: string
  onPress?: () => void
}) {
  const cleanName = username.trim().replace(/^@/, '')
  const profile = useRecipientProfile(cleanName, principal ?? null)
  const txCount = useRecipientTxCount(principal ?? null)

  const content = (
    <View
      className={cn(
        'flex-row items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 p-3',
        className,
      )}
    >
      <UserAvatar seed={cleanName} size={38} />

      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
            {cleanName}
          </Text>
          <PremiumBadge name={cleanName} size={14} />
        </View>
        {principal ? (
          <Text className="font-mono text-xs text-muted-foreground" numberOfLines={1}>
            {shortPrincipal(principal)}
          </Text>
        ) : null}
      </View>

      <ScoreCircle
        username={cleanName}
        createdAtNs={profile?.createdAt}
        txCount={txCount}
      />
    </View>
  )

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-80">
        {content}
      </Pressable>
    )
  }

  return content
}

export function RecipientLookup({
  username,
  principal,
  isLoading,
  onSelect,
}: {
  username: string
  principal: string | null
  isLoading: boolean
  onSelect?: () => void
}) {
  const t = useTranslations('transfer')
  const trimmed = username.trim().replace(/^@/, '')
  if (trimmed.length < USERNAME_MIN_LENGTH) return null

  if (isLoading) {
    return (
      <View className="flex-row items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 p-3">
        <Spinner />
        <Text className="text-xs text-muted-foreground">
          {t('lookingUp', { name: trimmed })}
        </Text>
      </View>
    )
  }

  if (!principal) {
    return (
      <View className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-3 py-2.5">
        <Text className="text-xs text-muted-foreground">
          {t('noAccount', { name: trimmed })}
        </Text>
      </View>
    )
  }

  return (
    <RecipientCard
      username={trimmed}
      principal={principal}
      onPress={onSelect}
    />
  )
}
