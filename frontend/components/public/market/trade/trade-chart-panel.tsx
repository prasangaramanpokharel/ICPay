"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  type AreaData,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries,
  AreaSeries,
  type MouseEventParams,
  LineStyle,
  type IPriceLine,
} from "lightweight-charts"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/ui/utils"
import { formatUsd } from "@/lib/market/format"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import {
  CHART_INTERVALS,
  type ChartWindow,
  type OhlcBar,
} from "@/lib/market/ohlc"
import { useIcpswapOhlc } from "@/hooks/market/useTradeTerminal"
import { useOpenLimitOrders } from "@/hooks/trade/useTrade"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import { ICP_LEDGER_ID } from "@/services/tokens"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"
import { TradeChartLimitDialog } from "./trade-chart-limit-dialog"

interface CursorDiffInfo {
  x: number
  y: number
  cursorPrice: number
  basePrice: number
  diff: number
  diffPct: number
  isAbove: boolean
}

type ChartType = "candle" | "area"

function cleanOhlcData(bars: OhlcBar[]): {
  candles: CandlestickData[]
  volumes: HistogramData[]
  areas: AreaData[]
} {
  const seen = new Set<number>()
  const candles: CandlestickData[] = []
  const volumes: HistogramData[] = []
  const areas: AreaData[] = []

  const sorted = [...bars].sort((a, b) => a.time - b.time)

  for (const b of sorted) {
    if (!Number.isFinite(b.close) || b.close <= 0) continue
    const rawTime = b.time > 10_000_000_000 ? Math.floor(b.time / 1000) : Math.floor(b.time)
    if (!Number.isFinite(rawTime) || rawTime <= 0) continue

    if (seen.has(rawTime)) continue
    seen.add(rawTime)

    const open = Number.isFinite(b.open) && b.open > 0 ? b.open : b.close
    const high = Number.isFinite(b.high) && b.high > 0 ? Math.max(b.high, open, b.close) : b.close
    const low = Number.isFinite(b.low) && b.low > 0 ? Math.min(b.low, open, b.close) : b.close
    const close = b.close
    const isUp = close >= open

    candles.push({
      time: rawTime as CandlestickData["time"],
      open,
      high,
      low,
      close,
    })

    volumes.push({
      time: rawTime as HistogramData["time"],
      value: Number(b.volumeUsd || 0),
      color: isUp ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)",
    })

    areas.push({
      time: rawTime as AreaData["time"],
      value: close,
    })
  }

  return { candles, volumes, areas }
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
  const [chartWindow, setChartWindow] = useState<ChartWindow>("1d")
  const [chartType, setChartType] = useState<ChartType>("candle")
  const [cursorDiff, setCursorDiff] = useState<CursorDiffInfo | null>(null)
  const [pinnedDiff, setPinnedDiff] = useState<CursorDiffInfo | null>(null)
  const [limitDialogOpen, setLimitDialogOpen] = useState(false)
  const [dialogPriceUsd, setDialogPriceUsd] = useState(0)
  const [dialogIsAbove, setDialogIsAbove] = useState(false)

  function handleOpenLimitDialog(priceUsd: number, isAbove: boolean) {
    setDialogPriceUsd(priceUsd)
    setDialogIsAbove(isAbove)
    setLimitDialogOpen(true)
  }

  useEffect(() => {
    if (!pinnedDiff) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPinnedDiff(null)
      }
    }
    globalThis.addEventListener("keydown", handleKeyDown)
    return () => globalThis.removeEventListener("keydown", handleKeyDown)
  }, [pinnedDiff])

  const { bars, isLoading } = useIcpswapOhlc(snapshot?.baseLedgerId, chartWindow)

  const { candles, volumes, areas } = useMemo(() => cleanOhlcData(bars), [bars])
  const waiting = (loading || isLoading) && candles.length === 0

  const { price: icpPrice } = useIcpPrice()
  const { openOrders } = useOpenLimitOrders(true)

  const pairOrders = useMemo(() => {
    if (!snapshot || !openOrders.length) return []
    const baseId = snapshot.baseLedgerId
    const quoteId = snapshot.quoteLedgerId

    return openOrders.filter((o) => {
      if (o.status !== "Open") return false
      const isBuy = o.tokenIn === quoteId && o.tokenOut === baseId
      const isSell = o.tokenIn === baseId && o.tokenOut === quoteId
      return isBuy || isSell
    })
  }, [openOrders, snapshot])

  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const areaSeriesRef = useRef<ISeriesApi<"Area"> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)
  const priceLinesRef = useRef<Array<{ line: IPriceLine; series: ISeriesApi<"Candlestick"> | ISeriesApi<"Area"> }>>([])
  const latestPriceRef = useRef<number>(0)

  const latestCandle = candles[candles.length - 1] ?? null
  const currentPrice = snapshot?.stats?.priceUsd ?? latestCandle?.close ?? 0

  useEffect(() => {
    if (currentPrice > 0) {
      latestPriceRef.current = currentPrice
    } else if (candles.length > 0) {
      latestPriceRef.current = Number(candles[candles.length - 1].close)
    }
  }, [currentPrice, candles])

  useEffect(() => {
    if (!containerRef.current) return

    const initialHeight = containerRef.current.clientHeight || 340
    const initialWidth = containerRef.current.clientWidth || 600

    const comp = getComputedStyle(containerRef.current)
    const upCol = comp.getPropertyValue("--success").trim() || "rgba(34, 197, 94, 1)"
    const downCol = comp.getPropertyValue("--destructive").trim() || "rgba(239, 68, 68, 1)"
    const textCol = comp.getPropertyValue("--muted-foreground").trim() || "rgba(148, 163, 184, 0.8)"

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: textCol,
        fontSize: 11,
        fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.04)" },
        horzLines: { color: "rgba(255, 255, 255, 0.04)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "rgba(148, 163, 184, 0.35)",
          width: 1,
          style: 3,
        },
        horzLine: {
          color: "rgba(148, 163, 184, 0.35)",
          width: 1,
          style: 3,
        },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.22 },
        autoScale: true,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      width: initialWidth,
      height: initialHeight,
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    })
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: upCol,
      downColor: downCol,
      borderUpColor: upCol,
      borderDownColor: downCol,
      wickUpColor: upCol,
      wickDownColor: downCol,
    })

    const areaSeries = chart.addSeries(AreaSeries, {
      topColor: "rgba(34, 197, 94, 0.35)",
      bottomColor: "rgba(34, 197, 94, 0.01)",
      lineColor: upCol,
      lineWidth: 2,
    })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries
    areaSeriesRef.current = areaSeries
    volumeSeriesRef.current = volumeSeries

    chart.subscribeCrosshairMove((param) => {
      if (!param.point || !containerRef.current) {
        setCursorDiff(null)
        return
      }

      const activeSeries = candleSeriesRef.current?.options().visible
        ? candleSeriesRef.current
        : areaSeriesRef.current
      if (!activeSeries) {
        setCursorDiff(null)
        return
      }

      const { x, y } = param.point
      const container = containerRef.current
      if (x < 0 || y < 0 || x > container.clientWidth || y > container.clientHeight) {
        setCursorDiff(null)
        return
      }

      const cursorPrice = activeSeries.coordinateToPrice(y)
      const basePrice = latestPriceRef.current

      if (cursorPrice === null || isNaN(cursorPrice) || cursorPrice <= 0 || basePrice <= 0) {
        setCursorDiff(null)
        return
      }

      const diff = cursorPrice - basePrice
      const diffPct = (diff / basePrice) * 100

      setCursorDiff({
        x,
        y,
        cursorPrice,
        basePrice,
        diff,
        diffPct,
        isAbove: diff >= 0,
      })
    })

    const handleChartClick = (param: MouseEventParams) => {
      if (!param.point || !containerRef.current) return

      const activeSeries = candleSeriesRef.current?.options().visible
        ? candleSeriesRef.current
        : areaSeriesRef.current
      if (!activeSeries) return

      const { x, y } = param.point
      const container = containerRef.current
      if (x < 0 || y < 0 || x > container.clientWidth || y > container.clientHeight) return

      const cursorPrice = activeSeries.coordinateToPrice(y)
      const basePrice = latestPriceRef.current

      if (cursorPrice === null || isNaN(cursorPrice) || cursorPrice <= 0 || basePrice <= 0) return

      const diff = cursorPrice - basePrice
      const diffPct = (diff / basePrice) * 100

      setPinnedDiff({
        x,
        y,
        cursorPrice,
        basePrice,
        diff,
        diffPct,
        isAbove: diff >= 0,
      })
    }

    chart.subscribeClick(handleChartClick)

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry && chartRef.current) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          chartRef.current.applyOptions({ width, height })
        }
      }
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      chart.unsubscribeClick(handleChartClick)
      chart.remove()
      chartRef.current = null
      candleSeriesRef.current = null
      areaSeriesRef.current = null
      volumeSeriesRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!chartRef.current) return

    const isCandle = chartType === "candle"

    if (candleSeriesRef.current) {
      candleSeriesRef.current.applyOptions({ visible: isCandle })
      if (isCandle && candles.length > 0) {
        candleSeriesRef.current.setData(candles)
      } else if (!isCandle) {
        candleSeriesRef.current.setData([])
      }
    }

    if (areaSeriesRef.current) {
      areaSeriesRef.current.applyOptions({ visible: !isCandle })
      if (!isCandle && areas.length > 0) {
        areaSeriesRef.current.setData(areas)
      } else if (isCandle) {
        areaSeriesRef.current.setData([])
      }
    }

    if (volumeSeriesRef.current) {
      if (volumes.length > 0) {
        volumeSeriesRef.current.setData(volumes)
      } else {
        volumeSeriesRef.current.setData([])
      }
    }

    if (candles.length > 0) {
      requestAnimationFrame(() => {
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent()
        }
      })
    }
  }, [candles, volumes, areas, chartType, snapshot?.baseLedgerId])

  useEffect(() => {
    for (const item of priceLinesRef.current) {
      try {
        item.series.removePriceLine(item.line)
      } catch {}
    }
    priceLinesRef.current = []

    const activeSeries = chartType === "candle" ? candleSeriesRef.current : areaSeriesRef.current
    if (!activeSeries || !snapshot) return

    const newLines: Array<{ line: IPriceLine; series: ISeriesApi<"Candlestick"> | ISeriesApi<"Area"> }> = []

    const isQuoteIcp = snapshot.quoteLedgerId === ICP_LEDGER_ID
    const effectiveIcpPrice =
      snapshot.stats?.priceUsd && snapshot.priceInIcp && snapshot.priceInIcp > 0
        ? snapshot.stats.priceUsd / snapshot.priceInIcp
        : icpPrice?.usd && icpPrice.usd > 0
          ? icpPrice.usd
          : 0

    for (const order of pairOrders) {
      const isBuy = order.tokenIn === snapshot.quoteLedgerId && order.tokenOut === snapshot.baseLedgerId
      const isSell = order.tokenIn === snapshot.baseLedgerId && order.tokenOut === snapshot.quoteLedgerId
      if (!isBuy && !isSell) continue

      const baseDecimals = snapshot.base.decimals ?? 8
      const quoteDecimals = snapshot.quote.decimals ?? 8

      const baseAmount = isBuy ? order.minAmountOut : order.amountIn
      const quoteTotal = isBuy ? order.amountIn : order.minAmountOut

      const baseUnits = Number(baseAmount) / Math.pow(10, baseDecimals)
      const quoteUnits = Number(quoteTotal) / Math.pow(10, quoteDecimals)

      const priceInQuote = baseUnits > 0 ? quoteUnits / baseUnits : 0
      if (!Number.isFinite(priceInQuote) || priceInQuote <= 0) continue

      const chartPrice = isQuoteIcp
        ? effectiveIcpPrice > 0
          ? priceInQuote * effectiveIcpPrice
          : priceInQuote
        : priceInQuote

      if (!Number.isFinite(chartPrice) || chartPrice <= 0) continue

      const formattedUnits =
        baseUnits < 1
          ? baseUnits.toFixed(2)
          : baseUnits >= 1000
            ? Math.round(baseUnits).toLocaleString()
            : baseUnits.toFixed(1)

      const orderTitle = isBuy
        ? `Buy Limit (${formattedUnits} ${snapshot.base.symbol})`
        : `Sell Limit (${formattedUnits} ${snapshot.base.symbol})`

      const comp = containerRef.current ? getComputedStyle(containerRef.current) : null
      const upCol = comp?.getPropertyValue("--success").trim() || "rgba(34, 197, 94, 1)"
      const downCol = comp?.getPropertyValue("--destructive").trim() || "rgba(239, 68, 68, 1)"
      const cardCol = comp?.getPropertyValue("--card-foreground").trim() || "rgba(255, 255, 255, 1)"
      const lineColor = isBuy ? upCol : downCol

      try {
        const line = activeSeries.createPriceLine({
          price: chartPrice,
          color: lineColor,
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          lineVisible: true,
          axisLabelVisible: true,
          title: orderTitle,
          axisLabelColor: lineColor,
          axisLabelTextColor: cardCol,
        })
        newLines.push({ line, series: activeSeries })
      } catch {}
    }

    if (pinnedDiff && Number.isFinite(pinnedDiff.cursorPrice) && pinnedDiff.cursorPrice > 0) {
      const isAbove = pinnedDiff.isAbove
      const pinnedTitle = isAbove ? "Limit Sell" : "Limit Buy"
      const comp = containerRef.current ? getComputedStyle(containerRef.current) : null
      const upCol = comp?.getPropertyValue("--success").trim() || "rgba(34, 197, 94, 1)"
      const downCol = comp?.getPropertyValue("--destructive").trim() || "rgba(239, 68, 68, 1)"
      const cardCol = comp?.getPropertyValue("--card-foreground").trim() || "rgba(255, 255, 255, 1)"
      const pinnedColor = isAbove ? downCol : upCol

      try {
        const line = activeSeries.createPriceLine({
          price: pinnedDiff.cursorPrice,
          color: pinnedColor,
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          lineVisible: true,
          axisLabelVisible: true,
          title: pinnedTitle,
          axisLabelColor: pinnedColor,
          axisLabelTextColor: cardCol,
        })
        newLines.push({ line, series: activeSeries })
      } catch {}
    }

    priceLinesRef.current = newLines

    return () => {
      for (const item of newLines) {
        try {
          item.series.removePriceLine(item.line)
        } catch {}
      }
      priceLinesRef.current = []
    }
  }, [chartType, icpPrice?.usd, pairOrders, pinnedDiff, snapshot])

  const body = (
    <div className="flex h-full min-h-[220px] flex-col">
      <div
        className="flex shrink-0 items-center justify-between border-b px-4 py-2"
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

        <div className="flex items-center gap-2">
          <ToggleGroup
            value={[chartType]}
            onValueChange={(val) => {
              const ct = val[0] as "candle" | "area" | undefined
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

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden p-1">
        {waiting && (
          <div className="absolute inset-1 z-20 flex flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-xs">
            <Spinner className="size-8 text-muted-foreground/60" />
          </div>
        )}

        {!waiting && candles.length === 0 && (
          <div className="absolute inset-1 z-10 flex size-full items-center justify-center text-sm text-muted-foreground">
            {t("noChartData")}
          </div>
        )}

        <div className="relative size-full">
          <div
            ref={containerRef}
            className="absolute inset-0 size-full cursor-crosshair"
            onMouseLeave={() => {
              if (!limitDialogOpen) {
                setCursorDiff(null)
              }
            }}
          />



          {pinnedDiff && (
            <div
              className="pointer-events-auto absolute z-30 flex items-center select-none max-w-[calc(100%-24px)]"
              style={{
                left: `${Math.max(12, pinnedDiff.x + 12)}px`,
                top: `${Math.max(10, pinnedDiff.y - 14)}px`,
              }}
            >
              <Badge
                variant="outline"
                className={cn(
                  "flex items-center gap-1.5 bg-background/98 py-1 pr-1.5 pl-1.5 text-xs font-mono font-medium shadow-xl backdrop-blur-md ring-1 select-none",
                  pinnedDiff.isAbove
                    ? "border-destructive/60 text-destructive ring-destructive/20"
                    : "border-success/60 text-success ring-success/20"
                )}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenLimitDialog(pinnedDiff.cursorPrice, pinnedDiff.isAbove)
                  }}
                  title={`Place ${pinnedDiff.isAbove ? "Sell" : "Buy"} Limit Order at ${formatUsd(pinnedDiff.cursorPrice, pinnedDiff.cursorPrice < 1 ? 6 : 2)}`}
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full transition-all cursor-pointer shadow-sm active:scale-95",
                    pinnedDiff.isAbove
                      ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      : "bg-success hover:bg-success/90 text-success-foreground"
                  )}
                >
                  <HugeiconsIcon icon={Add01Icon} className="size-3.5" strokeWidth={2.5} />
                </button>
                <span>
                  {pinnedDiff.isAbove ? "+" : ""}
                  {pinnedDiff.diffPct.toFixed(2)}%
                </span>
                <span className="text-[10px] text-muted-foreground">
                  ({pinnedDiff.isAbove ? "+" : "-"}
                  {formatUsd(Math.abs(pinnedDiff.diff), 4)})
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPinnedDiff(null)
                  }}
                  title="Dismiss pinned order"
                  className="ml-0.5 flex size-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3" strokeWidth={2} />
                </button>
              </Badge>
            </div>
          )}

          {!pinnedDiff && cursorDiff && (
            <div
              className="pointer-events-none absolute z-20 transition-[top,left] duration-75 select-none"
              style={{
                left: `${cursorDiff.x + 14}px`,
                top: `${Math.max(10, cursorDiff.y - 14)}px`,
              }}
            >
              <Badge
                variant="outline"
                className={cn(
                  "flex items-center gap-1.5 border-border/80 bg-background/90 py-0.5 px-2 text-xs font-mono font-medium shadow-md backdrop-blur-md opacity-85",
                  cursorDiff.isAbove ? "text-success" : "text-destructive"
                )}
              >
                <HugeiconsIcon icon={Add01Icon} className="size-3 text-muted-foreground" strokeWidth={2} />
                <span>
                  {cursorDiff.isAbove ? "+" : ""}
                  {cursorDiff.diffPct.toFixed(2)}%
                </span>
                <span className="text-[10px] text-muted-foreground">
                  ({cursorDiff.isAbove ? "+" : "-"}
                  {formatUsd(Math.abs(cursorDiff.diff), 4)})
                </span>
                <span className="text-[9px] text-muted-foreground/70 ml-0.5">Click to pin</span>
              </Badge>
            </div>
          )}
        </div>
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
    <Card size="sm" className="m-1 flex h-full min-h-[240px] flex-col gap-0 py-0">
      <CardContent className="flex min-h-0 flex-1 flex-col p-0">{body}</CardContent>
    </Card>
  )
}
