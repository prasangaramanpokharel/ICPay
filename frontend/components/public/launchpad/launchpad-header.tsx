"use client"

import * as React from "react"
import { Rocket, ShieldCheck, Coins, RefreshCw, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientBadge } from "@/components/ui/gradient-badge"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"
import { LaunchpadGuideDialog } from "./launchpad-guide-dialog"

interface LaunchpadHeaderProps {
  onStartSaleClick: () => void
}

export function LaunchpadHeader({ onStartSaleClick }: LaunchpadHeaderProps) {
  const [guideOpen, setGuideOpen] = React.useState(false)

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-card/90 via-card/50 to-background p-6 md:p-10 shadow-lg backdrop-blur-2xl">
      {/* Background glow decoration */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 shadow-xs backdrop-blur-md">
            <GradientBadge size="sm">DECENTRALIZED</GradientBadge>
            <AnimatedShinyText shimmerWidth={130} className="text-xs font-medium text-foreground">
              Smart Contract Liquidity Engine
            </AnimatedShinyText>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            ICPay <span className="text-primary">Launchpad</span>
          </h1>

          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Discover and participate in early-stage ICP ecosystem tokens. Built with
            decentralized smart contract escrow — if a sale does not reach its Soft Cap,
            100% of your ICP is instantly refundable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setGuideOpen(true)}
            className="gap-2 font-medium"
          >
            <Info className="size-4" />
            How it Works
          </Button>
          <Button
            size="lg"
            onClick={onStartSaleClick}
            className="gap-2 font-medium"
          >
            <Rocket className="size-4" />
            Launch Token Sale
          </Button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/60 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/60 border border-border text-foreground">
            <ShieldCheck className="size-5 text-foreground" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">100% Escrow Protection</p>
            <p className="text-[11px] text-muted-foreground">Zero rug-pulls. Tokens locked upfront.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/60 border border-border text-foreground">
            <RefreshCw className="size-5 text-foreground" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Guaranteed Full Refund</p>
            <p className="text-[11px] text-muted-foreground">100% ICP return if Soft Cap is missed.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/60 border border-border text-foreground">
            <Coins className="size-5 text-foreground" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Fair Community Terms</p>
            <p className="text-[11px] text-muted-foreground">1.99 ICP launch fee, 2.5% success fee.</p>
          </div>
        </div>
      </div>

      <LaunchpadGuideDialog open={guideOpen} onOpenChange={setGuideOpen} />
    </div>
  )
}
