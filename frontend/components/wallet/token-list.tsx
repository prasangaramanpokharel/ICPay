"use client"

import { useMemo, useState, useSyncExternalStore } from "react"
import { useTranslations } from "next-intl"
import { Icon } from "@/components/ui/icon"
import { PlusGlassIcon, SearchGlassIcon } from "@thesvg/ui-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatTokenAmount, resolveTokenDisplayName } from "@/lib/wallet/utils"
import { type TokenHolding, type TokenMetadata } from "@/services/tokens"
import { TokenLogo } from "@/components/token/token-logo"
import { AddTokenDrawer } from "@/components/wallet/add-token-drawer"
import { TokenDetailDrawer } from "@/components/wallet/token-detail-drawer"
import { readHideZeroBalances, writeHideZeroBalances, HIDE_ZERO_EVENT } from "@/lib/wallet/tokenListPrefs"
import { useResolvedTokenPrices } from "@/lib/token/registry"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import { useFiatValue } from "@/hooks/fiat/useFiatValue"
import { useBalanceVisibility } from "@/components/wallet/balance-visibility-provider"
import { cn } from "@/lib/ui/utils"

const PAGE_SIZE = 20

function useHideZeroBalances() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const onChange = () => onStoreChange()
      window.addEventListener(HIDE_ZERO_EVENT, onChange)
      window.addEventListener("storage", onChange)
      return () => {
        window.removeEventListener(HIDE_ZERO_EVENT, onChange)
        window.removeEventListener("storage", onChange)
      }
    },
    () => readHideZeroBalances(),
    () => true
  )
}

function matchesSearch(token: TokenHolding, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    token.symbol.toLowerCase().includes(q) ||
    token.name.toLowerCase().includes(q) ||
    token.ledgerId.toLowerCase().includes(q)
  )
}

export function TokenList({
  holdings,
  isLoading,
  outside,
  existingLedgerIds = [],
  initialSelectedLedgerId,
  onAddCustom,
}: {
  holdings: TokenHolding[]
  isLoading: boolean
  outside?: Map<string, bigint>
  existingLedgerIds?: string[]
  initialSelectedLedgerId?: string | null
  onAddCustom?: (ledgerId: string, meta: TokenMetadata) => void
}) {
  const t = useTranslations("wallet")
  const tPage = useTranslations("transactions")
  const [addOpen, setAddOpen] = useState(false)
  const [selectedLedgerId, setSelectedLedgerId] = useState<string | null | false>(null)
  const [query, setQuery] = useState("")
  const hideZero = useHideZeroBalances()
  const filterKey = `${query}|${hideZero}|${holdings.length}`
  const [pageState, setPageState] = useState({ key: filterKey, page: 0 })
  const page = pageState.key === filterKey ? pageState.page : 0
  const setPage = (next: number) => setPageState({ key: filterKey, page: next })

  const resolvedPrices = useResolvedTokenPrices(holdings)
  const { price: icpPrice } = useIcpPrice()
  const fiat = useFiatValue(null)

  const effectiveId = selectedLedgerId === false ? null : (selectedLedgerId ?? initialSelectedLedgerId ?? null)
  const selectedToken = useMemo(
    () => (effectiveId ? holdings.find((h) => h.ledgerId === effectiveId) ?? null : null),
    [effectiveId, holdings]
  )

  const filtered = useMemo(() => {
    const list = holdings.filter((token) => {
      if (hideZero && token.balance === 0n) return false
      return matchesSearch(token, query)
    })
    return list.sort((a, b) => {
      if (a.balance > 0n && b.balance === 0n) return -1
      if (a.balance === 0n && b.balance > 0n) return 1
      if (a.symbol === "ICP") return -1
      if (b.symbol === "ICP") return 1
      return 0
    })
  }, [holdings, hideZero, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)
  const hasNext = safePage < totalPages - 1
  const hasPrev = safePage > 0

  const toolbar = (
    <div className="space-y-3.5 border-b border-border/60 pb-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground tracking-tight">
          {t("yourAssets")}
        </h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {filtered.length} {t("tokens")}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Icon
            icon={SearchGlassIcon}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchTokens")}
            className="h-9 rounded-lg pl-9"
            aria-label={t("searchTokens")}
          />
        </div>

        <div className="flex shrink-0 items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Switch
              id="hide-zero-balances"
              checked={hideZero}
              onCheckedChange={(checked) => {
                writeHideZeroBalances(checked === true)
              }}
            />
            <Label htmlFor="hide-zero-balances" className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground">
              {t("hideZeroBalances")}
            </Label>
          </div>

          {onAddCustom ? (
            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-9 gap-1.5 rounded-lg px-3.5 text-xs font-semibold cursor-pointer shadow-xs shrink-0"
              aria-label={t("addToken")}
              onClick={() => setAddOpen(true)}
            >
              <Icon icon={PlusGlassIcon} className="size-3.5" strokeWidth={2.25} />
              <span>{t("addToken")}</span>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )

  if (isLoading && holdings.length === 0) {
    return (
      <div className="rounded-(--radius) border border-border/60 bg-card p-4 sm:p-5">
        {toolbar}
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground">{t("colSymbol")}</TableHead>
                <TableHead className="hidden sm:table-cell text-xs font-medium text-muted-foreground">{t("colName")}</TableHead>
                <TableHead className="text-right text-xs font-medium text-muted-foreground">{t("colQuantity")}</TableHead>
                <TableHead className="hidden sm:table-cell text-right text-xs font-medium text-muted-foreground">{t("colValue")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[0, 1, 2, 3].map((i) => (
                <TableRow key={i} className="border-border/60">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-8 rounded-full shrink-0" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-24 sm:hidden" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell py-3">
                    <Skeleton className="h-3.5 w-28" />
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="ml-auto flex flex-col items-end gap-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-14 sm:hidden" />
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell py-3 text-right">
                    <Skeleton className="ml-auto h-4 w-14" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  if (holdings.length === 0) {
    return (
      <div className="rounded-(--radius) border border-border/60 bg-card p-4 sm:p-5">
        {toolbar}
        <Empty className="py-8">
          <EmptyHeader>
            <EmptyTitle>{t("noTokens")}</EmptyTitle>
          </EmptyHeader>
        </Empty>
        {onAddCustom ? (
          <AddTokenDrawer
            open={addOpen}
            onOpenChange={setAddOpen}
            existingIds={existingLedgerIds}
            onAdded={onAddCustom}
          />
        ) : null}
      </div>
    )
  }

  return (
    <div className="rounded-(--radius) border border-border/60 bg-card p-4 sm:p-5">
      {toolbar}

      {pageItems.length === 0 ? (
        <Empty className="py-8">
          <EmptyHeader>
            <EmptyTitle>{t("noTokensFound")}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground">{t("colSymbol")}</TableHead>
                <TableHead className="hidden sm:table-cell text-xs font-medium text-muted-foreground">{t("colName")}</TableHead>
                <TableHead className="text-right text-xs font-medium text-muted-foreground">{t("colQuantity")}</TableHead>
                <TableHead className="hidden sm:table-cell text-right text-xs font-medium text-muted-foreground">{t("colValue")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((token) => {
                const priceUsd =
                  token.symbol === "ICP" ? icpPrice?.usd : resolvedPrices.get(token.ledgerId)
                return (
                  <TokenTableRow
                    key={token.ledgerId}
                    token={token}
                    priceUsd={priceUsd}
                    fiatSymbol={fiat.symbol}
                    fiatRate={fiat.rate ?? 1}
                    onClick={() => setSelectedLedgerId(token.ledgerId)}
                    outside={
                      (outside?.get(token.ledgerId) ?? 0n) > token.fee
                        ? outside!.get(token.ledgerId)!
                        : undefined
                    }
                  />
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {filtered.length > PAGE_SIZE ? (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
          <p className="text-xs text-muted-foreground">
            {tPage("page", { page: safePage + 1, total: totalPages })}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!hasPrev} onClick={() => setPage(safePage - 1)}>
              {tPage("previous")}
            </Button>
            <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => setPage(safePage + 1)}>
              {tPage("next")}
            </Button>
          </div>
        </div>
      ) : null}

      {onAddCustom ? (
        <AddTokenDrawer
          open={addOpen}
          onOpenChange={setAddOpen}
          existingIds={existingLedgerIds}
          onAdded={onAddCustom}
        />
      ) : null}

      <TokenDetailDrawer
        token={selectedToken}
        open={!!selectedToken}
        onOpenChange={(next) => {
          if (!next) setSelectedLedgerId(false)
        }}
      />
    </div>
  )
}

function TokenTableRow({
  token,
  priceUsd,
  fiatSymbol,
  fiatRate,
  outside,
  onClick,
}: {
  token: TokenHolding
  priceUsd?: number
  fiatSymbol: string
  fiatRate: number
  outside?: bigint
  onClick: () => void
}) {
  const t = useTranslations("wallet")
  const { hidden } = useBalanceVisibility()
  const displayName = resolveTokenDisplayName(token.symbol, token.name)

  const fiatFormatted = useMemo(() => {
    if (!priceUsd || priceUsd <= 0) return null
    const tokenAmount = Number(token.balance) / 10 ** token.decimals
    const val = tokenAmount * priceUsd * fiatRate
    return val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }, [token.balance, token.decimals, priceUsd, fiatRate])

  return (
    <TableRow
      onClick={onClick}
      className="cursor-pointer border-border/60 transition-colors hover:bg-muted/50"
    >
      <TableCell className="py-3">
        <div className="flex items-center gap-3">
          <TokenLogo token={token} />
          <div className="min-w-0">
            <span className="font-semibold text-foreground text-sm block">{token.symbol}</span>
            <span className="text-xs text-muted-foreground truncate block max-w-32 sm:hidden">{displayName}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell py-3">
        <span className="text-xs text-muted-foreground truncate block max-w-44 sm:max-w-xs">{displayName}</span>
      </TableCell>
      <TableCell className="py-3 text-right">
        <p
          className={cn(
            "text-sm tabular-nums",
            token.balance === 0n ? "font-normal text-muted-foreground" : "font-semibold text-foreground"
          )}
        >
          {hidden ? "••••••" : formatTokenAmount(token.balance, token.decimals, 4)}
        </p>
        <span className="text-xs tabular-nums text-muted-foreground sm:hidden block">
          {hidden ? "••••" : (fiatFormatted ? `${fiatSymbol}${fiatFormatted}` : "—")}
        </span>
        {outside !== undefined ? (
          <p className="mt-0.5 text-[11px] font-medium text-primary tabular-nums">
            {t("outsideAmount", {
              amount: hidden ? "••••••" : formatTokenAmount(outside, token.decimals, 4),
            })}
          </p>
        ) : null}
      </TableCell>
      <TableCell className="hidden sm:table-cell py-3 text-right">
        <span className="text-sm tabular-nums text-muted-foreground">
          {hidden ? "••••" : (fiatFormatted ? `${fiatSymbol}${fiatFormatted}` : "—")}
        </span>
      </TableCell>
    </TableRow>
  )
}
