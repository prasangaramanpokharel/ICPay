import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Text } from '@/components/ui/text'
import { icpServiceDebit, icpServiceFee, requiredBalance, requiredIcpSwapBalance, swapRate } from '@/lib/swap-utils'
import { formatTokenAmount } from '@/lib/wallet-utils'
import { ICP_LEDGER_ID, type TokenHolding } from '@/services/tokens'
import type { SwapQuoteResult } from '@/services/types'

export function SwapFeeStats({
  tokenIn,
  tokenOut,
  amountIn,
  quote,
  icpToken,
}: {
  tokenIn: TokenHolding
  tokenOut: TokenHolding | null
  amountIn: bigint
  quote: SwapQuoteResult | undefined
  icpToken: TokenHolding | undefined
}) {
  const t = useTranslations('swap')
  const serviceFee = icpServiceFee()
  const serviceDebit = icpToken ? icpServiceDebit(icpToken.fee) : null
  const totalDebit =
    tokenIn.ledgerId === ICP_LEDGER_ID && serviceDebit
      ? requiredIcpSwapBalance(amountIn, tokenIn.fee, serviceDebit)
      : requiredBalance(amountIn, tokenIn.fee)
  const rate = quote && amountIn > 0n ? swapRate(amountIn, quote.amountOut) : null

  return (
    <View className="rounded-2xl border border-border/50 bg-muted/20 px-4 py-3">
      {rate && tokenOut ? (
        <View className="mb-2 flex-row items-center justify-between border-b border-border/40 pb-2">
          <Text className="text-xs text-muted-foreground">{t('rate')}</Text>
          <Text className="text-xs font-semibold tabular-nums text-foreground">
            1 {tokenIn.symbol} ≈ {rate} {tokenOut.symbol}
          </Text>
        </View>
      ) : null}

      <View className="gap-1">
        {icpToken ? (
          <FeeRow label={t('icpServiceFee')} value={`${formatTokenAmount(serviceFee, icpToken.decimals)} ${icpToken.symbol}`} />
        ) : null}
        {quote ? (
          <FeeRow label={t('poolFee')} value={`${formatTokenAmount(quote.swapFee, tokenIn.decimals)} ${tokenIn.symbol}`} />
        ) : null}
        <FeeRow label={t('ledgerFees')} value={`${formatTokenAmount(3n * tokenIn.fee, tokenIn.decimals)} ${tokenIn.symbol}`} />
      </View>

      <View className="mt-2.5 flex-row justify-between border-t border-border/40 pt-2.5">
        <Text className="text-xs font-semibold text-foreground">{t('totalDebit')}</Text>
        <Text className="text-xs font-semibold tabular-nums text-foreground">
          {formatTokenAmount(totalDebit, tokenIn.decimals)} {tokenIn.symbol}
        </Text>
      </View>
    </View>
  )
}

function FeeRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-0.5">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="text-xs tabular-nums text-muted-foreground">{value}</Text>
    </View>
  )
}
