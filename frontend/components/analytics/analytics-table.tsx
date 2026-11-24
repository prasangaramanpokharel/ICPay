"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CopyButton } from "@/components/ui/copy-button"
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Icon } from "@/components/ui/icon"
import { SearchGlassIcon, FunnelGlassIcon } from "@thesvg/ui-react"
import type { TransactionPublic } from "@/services/types"
import {
  formatTime,
  formatTokenAmount,
  shortenCounterparty,
  txStatusLabel,
} from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"
import { ICP_LEDGER_ID } from "@/services/tokens"
import { useBalanceVisibility } from "@/components/wallet/balance-visibility-provider"

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

function getPageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 3) {
    return [1, 2, 3, 4, "ellipsis", total]
  }
  if (current >= total - 2) {
    return [1, "ellipsis", total - 3, total - 2, total - 1, total]
  }
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total]
}

export function AnalyticsTable({ rows }: AnalyticsTableProps) {
  const t = useTranslations("analytics")
  const tt = useTranslations("transactions")
  const { hidden } = useBalanceVisibility()

  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [page, setPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)

  const filteredRows = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((tx) => {
      const typeKey = txTypeDisplay(tx)
      const statusKey = txStatusLabel(tx.status)

      if (typeFilter !== "all" && typeKey !== typeFilter) return false
      if (statusFilter !== "all" && statusKey !== statusFilter) return false

      if (q) {
        const memo = tx.memo[0]?.toLowerCase() ?? ""
        const id = tx.id.toLowerCase()
        const from = tx.from.toLowerCase()
        const to = tx.to.toLowerCase()
        const match = memo.includes(q) || id.includes(q) || from.includes(q) || to.includes(q)
        if (!match) return false
      }

      return true
    })
  }, [rows, search, typeFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safePage = Math.min(page, totalPages - 1)
  const currentPageDisplay = safePage + 1
  const pageItems = getPageItems(currentPageDisplay, totalPages)

  const pageSlice = React.useMemo(() => {
    const start = safePage * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [filteredRows, safePage, pageSize])

  const handleResetFilters = () => {
    setSearch("")
    setTypeFilter("all")
    setStatusFilter("all")
    setPage(0)
  }

  const startRecord = filteredRows.length === 0 ? 0 : safePage * pageSize + 1
  const endRecord = Math.min((safePage + 1) * pageSize, filteredRows.length)

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
    <div className="space-y-3">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Icon
            icon={SearchGlassIcon}
            className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            placeholder={t("searchPlaceholder")}
            className="h-8.5 rounded-lg pl-8 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={typeFilter}
            onValueChange={(val) => {
              setTypeFilter(val ?? "all")
              setPage(0)
            }}
          >
            <SelectTrigger className="h-8.5 w-[120px] rounded-lg text-xs">
              <SelectValue placeholder={t("filterAllTypes")} />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              <SelectItem value="all">{t("filterAllTypes")}</SelectItem>
              <SelectItem value="deposit">{tt("type.deposit")}</SelectItem>
              <SelectItem value="transfer">{tt("type.transfer")}</SelectItem>
              <SelectItem value="withdraw">{tt("type.withdraw")}</SelectItem>
              <SelectItem value="swapIn">{tt("type.swapIn")}</SelectItem>
              <SelectItem value="swapOut">{tt("type.swapOut")}</SelectItem>
              <SelectItem value="fee">{tt("type.fee")}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val ?? "all")
              setPage(0)
            }}
          >
            <SelectTrigger className="h-8.5 w-[120px] rounded-lg text-xs">
              <SelectValue placeholder={t("filterAllStatuses")} />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              <SelectItem value="all">{t("filterAllStatuses")}</SelectItem>
              <SelectItem value="completed">{t("completed")}</SelectItem>
              <SelectItem value="failed">{t("failed")}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              setPageSize(Number(val ?? "10"))
              setPage(0)
            }}
          >
            <SelectTrigger className="h-8.5 w-[85px] rounded-lg text-xs">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              <SelectItem value="10">10 / pg</SelectItem>
              <SelectItem value="25">25 / pg</SelectItem>
              <SelectItem value="50">50 / pg</SelectItem>
            </SelectContent>
          </Select>

          {(search !== "" || typeFilter !== "all" || statusFilter !== "all") && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters} className="h-8.5 text-xs">
              <Icon icon={FunnelGlassIcon} className="size-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
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
            {pageSlice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-xs text-muted-foreground">
                  {t("noRows")}
                </TableCell>
              </TableRow>
            ) : (
              pageSlice.map((tx) => {
                const typeKey = txTypeDisplay(tx)
                const statusKey = txStatusLabel(tx.status)
                const token = tx.ledgerId === ICP_LEDGER_ID ? "ICP" : "TOKEN"
                return (
                  <TableRow key={tx.id} className="text-xs transition-colors hover:bg-muted/40">
                    <TableCell className="px-3 py-2.5 whitespace-nowrap tabular-nums text-muted-foreground">
                      {formatTime(tx.createdAt)}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 font-medium">
                      {tt(`type.${typeKey}` as "type.deposit")}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 font-medium tabular-nums">
                      {hidden ? "••••••" : formatTokenAmount(tx.amount, 8)} {token}
                    </TableCell>
                    <TableCell className="max-w-[140px] px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <span className="truncate font-mono text-[11px] text-muted-foreground">
                          {shortenCounterparty(tx.from)}
                        </span>
                        <CopyButton text={tx.from} size="icon-xs" variant="ghost" className="size-5 shrink-0" />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[140px] px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <span className="truncate font-mono text-[11px] text-muted-foreground">
                          {shortenCounterparty(tx.to)}
                        </span>
                        <CopyButton text={tx.to} size="icon-xs" variant="ghost" className="size-5 shrink-0" />
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
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
                        {statusKey}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground order-2 sm:order-1">
          {filteredRows.length > 0
            ? `Showing ${startRecord}–${endRecord} of ${filteredRows.length} transactions`
            : "0 transactions"}
        </p>

        {totalPages > 1 && (
          <Pagination className="mx-0 w-auto justify-end order-1 sm:order-2">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={safePage <= 0}
                  onClick={() => setPage(Math.max(0, safePage - 1))}
                  text="Previous"
                />
              </PaginationItem>

              {pageItems.map((item, index) =>
                item === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      isActive={item === currentPageDisplay}
                      onClick={() => setPage(item - 1)}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
                  text="Next"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
}
