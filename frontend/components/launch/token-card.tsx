"use client"

import type { MouseEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Icon } from "@/components/ui/icon"
import { CoinsGlassIcon, ArrowRightGlassIcon, FuelGaugeGlassIcon } from "@thesvg/ui-react"
import { Badge } from "@/components/ui/badge"
import { statusOf } from "@/services/launch/launch"
import { formatCycles } from "@/services/cycles/topUp"
import type { TokenPublic } from "@/services/types"
import { formatTokenAmount, formatTime } from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"

const STATUS_VARIANT = {
  active: "secondary",
  pending: "outline",
  failed: "destructive",
} as const

export function TokenCard({
  token,
  onSelect,
}: {
  token: TokenPublic
  onSelect?: (token: TokenPublic) => void
}) {
  const t = useTranslations("launch")
  const status = statusOf(token)
  const [logo] = token.logo
  const [ledgerId] = token.ledgerId
  const [cyclesFunded] = token.cyclesFunded

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onSelect && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
      e.preventDefault()
      onSelect(token)
    }
  }

  return (
    <Link
      href={`/token?id=${encodeURIComponent(token.id)}`}
      onClick={handleClick}
      prefetch
      className="group flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40 cursor-pointer"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
          {logo ? (
            <Image src={logo} alt="" width={40} height={40} className="size-full object-cover" unoptimized />
          ) : (
            <Icon icon={CoinsGlassIcon} className="size-5 text-muted-foreground" strokeWidth={1.75} />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {token.name}
            </span>
            <span className="shrink-0 font-mono text-xs text-muted-foreground">{token.symbol}</span>
            {ledgerId && (
              <span className="hidden sm:inline-block truncate rounded-md bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {ledgerId.slice(0, 5)}...{ledgerId.slice(-3)}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="tabular-nums font-medium">
              {formatTokenAmount(token.totalSupply, token.decimals, 0)} {token.symbol}
            </span>
            {cyclesFunded != null && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <Icon icon={FuelGaugeGlassIcon} className="size-3 text-muted-foreground" strokeWidth={1.75} />
                  {formatCycles(cyclesFunded)}
                </span>
              </>
            )}
            <span>•</span>
            <span className="text-[11px]">{formatTime(token.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={STATUS_VARIANT[status]} className={cn("text-xs", status === "pending" && "animate-pulse")}>
          {t(`status.${status}`)}
        </Badge>
        <Icon
          icon={ArrowRightGlassIcon}
          className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground"
          strokeWidth={1.75}
        />
      </div>
    </Link>
  )
}
