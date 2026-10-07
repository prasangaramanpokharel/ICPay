import { ICPAY_LEDGER_ID } from "@/services/icpay/icpay"
import { ICP_LEDGER_ID, PINNED_LEDGER_IDS, type TokenHolding } from "@/services/tokens"

/** ICPAY has no ICPSwap liquidity — keep it out of the swap picker. */
export function isSwapToken(ledgerId: string): boolean {
  return ledgerId !== ICPAY_LEDGER_ID
}

export const DEFAULT_SWAP_TOKENS: TokenHolding[] = [
  {
    ledgerId: ICP_LEDGER_ID,
    symbol: 'ICP',
    name: 'Internet Computer',
    decimals: 8,
    fee: 10_000n,
    balance: 0n,
  },
  {
    ledgerId: 'mxzaz-hqaaa-aaaar-qaada-cai',
    symbol: 'ckBTC',
    name: 'Chain-key Bitcoin',
    decimals: 8,
    fee: 10n,
    balance: 0n,
  },
  {
    ledgerId: 'ss2fx-dyaaa-aaaar-qacoq-cai',
    symbol: 'ckETH',
    name: 'Chain-key Ethereum',
    decimals: 18,
    fee: 2_000_000_000_000n,
    balance: 0n,
  },
  {
    ledgerId: 'xevnm-gaaaa-aaaar-qafnq-cai',
    symbol: 'ckUSDC',
    name: 'Chain-key USD Coin',
    decimals: 6,
    fee: 10_000n,
    balance: 0n,
  },
  {
    ledgerId: 'cngnf-vqaaa-aaaar-qag4q-cai',
    symbol: 'ckUSDT',
    name: 'Chain-key Tether USD',
    decimals: 6,
    fee: 10_000n,
    balance: 0n,
  },
]


export function filterSwapTokens(holdings: TokenHolding[]): TokenHolding[] {
  return holdings.filter((t) => isSwapToken(t.ledgerId))
}

function pinRank(ledgerId: string): number {
  const i = PINNED_LEDGER_IDS.indexOf(ledgerId)
  return i === -1 ? PINNED_LEDGER_IDS.length : i
}

/** Pinned tokens first, then by balance, then symbol. */
export function sortSwapTokens(tokens: TokenHolding[]): TokenHolding[] {
  return [...tokens].sort((a, b) => {
    const pr = pinRank(a.ledgerId) - pinRank(b.ledgerId)
    if (pr !== 0) return pr
    if (a.balance !== b.balance) return a.balance > b.balance ? -1 : 1
    return a.symbol.localeCompare(b.symbol)
  })
}

export function defaultSwapPair(tokens: TokenHolding[]): { tokenIn: TokenHolding; tokenOut: TokenHolding } | null {
  const list = sortSwapTokens(filterSwapTokens(tokens))
  if (list.length < 2) return null
  const icp = list.find((t) => t.ledgerId === ICP_LEDGER_ID)
  const ck = list.find((t) => t.ledgerId !== ICP_LEDGER_ID && t.balance > 0n)
  if (icp && ck && ck.ledgerId !== icp.ledgerId) {
    return ck.balance > icp.balance ? { tokenIn: ck, tokenOut: icp } : { tokenIn: icp, tokenOut: ck }
  }
  return { tokenIn: list[0], tokenOut: list[1] }
}
