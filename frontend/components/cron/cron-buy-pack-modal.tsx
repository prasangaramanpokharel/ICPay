"use client"

import * as React from "react"
import { Principal } from "@icp-sdk/core/principal"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { ZapIcon, Coins01Icon } from "@hugeicons/core-free-icons"
import { buyPack, getPackQuotes } from "@/services/cron/client"
import { getWalletActor } from "@/services/wallet/actor"
import type { RemoteCreditBalance, RemotePackQuote } from "@/services/cron/types"

interface CronBuyPackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  credits: RemoteCreditBalance | null
  onPurchased?: () => void
}

export function CronBuyPackModal({
  open,
  onOpenChange,
  credits,
  onPurchased,
}: CronBuyPackModalProps) {
  const [quotes, setQuotes] = React.useState<RemotePackQuote[]>([])
  const [loadingQuotes, setLoadingQuotes] = React.useState(false)
  const [purchasingTier, setPurchasingTier] = React.useState<number | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    let active = true
    getPackQuotes()
      .then((data) => {
        if (active) setQuotes(data)
      })
      .catch(() => {
        if (active) setQuotes([])
      })
      .finally(() => {
        if (active) setLoadingQuotes(false)
      })
    return () => {
      active = false
    }
  }, [open])

  const handleBuy = async (quote: RemotePackQuote) => {
    setPurchasingTier(quote.pack_tier)
    setError(null)
    setSuccessMsg(null)

    try {
      const walletActor = await getWalletActor()
      const ledgerId = "ryjl3-tyaaa-aaaaa-aaaba-cai"
      const treasuryPrincipal = Principal.fromText(quote.treasury_principal)

      const transferRes = await walletActor.transferByPrincipal(
        ledgerId,
        treasuryPrincipal,
        quote.icp_e8s,
        [`icCron Pack Tier ${quote.pack_tier}`]
      )

      if ("err" in transferRes) {
        throw new Error(`Wallet transfer failed: ${transferRes.err}`)
      }

      const blockIndex = transferRes.ok.blockIndex
      const newBalance = await buyPack(quote.pack_tier, blockIndex)
      const msg = `Added ${quote.credits.toLocaleString()} credits! New balance: ${newBalance.toLocaleString()}`
      setSuccessMsg(msg)
      toast.success(msg)
      if (onPurchased) {
        onPurchased()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process payment"
      setError(msg)
      toast.error(msg)
    } finally {
      setPurchasingTier(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <HugeiconsIcon icon={ZapIcon} className="size-5 text-primary" />
            Buy Execution Credits
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Top up prepaid execution runs pegged to USD and settled via ICP.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 flex flex-col gap-4">
          {credits && (
            <div className="rounded-lg border border-border bg-muted/40 p-3.5 flex items-center justify-between text-xs">
              <div>
                <span className="text-muted-foreground">Free monthly allowance:</span>{" "}
                <span className="font-semibold text-foreground font-mono">
                  {credits.free_runs_remaining.toString()} / 60 remaining
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Prepaid balance:</span>{" "}
                <span className="font-semibold text-foreground font-mono">
                  {credits.prepaid_credits.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {loadingQuotes ? (
            <div className="flex h-40 items-center justify-center">
              <Spinner className="size-6 text-primary" />
            </div>
          ) : quotes.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Unable to load pack quotes right now. Please try again.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quotes.map((q) => {
                const isBuying = purchasingTier === q.pack_tier
                const dollars = (q.usd_cents / 100).toFixed(2)
                const icpFormatted = (Number(q.icp_e8s) / 100_000_000).toFixed(4)

                return (
                  <Card
                    key={q.pack_tier}
                    className="border border-border/80 bg-background text-foreground flex flex-col justify-between p-4"
                  >
                    <div className="flex flex-col gap-1.5 pb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Tier {q.pack_tier}
                        </span>
                        {q.pack_tier === 2 && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        ${dollars}
                      </div>
                      <div className="text-xs font-semibold text-primary">
                        {q.credits.toLocaleString()} Runs
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1 pt-1">
                        <HugeiconsIcon icon={Coins01Icon} className="size-3" />
                        {icpFormatted} ICP
                      </div>
                    </div>

                    <Button
                      size="sm"
                      disabled={isBuying}
                      onClick={() => handleBuy(q)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2 text-xs"
                    >
                      {isBuying ? <Spinner className="size-3.5" /> : "Purchase"}
                    </Button>
                  </Card>
                )
              })}
            </div>
          )}

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="rounded-md border border-success/30 bg-success/10 p-3 text-xs text-success">
              {successMsg}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
