"use client"

import { useMemo } from "react"
import { Label, Pie, PieChart } from "recharts"
import { cn } from "@/lib/ui/utils"
import { computeAllocation, formatPercent, type Holding, type UnpricedHolding } from "@/lib/allocation"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const SLICE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
] as const

const OTHER_COLOR = "var(--muted-foreground)"

export type WalletAllocationProps = {
  holdings: readonly Holding[]
  unpricedHoldings?: readonly UnpricedHolding[]
  formatValue: (value: number) => string
  formatTotal?: (value: number) => string
  otherLabel: string
  totalLabel: string
  className?: string
  hidden?: boolean
}

export function WalletAllocation({
  holdings,
  unpricedHoldings,
  formatValue,
  formatTotal,
  otherLabel,
  totalLabel,
  className,
  hidden = false,
}: WalletAllocationProps) {
  const { slices, total } = useMemo(
    () => computeAllocation(holdings, otherLabel),
    [holdings, otherLabel]
  )

  const hasUnpriced = Boolean(unpricedHoldings && unpricedHoldings.length > 0)

  const chartData = useMemo(() => {
    if (slices.length === 0) {
      return [{ name: "Other", value: 1, fill: OTHER_COLOR }]
    }
    return slices.map((slice, index) => ({
      name: slice.symbol,
      value: Number(slice.value.toFixed(4)),
      fill: slice.isOther ? OTHER_COLOR : SLICE_COLORS[index % SLICE_COLORS.length],
    }))
  }, [slices])

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      value: { label: totalLabel },
    }
    slices.forEach((slice, index) => {
      config[slice.symbol] = {
        label: slice.symbol,
        color: slice.isOther ? OTHER_COLOR : SLICE_COLORS[index % SLICE_COLORS.length],
      }
    })
    return config
  }, [slices, totalLabel])

  if (slices.length === 0 && !hasUnpriced) return null

  const formattedTotal = formatTotal ? formatTotal(total) : formatValue(total)
  const showCenterTotal = slices.length >= 2

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 w-full", className)}>
      <div className="size-28 sm:size-32 shrink-0 aspect-square" aria-hidden="true">
        <ChartContainer config={chartConfig} className="size-full aspect-square">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={34}
              outerRadius={48}
              paddingAngle={slices.length > 1 ? 3 : 0}
              cornerRadius={slices.length > 1 ? 4 : 0}
              strokeWidth={2}
              stroke="var(--card)"
            >
              {showCenterTotal ? (
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-sm font-semibold tabular-nums"
                          >
                            {hidden ? "••••••" : formattedTotal}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 14}
                            className="fill-muted-foreground text-[10px]"
                          >
                            {totalLabel}
                          </tspan>
                        </text>
                      )
                    }
                    return null
                  }}
                />
              ) : null}
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>

      <div className="flex-1 w-full space-y-2">
        <ul className="space-y-1.5 text-xs">
          {slices.map((slice, index) => (
            <li key={slice.symbol} className="grid grid-cols-12 items-center text-xs">
              <span className="col-span-4 sm:col-span-5 flex min-w-0 items-center gap-1.5 truncate">
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-xs"
                  style={{
                    backgroundColor: slice.isOther
                      ? OTHER_COLOR
                      : SLICE_COLORS[index % SLICE_COLORS.length],
                  }}
                />
                <span className="truncate font-medium text-foreground">{slice.symbol}</span>
              </span>
              <span className="col-span-3 text-end text-muted-foreground text-[11px] tabular-nums">
                {formatPercent(slice.percent)}
              </span>
              <span className="col-span-5 sm:col-span-4 text-end font-medium text-foreground text-[11px] tabular-nums truncate">
                {hidden ? "••••••" : formatValue(slice.value)}
              </span>
            </li>
          ))}
        </ul>

        {hasUnpriced && unpricedHoldings ? (
          <div className="pt-2 border-t border-border/50">
            <ul className="space-y-1.5 text-xs">
              {unpricedHoldings.map((token) => (
                <li key={token.symbol} className="grid grid-cols-12 items-center text-xs">
                  <span className="col-span-4 sm:col-span-5 flex min-w-0 items-center gap-1.5 truncate">
                    <span
                      aria-hidden="true"
                      className="size-2 shrink-0 rounded-xs bg-muted-foreground/40"
                    />
                    <span className="truncate font-medium text-muted-foreground">{token.symbol}</span>
                  </span>
                  <span className="col-span-2 sm:col-span-3 text-end text-muted-foreground text-[11px] tabular-nums">
                    —
                  </span>
                  <span className="col-span-6 sm:col-span-4 text-end font-medium text-foreground text-[11px] tabular-nums truncate">
                    {hidden ? "••••••" : token.amount}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
