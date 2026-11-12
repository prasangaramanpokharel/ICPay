"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Layers01Icon,
  CpuIcon,
  GlobalIcon,
  ShieldIcon,
  DatabaseIcon,
} from "@hugeicons/core-free-icons"

const SPECS = [
  {
    icon: CpuIcon,
    title: "Rust Canister Core",
    subtitle: "uzt4z-lp777-77774-qaabq-cai",
    description:
      "Engineered in memory-safe Rust with ic-stable-structures. State persists safely across canister Wasm upgrades without serialization loss.",
  },
  {
    icon: Layers01Icon,
    title: "Nanosecond Timer Loop",
    subtitle: "Zero Heartbeat Idle Burn",
    description:
      "Direct integration with Internet Computer system timers. Sleeps at zero cycles between jobs, waking up with 1-second consensus precision.",
  },
  {
    icon: GlobalIcon,
    title: "Subnet HTTPS Dispatch",
    subtitle: "Threshold-Signed Calls",
    description:
      "Outbound HTTP calls to Web2 endpoints are verified and threshold-signed by independent node providers, ensuring verifiable webhook delivery.",
  },
  {
    icon: ShieldIcon,
    title: "DLQ & Circuit Breaker",
    subtitle: "Auto-Pause on Dormancy",
    description:
      "Protects developer cycle balances by detecting broken endpoints, auto-pausing after consecutive failures, and recording status codes.",
  },
]

export function ArchitectureSection() {
  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            System Architecture
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Decentralized Architecture Under the Hood
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            How icCron bridges on-chain Motoko/Rust canisters and off-chain Web2 APIs through cryptographic subnet consensus.
          </p>
        </div>

        <div className="mt-12 rounded-3xl border border-border/80 bg-card/70 p-6 shadow-xl md:p-8">
          <div className="relative mx-auto flex justify-center overflow-hidden rounded-2xl bg-secondary/30 p-4">
            <Image
              src="/images/pages/iccron/architecture-diagram.svg"
              alt="icCron system architecture diagram"
              width={1000}
              height={450}
              className="h-auto w-full max-w-4xl object-contain dark:invert-0"
            />
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SPECS.map((spec, idx) => (
              <Card
                key={idx}
                className="rounded-2xl border border-border/60 bg-background/60 p-5 shadow-xs transition-colors hover:border-primary/40"
              >
                <div className="space-y-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <HugeiconsIcon icon={spec.icon} className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{spec.title}</h3>
                    <p className="font-mono text-[11px] text-primary">{spec.subtitle}</p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {spec.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/60 bg-secondary/30 p-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <HugeiconsIcon icon={DatabaseIcon} className="size-5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Canister ID: <span className="font-mono text-primary">uzt4z-lp777-77774-qaabq-cai</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Subnet: App Subnet · Replicated across 13 independent node machines
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-xs font-mono text-primary">
              Mainnet Verified
            </Badge>
          </div>
        </div>
      </div>
    </section>
  )
}
