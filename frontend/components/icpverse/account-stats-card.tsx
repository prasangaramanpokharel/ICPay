"use client"

import { useState } from "react"
import { Principal } from "@icp-sdk/core/principal"
import { useTranslations } from "next-intl"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { formatAmount, copyText, E8S } from "@/lib/wallet/utils"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import { useFiatValue } from "@/hooks/fiat/useFiatValue"
import { useAccountStats } from "@/hooks/wallet/useWalletData"
import { cn } from "@/lib/ui/utils"

export function AccountStatsCard({ principal }: { principal: string }) {
  const t = useTranslations("accountStats")
  const { stats, isLoading } = useAccountStats(principal)
  const { price } = useIcpPrice()
  const usd = price && stats ? (Number(stats.balance) / Number(E8S)) * price.usd : null
  const fiat = useFiatValue(usd)

  if (isLoading) return <Skeleton className="h-44 w-full rounded-2xl" />
  if (!stats) return null

  return (
    <Card className="w-full gap-0 overflow-hidden font-mono text-xs border border-border p-0">
      <div className="grid grid-cols-2 gap-px bg-border">
        <Cell label={t("balance")} value={`${formatAmount(stats.balance)} ICP`} strong />
        <Cell label={t("transactions")} value={stats.txCount === 0 ? "—" : String(stats.txCount)} strong />
        <Cell
          label={t("value")}
          value={fiat.formatted === null ? "—" : `≈ ${fiat.symbol}${fiat.formatted}`}
        />
        <Cell
          label={t("sinceBlock")}
          value={stats.firstBlock === undefined ? "—" : compact(stats.firstBlock)}
        />
      </div>

      <div className="space-y-2 bg-card px-3.5 py-3">
        <CopyRow label={t("principal")} value={principal} />
        <Row label={t("type")} value={t(`kinds.${principalKind(principal)}`)} />
        <Row label={t("bytes")} value={String(principalBytes(principal))} />
        {stats.lastBlock !== undefined && (
          <Row label={t("lastBlock")} value={stats.lastBlock.toString()} />
        )}
      </div>
    </Card>
  )
}

function Cell({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="bg-card px-3.5 py-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-1 truncate tabular-nums", strong && "text-sm font-semibold")}>{value}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="min-w-0 truncate text-right">{value}</span>
    </div>
  )
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const tc = useTranslations("common")
  const [copied, setCopied] = useState(false)

  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <Button
        variant="ghost"
        size="xs"
        onClick={async () => {
          await copyText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
        className="h-auto min-w-0 px-0 text-inherit hover:bg-transparent hover:text-primary"
      >
        <span className={cn("truncate", copied && "text-primary")}>
          {copied ? tc("copied") : value}
        </span>
      </Button>
    </div>
  )
}

function principalKind(text: string): "selfAuthenticating" | "anonymous" | "canister" | "opaque" {
  const n = principalBytes(text)
  if (n === 29) return "selfAuthenticating"
  if (n === 0) return "anonymous"
  if (n <= 10) return "canister"
  return "opaque"
}

function principalBytes(text: string): number {
  try {
    return Principal.fromText(text).toUint8Array().length
  } catch {
    return 0
  }
}

function compact(n: bigint): string {
  const v = Number(n)
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return String(v)
}
