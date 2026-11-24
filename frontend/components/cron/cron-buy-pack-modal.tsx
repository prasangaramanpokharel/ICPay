"use client"

import * as React from "react"
import { Principal } from "@icp-sdk/core/principal"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { Icon } from "@/components/ui/icon"
import { ZapGlassIcon, ClockGlassIcon } from "@thesvg/ui-react"
import { useAuth } from "@/components/auth/auth-provider"
import { buyCredits, quoteCredits } from "@/services/cron/client"
import { getWalletActor } from "@/services/wallet/actor"
import type { RemoteCreditBalance, RemotePackQuote } from "@/services/cron/types"

interface CronBuyPackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  credits: RemoteCreditBalance | null
  onPurchased?: () => void
}

const PRESET_RUNS = [1000, 2500, 5000, 10000, 25000]

function formatRunway(runs: number): string {
  if (runs <= 0) return "—"
  const hourlyDays = Math.floor(runs / 24)
  if (hourlyDays >= 365) {
    const years = (hourlyDays / 365).toFixed(1)
    return `~ ${years} years of hourly runs`
  }
  if (hourlyDays >= 30) {
    const months = (hourlyDays / 30).toFixed(1)
    return `~ ${months} months of hourly runs`
  }
  if (hourlyDays >= 2) {
    return `~ ${hourlyDays} days of hourly runs`
  }
  return `~ ${runs} hours of hourly runs`
}

export function CronBuyPackModal({
  open,
  onOpenChange,
  credits,
  onPurchased,
}: CronBuyPackModalProps) {
  const t = useTranslations("cron")
  const { identity } = useAuth()
  const [runs, setRuns] = React.useState<number>(2500)
  const [quote, setQuote] = React.useState<RemotePackQuote | null>(null)
  const [loadingQuote, setLoadingQuote] = React.useState(false)
  const [purchasing, setPurchasing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    if (runs < 100) {
      setQuote(null)
      setLoadingQuote(false)
      return
    }
    let active = true
    setLoadingQuote(true)
    quoteCredits(BigInt(runs), identity ?? undefined)
      .then((q) => {
        if (active) {
          setQuote(q)
          setLoadingQuote(false)
        }
      })
      .catch(() => {
        if (active) {
          setQuote(null)
          setLoadingQuote(false)
        }
      })
    return () => {
      active = false
    }
  }, [open, runs, identity])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setError(null)
      setSuccessMsg(null)
    }
    onOpenChange(nextOpen)
  }

  const handleRunsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setSuccessMsg(null)
    const raw = parseInt(e.target.value.replace(/\D/g, ""), 10)
    const val = Number.isNaN(raw) ? 0 : raw
    setLoadingQuote(true)
    setRuns(val)
  }

  const handlePresetClick = (preset: number) => {
    setError(null)
    setSuccessMsg(null)
    setLoadingQuote(true)
    setRuns(preset)
  }

  const handleBuy = async () => {
    if (!quote || runs < 100) {
      toast.error("Please enter a valid number of runs (min 100).")
      return
    }

    setPurchasing(true)
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
        [`icCron Top Up: ${runs} runs`]
      )

      if ("err" in transferRes) {
        throw new Error(`Wallet transfer failed: ${transferRes.err}`)
      }

      const blockIndex = transferRes.ok.blockIndex
      const newBalance = await buyCredits(
        BigInt(runs),
        blockIndex,
        identity ?? undefined
      )
      const msg = `Successfully added ${runs.toLocaleString()} runs! New balance: ${newBalance.toLocaleString()} runs`
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
      setPurchasing(false)
    }
  }

  const dollarsFormatted = quote ? (quote.usd_cents / 100).toFixed(2) : (runs * 0.0005).toFixed(2)
  const icpFormatted = quote ? (Number(quote.icp_e8s) / 100_000_000).toFixed(4) : "—"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon={ZapGlassIcon} className="size-5 text-primary" />
            {t("topUpTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("topUpDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 flex flex-col gap-4">
          {credits && (
            <div className="rounded-lg border border-border bg-muted/40 p-3.5 flex items-center justify-between text-xs">
              <div>
                <span className="text-muted-foreground">{t("freeMonthlyAllowance")}:</span>{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {credits.free_runs_remaining.toString()} / 60 {t("remaining")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">{t("prepaidBalance")}:</span>{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {credits.prepaid_credits.toLocaleString()} {t("runs")}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="runs-input">
              {t("executionRuns")}
            </Label>

            <div className="relative">
              <Input
                id="runs-input"
                type="text"
                inputMode="numeric"
                value={runs === 0 ? "" : runs.toLocaleString()}
                onChange={handleRunsChange}
                placeholder="2,500"
                className="pr-16 font-semibold tabular-nums text-foreground bg-input border-border"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                {t("runs")}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {PRESET_RUNS.map((preset) => {
                const isSelected = runs === preset
                return (
                  <Button
                    key={preset}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs px-2.5 tabular-nums"
                    onClick={() => handlePresetClick(preset)}
                  >
                    {preset.toLocaleString()}
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{t("totalUsd")}</span>
                <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                  ${dollarsFormatted}
                </span>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="text-xs text-muted-foreground">{t("estimatedIcp")}</span>
                <div className="flex items-center text-sm font-semibold text-foreground tabular-nums">
                  {loadingQuote ? <Spinner className="size-3.5" /> : `${icpFormatted} ICP`}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Icon icon={ClockGlassIcon} className="size-3.5 text-primary" />
                <span>{t("estimatedRunway")}</span>
              </div>
              <Badge variant="secondary" className="font-normal text-[11px]">
                {formatRunway(runs)}
              </Badge>
            </div>
          </div>

          <Button
            size="default"
            disabled={purchasing || runs < 100 || !quote}
            onClick={handleBuy}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          >
            {purchasing ? (
              <Spinner className="size-4 mr-2" />
            ) : null}
            {t("confirm")}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMsg && (
            <Alert className="border-success/30 bg-success/10 text-success">
              <AlertDescription>{successMsg}</AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
