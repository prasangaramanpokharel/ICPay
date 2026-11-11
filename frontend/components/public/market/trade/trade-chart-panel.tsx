"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"
import { useIcpswapOhlc } from "@/hooks/market/useTradeTerminal"
import { CHART_INTERVALS, type ChartWindow, type OhlcBar } from "@/lib/market/ohlc"
import { formatPct, formatUsd, changeClass } from "@/lib/market/format"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"
import { TradeChartLimitDialog } from "./trade-chart-limit-dialog"

type ChartType = "candle" | "area"

interface ChartDataPoint {
  time: number
  formattedTime: string
  formattedDate: string
  open: number
  high: number
  low: number
  close: number
  volumeUsd: number
  isUp: boolean
  changePct: number
  openClose: [number, number]
}

const chartConfig: ChartConfig = {
  price: {
    label: "Price",
    color: "var(--primary)",
  },
  bullish: {
    label: "Bullish",
    color: "var(--success)",
  },
  bearish: {
    label: "Bearish",
    color: "var(--destructive)",
  },
  volume: {
    label: "Volume",
    color: "var(--muted-foreground)",
  },
}

function formatAxisPrice(val: number): string {
  if (!Number.isFinite(val) || val <= 0) return "0"
  if (val < 0.0001) return val.toExponential(2)
  if (val < 0.01) return val.toFixed(5)
  if (val < 1) return val.toFixed(4)
  if (val < 100) return val.toFixed(2)
  return val.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

function processOhlcBars(bars: OhlcBar[]): ChartDataPoint[] {
  const sorted = [...bars].sort((a, b) => a.time - b.time)
  const seen = new Set<number>()
  const points: ChartDataPoint[] = []

  for (const b of sorted) {
    if (!Number.isFinite(b.close) || b.close <= 0) continue
    const rawSec = b.time > 10_000_000_000 ? Math.floor(b.time / 1000) : Math.floor(b.time)
    if (!Number.isFinite(rawSec) || rawSec <= 0 || seen.has(rawSec)) continue
    seen.add(rawSec)

    const open = Number.isFinite(b.open) && b.open > 0 ? b.open : b.close
    const high = Number.isFinite(b.high) && b.high > 0 ? Math.max(b.high, open, b.close) : b.close
    const low = Number.isFinite(b.low) && b.low > 0 ? Math.min(b.low, open, b.close) : b.close
    const close = b.close
    const isUp = close >= open
    const changePct = open > 0 ? ((close - open) / open) * 100 : 0

    const date = new Date(rawSec * 1000)
    const formattedTime = date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    const formattedDate = date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })

    points.push({
      time: rawSec,
      formattedTime: `${formattedDate} ${formattedTime}`,
      formattedDate,
      open,
      high,
      low,
      close,
      volumeUsd: Number(b.volumeUsd || 0),
      isUp,
      changePct,
      openClose: [Math.min(open, close), Math.max(open, close)],
    })
  }

  return points
}

interface CustomCandleProps {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: ChartDataPoint
  yDomain: [number, number]
  chartHeight: number
  topOffset: number
}

function CandlestickBar(props: CustomCandleProps) {
  const { x = 0, width = 0, payload, yDomain, chartHeight, topOffset } = props
  if (!payload) return null

  const [minDomain, maxDomain] = yDomain
  const domainDelta = maxDomain - minDomain
  if (domainDelta <= 0 || chartHeight <= 0) return null

  const getY = (val: number) => {
    const clamped = Math.max(minDomain, Math.min(maxDomain, val))
    return topOffset + chartHeight - ((clamped - minDomain) / domainDelta) * chartHeight
  }

  const yHigh = getY(payload.high)
  const yLow = getY(payload.low)
  const yOpen = getY(payload.open)
  const yClose = getY(payload.close)

  const bodyTop = Math.min(yOpen, yClose)
  const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1.5)
  const centerX = x + width / 2
  const bodyWidth = Math.max(width - 2, 2)
  const bodyX = x + (width - bodyWidth) / 2

  const strokeColor = payload.isUp ? "var(--success)" : "var(--destructive)"

  return (
    <g>
      <line
        x1={centerX}
        y1={yHigh}
        x2={centerX}
        y2={yLow}
        stroke={strokeColor}
        strokeWidth={1.25}
        strokeOpacity={0.9}
      />
      <rect
        x={bodyX}
        y={bodyTop}
        width={bodyWidth}
        height={bodyHeight}
        fill={strokeColor}
        stroke={strokeColor}
        strokeWidth={1}
        rx={1}
      />
    </g>
  )
}

function TradeChartTooltipContent({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload?: ChartDataPoint }>
}) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card/95 p-2.5 text-xs font-mono shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-1.5">
        <span className="font-sans font-medium text-muted-foreground">{d.formattedTime}</span>
        <Badge
          variant="outline"
          className={cn(
            "h-4 px-1 text-[10px] font-semibold tracking-tight",
            d.isUp
              ? "border-success/30 bg-success/10 text-success"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          )}
        >
          {d.isUp ? "+" : ""}
          {d.changePct.toFixed(2)}%
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">O:</span>
          <span className="font-semibold text-foreground">{formatUsd(d.open, d.open < 1 ? 6 : 2)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">H:</span>
          <span className="font-semibold text-foreground">{formatUsd(d.high, d.high < 1 ? 6 : 2)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">L:</span>
          <span className="font-semibold text-foreground">{formatUsd(d.low, d.low < 1 ? 6 : 2)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">C:</span>
          <span className="font-semibold text-foreground">{formatUsd(d.close, d.close < 1 ? 6 : 2)}</span>
        </div>
      </div>
      {d.volumeUsd > 0 && (
        <div className="flex items-center justify-between border-t border-border/60 pt-1 text-[10px]">
          <span className="text-muted-foreground">Vol:</span>
          <span className="text-foreground">{formatUsd(d.volumeUsd)}</span>
        </div>
      )}
    </div>
  )
}

function cn(...inputs: Array<string | boolean | undefined | null>): string {
  return inputs.filter(Boolean).join(" ")
}

export function TradeChartPanel({
  snapshot,
  loading,
  bare,
}: {
  snapshot: TradePairSnapshot | undefined
  loading?: boolean
  bare?: boolean
}) {
  const t = useTranslations("marketTrade")
  const [chartWindow, setChartWindow] = React.useState<ChartWindow>("1d")
  const [chartType, setChartType] = React.useState<ChartType>("area")
  const [limitDialogOpen, setLimitDialogOpen] = React.useState(false)
  const [dialogPriceUsd, setDialogPriceUsd] = React.useState(0)
  const [dialogIsAbove, setDialogIsAbove] = React.useState(false)

  const { bars, isLoading } = useIcpswapOhlc(snapshot?.baseLedgerId, chartWindow)
  const chartData = React.useMemo(() => processOhlcBars(bars), [bars])

  const waiting = (loading || isLoading) && chartData.length === 0

  const latestPoint = chartData[chartData.length - 1] ?? null
  const currentPrice = snapshot?.stats?.priceUsd ?? latestPoint?.close ?? 0

  const { minPrice, maxPrice, maxVolume } = React.useMemo(() => {
    if (!chartData.length) {
      return { minPrice: 0, maxPrice: 1, maxVolume: 1 }
    }
    let min = Infinity
    let max = -Infinity
    let volMax = 0

    for (const d of chartData) {
      if (d.low < min) min = d.low
      if (d.high > max) max = d.high
      if (d.volumeUsd > volMax) volMax = d.volumeUsd
    }

    if (!Number.isFinite(min) || min <= 0) min = 0.00001
    if (!Number.isFinite(max) || max <= min) max = min * 1.1

    const padding = (max - min) * 0.05
    return {
      minPrice: Math.max(0.000001, min - padding),
      maxPrice: max + padding,
      maxVolume: volMax > 0 ? volMax : 1,
    }
  }, [chartData])

  const priceDomain: [number, number] = React.useMemo(() => [minPrice, maxPrice], [minPrice, maxPrice])

  const body = (
    <div className="flex h-full min-h-[260px] flex-col">
      <div
        className="flex shrink-0 items-center justify-between border-b border-border/80 px-4 py-2"
        role="tablist"
        aria-label={t("tabChart")}
      >
        <ToggleGroup
          value={[chartWindow]}
          onValueChange={(val) => {
            const id = val[0] as ChartWindow | undefined
            if (id) setChartWindow(id)
          }}
          className="gap-1 p-0 justify-start"
        >
          {CHART_INTERVALS.map((id) => (
            <ToggleGroupItem
              key={id}
              value={id}
              size="sm"
              className="h-6 rounded px-2.5 text-xs font-semibold tabular-nums data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-xs"
            >
              {id === "1d" ? t("interval1d") : t("interval1w")}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="flex items-center gap-3">
          {currentPrice > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs">
              <span className="text-muted-foreground">{t("priceUsd")}:</span>
              <span className={cn("font-semibold", changeClass(snapshot?.stats?.priceChange24h))}>
                {formatUsd(currentPrice, currentPrice < 1 ? 6 : 2)}
              </span>
              {snapshot?.stats?.priceChange24h !== undefined && (
                <span className={cn("text-[10px]", changeClass(snapshot.stats.priceChange24h))}>
                  ({formatPct(snapshot.stats.priceChange24h)})
                </span>
              )}
            </div>
          )}

          <ToggleGroup
            value={[chartType]}
            onValueChange={(val) => {
              const ct = val[0] as ChartType | undefined
              if (ct) setChartType(ct)
            }}
            className="rounded-md border border-border/60 bg-muted/30 p-0.5 text-[10px] font-medium"
          >
            <ToggleGroupItem
              value="candle"
              size="sm"
              className="h-5 rounded px-2 text-[10px] font-medium data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs"
            >
              Candles
            </ToggleGroupItem>
            <ToggleGroupItem
              value="area"
              size="sm"
              className="h-5 rounded px-2 text-[10px] font-medium data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs"
            >
              Line
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden p-2">
        {waiting && (
          <div className="absolute inset-2 z-20 flex flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-xs">
            <Spinner className="size-8 text-muted-foreground/60" />
          </div>
        )}

        {!waiting && chartData.length === 0 && (
          <div className="absolute inset-2 z-10 flex size-full items-center justify-center text-sm text-muted-foreground">
            {t("noChartData")}
          </div>
        )}

        <ChartContainer config={chartConfig} className="h-full min-h-[220px] w-full">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, bottom: 0, left: 10 }}
            onClick={(state) => {
              if (state && typeof state.activeIndex === "number") {
                const point = chartData[state.activeIndex]
                if (point && point.close > 0) {
                  setDialogPriceUsd(point.close)
                  setDialogIsAbove(point.close >= currentPrice)
                  setLimitDialogOpen(true)
                }
              }
            }}
          >
            <defs>
              <linearGradient id="tradeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.3}
              vertical={false}
            />

            <XAxis
              dataKey="formattedDate"
              stroke="var(--muted-foreground)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              minTickGap={32}
            />

            <YAxis
              yAxisId="price"
              domain={priceDomain}
              orientation="right"
              stroke="var(--muted-foreground)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatAxisPrice}
              width={56}
            />

            <YAxis
              yAxisId="volume"
              domain={[0, maxVolume * 4]}
              orientation="left"
              hide
            />

            <ChartTooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "3 3" }}
              content={<TradeChartTooltipContent />}
            />

            <Bar
              yAxisId="volume"
              dataKey="volumeUsd"
              radius={[1, 1, 0, 0]}
              barSize={6}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`vol-${index}`}
                  fill={entry.isUp ? "var(--success)" : "var(--destructive)"}
                  fillOpacity={0.3}
                />
              ))}
            </Bar>

            {currentPrice > 0 && (
              <ReferenceLine
                yAxisId="price"
                y={currentPrice}
                stroke="var(--primary)"
                strokeDasharray="3 3"
                strokeOpacity={0.65}
              />
            )}

            {chartType === "candle" ? (
              <Bar
                yAxisId="price"
                dataKey="close"
                shape={(shapeProps: unknown) => {
                  const p = shapeProps as {
                    x?: number
                    width?: number
                    payload?: ChartDataPoint
                    background?: { y?: number; height?: number }
                  }
                  return (
                    <CandlestickBar
                      x={p.x}
                      width={p.width}
                      payload={p.payload}
                      yDomain={priceDomain}
                      chartHeight={p.background?.height ?? 200}
                      topOffset={p.background?.y ?? 10}
                    />
                  )
                }}
              />
            ) : (
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="close"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#tradeAreaGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2 }}
              />
            )}
          </ComposedChart>
        </ChartContainer>
      </div>

      <TradeChartLimitDialog
        open={limitDialogOpen}
        onOpenChange={setLimitDialogOpen}
        snapshot={snapshot}
        initialPriceUsd={dialogPriceUsd}
        initialIsAbove={dialogIsAbove}
      />
    </div>
  )

  if (bare) return body
  return (
    <Card size="sm" className="m-1 flex h-full min-h-[260px] flex-col gap-0 py-0">
      <CardContent className="flex min-h-0 flex-1 flex-col p-0">{body}</CardContent>
    </Card>
  )
}
