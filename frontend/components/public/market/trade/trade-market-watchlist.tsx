"use client"

import { useMemo, useState } from "react"
import { preload } from "swr"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowDownGlassIcon, ArrowUpGlassIcon, SearchGlassIcon, XGlassIcon } from "@thesvg/ui-react"
import { TokenAvatar } from "./token-avatar"
import { cn } from "@/lib/ui/utils"
import { changeClass, formatPct, formatUsd, formatWatchlistPrice } from "@/lib/market/format"
import { marketPageCount, sortDefaultsForChangeFilter } from "@/lib/market/overview"
import { takeWatchlistRows, WATCHLIST_PAGE_SIZE } from "@/lib/market/watchlistPage"
import { pinWatchlistRows } from "@/lib/market/customWatchlist"
import { MarketPager } from "@/components/public/market/market-pager"
import { Separator } from "@/components/ui/separator"
import { CustomTokenSearch } from "@/components/public/market/custom-token-search"
import { terminalPairKey } from "@/lib/market/tradePairs"
import { fetchTradePairSnapshot, type TerminalPairRow } from "@/services/market/tradePairSnapshot"

type SortKey = "name" | "price" | "change" | "volume"
type ChangeFilter = "all" | "up" | "down"

export function TradeMarketWatchlist({
  rows,
  activeBaseId,
  activeLogoUrl,
  onSelect,
  onAddCustomToken,
  loading,
  pinnedIds,
}: {
  rows: TerminalPairRow[]
  activeBaseId: string
  activeLogoUrl?: string | null
  onSelect: (baseLedgerId: string) => void
  onAddCustomToken?: (row: TerminalPairRow) => void
  loading?: boolean
  pinnedIds?: Iterable<string>
}) {
  const t = useTranslations("marketTrade")
  const [query, setQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [changeFilter, setChangeFilter] = useState<ChangeFilter>("all")
  const [sortKey, setSortKey] = useState<SortKey>("volume")
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(1)
  const filterKey = `${query}|${changeFilter}|${sortKey}|${sortAsc}`
  const [pageKey, setPageKey] = useState(filterKey)

  const resetPageIfNeeded = pageKey !== filterKey
  if (resetPageIfNeeded) {
    setPageKey(filterKey)
    setPage(1)
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v)
    else {
      setSortKey(key)
      setSortAsc(key === "name")
    }
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const lowercased = q ? rows.map(row => ({
      row,
      symbol: row.base.symbol.toLowerCase(),
      name: row.base.name.toLowerCase()
    })) : null
    const next = rows.filter((row, idx) => {
      if (q) {
        const lc = lowercased![idx]
        if (!lc.symbol.includes(q) && !lc.name.includes(q)) return false
      }
      const ch = row.stats?.priceChange24h ?? 0
      if (changeFilter === "up") return ch > 0
      if (changeFilter === "down") return ch < 0
      return true
    })
    const dir = sortAsc ? 1 : -1
    next.sort((a, b) => {
      if (sortKey === "name") return dir * a.base.symbol.localeCompare(b.base.symbol)
      if (sortKey === "price") return dir * ((a.stats?.priceUsd ?? 0) - (b.stats?.priceUsd ?? 0))
      if (sortKey === "change") {
        return dir * ((a.stats?.priceChange24h ?? 0) - (b.stats?.priceChange24h ?? 0))
      }
      return dir * (pairVolume(a) - pairVolume(b))
    })
    return pinWatchlistRows(next, pinnedIds ?? [])
  }, [rows, query, changeFilter, sortKey, sortAsc, pinnedIds])

  const pageCount = marketPageCount(visible.length, WATCHLIST_PAGE_SIZE)
  const safePage = Math.min(page, pageCount)
  const shown = takeWatchlistRows(visible, safePage)

  return (
    <TooltipProvider delay={200}>
      <Card size="sm" className="m-1 flex h-full min-h-0 flex-col gap-0 overflow-hidden py-0">
        <CardHeader className="shrink-0 border-b py-2">
          {isSearchOpen || query ? (
            <div className="flex h-6 items-center gap-1.5">
              <SearchGlassIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setQuery("")
                    setIsSearchOpen(false)
                  }
                }}
                placeholder={t("searchPairs")}
                className="h-6 flex-1 border-border/60 bg-muted/40 px-1.5 py-0 text-xs"
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("searchPairs")}
                className="size-6 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setQuery("")
                  setIsSearchOpen(false)
                }}
              >
                <XGlassIcon className="size-3" />
              </Button>
            </div>
          ) : (
            <div className="flex h-6 items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">
                {t("markets")}
              </p>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 cursor-pointer text-muted-foreground hover:text-foreground"
                        onClick={() => setIsSearchOpen(true)}
                        aria-label={t("searchPairs")}
                      />
                    }
                  >
                    <SearchGlassIcon className="size-3.5" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">{t("searchPairs")}</p>
                  </TooltipContent>
                </Tooltip>
                {onAddCustomToken && <CustomTokenSearch onTokenFound={onAddCustomToken} />}
              </div>
            </div>
          )}
          <ToggleGroup
            value={[changeFilter]}
            onValueChange={(val) => {
              const k = val[0] as ChangeFilter | undefined
              if (!k) return
              setChangeFilter(k)
              const defaults = sortDefaultsForChangeFilter(k)
              if (defaults) {
                setSortKey(defaults.sortKey as SortKey)
                setSortAsc(defaults.sortAsc)
              }
            }}
            className="mt-1.5 justify-start gap-1"
          >
            <ToggleGroupItem value="all" size="sm" className="h-6 px-2.5 text-xs font-medium">
              {t("filterAll")}
            </ToggleGroupItem>
            <ToggleGroupItem value="up" size="sm" className="h-6 px-2.5 text-xs font-medium">
              {t("filterGainers")}
            </ToggleGroupItem>
            <ToggleGroupItem value="down" size="sm" className="h-6 px-2.5 text-xs font-medium">
              {t("filterLosers")}
            </ToggleGroupItem>
          </ToggleGroup>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full px-1.5 py-1">
            <div className="flex w-full items-center justify-between gap-2 px-3 pb-1.5 text-xs text-muted-foreground">
              <SortHead
                label={t("colName")}
                active={sortKey === "name"}
                asc={sortAsc}
                onClick={() => toggleSort("name")}
              />
              <SortHead
                label={`${t("price")} (USD)`}
                active={sortKey === "price"}
                asc={sortAsc}
                onClick={() => toggleSort("price")}
              />
            </div>
            <ul>
              {loading && rows.length === 0 ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <li key={i} className="grid grid-cols-12 items-center gap-2 px-3 py-2">
                    <Skeleton className="col-span-2 size-7 rounded-full" />
                    <div className="col-span-5 grid gap-1.5">
                      <Skeleton className="h-3.5 w-14" />
                      <Skeleton className="h-2.5 w-20" />
                    </div>
                    <div className="col-span-5 grid justify-items-end gap-1.5">
                      <Skeleton className="h-3.5 w-14" />
                      <Skeleton className="h-2.5 w-10" />
                    </div>
                  </li>
                ))
              ) : shown.map((row) => (
                <li key={row.baseLedgerId}>
                  <HoverCard>
                    <HoverCardTrigger
                      onClick={() => onSelect(row.baseLedgerId)}
                      onMouseEnter={() => {
                        void preload(["terminal-pair", terminalPairKey(row.baseLedgerId)], () =>
                          fetchTradePairSnapshot(row.baseLedgerId, row.stats)
                        )
                      }}
                      className={cn(
                        "grid w-full grid-cols-12 items-center gap-1.5 rounded-lg px-2.5 py-2 text-left transition-colors cursor-pointer",
                        row.baseLedgerId === activeBaseId
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50 text-foreground"
                      )}
                    >
                      <TokenAvatar
                        symbol={row.base.symbol}
                        ledgerId={row.baseLedgerId}
                        logoUrl={
                          row.baseLedgerId === activeBaseId
                            ? (activeLogoUrl ?? row.base.logoUrl)
                            : row.base.logoUrl
                        }
                        className="col-span-2 size-7 shrink-0"
                      />
                      <div className="col-span-4 grid min-w-0">
                        <span className="truncate text-sm font-medium leading-tight">
                          {row.base.symbol}
                        </span>
                        <span className="truncate text-xs text-muted-foreground leading-tight">
                          {row.base.name}
                        </span>
                      </div>
                      <div className="col-span-6 grid text-end tabular-nums">
                        <span className="text-sm leading-tight">
                          {formatWatchlistPrice(row.stats?.priceUsd)}
                        </span>
                        <span
                          className={cn(
                            "text-xs leading-tight",
                            changeClass(row.stats?.priceChange24h)
                          )}
                        >
                          {formatPct(row.stats?.priceChange24h)}
                        </span>
                      </div>
                    </HoverCardTrigger>
                  <HoverCardContent side="right" align="start" className="w-56 p-3 text-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <TokenAvatar
                        symbol={row.base.symbol}
                        ledgerId={row.baseLedgerId}
                        logoUrl={row.base.logoUrl}
                        className="size-6"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate leading-tight">{row.base.symbol}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{row.base.name}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 border-t border-border pt-2 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("price")}</span>
                        <span className="font-medium tabular-nums">{formatWatchlistPrice(row.stats?.priceUsd)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("change24h")}</span>
                        <span className={cn("font-medium tabular-nums", changeClass(row.stats?.priceChange24h))}>
                          {formatPct(row.stats?.priceChange24h)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("volume24h")}</span>
                        <span className="font-medium tabular-nums">{formatUsd(row.stats?.volume24hUsd)}</span>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </li>
            ))}
          </ul>
          {pageCount > 1 && (
            <>
              <Separator className="my-2" />
              <MarketPager compact page={safePage} pages={pageCount} onPage={setPage} />
            </>
          )}
        </ScrollArea>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

function SortHead({
  label,
  active,
  asc,
  onClick,
}: {
  label: string
  active: boolean
  asc: boolean
  onClick: () => void
}) {
  return (
    <Button
      variant="ghost"
      size="xs"
      onClick={onClick}
      aria-sort={active ? (asc ? "ascending" : "descending") : "none"}
      className={cn(
        "h-auto min-w-0 px-0! py-0 font-normal hover:bg-transparent text-muted-foreground hover:text-foreground inline-flex items-center gap-1 whitespace-nowrap cursor-pointer",
        active && "text-foreground font-medium"
      )}
    >
      <span>{label}</span>
      {active ? (
        asc ? (
          <ArrowUpGlassIcon className="size-3 shrink-0" />
        ) : (
          <ArrowDownGlassIcon className="size-3 shrink-0" />
        )
      ) : null}
    </Button>
  )
}

function pairVolume(row: TerminalPairRow): number {
  const v24 = row.stats?.volume24hUsd ?? 0
  return v24 > 0 ? v24 : (row.stats?.volume7dUsd ?? 0)
}
