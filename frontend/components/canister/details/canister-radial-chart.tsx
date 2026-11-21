"use client"

import { useMemo } from "react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"
import type { CanisterStatusView } from "@/services/canister/management"

const WASM_MAX_BYTES = 4 * 1024 * 1024 * 1024

function parseByteSize(label?: string): number {
  if (!label || label === "—") return 0
  const match = label.trim().match(/^([\d.]+)\s*([a-zA-Z]+)?$/)
  if (!match) return 0
  const val = parseFloat(match[1])
  const unit = (match[2] || "B").toUpperCase()
  if (unit.startsWith("K")) return val * 1024
  if (unit.startsWith("M")) return val * 1024 * 1024
  if (unit.startsWith("G")) return val * 1024 * 1024 * 1024
  if (unit.startsWith("T")) return val * 1024 * 1024 * 1024 * 1024
  return val
}

const chartConfig = {
  wasm: {
    label: "Wasm Memory",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function CanisterRadialChart({
  status,
}: {
  status?: CanisterStatusView
}) {
  const wasmDisplay = status?.wasmMemory && status.wasmMemory !== "—" ? status.wasmMemory : "0 B"
  const wasmBytes = useMemo(() => parseByteSize(wasmDisplay), [wasmDisplay])

  const ratio = Math.max(0, Math.min(1, wasmBytes / WASM_MAX_BYTES))
  const endAngle = Math.max(14, Math.min(360, Math.round(ratio * 360)))
  const percentage = (ratio * 100).toFixed(1)

  const chartData = useMemo(
    () => [{ name: "wasm", value: wasmBytes, fill: "var(--primary)" }],
    [wasmBytes]
  )

  return (
    <div className="flex flex-col items-center justify-center gap-1.5 shrink-0">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square size-28 shrink-0"
        initialDimension={{ width: 112, height: 112 }}
      >
        <RadialBarChart
          data={chartData}
          startAngle={0}
          endAngle={endAngle}
          outerRadius={52}
          innerRadius={40}
        >
          <PolarGrid
            gridType="circle"
            radialLines={false}
            stroke="none"
            className="first:fill-muted/30 last:fill-card"
            polarRadius={[52, 40]}
          />
          <RadialBar dataKey="value" background cornerRadius={6} />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
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
                        y={(viewBox.cy || 0) - 2}
                        className="fill-foreground text-sm font-bold tracking-tight font-mono tabular-nums"
                      >
                        {wasmDisplay}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 13}
                        className="fill-muted-foreground text-[9px] font-medium tracking-wide uppercase"
                      >
                        of 4 GiB
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>
      <p className="text-xs text-muted-foreground tabular-nums text-center">
        Wasm: <span className="font-medium text-foreground">{percentage}%</span> of 4 GiB
      </p>
    </div>
  )
}
