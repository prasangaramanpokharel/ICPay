import type { TransactionPublic, AnalyticsSummary } from "@/services/types"

export type TimeSeriesPoint = {
  date: string
  inflow: number
  outflow: number
  net: number
  count: number
}

export type PeriodicActivityPoint = {
  period: string
  deposits: number
  transfers: number
  withdrawals: number
  swaps: number
  total: number
}

export type TypeDistributionPoint = {
  name: string
  labelKey: string
  count: number
  fill: string
}

export function txTypeKind(tx: TransactionPublic): "deposit" | "withdraw" | "transfer" | "fee" | "swapIn" | "swapOut" {
  if ("deposit" in tx.txType) return "deposit"
  if ("withdraw" in tx.txType) return "withdraw"
  if ("transfer" in tx.txType) return "transfer"
  if ("fee" in tx.txType) return "fee"
  if ("swapIn" in tx.txType) return "swapIn"
  if ("swapOut" in tx.txType) return "swapOut"
  return "transfer"
}

export function e8sToIcp(e8s: bigint): number {
  return Number(e8s) / 100_000_000
}

export function toDateKey(createdAtNanos: bigint): string {
  const ms = Number(createdAtNanos / 1_000_000n)
  const d = new Date(ms)
  return d.toISOString().slice(0, 10)
}

export function aggregateVolumeByDay(
  rows: TransactionPublic[],
  timeRange: "7d" | "30d" | "90d" | "all"
): TimeSeriesPoint[] {
  const map = new Map<string, { inflow: number; outflow: number; count: number }>()

  for (const tx of rows) {
    const key = toDateKey(tx.createdAt)
    const current = map.get(key) ?? { inflow: 0, outflow: 0, count: 0 }
    const amount = e8sToIcp(tx.amount)
    const kind = txTypeKind(tx)

    if (kind === "deposit" || kind === "swapIn") {
      current.inflow += amount
    } else if (kind === "withdraw" || kind === "transfer" || kind === "swapOut" || kind === "fee") {
      current.outflow += amount
    }
    current.count += 1
    map.set(key, current)
  }

  const now = new Date()
  let days = 90
  if (timeRange === "7d") days = 7
  else if (timeRange === "30d") days = 30
  else if (timeRange === "90d") days = 90
  else if (timeRange === "all") {
    if (rows.length === 0) days = 30
    else {
      const oldestNanos = rows.reduce((min, r) => (r.createdAt < min ? r.createdAt : min), rows[0].createdAt)
      const diffMs = Date.now() - Number(oldestNanos / 1_000_000n)
      days = Math.max(7, Math.ceil(diffMs / (86_400_000)))
    }
  }

  const result: TimeSeriesPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const entry = map.get(key) ?? { inflow: 0, outflow: 0, count: 0 }
    const inflow = Math.round(entry.inflow * 10_000) / 10_000
    const outflow = Math.round(entry.outflow * 10_000) / 10_000
    result.push({
      date: key,
      inflow,
      outflow,
      net: Math.round((inflow - outflow) * 10_000) / 10_000,
      count: entry.count,
    })
  }

  return result
}

export function aggregateMonthlyActivity(rows: TransactionPublic[]): PeriodicActivityPoint[] {
  const map = new Map<string, { deposits: number; transfers: number; withdrawals: number; swaps: number; total: number }>()

  for (const tx of rows) {
    const ms = Number(tx.createdAt / 1_000_000n)
    const d = new Date(ms)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const cur = map.get(key) ?? { deposits: 0, transfers: 0, withdrawals: 0, swaps: 0, total: 0 }
    const kind = txTypeKind(tx)

    if (kind === "deposit") cur.deposits += 1
    else if (kind === "transfer") cur.transfers += 1
    else if (kind === "withdraw") cur.withdrawals += 1
    else if (kind === "swapIn" || kind === "swapOut") cur.swaps += 1

    cur.total += 1
    map.set(key, cur)
  }

  if (map.size === 0) {
    const curMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
    return [{ period: curMonth, deposits: 0, transfers: 0, withdrawals: 0, swaps: 0, total: 0 }]
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([period, data]) => ({
      period,
      ...data,
    }))
}

export function deriveTypeDistribution(summary: AnalyticsSummary): TypeDistributionPoint[] {
  const points: TypeDistributionPoint[] = [
    {
      name: "transfers",
      labelKey: "transfers",
      count: Number(summary.transferCount),
      fill: "var(--chart-1)",
    },
    {
      name: "deposits",
      labelKey: "deposits",
      count: Number(summary.depositCount),
      fill: "var(--chart-2)",
    },
    {
      name: "withdrawals",
      labelKey: "withdrawals",
      count: Number(summary.withdrawCount),
      fill: "var(--chart-3)",
    },
    {
      name: "swaps",
      labelKey: "swapsIn",
      count: Number(summary.swapInCount + summary.swapOutCount),
      fill: "var(--chart-4)",
    },
    {
      name: "tips",
      labelKey: "tips",
      count: Number(summary.tipCount),
      fill: "var(--chart-5)",
    },
  ]

  return points.filter((p) => p.count > 0)
}
