import type { Principal } from "@icp-sdk/core/principal"
import type { Identity } from "@icp-sdk/core/agent"
import { call, type Outcome } from "@/services/client"
import { isSwapToken } from "@/lib/swap/tokens"
import { isLedgerSupported } from "@/services/tokens"
import { getTradeActor } from "@/services/trade/actor"
import { fetchTradeQuote, type TradeQuoteFees } from "@/services/trade/quote"
import type {
  CandidLimitOrder,
  CandidTradeRecord,
  LimitOrder,
  LimitOrderStatus,
  TradeDepositResult,
  TradeQuoteResult,
  TradeRecord,
  TradeResult,
} from "@/services/trade/types"

export type TradeQuoteOpts = TradeQuoteFees & {
  skipAllowlistCheck?: boolean
}

export { fetchTradeQuote }

/** Preload trade actor while the user prepares order. */
export async function warmTradeSession(identity: Identity | undefined): Promise<void> {
  if (!identity) return
  await getTradeActor(identity)
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

function toTradeResult(ok: {
  blockIndex?: bigint
  block_index?: bigint
  amountIn?: bigint
  amount_in?: bigint
  amountOut?: bigint
  amount_out?: bigint
  icpServiceFee?: bigint
  service_fee?: bigint
  txId?: string
  tx_id?: string
}): TradeResult {
  return {
    blockIndex:
      "block_index" in ok && ok.block_index !== undefined
        ? ok.block_index
        : "blockIndex" in ok && ok.blockIndex !== undefined
          ? ok.blockIndex
          : 0n,
    amountIn:
      "amount_in" in ok && ok.amount_in !== undefined
        ? ok.amount_in
        : "amountIn" in ok && ok.amountIn !== undefined
          ? ok.amountIn
          : 0n,
    amountOut:
      "amount_out" in ok && ok.amount_out !== undefined
        ? ok.amount_out
        : "amountOut" in ok && ok.amountOut !== undefined
          ? ok.amountOut
          : 0n,
    serviceFee:
      "service_fee" in ok && ok.service_fee !== undefined
        ? ok.service_fee
        : "icpServiceFee" in ok && ok.icpServiceFee !== undefined
          ? ok.icpServiceFee
          : 0n,
    txId:
      "tx_id" in ok && ok.tx_id !== undefined
        ? ok.tx_id
        : "txId" in ok && ok.txId !== undefined
          ? ok.txId
          : "",
  }
}

/** Execute instant market swap directly on the Trade Canister */
export async function runTrade(
  identity: Identity | undefined,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  amountOutMin: bigint
): Promise<Outcome<TradeResult>> {
  if (!identity) return { err: "Authentication required" }
  try {
    const actor = await getTradeActor(identity)
    const res = await actor.execute_swap(tokenIn, tokenOut, amountIn, amountOutMin)
    if ("Ok" in res) return { ok: toTradeResult(res.Ok) }
    if ("ok" in res) return { ok: toTradeResult(res.ok) }
    if ("Err" in res) return { err: res.Err }
    if ("err" in res) return { err: res.err }
    return { err: "Trade failed" }
  } catch (e) {
    return { err: e instanceof Error ? e.message : "Trade failed" }
  }
}

function parseLimitOrderStatus(status: CandidLimitOrder["status"]): LimitOrderStatus {
  if ("Filled" in status) return "Filled"
  if ("Cancelled" in status) return "Cancelled"
  return "Open"
}

function fromCandidLimitOrder(order: CandidLimitOrder): LimitOrder {
  return {
    id: order.id,
    user: order.user.toText(),
    tokenIn: order.token_in,
    tokenOut: order.token_out,
    amountIn: order.amount_in,
    minAmountOut: order.min_amount_out,
    createdAtNs: order.created_at_ns,
    filledAtNs: order.filled_at_ns.length > 0 ? order.filled_at_ns[0] : undefined,
    status: parseLimitOrderStatus(order.status),
  }
}

function fromCandidTradeRecord(rec: CandidTradeRecord): TradeRecord {
  return {
    serviceFee: rec.service_fee,
    txId: rec.tx_id,
    timestampNs: rec.timestamp_ns,
    tokenIn: rec.token_in,
    amountOut: rec.amount_out,
    amountIn: rec.amount_in,
    tokenOut: rec.token_out,
  }
}

/** Fetch user trade execution history directly from on-chain audit logs */
export async function getUserTrades(
  identity: Identity | undefined,
  limit: number = 50
): Promise<TradeRecord[]> {
  if (!identity) return []
  const actor = await getTradeActor(identity)
  const res = await actor.get_user_trades(identity.getPrincipal(), [BigInt(limit)])
  return res.map(fromCandidTradeRecord)
}


/** Fetch open limit orders, optionally for a specific user */
export async function getOpenLimitOrders(
  identity: Identity | undefined,
  onlyUser = false
): Promise<LimitOrder[]> {
  const actor = await getTradeActor(identity)
  const userParam: [] | [Principal] =
    onlyUser && identity ? [identity.getPrincipal()] : []
  const res = await actor.get_open_limit_orders(userParam)
  return res.map(fromCandidLimitOrder)
}

/** Fetch all limit orders placed by current user across all statuses */
export async function getUserLimitOrders(
  identity: Identity | undefined,
  limit: number = 50
): Promise<LimitOrder[]> {
  if (!identity) return []
  const actor = await getTradeActor(identity)
  const res = await actor.get_user_limit_orders(identity.getPrincipal(), [BigInt(limit)])
  return res.map(fromCandidLimitOrder)
}

/** Place a new limit order, locking tokens into trade escrow */
export async function placeLimitOrder(
  identity: Identity | undefined,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  minAmountOut: bigint
): Promise<Outcome<LimitOrder>> {
  if (!identity) return { err: "Authentication required" }
  try {
    const actor = await getTradeActor(identity)
    const res = await actor.place_limit_order(tokenIn, tokenOut, amountIn, minAmountOut)
    if ("Ok" in res) return { ok: fromCandidLimitOrder(res.Ok) }
    if ("ok" in res) return { ok: fromCandidLimitOrder(res.ok) }
    if ("Err" in res) return { err: res.Err }
    if ("err" in res) return { err: res.err }
    return { err: "Failed to place limit order" }
  } catch (e) {
    return { err: e instanceof Error ? e.message : "Failed to place limit order" }
  }
}

/** Cancel an open limit order and refund escrow back to trading balance */
export async function cancelLimitOrder(
  identity: Identity | undefined,
  orderId: bigint
): Promise<Outcome<bigint>> {
  if (!identity) return { err: "Authentication required" }
  try {
    const actor = await getTradeActor(identity)
    const res = await actor.cancel_limit_order(orderId)
    if ("Ok" in res) return { ok: res.Ok }
    if ("ok" in res) return { ok: res.ok }
    if ("Err" in res) return { err: res.Err }
    if ("err" in res) return { err: res.err }
    return { err: "Failed to cancel limit order" }
  } catch (e) {
    return { err: e instanceof Error ? e.message : "Failed to cancel limit order" }
  }
}

/** Get configured cold treasury principal */
export async function getTreasury(identity?: Identity): Promise<string> {
  const actor = await getTradeActor(identity)
  const p = await actor.get_treasury()
  return p.toText()
}

/** Sweep protocol fees to cold treasury (Treasury / Admin only) */
export async function sweepFees(
  identity: Identity | undefined,
  token: string
): Promise<Outcome<bigint>> {
  if (!identity) return { err: "Authentication required" }
  try {
    const actor = await getTradeActor(identity)
    const res = await actor.sweep_fees(token)
    if ("Ok" in res) return { ok: res.Ok }
    if ("ok" in res) return { ok: res.ok }
    if ("Err" in res) return { err: res.Err }
    if ("err" in res) return { err: res.err }
    return { err: "Failed to sweep fees" }
  } catch (e) {
    return { err: e instanceof Error ? e.message : "Failed to sweep fees" }
  }
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
