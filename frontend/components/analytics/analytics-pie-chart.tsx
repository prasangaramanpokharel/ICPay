"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Pie, PieChart, Cell } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { AnalyticsSummary } from "@/services/types"
import { deriveTypeDistribution } from "@/lib/analytics/charts"

type AnalyticsPieChartProps = {
  summary: AnalyticsSummary
}

export function AnalyticsPieChart({ summary }: AnalyticsPieChartProps) {
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
        tips: {
          label: t("tips"),
          color: "var(--chart-5)",
        },
      }) satisfies ChartConfig,
    [t]
  )

  const chartData = React.useMemo(() => {
    return deriveTypeDistribution(summary)
  }, [summary])

  const total = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0)
  }, [chartData])

  return (
    <Card className="rounded-xl border border-border/50 bg-card flex flex-col">
      <CardHeader className="border-b border-border/50 px-5 py-4">
        <CardTitle className="text-base font-semibold tracking-tight">{t("distributionTitle")}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {total} {t("count")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-4 flex-1 flex flex-col justify-between">
        {chartData.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-xs text-muted-foreground">
            {t("noRows")}
          </div>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[210px] w-full"
            >
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="name" hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  strokeWidth={2}
                  stroke="var(--card)"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2 text-xs">
              {chartData.map((item) => {
                const itemConfig = chartConfig[item.name as keyof typeof chartConfig]
                return (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span
                      className="size-2 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-muted-foreground">
                      {itemConfig?.label ?? item.name}
                    </span>
                    <span className="font-mono font-medium text-foreground tabular-nums">
                      {item.count}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
