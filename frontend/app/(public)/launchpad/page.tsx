"use client"

import * as React from "react"
import useSWR from "swr"
import { useTheme } from "next-themes"
import { Particles } from "@/components/ui/particles"
import { LaunchpadHeader } from "@/components/public/launchpad/launchpad-header"
import { LaunchpadList } from "@/components/public/launchpad/launchpad-list"
import { LaunchpadCreateModal } from "@/components/public/launchpad/launchpad-create-modal"
import { listLaunchpadCampaigns } from "@/services/launchpad/launchpad"

export default function LaunchpadPage() {
  const { resolvedTheme } = useTheme()
  const particleColor = resolvedTheme === "dark" ? "#ffffff" : "#000000"

  const { data: campaigns = [], mutate } = useSWR(
    "launchpad-campaigns",
    () => listLaunchpadCampaigns()
  )
  const [modalOpen, setModalOpen] = React.useState(false)

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <Particles
        className="pointer-events-none absolute inset-0 z-0"
        quantity={60}
        ease={80}
        color={particleColor}
        refresh
      />

      <div className="relative z-10 mx-auto max-w-6xl space-y-10 px-4 py-8 md:px-6 md:py-12">
        <LaunchpadHeader onStartSaleClick={() => setModalOpen(true)} />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Community Token Sales
              </h2>
              <p className="text-xs text-muted-foreground">
                Participate with ICP. Zero risk of rug-pulls with 100% smart contract escrow.
              </p>
            </div>
          </div>

          <LaunchpadList campaigns={campaigns} />
        </section>

        <LaunchpadCreateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSuccess={() => {
            void mutate()
          }}
        />
      </div>
    </div>
  )
}

