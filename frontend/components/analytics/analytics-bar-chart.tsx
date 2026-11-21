"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { TransactionPublic } from "@/services/types"
import { aggregateMonthlyActivity } from "@/lib/analytics/charts"

type AnalyticsBarChartProps = {
  rows: TransactionPublic[]
}

export function AnalyticsBarChart({ rows }: AnalyticsBarChartProps) {
  const t = useTranslations("analytics")

  const chartConfig = React.useMemo(
    () =>
      ({
        transfers: {
          label: t("transfers"),
          color: "var(--chart-1)",
        },
        deposits: {
          label: t("deposits"),
          color: "var(--chart-2)",
        },
        withdrawals: {
          label: t("withdrawals"),
          color: "var(--chart-3)",
        },
        swaps: {
          label: t("swapsIn"),
          color: "var(--chart-4)",
        },
      }) satisfies ChartConfig,
    [t]
  )

  const chartData = React.useMemo(() => {
    return aggregateMonthlyActivity(rows)
  }, [rows])

  const totalActivity = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.total, 0)
  }, [chartData])

  return (
    <Card className="rounded-xl border border-border/50 bg-card">
      <CardHeader className="border-b border-border/50 px-5 py-4">
        <CardTitle className="text-base font-semibold tracking-tight">{t("activityTitle")}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {totalActivity} {t("count")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-4">
        <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
          <BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const parts = value.split("-")
                if (parts.length === 2) {
                  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1)
                  return date.toLocaleDateString(undefined, { month: "short" })
                }
                return value
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              allowDecimals={false}
              width={32}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.2 }}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="transfers" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="deposits" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="withdrawals" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="swaps" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
            <ChartLegend
              content={<ChartLegendContent />}
              className="pt-3 flex-wrap justify-center text-xs gap-4"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
