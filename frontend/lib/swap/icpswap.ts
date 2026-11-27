import { Actor, type HttpAgent } from "@icp-sdk/core/agent"
import type { IDL } from "@icp-sdk/core/candid"
import {
  ICPSWAP_FACTORY_ID,
  ICPSWAP_FEE_TIERS,
  icpSwapTokenStandard,
  swapPairKey,
} from "@/lib/swap/config"

export type IcpswapPoolRef = {
  poolId: string
  token0: string
  fee: number
  zeroForOne: boolean
}

export type IcpswapQuoteWithImpact = {
  amountOut: bigint
  priceImpact: string
  priceImpactPct: number | null
}

type IcpswapError =
  | { CommonError: null }
  | { InternalError: string }
  | { UnsupportedToken: string }
  | { InsufficientFunds: null }

type PoolData = {
  canisterId: { toText(): string }
  fee: bigint
  key: string
  tickSpacing: bigint
  token0: { address: string; standard: string }
  token1: { address: string; standard: string }
}

type PoolMetadata = {
  sqrtPriceX96: bigint
  tick: bigint
  liquidity: bigint
}

const poolCache = new Map<string, Omit<IcpswapPoolRef, "zeroForOne">>()

const factoryIdl: IDL.InterfaceFactory = ({ IDL }) => {
  const Token = IDL.Record({ address: IDL.Text, standard: IDL.Text })
  const Error = IDL.Variant({
    CommonError: IDL.Null,
    InternalError: IDL.Text,
    UnsupportedToken: IDL.Text,
    InsufficientFunds: IDL.Null,
  })
  const PoolData = IDL.Record({
    canisterId: IDL.Principal,
    fee: IDL.Nat,
    key: IDL.Text,
    tickSpacing: IDL.Int,
    token0: Token,
    token1: Token,
  })
  return IDL.Service({
    getPool: IDL.Func(
      [IDL.Record({ fee: IDL.Nat, token0: Token, token1: Token })],
      [IDL.Variant({ ok: PoolData, err: Error })],
      ["query"]
    ),
  })
}

const poolIdl: IDL.InterfaceFactory = ({ IDL }) => {
  const Token = IDL.Record({ address: IDL.Text, standard: IDL.Text })
  const Error = IDL.Variant({
    CommonError: IDL.Null,
    InternalError: IDL.Text,
    UnsupportedToken: IDL.Text,
    InsufficientFunds: IDL.Null,
  })
  const Metadata = IDL.Record({
    fee: IDL.Nat,
    key: IDL.Text,
    sqrtPriceX96: IDL.Nat,
    tick: IDL.Int,
    liquidity: IDL.Nat,
    token0: Token,
    token1: Token,
    maxLiquidityPerTick: IDL.Nat,
    nextPositionId: IDL.Nat,
  })
  return IDL.Service({
    quote: IDL.Func(
      [
        IDL.Record({
          amountIn: IDL.Text,
          zeroForOne: IDL.Bool,
          amountOutMinimum: IDL.Text,
        }),
      ],
      [IDL.Variant({ ok: IDL.Nat, err: Error })],
      ["query"]
    ),
    metadata: IDL.Func([], [IDL.Variant({ ok: Metadata, err: Error })], ["query"]),
  })
}

export function icpswapErrorMessage(err: IcpswapError): string {
  if ("InternalError" in err) return `Internal error: ${err.InternalError}`
  if ("UnsupportedToken" in err) return `Unsupported token: ${err.UnsupportedToken}`
  if ("InsufficientFunds" in err) return "Insufficient funds"
  return "Common error"
}

export async function resolveIcpswapPool(
  agent: HttpAgent,
  tokenIn: string,
  tokenOut: string
): Promise<IcpswapPoolRef> {
  const cacheKey = swapPairKey(tokenIn, tokenOut)
  const cached = poolCache.get(cacheKey)
  if (cached) {
    return { ...cached, zeroForOne: tokenIn === cached.token0 }
  }

  const factory = Actor.createActor<{
    getPool: (args: {
      fee: bigint
      token0: { address: string; standard: string }
      token1: { address: string; standard: string }
    }) => Promise<{ ok?: PoolData; err?: IcpswapError }>
  }>(factoryIdl, { agent, canisterId: ICPSWAP_FACTORY_ID })

  const [t0, t1] = tokenIn < tokenOut ? [tokenIn, tokenOut] : [tokenOut, tokenIn]
  const token0 = { address: t0, standard: icpSwapTokenStandard(t0) }
  const token1 = { address: t1, standard: icpSwapTokenStandard(t1) }

  for (const fee of ICPSWAP_FEE_TIERS) {
    const result = await factory.getPool({ fee: BigInt(fee), token0, token1 })
    if (result.ok) {
      const pool = {
        poolId: result.ok.canisterId.toText(),
        token0: result.ok.token0.address,
        fee: Number(result.ok.fee),
      }
      poolCache.set(cacheKey, pool)
      return { ...pool, zeroForOne: tokenIn === pool.token0 }
    }
  }

  throw new Error(`No pool found for ${tokenIn} / ${tokenOut}`)
}

export function computePriceImpact(
  sqrtPriceX96: bigint,
  feeTier: number,
  zeroForOne: boolean,
  amountIn: bigint,
  amountOut: bigint
): { pct: number; label: string } | null {
  if (sqrtPriceX96 <= 0n || amountIn <= 0n || amountOut <= 0n) return null
  const sqrtP = Number(sqrtPriceX96) / 2 ** 96
  const price = sqrtP * sqrtP
  if (!Number.isFinite(price) || price <= 0) return null
  const feeFactor = 1 - feeTier / 1_000_000
  const expectedOut =
    (zeroForOne ? Number(amountIn) * price : Number(amountIn) / price) * feeFactor
  if (!Number.isFinite(expectedOut) || expectedOut <= 0) return null
  const rawPct = ((expectedOut - Number(amountOut)) / expectedOut) * 100
  const pct = rawPct <= 0 ? 0 : Math.min(100, rawPct)
  const label = pct < 0.01 ? "< 0.01%" : `-${pct.toFixed(2)}%`
  return { pct, label }
}

type PoolActor = {
  quote: (args: {
    amountIn: string
    zeroForOne: boolean
    amountOutMinimum: string
  }) => Promise<{ ok?: bigint; err?: IcpswapError }>
  metadata: () => Promise<{ ok?: PoolMetadata; err?: IcpswapError }>
}

function createPoolActor(agent: HttpAgent, poolId: string): PoolActor {
  return Actor.createActor<PoolActor>(poolIdl, { agent, canisterId: poolId })
}

export async function quoteIcpswapPool(
  agent: HttpAgent,
  pool: IcpswapPoolRef,
  amountIn: bigint
): Promise<bigint> {
  if (amountIn <= 0n) return 0n
  const poolActor = createPoolActor(agent, pool.poolId)
  const quoteResult = await poolActor.quote({
    amountIn: amountIn.toString(),
    zeroForOne: pool.zeroForOne,
    amountOutMinimum: "0",
  })

  if (quoteResult.err) {
    throw new Error(`Quote failed: ${icpswapErrorMessage(quoteResult.err)}`)
  }

  return quoteResult.ok ?? 0n
}

export async function quoteIcpswapWithImpact(
  agent: HttpAgent,
  pool: IcpswapPoolRef,
  amountIn: bigint
): Promise<IcpswapQuoteWithImpact> {
  if (amountIn <= 0n) return { amountOut: 0n, priceImpact: "", priceImpactPct: null }
  const poolActor = createPoolActor(agent, pool.poolId)
  const [quoteResult, metaResult] = await Promise.all([
    poolActor.quote({
      amountIn: amountIn.toString(),
      zeroForOne: pool.zeroForOne,
      amountOutMinimum: "0",
    }),
    poolActor.metadata().catch((): { ok?: PoolMetadata } => ({})),
  ])

  if (quoteResult.err) {
    throw new Error(`Quote failed: ${icpswapErrorMessage(quoteResult.err)}`)
  }

  const amountOut = quoteResult.ok ?? 0n
  const impact =
    metaResult.ok && amountOut > 0n
      ? computePriceImpact(metaResult.ok.sqrtPriceX96, pool.fee, pool.zeroForOne, amountIn, amountOut)
      : null

  return {
    amountOut,
    priceImpact: impact?.label ?? "",
    priceImpactPct: impact?.pct ?? null,
  }
}

export function poolSwapFee(amountIn: bigint, feeTier: number): bigint {
  return (amountIn * BigInt(feeTier)) / 1_000_000n
}
