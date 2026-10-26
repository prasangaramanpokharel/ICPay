"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { TokenAvatar } from "@/components/public/market/trade/token-avatar"
import { TradeInfoHint } from "@/components/public/market/trade/trade-info-hint"
import { cn } from "@/lib/ui/utils"
import { buildPortfolioAssetRows } from "@/lib/market/availableAssets"
import { formatUsd, formatPct } from "@/lib/market/format"
import { formatTokenAmount, toPlainTokenAmount } from "@/lib/wallet/utils"
import type { TerminalPairRow } from "@/services/market/tradePairSnapshot"

export function TradeAvailableAssets({
  rows,
  balances,
  activeBaseId,
  loading,
  onSelect,
}: {
  rows: TerminalPairRow[]
  balances: Map<string, bigint>
  activeBaseId: string
  loading?: boolean
  onSelect: (baseLedgerId: string) => void
}) {
  const t = useTranslations("marketTrade")
  const tc = useTranslations("common")
  const assets = buildPortfolioAssetRows(rows, balances)

  return (
    <Card size="sm" className="m-1 flex h-full min-h-0 flex-1 flex-col gap-0 overflow-hidden py-0">
      <CardHeader className="shrink-0 border-b px-3 py-2">
        <div className="flex items-center gap-1">
          <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {tc("available")}
          </CardTitle>
          <TradeInfoHint label={tc("available")} text={t("availableHint")} />
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 p-0">
        <ScrollArea className="h-full px-0 pb-1">
          {loading ? (
            <Table>
              <TableBody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="h-9 border-b border-border/20">
                    <TableCell className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="size-5 rounded-full" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-right">
                      <Skeleton className="h-3 w-14 ml-auto" />
                    </TableCell>
                    <TableCell className="px-3 py-2 text-right">
                      <Skeleton className="h-3 w-10 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : assets.length === 0 ? (
            <Empty className="border-0 py-6">
              <EmptyHeader>
                <EmptyTitle className="text-xs text-muted-foreground">{t("positionsEmpty")}</EmptyTitle>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-7 px-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t("colCoin")}
                  </TableHead>
                  <TableHead className="h-7 px-3 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t("colAvailable")}
                  </TableHead>
                  <TableHead className="h-7 px-3 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t("colPnl")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((row) => {
                  const active = row.ledgerId === activeBaseId
                  const pnl = row.pnl24hUsd
                  const up = (pnl ?? 0) > 0
                  const down = (pnl ?? 0) < 0
                  return (
                    <TableRow
                      key={row.ledgerId}
                      role="button"
                      tabIndex={0}
                      aria-label={row.symbol}
                      className={cn("cursor-pointer", active && "bg-muted/60")}
                      onClick={() => onSelect(row.ledgerId)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          onSelect(row.ledgerId)
                        }
                      }}
                    >
                      <TableCell className="px-3 py-1.5">
                        <div className="flex min-w-0 items-center gap-2">
                          <TokenAvatar
                            symbol={row.symbol}
                            ledgerId={row.ledgerId}
                            logoUrl={row.logoUrl}
                            className="size-5 shrink-0"
                          />
                          <span className="truncate text-xs font-semibold">{row.symbol}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-1.5 text-right font-mono tabular-nums">
                        <div
                          className="text-xs font-medium text-foreground"
                          title={`${toPlainTokenAmount(row.balance, row.decimals)} ${row.symbol}`}
                        >
                          {formatTokenAmount(row.balance, row.decimals, 6)}
                        </div>
                        <div className="text-[10px] text-muted-foreground/80 font-mono">
                          {row.valueUsd != null ? formatUsd(row.valueUsd, 2) : "—"}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-1.5 text-right font-mono tabular-nums">
                        <div
                          className={cn(
                            "text-xs font-medium",
                            up && "text-success",
                            down && "text-destructive"
                          )}
                        >
                          {pnl == null
                            ? "—"
                            : `${up ? "+" : ""}${formatUsd(pnl, 2, { compact: false })}`}
                        </div>
                        <div
                          className={cn(
                            "text-[10px] font-mono",
                            up && "text-success/90",
                            down && "text-destructive/90",
                            !up && !down && "text-muted-foreground/90"
                          )}
                        >
                          {formatPct(row.change24h)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
