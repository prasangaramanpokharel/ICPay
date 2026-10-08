import { useMemo, useState } from 'react'
import { FlatList, Pressable, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { CommunityAvatar } from '@/components/community/community-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useAuth } from '@/components/auth/auth-provider'
import {
  useCommunityChannel,
  useCommunityDeleteMessage,
  useCommunityMembership,
  useCommunityMessages,
  useCommunityPinMessage,
  useCommunityPostMessage,
  useCommunityReaction,
  useInvalidateCommunityLists,
  useMyCommunityChannels,
} from '@/hooks/use-community'
import { formatCommunityPriceE8s, formatMessageTime } from '@/lib/community/format'
import { REACTIONS, reactionEmoji } from '@/lib/community/reactions'
import {
  isCommunityOpen,
  isCommunityPaid,
  joinCommunityChannel,
  leaveCommunityChannel,
  ownerHandle,
  type CommunityMessagePublic,
} from '@/services/community/community'

export function ChannelScreen() {
  const { slug, code } = useLocalSearchParams<{ slug: string; code?: string }>()
  const channelSlug = Array.isArray(slug) ? slug[0] : slug
  const inviteCode = Array.isArray(code) ? code[0] : code
  const t = useTranslations('community')
  const { identity } = useAuth()
  const { channel, isLoading, refresh } = useCommunityChannel(channelSlug ?? '')
  const { isMember, mutate: mutateMember } = useCommunityMembership(channelSlug ?? '')
  const mine = useMyCommunityChannels()
  const invalidateLists = useInvalidateCommunityLists(channelSlug)
  const [joinBusy, setJoinBusy] = useState(false)
  const [joinErr, setJoinErr] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [postBusy, setPostBusy] = useState(false)

  const isOwner = useMemo(() => {
    if (!channel || !identity) return false
    return channel.owner.toText() === identity.getPrincipal().toText()
  }, [channel, identity])

  const isJoined = useMemo(() => {
    if (isOwner || isMember) return true
    return mine.channels.some((ch) => ch.slug === channelSlug)
  }, [isOwner, isMember, mine.channels, channelSlug])

  const canRead =
    !!channel &&
    (isOwner || isJoined || (isCommunityOpen(channel.visibility) && !isCommunityPaid(channel.access)))

  const { messages, isLoading: messagesLoading } = useCommunityMessages(channelSlug ?? '', canRead)
  const postMessage = useCommunityPostMessage(channelSlug ?? '')
  const pinMessage = useCommunityPinMessage(channelSlug ?? '')
  const deleteMessage = useCommunityDeleteMessage(channelSlug ?? '')
  const react = useCommunityReaction(channelSlug ?? '')

  const handleJoin = async () => {
    if (!channelSlug) return
    setJoinBusy(true)
    setJoinErr(null)
    try {
      await joinCommunityChannel(identity, channelSlug, inviteCode)
      await mutateMember(true)
      await invalidateLists()
      await refresh()
    } catch (e) {
      setJoinErr(e instanceof Error ? e.message : t('joinFailed'))
    } finally {
      setJoinBusy(false)
    }
  }

  const handleLeave = async () => {
    if (!channelSlug) return
    setJoinBusy(true)
    try {
      await leaveCommunityChannel(identity, channelSlug)
      await mutateMember(false)
      await invalidateLists()
    } finally {
      setJoinBusy(false)
    }
  }

  const handlePost = async () => {
    const text = draft.trim()
    if (!text) return
    setPostBusy(true)
    try {
      await postMessage(text)
      setDraft('')
    } catch {
      // keep draft
    } finally {
      setPostBusy(false)
    }
  }

  if (!channelSlug) return null
  if (isLoading && !channel) {
    return (
      <View className="items-center pt-16">
        <Spinner />
      </View>
    )
  }
  if (!channel) {
    return (
      <View className="items-center gap-2 pt-16">
        <Text className="font-medium">{t('empty')}</Text>
      </View>
    )
  }

  const paid = isCommunityPaid(channel.access)
  const needsJoin = !canRead

  return (
    <View className="flex-1 gap-3 pt-2">
      <View className="flex-row items-center gap-3.5 rounded-3xl border border-border/60 bg-card/60 p-4 shadow-sm">
        <CommunityAvatar slug={channel.slug} size={50} />
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-bold text-foreground" numberOfLines={1}>
              {channel.name}
            </Text>
            {paid ? (
              <View className="rounded-full bg-amber-500/15 px-2 py-0.5">
                <Text className="text-[10px] font-bold text-amber-500">PRO</Text>
              </View>
            ) : null}
          </View>
          <Text className="mt-0.5 text-xs text-muted-foreground" numberOfLines={1}>
            {ownerHandle(channel)} · {t('membersCount', { count: channel.memberCount.toString() })}
          </Text>
          {channel.bio ? (
            <Text className="mt-1 text-xs text-muted-foreground/90" numberOfLines={2}>
              {channel.bio}
            </Text>
          ) : null}
        </View>
      </View>

      {needsJoin ? (
        <View className="gap-3 rounded-3xl border border-border/60 bg-muted/30 p-4">
          <Text className="text-sm text-muted-foreground">{t('joinToRead')}</Text>
          {paid ? (
            <Text className="text-sm font-medium">
              {t('joinPrice', { price: formatCommunityPriceE8s(channel.priceE8s) })}
            </Text>
          ) : null}
          {joinErr ? <Text className="text-sm text-destructive">{joinErr}</Text> : null}
          <Button disabled={joinBusy} onPress={() => void handleJoin()}>
            {joinBusy ? t('joining') : paid ? t('payToJoin', { price: formatCommunityPriceE8s(channel.priceE8s) }) : t('getIn')}
          </Button>
        </View>
      ) : (
        <>
          {!isOwner && isJoined ? (
            <Button variant="outline" size="sm" disabled={joinBusy} onPress={() => void handleLeave()}>
              {t('leave')}
            </Button>
          ) : null}
          {messagesLoading && messages.length === 0 ? (
            <View className="items-center py-10">
              <Spinner />
            </View>
          ) : messages.length === 0 ? (
            <Text className="py-8 text-center text-sm text-muted-foreground">{t('noMessages')}</Text>
          ) : (
            <FlatList
              data={[...messages].reverse()}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ gap: 12, paddingBottom: 130 }}
              renderItem={({ item }) => (
                <MessageRow
                  message={item}
                  isOwner={isOwner}
                  pinnedId={channel.pinnedMessageId[0]}
                  onPin={() => void pinMessage(item.id)}
                  onDelete={() => void deleteMessage(item.id)}
                  onReact={(code) => void react(item.id, code)}
                />
              )}
            />
          )}
          {isOwner ? (
            <View className="gap-2 border-t border-border/40 pt-2 pb-2">
              <Input
                value={draft}
                onChangeText={setDraft}
                placeholder={t('postPlaceholder')}
                multiline
              />
              <Button disabled={postBusy || !draft.trim()} onPress={() => void handlePost()}>
                {postBusy ? t('creating') : t('sendAria')}
              </Button>
            </View>
          ) : null}
        </>
      )}
    </View>
  )
}

function MessageRow({
  message,
  isOwner,
  pinnedId,
  onPin,
  onDelete,
  onReact,
}: {
  message: CommunityMessagePublic
  isOwner: boolean
  pinnedId?: bigint
  onPin: () => void
  onDelete: () => void
  onReact: (code: (typeof REACTIONS)[number]['code']) => void
}) {
  const t = useTranslations('community')
  const author = message.authorUsername[0] ? `@${message.authorUsername[0]}` : message.author.toText().slice(0, 8)
  const pinned = pinnedId === message.id

  return (
    <View className="gap-2.5 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-2">
          <Text className="text-xs font-semibold text-primary">{author}</Text>
          {pinned ? (
            <View className="rounded-full bg-primary/10 px-2 py-0.5">
              <Text className="text-[10px] font-semibold text-primary">{t('pinned')}</Text>
            </View>
          ) : null}
        </View>
        <Text className="text-[10px] text-muted-foreground">{formatMessageTime(message.createdAt)}</Text>
      </View>
      <Text className="text-sm leading-relaxed text-foreground">{message.text}</Text>
      <View className="flex-row flex-wrap items-center gap-1.5 pt-1">
        {REACTIONS.map((r) => {
          const count = message.reactions.find((row) => Number(row.code) === r.code)?.count ?? 0n
          if (count === 0n) return null
          return (
            <Pressable
              key={r.code}
              onPress={() => onReact(r.code)}
              className="flex-row items-center gap-1 rounded-full border border-border/60 bg-muted/60 px-2.5 py-1 active:bg-muted"
            >
              <Text className="text-xs">{reactionEmoji(r.code)}</Text>
              <Text className="text-xs font-semibold tabular-nums text-foreground">{count.toString()}</Text>
            </Pressable>
          )
        })}
        <View className="flex-row items-center rounded-full border border-border/40 bg-muted/30 px-1 py-0.5">
          {REACTIONS.map((r) => (
            <Pressable
              key={r.code}
              onPress={() => onReact(r.code)}
              className="size-7 items-center justify-center rounded-full active:bg-muted/80"
            >
              <Text className="text-sm">{r.emoji}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {isOwner ? (
        <View className="flex-row gap-4 border-t border-border/30 pt-2">
          <Pressable onPress={onPin} hitSlop={6}>
            <Text className="text-xs text-muted-foreground">{pinned ? t('unpin') : t('pin')}</Text>
          </Pressable>
          <Pressable onPress={onDelete} hitSlop={6}>
            <Text className="text-xs text-destructive">{t('delete')}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  )
}
