"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { LayersGlassIcon, CpuGlassIcon, GlobeGlassIcon, ShieldGlassIcon, DatabaseGlassIcon } from "@thesvg/ui-react"

const SPECS = [
  {
    icon: CpuGlassIcon,
    title: "Rust canister core",
    subtitle: "State in stable memory",
    description:
      "Engineered in memory-safe Rust with ic-stable-structures. Job schedules, logs, and account balances persist across canister upgrades without data loss.",
  },
  {
    icon: LayersGlassIcon,
    title: "Canister timers",
    subtitle: "1-second ticks",
    description:
      "Native Internet Computer canister timers sleep at 0 cycles between jobs and wake up with 1-second consensus precision.",
  },
  {
    icon: GlobeGlassIcon,
    title: "HTTPS outcalls",
    subtitle: "Threshold-signed calls",
    description:
      "Outbound HTTP requests to external endpoints are cryptographically threshold-signed by independent subnet node providers.",
  },
  {
    icon: ShieldGlassIcon,
    title: "Retries and DLQ",
    subtitle: "Circuit breaker",
    description:
      "Configurable exponential backoff protects downstream targets. Persistent failures transition jobs to a dead letter queue.",
  },
]

export function ArchitectureSection() {
  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Architecture
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            How a job moves from a schedule to a target.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-border/80 bg-card p-6 shadow-sm md:p-8">
          <div className="relative mx-auto flex justify-center overflow-hidden rounded-xl bg-muted/40 p-4">
            <Image
              src="/images/pages/iccron/architecture-diagram.svg"
              alt="icCron system architecture diagram"
              width={940}
              height={480}
              className="h-auto w-full max-w-4xl object-contain dark:invert-0"
            />
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SPECS.map((spec, idx) => (
              <Card
                key={idx}
                className="rounded-xl border border-border/60 bg-background/60 p-5 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Icon icon={spec.icon} className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{spec.title}</h3>
                    <p className="font-mono text-[11px] text-muted-foreground">{spec.subtitle}</p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {spec.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 p-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <Icon icon={DatabaseGlassIcon} className="size-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Canister ID: <span className="font-mono text-foreground">w2fxo-5qaaa-aaaan-q6zxq-cai</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Application subnet · State replicated across 13 independent node machines
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Mainnet verified
            </Badge>
          </div>
        </div>
      </div>
    </section>
  )
}
