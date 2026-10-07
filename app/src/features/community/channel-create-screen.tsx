import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/components/auth/auth-provider'
import { useInvalidateCommunityLists } from '@/hooks/use-community'
import { parseCommunityPriceIcp } from '@/lib/community/format'
import { createCommunityChannel } from '@/services/community/community'
import { cn } from '@/lib/utils'

export function ChannelCreateScreen() {
  const t = useTranslations('community')
  const router = useRouter()
  const { identity } = useAuth()
  const invalidate = useInvalidateCommunityLists()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [bio, setBio] = useState('')
  const [price, setPrice] = useState('0.5')
  const [paid, setPaid] = useState(false)
  const [privateChannel, setPrivateChannel] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleNameChange = (val: string) => {
    setName(val)
    if (!slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 32))
    }
  }

  const submit = async () => {
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
    if (!name.trim() || cleanSlug.length < 3) {
      setError(t('slugInvalid'))
      return
    }
    const priceE8s = paid ? parseCommunityPriceIcp(price) : 0n
    if (paid && priceE8s === null) {
      setError(t('priceInvalid', { min: '0.1', max: '10' }))
      return
    }
    setBusy(true)
    setError(null)
    try {
      await createCommunityChannel(
        identity,
        name.trim(),
        cleanSlug,
        bio.trim(),
        privateChannel ? { inviteOnly: null } : { open: null },
        paid ? { paid: null } : { free: null },
        priceE8s ?? 0n,
      )
      await invalidate()
      router.replace(`/channels/${cleanSlug}` as never)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('createFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <View className="gap-5 pt-2 pb-16">
      <View>
        <Text className="text-2xl font-bold tracking-tight">{t('createTitle')}</Text>
        <Text className="mt-1 text-sm text-muted-foreground">{t('createSubtitle')}</Text>
      </View>

      <View className="gap-4 rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
        {/* Channel Name */}
        <View className="gap-1.5">
          <Text className="text-xs font-semibold text-foreground">{t('name')}</Text>
          <Input
            value={name}
            onChangeText={handleNameChange}
            placeholder={t('namePlaceholder')}
            maxLength={80}
          />
        </View>

        {/* Username / Slug */}
        <View className="gap-1.5">
          <Text className="text-xs font-semibold text-foreground">{t('slug')}</Text>
          <Input
            value={slug}
            onChangeText={(v) => setSlug(v.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="alpha_calls"
            autoCapitalize="none"
            maxLength={32}
          />
          <Text className="text-[11px] text-muted-foreground">{t('slugHint')}</Text>
        </View>

        {/* Bio / Description */}
        <View className="gap-1.5">
          <Text className="text-xs font-semibold text-foreground">{t('bio')}</Text>
          <Input
            value={bio}
            onChangeText={setBio}
            placeholder={t('bioPlaceholder')}
            multiline
            numberOfLines={3}
            style={{ minHeight: 74, textAlignVertical: 'top' }}
          />
        </View>

        {/* Visibility Segmented Control */}
        <View className="gap-1.5">
          <Text className="text-xs font-semibold text-foreground">{t('visibility')}</Text>
          <View className="flex-row rounded-2xl border border-border/50 bg-muted/50 p-1">
            <Pressable
              onPress={() => setPrivateChannel(false)}
              className={cn(
                'flex-1 items-center justify-center rounded-xl py-2.5 transition-all',
                !privateChannel ? 'bg-background shadow-xs' : 'bg-transparent',
              )}
            >
              <Text
                className={cn(
                  'text-xs',
                  !privateChannel ? 'font-bold text-foreground' : 'font-medium text-muted-foreground',
                )}
              >
                {t('public')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPrivateChannel(true)}
              className={cn(
                'flex-1 items-center justify-center rounded-xl py-2.5 transition-all',
                privateChannel ? 'bg-background shadow-xs' : 'bg-transparent',
              )}
            >
              <Text
                className={cn(
                  'text-xs',
                  privateChannel ? 'font-bold text-foreground' : 'font-medium text-muted-foreground',
                )}
              >
                {t('private')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Access Model Segmented Control */}
        <View className="gap-1.5">
          <Text className="text-xs font-semibold text-foreground">{t('access')}</Text>
          <View className="flex-row rounded-2xl border border-border/50 bg-muted/50 p-1">
            <Pressable
              onPress={() => setPaid(false)}
              className={cn(
                'flex-1 items-center justify-center rounded-xl py-2.5 transition-all',
                !paid ? 'bg-background shadow-xs' : 'bg-transparent',
              )}
            >
              <Text
                className={cn(
                  'text-xs',
                  !paid ? 'font-bold text-foreground' : 'font-medium text-muted-foreground',
                )}
              >
                {t('free')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPaid(true)}
              className={cn(
                'flex-1 items-center justify-center rounded-xl py-2.5 transition-all',
                paid ? 'bg-background shadow-xs' : 'bg-transparent',
              )}
            >
              <Text
                className={cn(
                  'text-xs',
                  paid ? 'font-bold text-foreground' : 'font-medium text-muted-foreground',
                )}
              >
                {t('paid')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Paid Admission Fee Input */}
        {paid ? (
          <View className="gap-1.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5">
            <Text className="text-xs font-semibold text-foreground">{t('price')}</Text>
            <Input
              value={price}
              onChangeText={setPrice}
              placeholder="0.5"
              keyboardType="decimal-pad"
            />
            <Text className="text-[11px] text-muted-foreground">{t('priceHint')}</Text>
          </View>
        ) : null}

        {error ? (
          <View className="rounded-xl border border-destructive/30 bg-destructive/10 p-3">
            <Text className="text-xs font-medium text-destructive">{error}</Text>
          </View>
        ) : null}

        <Button
          size="lg"
          className="mt-2 w-full"
          disabled={busy || !name.trim() || slug.length < 3}
          onPress={() => void submit()}
        >
          {busy ? (
            <View className="flex-row items-center gap-2">
              <Spinner />
              <Text className="text-sm font-semibold text-primary-foreground">{t('creating')}</Text>
            </View>
          ) : (
            t('create')
          )}
        </Button>
      </View>
    </View>
  )
}
