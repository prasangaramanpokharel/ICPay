"use client"

import { useTranslations } from "next-intl"
import { Card } from "@/components/ui/card"
import type { AnalyticsSummary } from "@/services/types"
import { formatAmount } from "@/lib/wallet/utils"

type AnalyticsSummaryGridProps = {
  summary: AnalyticsSummary
}

export function AnalyticsSummaryGrid({ summary }: AnalyticsSummaryGridProps) {
  const t = useTranslations("analytics")

  const netDiffE8s = summary.totalReceivedE8s - summary.totalSentE8s
  const isNetPositive = netDiffE8s >= 0n
  const netDisplay = isNetPositive
    ? `+${formatAmount(netDiffE8s)} ICP`
    : `-${formatAmount(-netDiffE8s)} ICP`

  const totalOps = Number(summary.completedCount + summary.failedCount)
  const successRate = totalOps > 0
    ? `${Math.round((Number(summary.completedCount) / totalOps) * 100)}%`
    : "100%"

  const depositCount = Number(summary.depositCount)
  const tipCount = Number(summary.tipCount)
  const transferCount = Number(summary.transferCount)
  const withdrawCount = Number(summary.withdrawCount)
  const counterpartiesCount = Number(summary.uniqueCounterparties)
  const completedCount = Number(summary.completedCount)
  const failedCount = Number(summary.failedCount)

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card className="rounded-xl border border-border/50 bg-card p-4 transition-colors sm:p-5">
        <div>
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">{t("received")}</span>
        </div>
        <div className="mt-3">
          <p className="text-xl font-bold tracking-tight text-foreground tabular-nums sm:text-2xl">
            {formatAmount(summary.totalReceivedE8s)}{" "}
            <span className="text-xs font-normal text-muted-foreground sm:text-sm">ICP</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {depositCount} {t("deposits").toLowerCase()}
            {tipCount > 0 ? ` · ${tipCount} ${t("tips").toLowerCase()}` : ""}
          </p>
        </div>
      </Card>

      <Card className="rounded-xl border border-border/50 bg-card p-4 transition-colors sm:p-5">
        <div>
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">{t("sent")}</span>
        </div>
        <div className="mt-3">
          <p className="text-xl font-bold tracking-tight text-foreground tabular-nums sm:text-2xl">
            {formatAmount(summary.totalSentE8s)}{" "}
            <span className="text-xs font-normal text-muted-foreground sm:text-sm">ICP</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {transferCount} {t("transfers").toLowerCase()}
            {withdrawCount > 0 ? ` · ${withdrawCount} ${t("withdrawals").toLowerCase()}` : ""}
          </p>
        </div>
      </Card>

      <Card className="rounded-xl border border-border/50 bg-card p-4 transition-colors sm:p-5">
        <div>
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">{t("netFlow")}</span>
        </div>
        <div className="mt-3">
          <p className={`text-xl font-bold tracking-tight tabular-nums sm:text-2xl ${isNetPositive ? "text-success" : "text-destructive"}`}>
            {netDisplay}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {counterpartiesCount} {t("counterparties").toLowerCase()}
          </p>
        </div>
      </Card>

      <Card className="rounded-xl border border-border/50 bg-card p-4 transition-colors sm:p-5">
        <div>
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">{t("successRate")}</span>
        </div>
        <div className="mt-3">
          <p className="text-xl font-bold tracking-tight text-foreground tabular-nums sm:text-2xl">
            {successRate}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            <span>{completedCount} {t("completed").toLowerCase()}</span>
            {failedCount > 0 ? (
              <span className="text-destructive"> · {failedCount} {t("failed").toLowerCase()}</span>
            ) : null}
          </p>
        </div>
      </Card>
    </div>
  )
}
