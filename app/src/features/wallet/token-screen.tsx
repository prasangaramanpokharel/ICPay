import { useState } from 'react'
import { Linking, Pressable, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { AppIcon } from '@/components/ui/app-icon'
import { TokenActionButton } from '@/components/wallet/token-action-button'
import { TokenLogo } from '@/components/shared/token-logo'
import { SendSuccess } from '@/components/shared/send-success'
import { SendTokenSheet } from '@/features/wallet/send-token-sheet'
import { useAuth } from '@/components/auth/auth-provider'
import { useRefreshWallet, useTokenHolding } from '@/hooks/use-wallet-data'
import { transfer, type TransferMode } from '@/services/transfer/transfer'
import { isSwapToken } from '@/lib/swap-tokens'
import { formatTokenAmount } from '@/lib/wallet-utils'
import { ICP_LEDGER_ID } from '@/services/tokens'

export function TokenScreen() {
  const t = useTranslations('token')
  const { ledgerId } = useLocalSearchParams<{ ledgerId: string }>()
  const id = typeof ledgerId === 'string' ? ledgerId : ''
  const { token, isLoading } = useTokenHolding(id || null)
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const router = useRouter()
  const [sendOpen, setSendOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sent, setSent] = useState<{ amount: bigint; recipient: string; blockIndex: bigint; memo?: string } | null>(null)

  const handleSend = async (
    mode: TransferMode,
    to: string,
    amount: bigint,
    memo?: string,
    subaccount?: Uint8Array,
  ) => {
    if (!token) return 'Missing token'
    const result = await transfer(identity, token.ledgerId, mode, to, amount, memo, subaccount)
    if ('err' in result) return result.err
    refreshWallet()
    setSent({
      amount,
      recipient: mode === 'username' ? `@${to}` : to,
      blockIndex: result.ok.blockIndex,
      memo,
    })
    return null
  }

  const copyLedgerId = async () => {
    if (!token) return
    await Clipboard.setStringAsync(token.ledgerId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading && !token) {
    return (
      <View className="gap-4 pt-2">
        <Text className="text-sm text-muted-foreground">…</Text>
      </View>
    )
  }

  if (!token) {
    return (
      <View className="gap-4 pt-2">
        <Button variant="ghost" size="sm" className="self-start" onPress={() => router.push('/wallet')}>
          {t('back')}
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{t('notFound')}</AlertDescription>
        </Alert>
      </View>
    )
  }

  if (sent) {
    return (
      <SendSuccess
        amount={sent.amount}
        recipient={sent.recipient}
        blockIndex={sent.blockIndex}
        memo={sent.memo}
        symbol={token.symbol}
        decimals={token.decimals}
        onDone={() => setSent(null)}
      />
    )
  }

  const swap = isSwapToken(token.ledgerId)
  const marketUrl = `https://app.icpswap.com/swap?input=${ICP_LEDGER_ID}&output=${token.ledgerId}`

  return (
    <View className="gap-6 pt-2">
      <Button variant="ghost" size="sm" className="self-start -ml-2" onPress={() => router.push('/wallet')}>
        {t('back')}
      </Button>

      {/* Hero: Logo and Balance */}
      <View className="items-center gap-2.5">
        <TokenLogo token={token} size={64} />
        <Text className="text-3xl font-bold tabular-nums tracking-tight">
          {formatTokenAmount(token.balance, token.decimals, token.decimals)}
        </Text>
        <Text className="text-sm font-semibold text-muted-foreground">{token.symbol}</Text>
        {token.name !== token.symbol ? (
          <Text className="text-xs text-muted-foreground">{token.name}</Text>
        ) : null}
      </View>

      {/* Action buttons */}
      <View className="flex-row justify-center gap-6">
        <TokenActionButton kind="send" label={t('send')} onPress={() => setSendOpen(true)} />
        <TokenActionButton
          kind="deposit"
          label={t('deposit')}
          onPress={() => router.push(`/token/${token.ledgerId}/deposit` as never)}
        />
        {swap ? (
          <TokenActionButton kind="swap" label={t('swap')} onPress={() => router.push('/swap' as never)} />
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Market"
          onPress={() => void Linking.openURL(marketUrl)}
          className="items-center gap-2 active:opacity-80"
        >
          <View className="size-11 items-center justify-center rounded-full bg-muted/60 border border-border/50">
            <AppIcon name="launch" size={18} />
          </View>
          <Text className="text-[11px] font-medium text-muted-foreground">Market</Text>
        </Pressable>
      </View>

      {/* Token Details Card */}
      <View className="rounded-2xl border border-border/50 bg-card p-4 gap-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-xs text-muted-foreground">Standard</Text>
          <View className="rounded-full bg-muted/60 px-2 py-0.5">
            <Text className="text-xs font-medium text-foreground">ICRC-1 / ICRC-2</Text>
          </View>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-xs text-muted-foreground">Transfer fee</Text>
          <Text className="text-xs font-medium tabular-nums text-foreground">
            {formatTokenAmount(token.fee, token.decimals)} {token.symbol}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-xs text-muted-foreground">Decimals</Text>
          <Text className="text-xs font-medium tabular-nums text-foreground">{token.decimals}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-xs text-muted-foreground">Ledger ID</Text>
          <Pressable onPress={() => void copyLedgerId()} className="active:opacity-70">
            <Text numberOfLines={1} className="text-xs font-mono text-primary max-w-[200px]">
              {copied ? 'Copied!' : token.ledgerId}
            </Text>
          </Pressable>
        </View>
      </View>

      <SendTokenSheet open={sendOpen} onOpenChange={setSendOpen} token={token} onSend={handleSend} />
    </View>
  )
}
