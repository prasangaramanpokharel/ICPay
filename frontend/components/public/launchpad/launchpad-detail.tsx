"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { GradientBadge } from "@/components/ui/gradient-badge"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ShineBorder } from "@/components/ui/shine-border"
import { toast } from "sonner"
import {
  ArrowLeft,
  ShieldCheck,
  Users,
  ExternalLink,
  Copy,
  Check,
  Info,
} from "lucide-react"
import { LaunchpadGuideDialog } from "./launchpad-guide-dialog"
import type { LaunchpadCampaign, UserCommitment } from "@/services/launchpad/types"

interface LaunchpadDetailProps {
  campaign: LaunchpadCampaign
  initialCommitment?: UserCommitment | null
}

export function LaunchpadDetail({ campaign: initialCampaign, initialCommitment }: LaunchpadDetailProps) {
  const [campaign, setCampaign] = React.useState<LaunchpadCampaign>(initialCampaign)
  const [commitment, setCommitment] = React.useState<UserCommitment | null>(initialCommitment ?? null)
  const [commitAmount, setCommitAmount] = React.useState<string>("1")
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [copied, setCopied] = React.useState<boolean>(false)
  const [guideOpen, setGuideOpen] = React.useState<boolean>(false)

  const rawTokens = parseFloat(campaign.totalTokensAllocated.replace(/,/g, ""))
  const tokenRate =
    campaign.maxIcpTarget > 0 && !isNaN(rawTokens) ? rawTokens / campaign.maxIcpTarget : 0
  const parsedCommit = parseFloat(commitAmount)
  const estimatedTokens = !isNaN(parsedCommit) && parsedCommit > 0 ? parsedCommit * tokenRate : 0

  const isLive = campaign.status === "Open"
  const isCommitted = campaign.status === "Committed" || campaign.status === "Finalized"
  const isAborted = campaign.status === "Aborted"

  const handleCopyLedger = () => {
    navigator.clipboard.writeText(campaign.tokenLedger)
    setCopied(true)
    toast.success("Ledger Principal copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCommit = async () => {
    const val = parseFloat(commitAmount)
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid ICP amount")
      return
    }
    if (val < campaign.minParticipantIcp) {
      toast.error(`Minimum commitment is ${campaign.minParticipantIcp} ICP`)
      return
    }
    if (val > campaign.maxParticipantIcp) {
      toast.error(`Maximum commitment per user is ${campaign.maxParticipantIcp} ICP`)
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate/Trigger participation
      await new Promise((r) => setTimeout(r, 1200))
      const newRaised = campaign.totalIcpRaised + val
      setCampaign((prev) => ({
        ...prev,
        totalIcpRaised: newRaised,
        participantCount: prev.participantCount + 1,
        progressPercent: Math.min(100, (newRaised / prev.maxIcpTarget) * 100),
      }))

      setCommitment((prev) => ({
        campaignId: campaign.id,
        participant: "current-user",
        amountIcp: (prev?.amountIcp ?? 0) + val,
        tokensClaimed: false,
        refundClaimed: false,
        timestamp: Date.now(),
      }))

      toast.success(`Successfully committed ${val} ICP to ${campaign.tokenSymbol}!`)
    } catch {
      toast.error("Commitment failed. Please verify your balance.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClaimTokens = async () => {
    setIsSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 1000))
      setCommitment((prev) => (prev ? { ...prev, tokensClaimed: true } : null))
      toast.success(`Successfully claimed ${campaign.tokenSymbol} tokens to your wallet!`)
    } catch {
      toast.error("Claiming tokens failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClaimRefund = async () => {
    setIsSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 1000))
      setCommitment((prev) => (prev ? { ...prev, refundClaimed: true } : null))
      toast.success(`100% refund of ${commitment?.amountIcp ?? 0} ICP returned to your wallet!`)
    } catch {
      toast.error("Claiming refund failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-6">
      {/* Back button */}
      <div>
        <Link
          href="/launchpad"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to Launchpad
        </Link>
      </div>

      {/* Main Grid: Left is Details & Tokenomics, Right is Live Participation Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Title & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/80 border border-border text-lg font-semibold tracking-wider text-foreground">
                {campaign.tokenSymbol.slice(0, 3)}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {campaign.tokenName}
                </h1>
                <p className="text-sm font-mono text-muted-foreground uppercase">
                  ${campaign.tokenSymbol}
                </p>
              </div>
            </div>

            <div>
              {isLive && (
                <GradientBadge size="md">
                  <span className="px-2 font-bold tracking-wider">LIVE SALE</span>
                </GradientBadge>
              )}
              {isCommitted && (
                <Badge variant="outline" className="border-border bg-muted/60 text-foreground font-medium text-xs px-3 py-1 gap-1.5">
                  <ShieldCheck className="size-3.5 text-muted-foreground" />
                  Goal Met
                </Badge>
              )}
              {isAborted && (
                <Badge variant="outline" className="border-border bg-muted/40 text-muted-foreground font-medium text-xs px-3 py-1">
                  Refunds Active
                </Badge>
              )}
            </div>
          </div>

          {/* Escrow Guarantee Banner */}
          <div className="flex items-start gap-3.5 rounded-2xl border border-border bg-card/60 p-4 text-xs text-foreground backdrop-blur-xl">
            <ShieldCheck className="size-5 text-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <AnimatedShinyText shimmerWidth={140} className="mx-0 text-xs font-semibold text-foreground">
                100% On-Chain Escrow Guarantee
              </AnimatedShinyText>
              <p className="leading-relaxed text-muted-foreground">
                All participant funds remain locked in the decentralized launchpad smart contract. If this sale does not hit the {campaign.minIcpTarget} ICP Soft Cap before expiry, 100% of deposited ICP is immediately returned to buyers.
              </p>
            </div>
          </div>

          {/* Project Description */}
          <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl space-y-3">
            <h2 className="text-base font-semibold text-foreground">About the Project</h2>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {campaign.description}
            </p>

            {campaign.website && (
              <div className="pt-2">
                <a
                  href={campaign.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  Visit Official Website
                </a>
              </div>
            )}
          </div>

          {/* Tokenomics & Sale Parameters */}
          <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl space-y-4">
            <h2 className="text-base font-semibold text-foreground">Launch Parameters</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl border border-border/40 bg-muted/20 p-3 space-y-1">
                <span className="text-muted-foreground">Tokens for Sale</span>
                <p className="font-mono font-semibold text-foreground">
                  {campaign.totalTokensAllocated}
                </p>
              </div>

              <div className="rounded-xl border border-border/40 bg-muted/20 p-3 space-y-1">
                <span className="text-muted-foreground">Soft / Hard Cap</span>
                <p className="font-mono font-semibold text-foreground">
                  {campaign.minIcpTarget} / {campaign.maxIcpTarget} ICP
                </p>
              </div>

              <div className="rounded-xl border border-border/40 bg-muted/20 p-3 space-y-1">
                <span className="text-muted-foreground">Min / Max Per User</span>
                <p className="font-mono font-semibold text-foreground">
                  {campaign.minParticipantIcp} - {campaign.maxParticipantIcp} ICP
                </p>
              </div>

              <div className="rounded-xl border border-border/40 bg-muted/20 p-3 space-y-1">
                <span className="text-muted-foreground">DEX Liquidity</span>
                <p className="font-mono font-semibold text-foreground">
                  {campaign.dexLiquidityPercent}% Paired
                </p>
              </div>

              <div className="rounded-xl border border-border/40 bg-muted/20 p-3 space-y-1">
                <span className="text-muted-foreground">Success Fee</span>
                <p className="font-mono font-semibold text-foreground">2.5% on Raised ICP</p>
              </div>

              <div className="rounded-xl border border-border/40 bg-muted/20 p-3 space-y-1">
                <span className="text-muted-foreground">Token Standard</span>
                <p className="font-mono font-semibold text-foreground">ICRC-1 / ICRC-2</p>
              </div>
            </div>

            {/* Token Ledger Box */}
            <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
              <span className="text-muted-foreground shrink-0 font-medium">Ledger:</span>
              <span className="font-mono text-muted-foreground truncate">{campaign.tokenLedger}</span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleCopyLedger}
                className="shrink-0"
              >
                {copied ? <Check className="size-3.5 text-foreground" /> : <Copy className="size-3.5 text-muted-foreground" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Sale Card */}
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-6 shadow-xl backdrop-blur-2xl">
            {isLive && (
              <ShineBorder
                borderWidth={1}
                duration={12}
                shineColor={["var(--primary)", "transparent"]}
                className="opacity-70"
              />
            )}

            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sale Progress
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuideOpen(true)}
                    className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="How Launchpad Works"
                    aria-label="How Launchpad Works"
                  >
                    <Info className="size-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="size-3.5 text-muted-foreground" />
                  <span>{campaign.participantCount} Buyers</span>
                </div>
              </div>

              {/* Progress and raised numbers */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono text-foreground">
                    {campaign.totalIcpRaised.toFixed(1)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">ICP</span>
                  </span>
                  <AnimatedShinyText shimmerWidth={70} className="mx-0 text-sm font-semibold text-primary">
                    {campaign.progressPercent.toFixed(1)}%
                  </AnimatedShinyText>
                </div>

                <Progress value={campaign.progressPercent} className="h-2.5 bg-muted/70" />

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Soft Cap: {campaign.minIcpTarget} ICP</span>
                  <span>Hard Cap: {campaign.maxIcpTarget} ICP</span>
                </div>
              </div>

              {/* Action Form */}
              {isLive ? (
                <div className="space-y-4 pt-2 border-t border-border/40">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground flex items-center justify-between">
                      <span>Commit ICP</span>
                      <span className="text-[11px] text-muted-foreground">
                        Limit: {campaign.minParticipantIcp} - {campaign.maxParticipantIcp} ICP
                      </span>
                    </label>

                    <div className="relative">
                      <Input
                        type="number"
                        min={campaign.minParticipantIcp}
                        max={campaign.maxParticipantIcp}
                        step="0.5"
                        value={commitAmount}
                        onChange={(e) => setCommitAmount(e.target.value)}
                        className="h-11 rounded-xl text-sm font-mono pr-14 bg-background"
                        placeholder="1.0"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                        ICP
                      </span>
                    </div>

                    {/* Quick amount chips */}
                    <div className="flex gap-2">
                      {["1", "5", "10", "20"].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCommitAmount(amt)}
                          className="flex-1 rounded-lg border border-border/60 bg-muted/30 py-1 text-xs font-mono text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          +{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Binance / KuCoin Style Token Allocation Breakdown */}
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Exchange Rate</span>
                      <span className="font-mono font-medium text-foreground">
                        1 ICP = {tokenRate.toLocaleString(undefined, { maximumFractionDigits: 2 })} {campaign.tokenSymbol}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Estimated Allocation</span>
                      <span className="font-mono font-bold text-foreground">
                        ~{estimatedTokens.toLocaleString(undefined, { maximumFractionDigits: 0 })} {campaign.tokenSymbol}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-1.5">
                      <span>Token Distribution</span>
                      <span className="text-foreground font-medium">Claim after sale ends</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCommit}
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl font-medium"
                  >
                    {isSubmitting ? "Processing..." : `Commit ${commitAmount || "0"} ICP`}
                  </Button>
                </div>
              ) : isCommitted ? (
                <div className="space-y-3 pt-3 border-t border-border/40">
                  <div className="rounded-xl bg-muted/60 p-3 text-xs text-foreground border border-border">
                    <p className="font-semibold">Goal Achieved!</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      This sale successfully hit its target. Tokens are ready to be claimed.
                    </p>
                  </div>

                  {commitment && !commitment.tokensClaimed ? (
                    <Button
                      onClick={handleClaimTokens}
                      disabled={isSubmitting}
                      className="w-full h-11 rounded-xl font-medium"
                    >
                      Claim {campaign.tokenSymbol} Tokens
                    </Button>
                  ) : commitment?.tokensClaimed ? (
                    <div className="rounded-xl border border-border bg-muted/60 p-2.5 text-center text-xs text-foreground font-medium">
                      Tokens Claimed ✓
                    </div>
                  ) : (
                    <p className="text-center text-xs text-muted-foreground">
                      Sale concluded.
                    </p>
                  )}
                </div>
              ) : isAborted ? (
                <div className="space-y-3 pt-3 border-t border-border/40">
                  <div className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground border border-border">
                    <p className="font-semibold text-foreground">Soft Cap Not Reached</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Sale did not meet the minimum target. 100% refund is available.
                    </p>
                  </div>

                  {commitment && !commitment.refundClaimed ? (
                    <Button
                      onClick={handleClaimRefund}
                      disabled={isSubmitting}
                      variant="outline"
                      className="w-full h-11 rounded-xl font-medium border-border"
                    >
                      Claim {commitment.amountIcp} ICP Refund
                    </Button>
                  ) : commitment?.refundClaimed ? (
                    <div className="rounded-xl border border-border bg-muted/60 p-2.5 text-center text-xs text-muted-foreground font-medium">
                      Refund Claimed ✓
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* User's active commitment info */}
              {commitment && commitment.amountIcp > 0 && (
                <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-foreground space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-muted-foreground">Your Commitment:</span>
                    <span className="font-mono text-primary font-semibold">
                      {commitment.amountIcp} ICP
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <LaunchpadGuideDialog open={guideOpen} onOpenChange={setGuideOpen} />
    </div>
  )
}
