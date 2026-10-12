import { useState, useEffect } from 'react'
import { View, Pressable, Linking } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet } from '@/components/ui/sheet'
import { AppIcon } from '@/components/ui/app-icon'
import { useAuth } from '@/components/auth/auth-provider'
import { copyText, shortPrincipal } from '@/lib/wallet-utils'
import { getItem, setItem } from '@/services/storage/kv'
import { Principal } from '@icp-sdk/core/principal'

type SavedCanister = {
  id: string
  name: string
  addedAt: number
}

const STORAGE_KEY_PREFIX = 'icpay:saved-canisters:'

function getSavedCanisters(principal: string | undefined): SavedCanister[] {
  if (!principal) return []
  const raw = getItem(STORAGE_KEY_PREFIX + principal)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as SavedCanister[]) : []
  } catch {
    return []
  }
}

function saveCanisters(principal: string | undefined, list: SavedCanister[]) {
  if (!principal) return
  setItem(STORAGE_KEY_PREFIX + principal, JSON.stringify(list))
}

export function CanisterScreen() {
  const t = useTranslations('myCanisters')
  const tc = useTranslations('common')
  const { identity } = useAuth()
  const principal = identity?.getPrincipal().toText()
  const [canisters, setCanisters] = useState<SavedCanister[]>([])
  const [copiedPrincipal, setCopiedPrincipal] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [draftId, setDraftId] = useState('')
  const [draftName, setDraftName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (principal) {
      setCanisters(getSavedCanisters(principal))
    }
  }, [principal])

  const handleCopyPrincipal = async () => {
    if (!principal) return
    await copyText(principal)
    setCopiedPrincipal(true)
    setTimeout(() => setCopiedPrincipal(false), 2000)
  }

  const handleCopyCanisterId = async (id: string) => {
    await copyText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleLink = () => {
    const trimmedId = draftId.trim()
    if (!trimmedId) return
    try {
      Principal.fromText(trimmedId)
    } catch {
      setError('Invalid Canister Principal ID')
      return
    }

    const next: SavedCanister[] = [
      {
        id: trimmedId,
        name: draftName.trim() || trimmedId.slice(0, 8),
        addedAt: Date.now(),
      },
      ...canisters.filter((c) => c.id !== trimmedId),
    ]

    setCanisters(next)
    saveCanisters(principal, next)
    setDraftId('')
    setDraftName('')
    setError(null)
    setLinkOpen(false)
  }

  const handleRemove = (id: string) => {
    const next = canisters.filter((c) => c.id !== id)
    setCanisters(next)
    saveCanisters(principal, next)
  }

  return (
    <View className="gap-6 pt-2 pb-16">
      <View>
        <Text className="text-xl font-bold tracking-tight">{t('title')}</Text>
        <Text className="text-sm text-muted-foreground">{t('subtitle')}</Text>
      </View>

      {/* Controller Principal Card */}
      {principal ? (
        <View className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
          <View className="flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1">
              <Text className="text-xs font-semibold text-foreground">{t('yourPrincipal')}</Text>
              <Text className="mt-1 font-mono text-xs text-muted-foreground" numberOfLines={1}>
                {principal}
              </Text>
            </View>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-3"
              onPress={() => void handleCopyPrincipal()}
            >
              {copiedPrincipal ? tc('copied') : t('copyPrincipal')}
            </Button>
          </View>
        </View>
      ) : null}

      {/* Top action bar */}
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold text-foreground">Tracked Canisters</Text>
        <Button size="sm" className="rounded-full px-4" onPress={() => setLinkOpen(true)}>
          + {t('link')}
        </Button>
      </View>

      {/* Canister list */}
      {canisters.length === 0 ? (
        <View className="items-center justify-center rounded-3xl border border-dashed border-border/60 bg-muted/20 py-12 px-6 text-center">
          <View className="size-12 items-center justify-center rounded-2xl bg-muted/60 mb-3">
            <AppIcon name="canister" size={24} />
          </View>
          <Text className="text-center text-sm font-medium text-muted-foreground">
            {t('empty')}
          </Text>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 rounded-full"
            onPress={() => setLinkOpen(true)}
          >
            {t('linkTitle')}
          </Button>
        </View>
      ) : (
        <View className="gap-3">
          {canisters.map((item) => (
            <View
              key={item.id}
              className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
            >
              <View className="flex-row items-start justify-between gap-3">
                <View className="min-w-0 flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View className="size-2 rounded-full bg-emerald-500" />
                  </View>
                  <Text className="mt-1 font-mono text-xs text-muted-foreground" numberOfLines={1}>
                    {item.id}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 rounded-lg"
                    accessibilityLabel="Copy Canister ID"
                    onPress={() => void handleCopyCanisterId(item.id)}
                  >
                    {copiedId === item.id ? (
                      <AppIcon name="check" size={14} />
                    ) : (
                      <AppIcon name="copy" size={14} />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 rounded-lg text-muted-foreground"
                    accessibilityLabel="Open Dashboard"
                    onPress={() =>
                      void Linking.openURL(`https://dashboard.internetcomputer.org/canister/${item.id}`)
                    }
                  >
                    <AppIcon name="website" size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 rounded-lg text-destructive"
                    accessibilityLabel="Remove"
                    onPress={() => handleRemove(item.id)}
                  >
                    <AppIcon name="delete" size={14} />
                  </Button>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Link Canister Sheet */}
      <Sheet
        open={linkOpen}
        onOpenChange={setLinkOpen}
        title={t('linkTitle')}
        description={t('linkDesc')}
      >
        <View className="gap-4 pt-2">
          <View className="gap-1.5">
            <Text className="text-xs font-semibold text-foreground">{t('canisterId')}</Text>
            <Input
              value={draftId}
              onChangeText={(v) => {
                setDraftId(v)
                setError(null)
              }}
              placeholder="e.g. 6vbhm-nqaaa-aaaan-q6muq-cai"
              autoCapitalize="none"
              className="font-mono text-xs"
            />
          </View>
          <View className="gap-1.5">
            <Text className="text-xs font-semibold text-foreground">{t('canisterName')}</Text>
            <Input
              value={draftName}
              onChangeText={setDraftName}
              placeholder="e.g. Backend API"
            />
          </View>
          {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
          <Button
            size="lg"
            className="mt-2 w-full"
            disabled={!draftId.trim()}
            onPress={handleLink}
          >
            {t('link')}
          </Button>
        </View>
      </Sheet>
    </View>
  )
}
