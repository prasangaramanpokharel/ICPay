import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { useDebounced } from "@/hooks/use-debounced"
import { useTokenHoldings } from "@/hooks/use-wallet-data"
import { DEFAULT_SWAP_TOKENS, filterSwapTokens, isSwapToken, sortSwapTokens } from "@/lib/swap-tokens"
import { fetchSwapQuote } from "@/services/swap/swap"

const keyFor = (identity: { getPrincipal(): { toText(): string } } | undefined, ...parts: string[]) =>
  identity ? ([...parts, identity.getPrincipal().toText()] as const) : null

export function useSwapTokens() {
  const { holdings, isLoading } = useTokenHoldings()
  const holdingMap = new Map(holdings.map((h) => [h.ledgerId, h]))

  // Fallback to default pinned tokens so swap pairs are always available
  const baseTokens = DEFAULT_SWAP_TOKENS.map((def) => {
    const held = holdingMap.get(def.ledgerId)
    return held ? held : def
  })

  // Add any custom or dynamically discovered swap-eligible holdings
  for (const held of holdings) {
    if (isSwapToken(held.ledgerId) && !baseTokens.some((b) => b.ledgerId === held.ledgerId)) {
      baseTokens.push(held)
    }
  }

  const tokens = sortSwapTokens(baseTokens)
  return { tokens, isLoading }
}


export function useSwapQuote(tokenIn: string | null, tokenOut: string | null, amountIn: bigint) {
  const { identity } = useAuth()
  const debouncedAmount = useDebounced(amountIn, 300)

  const enabled =
    tokenIn &&
    tokenOut &&
    tokenIn !== tokenOut &&
    debouncedAmount > 0n

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    enabled ? keyFor(identity, "swap-quote", tokenIn, tokenOut, debouncedAmount.toString()) : null,
    () => fetchSwapQuote(identity, tokenIn!, tokenOut!, debouncedAmount),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 3_000,
      errorRetryCount: 1,
    }
  )

  return { quote: data, error, isLoading: isLoading || isValidating, refresh: mutate }
}
