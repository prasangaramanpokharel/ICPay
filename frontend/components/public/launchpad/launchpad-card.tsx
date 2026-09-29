"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { GradientBadge } from "@/components/ui/gradient-badge"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"
import { Progress } from "@/components/ui/progress"
import { ShineBorder } from "@/components/ui/shine-border"
import { Users, Clock, ShieldCheck, ArrowUpRight } from "lucide-react"
import type { LaunchpadCampaign } from "@/services/launchpad/types"

interface LaunchpadCardProps {
  campaign: LaunchpadCampaign
}

export function LaunchpadCard({ campaign }: LaunchpadCardProps) {
  const [timeLeft, setTimeLeft] = React.useState<string>("")

  React.useEffect(() => {
    function calculateTime() {
      const now = Date.now()
      if (now >= campaign.endTimestamp) {
        setTimeLeft("Ended")
        return
      }
      const diff = campaign.endTimestamp - now
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`)
      } else {
        setTimeLeft(`${hours}h ${mins}m left`)
      }
    }

    calculateTime()
    const timer = setInterval(calculateTime, 60000)
    return () => clearInterval(timer)
  }, [campaign.endTimestamp])

  const isLive = campaign.status === "Open"
  const isCommitted = campaign.status === "Committed" || campaign.status === "Finalized"
  const isAborted = campaign.status === "Aborted"

  return (
    <Link
      href={`/launchpad/${campaign.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-xl hover:shadow-primary/5"
    >
      {/* Premium animated Shine Border */}
      {isLive && (
        <ShineBorder
          borderWidth={1}
          duration={12}
          shineColor={["var(--primary)", "transparent"]}
          className="opacity-60 group-hover:opacity-100 transition-opacity"
        />
      )}

      {/* Top Header: Logo, Name, Symbol, and Status Badge */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-muted/80 border border-border text-xs font-semibold tracking-wider text-foreground">
            {campaign.tokenSymbol.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm tracking-tight text-foreground transition-colors group-hover:text-primary">
                {campaign.tokenName}
              </h3>
              <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
            </div>
            <p className="text-xs font-mono uppercase text-muted-foreground">
              ${campaign.tokenSymbol}
            </p>
          </div>
        </div>

        <div>
          {isLive && (
            <GradientBadge size="sm">
              <span className="px-1 tracking-wider">LIVE SALE</span>
            </GradientBadge>
          )}
          {isCommitted && (
            <Badge variant="outline" className="border-border bg-muted/60 text-foreground font-medium text-[11px] px-2.5 py-0.5 gap-1">
              <ShieldCheck className="size-3 text-muted-foreground" />
              Goal Met
            </Badge>
          )}
          {isAborted && (
            <Badge variant="outline" className="border-border bg-muted/40 text-muted-foreground font-medium text-[11px] px-2.5 py-0.5">
              Refunds Open
            </Badge>
          )}
        </div>
      </div>

      {/* Description Snippet */}
      <p className="relative z-10 mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {campaign.description}
      </p>

      {/* Progress & Target Stats */}
      <div className="relative z-10 mt-4 space-y-2 rounded-xl bg-muted/30 p-3.5 border border-border/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Raised</span>
          <span className="font-mono font-semibold text-foreground">
            {campaign.totalIcpRaised.toFixed(1)}{" "}
            <span className="text-muted-foreground font-normal">
              / {campaign.maxIcpTarget} ICP
            </span>
          </span>
        </div>

        <Progress
          value={campaign.progressPercent}
          className="h-2 bg-muted/70"
        />

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Soft: {campaign.minIcpTarget} ICP</span>
          <AnimatedShinyText shimmerWidth={70} className="mx-0 font-semibold text-primary">
            {campaign.progressPercent.toFixed(1)}%
          </AnimatedShinyText>
          <span>Hard: {campaign.maxIcpTarget} ICP</span>
        </div>
      </div>

      {/* Card Footer: Participants & Countdown */}
      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Users className="size-3.5 text-muted-foreground" />
          <span>{campaign.participantCount} Participants</span>
        </div>

        <div className="flex items-center gap-1.5 font-medium">
          <Clock className="size-3.5 text-muted-foreground" />
          <span>{timeLeft}</span>
        </div>
      </div>
    </Link>
  )
}
