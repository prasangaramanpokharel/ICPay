"use client"

import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { TransactionPublic } from "@/services/types"
import {
  formatTime,
  formatTokenAmount,
  shortenCounterparty,
  txStatusLabel,
} from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"
import { ICP_LEDGER_ID } from "@/services/tokens"

type AnalyticsTableProps = {
  rows: TransactionPublic[]
}

function txTypeDisplay(tx: TransactionPublic): string {
  if ("deposit" in tx.txType) return "deposit"
  if ("withdraw" in tx.txType) return "withdraw"
  if ("transfer" in tx.txType) return "transfer"
  if ("fee" in tx.txType) return "fee"
  if ("swapIn" in tx.txType) return "swapIn"
  if ("swapOut" in tx.txType) return "swapOut"
  return "transfer"
}

export function AnalyticsTable({ rows }: AnalyticsTableProps) {
  const t = useTranslations("analytics")
  const tt = useTranslations("transactions")

  if (rows.length === 0) {
    return (
      <Empty className="rounded-xl border border-dashed py-8">
        <EmptyHeader>
          <EmptyTitle>{t("noRows")}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow>
            <TableHead className="px-3 py-2 text-xs">{t("colDate")}</TableHead>
            <TableHead className="px-3 py-2 text-xs">{t("colType")}</TableHead>
            <TableHead className="px-3 py-2 text-xs">{t("colAmount")}</TableHead>
            <TableHead className="px-3 py-2 text-xs">{t("colFrom")}</TableHead>
            <TableHead className="px-3 py-2 text-xs">{t("colTo")}</TableHead>
            <TableHead className="px-3 py-2 text-xs">{t("colStatus")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((tx) => {
            const typeKey = txTypeDisplay(tx)
            const statusKey = txStatusLabel(tx.status)
            const token = tx.ledgerId === ICP_LEDGER_ID ? "ICP" : "TOKEN"
            return (
              <TableRow key={tx.id} className="text-xs">
                <TableCell className="px-3 py-2 whitespace-nowrap tabular-nums text-muted-foreground">
                  {formatTime(tx.createdAt)}
                </TableCell>
                <TableCell className="px-3 py-2 font-medium">
                  {tt(`type.${typeKey}` as "type.deposit")}
                </TableCell>
                <TableCell className="px-3 py-2 font-medium tabular-nums">
                  {formatTokenAmount(tx.amount, 8)} {token}
                </TableCell>
                <TableCell className="max-w-[120px] truncate px-3 py-2 font-mono text-[11px] text-muted-foreground">
                  {shortenCounterparty(tx.from)}
                </TableCell>
                <TableCell className="max-w-[120px] truncate px-3 py-2 font-mono text-[11px] text-muted-foreground">
                  {shortenCounterparty(tx.to)}
                </TableCell>
                <TableCell className="px-3 py-2">
                  <Badge
                    variant={
                      statusKey === "completed"
                        ? "default"
                        : statusKey === "failed"
                          ? "destructive"
                          : "outline"
                    }
                    className={cn(
                      "text-[10px] font-medium",
                      statusKey === "completed" && "bg-success/15 text-success border-transparent hover:bg-success/20"
                    )}
                  >
                    {tt(`status.${statusKey}` as "status.completed")}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
