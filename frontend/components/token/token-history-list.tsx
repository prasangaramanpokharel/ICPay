"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { LinkSquare02Icon } from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/spinner"
import { useIcrcTokenHistory } from "@/hooks/ledger/useIcrcTokenHistory"
import { useTransactions, useDashboard } from "@/hooks/wallet/useWalletData"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { ICP_LEDGER_ID, type TokenHolding } from "@/services/tokens"
import { cn } from "@/lib/ui/utils"

export function TokenHistoryList({
  token,
  enabled = true,
}: {
  token: TokenHolding
  enabled?: boolean
}) {
  const t = useTranslations("tokenHistory")
  const { page, isLoading: isIcrcLoading } = useIcrcTokenHistory(token.ledgerId, enabled)
  const { items: allTxs, isLoading: isTxsLoading } = useTransactions(0, 50)
  const { data: dashboardData, isLoading: isDashLoading } = useDashboard()

  const rows = page?.rows ?? []

  const custodialTxs = (allTxs.length > 0 ? allTxs : (dashboardData?.recentTransactions ?? []))
    .filter((tx) => {
      if (token.ledgerId === ICP_LEDGER_ID) {
        return !tx.ledgerId || tx.ledgerId === ICP_LEDGER_ID || tx.ledgerId === "ryjl3-tyaaa-aaaaa-aaaba-cai"
      }
      return tx.ledgerId === token.ledgerId
    })

  const isLoading =
    (isIcrcLoading || isTxsLoading || isDashLoading) &&
    custodialTxs.length === 0 &&
    rows.length === 0

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner className="size-5 text-muted-foreground" />
      </div>
    )
  }

  if (custodialTxs.length > 0) {
    return <RecentTransactions transactions={custodialTxs} embedded />
  }

  if (!rows.length) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{t("empty")}</p>
  }

  return (
    <ul className="divide-y divide-border/40 overflow-hidden">
      {rows.map((row) => {
        const isReceive = row.kind === "receive"
        return (
          <li
            key={row.id.toString()}
            className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
          >
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium capitalize text-foreground">
                {isReceive ? t("kind.receive") : t("kind.send")}
              </p>
              <a
                href={`https://dashboard.internetcomputer.org/canister/${token.ledgerId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <span>#{row.id.toString()}</span>
                <HugeiconsIcon
                  icon={LinkSquare02Icon}
                  className="size-3 opacity-60"
                  strokeWidth={1.75}
                />
              </a>
            </div>
            <p
              className={cn(
                "shrink-0 text-sm font-semibold tabular-nums",
                isReceive ? "text-success" : "text-foreground"
              )}
            >
              {isReceive ? "+" : "−"}
              {formatTokenAmount(row.amount, token.decimals, 4)} {token.symbol}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
