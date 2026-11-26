import { Actor } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { createAgent } from "@/services/icp"
import type { Identity } from "@icp-sdk/core/agent"

export const CYCLEPAY_BACKEND_CANISTER_ID = "2bwus-iiaaa-aaaac-bee3a-cai"
export const CYCLEPAY_CONSOLE_CANISTER_ID = "to2ii-4iaaa-aaaac-bgdma-cai"
export const CYCLES_LEDGER_CANISTER_ID = "um5iw-rqaaa-aaaaq-qaaba-cai"
export const CK_USDC_LEDGER_CANISTER_ID = "xevnm-gaaaa-aaaar-qafnq-cai"

export const STRIPE_FEE_BPS = 290n
export const STRIPE_FEE_FIXED_USD_CENTS = 30n
export const MIN_ORDER_USD_CENTS = 100n
export const MAX_ORDER_USD_CENTS = 20_000n

export function calculateStripeFee(amountUsdCents: bigint): bigint {
  if (amountUsdCents <= 0n) return 0n
  const variable = (amountUsdCents * STRIPE_FEE_BPS + 5000n) / 10_000n
  return variable + STRIPE_FEE_FIXED_USD_CENTS
}

export function estimateCardCycles(
  amountUsdCents: bigint,
  xdrUsdPermyriad: bigint
): bigint {
  if (amountUsdCents <= 0n || xdrUsdPermyriad <= 0n) return 0n
  const fee = calculateStripeFee(amountUsdCents)
  const netCents = amountUsdCents > fee ? amountUsdCents - fee : 0n
  const TRILLION = 1_000_000_000_000n
  return (netCents * 100n * TRILLION) / xdrUsdPermyriad
}

export function getCyclePayGuestUrl(canisterId: string, usdAmount: number): string {
  const safeUsd = Math.max(5, Math.min(100, Math.round(usdAmount)))
  return `https://www.cyclepay.org/c/${encodeURIComponent(canisterId.trim())}/${safeUsd}`
}

export function formatUsdCents(cents: bigint): string {
  const dollars = Number(cents) / 100
  return dollars.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Candid interface factory for CyclePay backend query and order methods
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cyclepayIdlFactory = ({ IDL }: any) => {
  const XdrRateStatus = IDL.Record({
    xdr_usd_x10000: IDL.Nat64,
    source: IDL.Variant({
      Xrc: IDL.Null,
      Legacy: IDL.Null,
      Manual: IDL.Null,
    }),
    updated_at: IDL.Opt(IDL.Nat64),
    stale: IDL.Bool,
  })

  const CardTerms = IDL.Record({
    payment_link: IDL.Text,
    min_order_usd_cents: IDL.Nat64,
    max_order_usd_cents: IDL.Nat64,
    fee_bps: IDL.Nat64,
    fee_fixed_usd_cents: IDL.Nat64,
    ledger_delivery_fee_cycles: IDL.Nat,
    deliveries_paused: IDL.Bool,
  })

  const CreateOrderArgs = IDL.Record({
    destination: IDL.Variant({
      Canister: IDL.Principal,
      Ledger: IDL.Null,
    }),
    beneficiary: IDL.Opt(IDL.Principal),
    amount_usd_cents: IDL.Nat64,
    escrow_spender: IDL.Opt(IDL.Principal),
    escrow_principal: IDL.Opt(IDL.Principal),
    project_id: IDL.Opt(IDL.Text),
    confirm_system_canister: IDL.Opt(IDL.Bool),
  })

  const CreatedOrder = IDL.Record({
    order_id: IDL.Text,
    payment_url: IDL.Text,
    client_reference_id: IDL.Text,
    amount_usd_cents: IDL.Nat64,
    net_usd_cents: IDL.Nat64,
    destination: IDL.Variant({
      Canister: IDL.Principal,
      Ledger: IDL.Principal,
    }),
    expires_at: IDL.Nat64,
  })

  const OrderError = IDL.Record({
    code: IDL.Text,
    message: IDL.Text,
  })

  const OrderStatus = IDL.Variant({
    AwaitingPayment: IDL.Null,
    PaymentPending: IDL.Null,
    Processing: IDL.Null,
    Delivered: IDL.Null,
    NeedsReview: IDL.Null,
    Refunding: IDL.Null,
    Refunded: IDL.Null,
    RefundOwed: IDL.Null,
  })

  const OrderStatusView = IDL.Record({
    status: OrderStatus,
    cycles_delivered: IDL.Opt(IDL.Nat64),
    paid_usd_cents: IDL.Opt(IDL.Nat64),
    amount_refunded_usd_cents: IDL.Nat64,
    detail: IDL.Opt(IDL.Text),
  })

  return IDL.Service({
    get_xdr_rate_status: IDL.Func([], [XdrRateStatus], ["query"]),
    get_card_terms: IDL.Func([], [CardTerms], ["query"]),
    create_order: IDL.Func(
      [CreateOrderArgs],
      [IDL.Variant({ Ok: CreatedOrder, Err: OrderError })]
    ),
    order_status: IDL.Func([IDL.Text], [IDL.Opt(OrderStatusView)], ["query"]),
  })
}

export type CyclePayXdrRate = {
  ratePermyriad: bigint
  usdPerXdr: number
  stale: boolean
}

export type CyclePayCardOrder = {
  orderId: string
  paymentUrl: string
  amountUsdCents: bigint
  netUsdCents: bigint
  expiresAt: bigint
}

export type CyclePayOrderStatus = {
  status:
    | "AwaitingPayment"
    | "PaymentPending"
    | "Processing"
    | "Delivered"
    | "NeedsReview"
    | "Refunding"
    | "Refunded"
    | "RefundOwed"
    | "Unknown"
  cyclesDelivered: bigint | null
  paidUsdCents: bigint | null
  detail: string | null
}

export async function fetchCyclePayXdrRate(
  identity?: Identity
): Promise<CyclePayXdrRate> {
  const agent = await createAgent(identity)
  const actor = Actor.createActor<{
    get_xdr_rate_status: () => Promise<{
      xdr_usd_x10000: bigint
      stale: boolean
    }>
  }>(cyclepayIdlFactory, {
    agent,
    canisterId: Principal.fromText(CYCLEPAY_BACKEND_CANISTER_ID),
  })
  const res = await actor.get_xdr_rate_status()
  const ratePermyriad = res.xdr_usd_x10000
  const usdPerXdr = Number(ratePermyriad) / 10_000
  return { ratePermyriad, usdPerXdr, stale: res.stale }
}

export async function createCyclePayCardOrder(
  canisterId: string,
  amountUsdCents: bigint,
  identity?: Identity
): Promise<CyclePayCardOrder> {
  const agent = await createAgent(identity)
  const actor = Actor.createActor<{
    create_order: (args: unknown) => Promise<{
      Ok?: {
        order_id: string
        payment_url: string
        client_reference_id: string
        amount_usd_cents: bigint
        net_usd_cents: bigint
        expires_at: bigint
      }
      Err?: { code: string; message: string }
    }>
  }>(cyclepayIdlFactory, {
    agent,
    canisterId: Principal.fromText(CYCLEPAY_BACKEND_CANISTER_ID),
  })

  const targetPrincipal = Principal.fromText(canisterId.trim())
  const res = await actor.create_order({
    destination: { Canister: targetPrincipal },
    beneficiary: [],
    amount_usd_cents: amountUsdCents,
    escrow_spender: [],
    escrow_principal: [],
    project_id: [],
    confirm_system_canister: [],
  })

  if (res.Err) {
    throw new Error(`${res.Err.code}: ${res.Err.message}`)
  }
  if (!res.Ok) {
    throw new Error("Failed to create card order: empty response")
  }

  return {
    orderId: res.Ok.order_id,
    paymentUrl: res.Ok.payment_url,
    amountUsdCents: res.Ok.amount_usd_cents,
    netUsdCents: res.Ok.net_usd_cents,
    expiresAt: res.Ok.expires_at,
  }
}

export async function pollCyclePayOrderStatus(
  orderId: string,
  identity?: Identity
): Promise<CyclePayOrderStatus> {
  const agent = await createAgent(identity)
  const actor = Actor.createActor<{
    order_status: (id: string) => Promise<
      [] | [{
        status: Record<string, null>
        cycles_delivered: [] | [bigint]
        paid_usd_cents: [] | [bigint]
        amount_refunded_usd_cents: bigint
        detail: [] | [string]
      }]
    >
  }>(cyclepayIdlFactory, {
    agent,
    canisterId: Principal.fromText(CYCLEPAY_BACKEND_CANISTER_ID),
  })

  const res = await actor.order_status(orderId)
  if (!res || res.length === 0) {
    return {
      status: "Unknown",
      cyclesDelivered: null,
      paidUsdCents: null,
      detail: null,
    }
  }

  const raw = res[0]
  const statusKey = (Object.keys(raw.status)[0] ?? "Unknown") as CyclePayOrderStatus["status"]
  return {
    status: statusKey,
    cyclesDelivered: raw.cycles_delivered[0] ?? null,
    paidUsdCents: raw.paid_usd_cents[0] ?? null,
    detail: raw.detail[0] ?? null,
  }
}
