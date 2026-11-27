import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { call, type Outcome } from "@/services/client"
import { TRADE_CANISTER_ID } from "@/services/icp"
import { icrcLedger } from "@/services/ledger/icrc"
import { getWalletActor } from "@/services/wallet"
import { isSwapToken } from "@/lib/swap/tokens"
import { isLedgerSupported } from "@/services/tokens"
import { getTradeActor } from "@/services/trade/actor"
import { fetchTradeQuote, type TradeQuoteFees } from "@/services/trade/quote"
import type { TradeDepositResult, TradeQuoteResult, TradeResult, CandidTradeResult } from "@/services/trade/types"

export type TradeQuoteOpts = TradeQuoteFees & {
  skipAllowlistCheck?: boolean
}

export { fetchTradeQuote }

export async function warmTradeSession(identity: Identity | undefined): Promise<void> {
  if (!identity) return
  await Promise.all([getWalletActor(identity), getTradeActor(identity)])
}

export async function getTradingBalance(
  identity: Identity | undefined,
  token: string
): Promise<bigint> {
  if (!identity) return 0n
  const actor = await getTradeActor(identity)
  return actor.get_trading_balance(identity.getPrincipal(), token)
}

export async function depositForTrade(
  identity: Identity | undefined,
  token: string,
  amount: bigint
): Promise<Outcome<TradeDepositResult>> {
  return call(identity, "Deposit failed", async (actor) => {
    const r = await actor.depositForTrade(token, amount)
    return r as Outcome<TradeDepositResult>
  })
}

export async function withdrawFromTrade(
  identity: Identity | undefined,
  token: string,
  amount: bigint
): Promise<Outcome<TradeDepositResult>> {
  return call(identity, "Withdraw failed", async (actor) => {
    const r = await actor.withdrawFromTrade(token, amount)
    return r as Outcome<TradeDepositResult>
  })
}

function parseTradeSwapResult(result: CandidTradeResult): Outcome<TradeResult> {
  if ("Err" in result) return { err: result.Err }
  if ("err" in result) return { err: result.err }
  const raw = "Ok" in result ? result.Ok : result.ok
  return {
    ok: {
      blockIndex: raw.block_index,
      amountIn: raw.amount_in,
      amountOut: raw.amount_out,
      serviceFee: raw.service_fee,
      txId: raw.tx_id,
    },
  }
}

export async function executeTradeSwap(
  identity: Identity | undefined,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  amountOutMin: bigint
): Promise<Outcome<TradeResult>> {
  if (!identity) return { err: "Not authenticated" }
  try {
    const actor = await getTradeActor(identity)
    const result = await actor.execute_swap(tokenIn, tokenOut, amountIn, amountOutMin)
    const parsed = parseTradeSwapResult(result)
    if ("err" in parsed) return parsed
    return parsed
  } catch (e) {
    console.error(e)
    return { err: "Trade failed" }
  }
}

const SETTLE_POLL_DELAYS_MS = [1_500, 2_000, 2_500, 3_000, 4_000] as const
const WITHDRAW_RETRY_DELAY_MS = 2_500
const MAX_WITHDRAW_ATTEMPTS = 3

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

async function waitForTradeLiquidity(
  identity: Identity | undefined,
  ledgerId: string,
  requiredAmount: bigint
): Promise<void> {
  if (requiredAmount <= 0n) return
  try {
    const ledger = await icrcLedger(identity, ledgerId)
    const owner = Principal.fromText(TRADE_CANISTER_ID)
    for (let i = 0; i <= SETTLE_POLL_DELAYS_MS.length; i++) {
      const balance = await ledger.balance({ owner, certified: false })
      if (balance >= requiredAmount) return
      const delay = SETTLE_POLL_DELAYS_MS[i]
      if (!delay) return
      await sleep(delay)
    }
  } catch {
    // Fall through to withdraw attempt; withdraw will return exact ledger error if still unsettled.
  }
}

export function isTransientWithdrawError(err: string): boolean {
  return err.toLowerCase().includes("insufficient funds")
}

export async function runWithWithdrawRetry<T>(
  attempt: () => Promise<Outcome<T>>,
  beforeAttempt?: (attemptIndex: number) => Promise<void>,
  delayMs: number = WITHDRAW_RETRY_DELAY_MS
): Promise<Outcome<T>> {
  let last: Outcome<T> = { err: "Withdraw failed" }
  for (let i = 0; i < MAX_WITHDRAW_ATTEMPTS; i++) {
    if (i > 0 && delayMs > 0) await sleep(delayMs)
    if (beforeAttempt) await beforeAttempt(i)
    last = await attempt()
    if (!("err" in last) || !isTransientWithdrawError(last.err)) {
      return last
    }
  }
  return last
}

export async function runTrade(
  identity: Identity | undefined,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  amountOutMin: bigint
): Promise<Outcome<TradeResult>> {
  const deposit = await depositForTrade(identity, tokenIn, amountIn)
  if ("err" in deposit) return deposit

  const swap = await executeTradeSwap(identity, tokenIn, tokenOut, amountIn, amountOutMin)
  if ("err" in swap) {
    const refund = await runWithWithdrawRetry(
      () => withdrawFromTrade(identity, tokenIn, amountIn),
      () => waitForTradeLiquidity(identity, tokenIn, amountIn)
    )
    if ("err" in refund) {
      return {
        err: `${swap.err}. Your ${tokenIn} is in trade balance — withdraw it below or in History.`,
      }
    }
    return swap
  }

  const withdraw = await runWithWithdrawRetry(
    () => withdrawFromTrade(identity, tokenOut, swap.ok.amountOut),
    () => waitForTradeLiquidity(identity, tokenOut, swap.ok.amountOut)
  )
  if ("err" in withdraw) {
    return {
      err: `Swap succeeded but withdraw failed: ${withdraw.err}. Withdraw it directly below.`,
    }
  }

  return swap
}

export async function fetchTradeQuoteChecked(
  identity: Identity | undefined,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  opts: TradeQuoteOpts = {}
): Promise<TradeQuoteResult> {
  if (tokenIn === tokenOut) throw new Error("sameToken")
  if (!isSwapToken(tokenIn) || !isSwapToken(tokenOut)) throw new Error("unsupported")

  if (!opts.skipAllowlistCheck) {
    const blocked = await checkTradePair(identity, tokenIn, tokenOut)
    if (blocked === "sameToken") throw new Error("sameToken")
    if (blocked === "unsupported") throw new Error("unsupported")
  }

  return fetchTradeQuote(identity, tokenIn, tokenOut, amountIn, opts)
}

export async function checkTradePair(
  identity: Identity | undefined,
  tokenIn: string,
  tokenOut: string
): Promise<"sameToken" | "unsupported" | null> {
  if (tokenIn === tokenOut) return "sameToken"
  if (!isSwapToken(tokenIn) || !isSwapToken(tokenOut)) return "unsupported"
  const [inOk, outOk] = await Promise.all([
    isLedgerSupported(identity, tokenIn),
    isLedgerSupported(identity, tokenOut),
  ])
  if (!inOk || !outOk) return "unsupported"
  return null
}

export async function tradeHealth(identity?: Identity): Promise<string> {
  const actor = await getTradeActor(identity)
  return actor.health()
}
