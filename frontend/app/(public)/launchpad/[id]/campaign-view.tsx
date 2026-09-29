"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useTheme } from "next-themes"
import { Particles } from "@/components/ui/particles"
import { LaunchpadDetail } from "@/components/public/launchpad/launchpad-detail"
import { getLaunchpadCampaign } from "@/services/launchpad/launchpad"
import type { LaunchpadCampaign } from "@/services/launchpad/types"
import { Loader2 } from "lucide-react"

export function CampaignView() {
  const params = useParams()
  const id = typeof params?.id === "string" ? params.id : "1"
  const [campaign, setCampaign] = React.useState<LaunchpadCampaign | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  const { resolvedTheme } = useTheme()
  const particleColor = resolvedTheme === "dark" ? "#ffffff" : "#000000"

  React.useEffect(() => {
    let active = true
    async function fetchCampaign() {
      setLoading(true)
      const c = await getLaunchpadCampaign(id)
      if (active) {
        setCampaign(c)
        setLoading(false)
      }
    }
    fetchCampaign()
    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-2 text-center">
        <h2 className="text-xl font-bold">Campaign Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The requested launchpad campaign does not exist or has been removed.
        </p>
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <Particles
        className="pointer-events-none absolute inset-0 z-0"
        quantity={45}
        ease={80}
        color={particleColor}
        refresh
      />
      <div className="relative z-10">
        <LaunchpadDetail campaign={campaign} />
      </div>
    </div>
  )
}

