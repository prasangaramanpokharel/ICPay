"use client"

import { useFiatValue } from "@/hooks/fiat/useFiatValue"
import { tokenUsdValue } from "@/lib/token/price"
import { useTokenRegistry, useTokenUsdPrice } from "@/lib/token/registry"
import { useBalanceVisibility } from "@/components/wallet/balance-visibility-provider"

type TokenFiatHintProps = {
  ledgerId: string
  amount: bigint
  decimals: number
  className?: string
}

export function TokenFiatHint({ ledgerId, amount, decimals, className }: TokenFiatHintProps) {
  const { hidden } = useBalanceVisibility()
  const registry = useTokenRegistry()
  const priceUsd = useTokenUsdPrice(ledgerId, registry)
  const usd = tokenUsdValue(amount, decimals, priceUsd)
  const fiat = useFiatValue(usd)

  if (hidden || fiat.formatted === null) return null

  return (
    <p className={className ?? "text-xs text-muted-foreground tabular-nums"}>
      {fiat.symbol}
      {fiat.formatted} {fiat.currency}
    </p>
  )
}
