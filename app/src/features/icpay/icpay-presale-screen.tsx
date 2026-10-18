import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { Image } from 'expo-image'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { AppIcon } from '@/components/ui/app-icon'
import { SendSuccess } from '@/components/shared/send-success'
import { IcpayPresaleBuySheet } from '@/features/icpay/icpay-presale-buy-sheet'
import { PresaleGuideSheet } from '@/features/icpay/presale-guide-sheet'
import { PresaleStatsPanel } from '@/features/icpay/presale-stats-panel'
import { useAuth } from '@/components/auth/auth-provider'
import { useIcpaySale } from '@/hooks/use-icpay-sale'
import { useIcpayStats } from '@/hooks/use-icpay-stats'
import { useLiveBalance, useRefreshWallet } from '@/hooks/use-wallet-data'
import { hasSeenPresaleGuide, markPresaleGuideSeen } from '@/lib/icpay/presaleGuide'
import { buyIcpay, icpayReceiveAmount } from '@/services/icpay/sale'
import type { IcpayPurchase } from '@/services/wallet'
import { parseTokenAmount } from '@/lib/wallet-utils'
import { images } from '@/constants/images'
import { usePaymentPin } from '@/features/security/use-payment-pin'

const ICP_DECIMALS = 8
const ICPAY_SYMBOL = 'ICPAY'

export function IcpayPresaleScreen() {
  const t = useTranslations('buyIcpay')
  const { identity } = useAuth()
  const { stats } = useIcpayStats()
  const { sale, rate, isLoading, refresh } = useIcpaySale()
  const balance = useLiveBalance()
  const refreshWallet = useRefreshWallet()
  const [buyOpen, setBuyOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<IcpayPurchase | null>(null)
  const pin = usePaymentPin(buyOpen)
  const icpAmount = parseTokenAmount(value, ICP_DECIMALS)
  const receive = icpAmount !== null && rate !== undefined ? icpayReceiveAmount(icpAmount, rate) : null
  const symbol = stats?.symbol ?? ICPAY_SYMBOL

  useEffect(() => {
    if (sale?.active && !hasSeenPresaleGuide()) setGuideOpen(true)
  }, [sale?.active])

  const submit = async () => {
    if (!icpAmount) return
    if (!(await pin.gate())) return
    setLoading(true)
    setError(null)
    const result = await buyIcpay(identity, icpAmount)
    setLoading(false)
    if ('err' in result) {
      setError(result.err)
      return
    }
    refreshWallet()
    await refresh()
    setBuyOpen(false)
    setSuccess(result.ok)
  }

  if (success) {
    return (
      <SendSuccess
        amount={success.icpayAmount}
        recipient={success.destination || t('yourWallet')}
        blockIndex={success.icpayBlock}
        kind="icpayBuy"
        symbol="ICPAY"
        decimals={ICP_DECIMALS}
        onDone={() => setSuccess(null)}
      />
    )
  }

  if (isLoading && !sale) {
    return (
      <View className="items-center pt-16">
        <Spinner />
      </View>
    )
  }

  return (
    <View className="gap-5 pt-2 pb-16">
      <View>
        <Text className="text-2xl font-bold tracking-tight">{t('heroTitle')}</Text>
        <Text className="mt-1 text-sm text-muted-foreground">{t('pageSubtitle')}</Text>
      </View>

      <View className="gap-5 rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
        {/* Token Header Row */}
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-row items-center gap-3.5">
            <View className="size-13 overflow-hidden rounded-full border border-border/50 bg-muted">
              <Image source={images.icpayToken} className="size-full" contentFit="cover" />
            </View>
            <View>
              <View className="flex-row items-center gap-2">
                <Text className="text-lg font-bold text-foreground">{t('heroTitle')}</Text>
                {sale?.active ? (
                  <View className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5">
                    <Text className="text-[10px] font-bold text-primary">{t('liveBadge')}</Text>
                  </View>
                ) : null}
              </View>
              <Text className="mt-0.5 text-xs text-muted-foreground">{t('heroSubtitle')}</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('viewGuide')}
            onPress={() => setGuideOpen(true)}
            className="size-8 items-center justify-center rounded-full bg-muted/60 active:bg-muted"
          >
            <AppIcon name="info" size={16} />
          </Pressable>
        </View>

        {/* Presale Rate Banner */}
        <View className="items-center rounded-2xl border border-border/50 bg-muted/30 py-3.5 px-4">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {t('rateInfoTitle')}
          </Text>
          <Text className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums">{t('heroRate')}</Text>
        </View>

        {/* Progress & Raised Stats */}
        <PresaleStatsPanel sale={sale} symbol={symbol} isLoading={isLoading} />

        {/* Liquidity Protection Note */}
        <View className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
          <Text className="text-xs leading-relaxed text-muted-foreground">{t('liquidityInfo')}</Text>
        </View>

        {/* Action Button */}
        <Button
          size="lg"
          className="w-full"
          disabled={!sale?.active}
          onPress={() => setBuyOpen(true)}
        >
          {sale?.active ? t('openBuy') : t('soldOut')}
        </Button>
      </View>

      <IcpayPresaleBuySheet
        open={buyOpen}
        onOpenChange={setBuyOpen}
        value={value}
        onValue={(next) => {
          setValue(next)
          setError(null)
        }}
        receive={receive}
        rate={rate}
        balance={balance}
        sale={sale}
        error={error}
        loading={loading}
        pinStep={pin.pinStep}
        onConfirm={() => void submit()}
        onPinVerified={() => {
          pin.onVerified()
          void submit()
        }}
        onPinBack={pin.cancel}
      />
      <PresaleGuideSheet
        open={guideOpen}
        onClose={() => {
          markPresaleGuideSeen()
          setGuideOpen(false)
        }}
      />
    </View>
  )
}
