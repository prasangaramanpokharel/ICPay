"use client"

import { useRef } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CrownIcon,
  SparklesIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ShineBorder } from "@/components/ui/shine-border"
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { BadgeMark } from "@/components/verified/premium-badge"
import { cn } from "@/lib/ui/utils"

function PremiumBeamShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const crownRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-between overflow-hidden rounded-xl border border-border/60 bg-muted/40 px-4 py-3 shadow-inner"
    >
      <div
        ref={userRef}
        className="z-10 flex h-8 items-center justify-center rounded-lg border border-border/80 bg-card px-2.5 shadow-2xs"
      >
        <span className="font-mono text-xs font-semibold text-foreground">@handle</span>
      </div>

      <div
        ref={crownRef}
        className="z-10 flex size-9 items-center justify-center rounded-full border border-primary/40 bg-card text-primary shadow-xs"
      >
        <HugeiconsIcon icon={CrownIcon} className="size-4.5 text-primary" strokeWidth={2} />
      </div>

      <div
        ref={badgeRef}
        className="z-10 flex h-8 items-center gap-1.5 rounded-lg border border-border/80 bg-card px-2.5 shadow-2xs"
      >
        <BadgeMark tier="gold" className="size-3.5" />
        <BadgeMark tier="blue" className="size-3.5" />
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={userRef}
        toRef={crownRef}
        duration={3}
        gradientStartColor="#ec4899"
        gradientStopColor="#a855f7"
        pathColor="#3f3f46"
        pathOpacity={0.3}
        pathWidth={2}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={crownRef}
        toRef={badgeRef}
        duration={3}
        delay={1.2}
        gradientStartColor="#a855f7"
        gradientStopColor="#3b82f6"
        pathColor="#3f3f46"
        pathOpacity={0.3}
        pathWidth={2}
      />
    </div>
  )
}

export function PremiumLockedCard({
  title,
  description,
  actionText = "Get Premium Handle",
  href = "/username",
  className,
}: {
  title: string
  description: string
  badge?: string
  actionText?: string
  href?: string
  className?: string
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-border/80 bg-gradient-to-b from-card/90 via-card/60 to-card/30 p-6 text-center sm:p-8 shadow-sm",
        className
      )}
    >
      <ShineBorder
        className="rounded-[inherit]"
        borderWidth={1.2}
        duration={12}
        shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Crown Icon - Primary Only, No Background Box */}
        <HugeiconsIcon icon={CrownIcon} className="size-8 text-primary" strokeWidth={2} />

        <h3 className="mt-3.5 text-base font-semibold tracking-tight text-foreground sm:text-lg">
          {title}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {description}
        </p>

        {/* Animated Beam Showcase */}
        <div className="mt-5 w-full max-w-sm">
          <PremiumBeamShowcase />
        </div>

        {/* 3 Key Benefits with bold numbers */}
        <div className="mt-4 grid w-full max-w-sm grid-cols-1 gap-2 text-left text-xs">
          <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/40 px-3 py-2">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
              1
            </span>
            <span className="font-semibold text-foreground">Lifetime Badge</span>
            <span className="ml-auto text-[11px] text-muted-foreground">No subscriptions</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/40 px-3 py-2">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
              2
            </span>
            <span className="font-semibold text-foreground">More Trust Score</span>
            <span className="ml-auto text-[11px] text-muted-foreground">+20 to +30 pts</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/40 px-3 py-2">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
              3
            </span>
            <span className="font-semibold text-foreground">Full Feature Access</span>
            <span className="ml-auto text-[11px] text-muted-foreground">Channels & tools</span>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            nativeButton={false}
            render={<Link href={href} />}
            className="gap-2 font-medium shadow-sm"
          >
            <span>{actionText}</span>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

export function PremiumGateDialog({
  open,
  onOpenChange,
  title,
  description,
  featureName = "This feature",
  actionText = "Get Premium Handle",
  href = "/username",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  featureName?: string
  actionText?: string
  href?: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-4 p-5 sm:p-6" showCloseButton>
        <DialogHeader className="text-center sm:text-left">
          {/* Crown Icon - Primary Only, No Background Box, No Badge Below */}
          <div className="flex items-center justify-center sm:justify-start">
            <HugeiconsIcon icon={CrownIcon} className="size-7 text-primary" strokeWidth={2} />
          </div>

          <DialogTitle className="pt-2 text-lg font-semibold tracking-tight text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Animated Beam Showcase */}
        <PremiumBeamShowcase />

        {/* Benefits Box with ShineBorder */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-muted/30 p-4 shadow-sm">
          <ShineBorder
            className="rounded-2xl"
            borderWidth={1.2}
            duration={12}
            shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
          />

          <div className="relative z-10 space-y-3">
            {/* Header with verified tick chips */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <HugeiconsIcon icon={SparklesIcon} className="size-3.5 text-primary" />
                <span>Premium Membership Perks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[10px] font-medium text-foreground shadow-2xs">
                  <BadgeMark tier="gold" className="size-3" />
                  <span>1–2 chars</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[10px] font-medium text-foreground shadow-2xs">
                  <BadgeMark tier="blue" className="size-3" />
                  <span>3–4 chars</span>
                </span>
              </div>
            </div>

            {/* Formal Numbered Perks List - Clean bold number badges */}
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  1
                </span>
                <div>
                  <p className="font-semibold text-foreground">Lifetime Badge</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Permanent Gold (1–2 chars) or Blue (3–4 chars) verified tick. Never expires, zero subscription renewals.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  2
                </span>
                <div>
                  <p className="font-semibold text-foreground">More Trust Score</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Adds +20 to +30 trust points across payments, transfers, and your public profile to prevent impersonation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  3
                </span>
                <div>
                  <p className="font-semibold text-foreground">Full Access: {featureName}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Broadcast news & announcements, host paid channels, generate Bucket API keys, and advanced controls.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-1 flex flex-row items-center justify-end gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            nativeButton={false}
            render={<Link href={href} onClick={() => onOpenChange(false)} />}
            className="flex-1 gap-1.5 font-medium shadow-sm sm:flex-initial"
          >
            <span>{actionText}</span>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
