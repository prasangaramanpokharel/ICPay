import { ICP_LEDGER_ID, PINNED_LEDGER_IDS } from "@/services/tokens"

export const ICPSWAP_FACTORY_ID = "4mmnk-kiaaa-aaaag-qbllq-cai"

export const ICPSWAP_FEE_TIERS = [500, 3000, 10_000] as const

const CHAIN_KEY_LEDGER_SET = new Set(PINNED_LEDGER_IDS)

export function isSwapBlocked(ledgerId: string): boolean {
  return !ledgerId
}

export function icpSwapTokenStandard(ledgerId: string): "ICP" | "ICRC2" | "ICRC1" {
  if (ledgerId === ICP_LEDGER_ID) return "ICP"
  if (CHAIN_KEY_LEDGER_SET.has(ledgerId)) return "ICRC2"
  return "ICRC1"
}

export function swapPairKey(tokenA: string, tokenB: string): string {
  return tokenA < tokenB ? `${tokenA}#${tokenB}` : `${tokenB}#${tokenA}`
}
