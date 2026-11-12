"use client"

import * as React from "react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/ui/utils"

export interface RadialMeterProps {
  value: number
  max?: number
  centerValue: React.ReactNode
  centerLabel?: React.ReactNode
  innerRadius?: number
  outerRadius?: number
  polarRadius?: [number, number]
  color?: string
  cornerRadius?: number
  className?: string
  width?: number
  height?: number
  valueClassName?: string
  labelClassName?: string
}

export function RadialMeter({
  value,
  max = 100,
  centerValue,
  centerLabel,
  innerRadius = 46,
  outerRadius = 66,
  polarRadius = [50, 42],
  color = "var(--primary)",
  cornerRadius = 5,
  className,
  width = 140,
  height = 140,
  valueClassName = "fill-foreground text-sm font-bold tracking-tight tabular-nums",
  labelClassName = "fill-muted-foreground text-[10px]",
}: RadialMeterProps) {
  const safeMax = Math.max(1, max)
  const ratio = Math.max(0, Math.min(1, value / safeMax))
  const endAngle = Math.max(12, Math.min(360, Math.round(ratio * 360)))

  const chartData = React.useMemo(
    () => [{ name: "meter", value, fill: color }],
    [value, color]
  )

  const chartConfig = React.useMemo<ChartConfig>(
    () => ({
      meter: {
        label: "Meter",
        color,
      },
    }),
    [color]
  )

  return (
    <ChartContainer
      config={chartConfig}
      initialDimension={{ width, height }}
      className={cn("mx-auto aspect-square shrink-0", className)}
      style={{ width, height }}
    >
      <RadialBarChart
        data={chartData}
        endAngle={endAngle}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
      >
        <PolarGrid
          gridType="circle"
          radialLines={false}
          stroke="none"
          className="first:fill-muted/40 last:fill-background"
          polarRadius={polarRadius}
        />
        <RadialBar dataKey="value" background cornerRadius={cornerRadius} />
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
                      y={(viewBox.cy || 0) - (centerLabel ? 2 : 0)}
                      className={valueClassName}
                    >
                      {centerValue}
                    </tspan>
                    {centerLabel ? (
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 14}
                        className={labelClassName}
                      >
                        {centerLabel}
                      </tspan>
                    ) : null}
                  </text>
                )
              }
              return null
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  )
}
