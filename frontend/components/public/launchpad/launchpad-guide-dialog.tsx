"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Coins01Icon,
  ShieldIcon,
  ShoppingBag01Icon,
  ArrowDataTransferHorizontalIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { GradientBadge } from "@/components/ui/gradient-badge"

interface LaunchpadGuideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STEPS = [
  {
    step: "01",
    title: "Subscription & Escrow Commit",
    desc: "Browse live token sales and commit ICP. Your ICP does NOT go to the project creator; it is held in a decentralized, tamper-proof smart contract escrow.",
    badge: "Smart Escrow",
    icon: ShoppingBag01Icon,
  },
  {
    step: "02",
    title: "Soft Cap & Hard Cap Verification",
    desc: "Every project must reach its minimum Soft Cap before the countdown expires. If the Soft Cap is missed, 100% of your ICP is unlocked for an instant full refund.",
    badge: "Refund Guarantee",
    icon: ShieldIcon,
  },
  {
    step: "03",
    title: "Sale Finalization & Claiming",
    desc: "Once the sale successfully ends, you click 'Claim Tokens' to receive your purchased tokens directly in your ICPay wallet balance at the ground-floor launch rate.",
    badge: "Instant Delivery",
    icon: Coins01Icon,
  },
  {
    step: "04",
    title: "Automated DEX Liquidity",
    desc: "A guaranteed percentage (e.g. 30%) of raised ICP is automatically paired with tokens and locked in DEX liquidity pools (like ICPSwap) for immediate public trading.",
    badge: "Fair Trading",
    icon: ArrowDataTransferHorizontalIcon,
  },
] as const

export function LaunchpadGuideDialog({ open, onOpenChange }: LaunchpadGuideDialogProps) {
  const [activeStep, setActiveStep] = React.useState<number>(0)

  const current = STEPS[activeStep]
  const isFirst = activeStep === 0
  const isLast = activeStep === STEPS.length - 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg border-border/80 bg-card">
        {/* Header Banner */}
        <div className="relative border-b border-border/60 bg-muted/30 px-6 py-6">
          <div className="flex items-center gap-2 mb-2">
            <GradientBadge size="sm">HOW IT WORKS</GradientBadge>
            <span className="text-xs font-medium text-muted-foreground">
              Binance & KuCoin Inspired Escrow
            </span>
          </div>
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              ICPay Launchpad Guide
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
              Participate in early-stage ICP ecosystem projects with 100% smart contract escrow protection and zero rug-pull risk.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Step Content */}
        <div className="space-y-5 px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
              <HugeiconsIcon icon={current.icon} className="size-6" strokeWidth={1.75} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-primary">
                  Step {current.step}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {current.badge}
                </span>
              </div>
              <h3 className="text-base font-semibold text-foreground">{current.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{current.desc}</p>
            </div>
          </div>

          {/* Stepper Dots Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {STEPS.map((s, idx) => (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeStep ? "w-8 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground/40"
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
          <div className="flex w-full gap-3">
            <Button
              variant="outline"
              className="flex-1 text-xs"
              disabled={isFirst}
              onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
            >
              Previous
            </Button>
            {isLast ? (
              <Button className="flex-1 text-xs" onClick={() => onOpenChange(false)}>
                Got It
              </Button>
            ) : (
              <Button className="flex-1 text-xs" onClick={() => setActiveStep((s) => s + 1)}>
                Next Step
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
