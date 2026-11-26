"use client"

import { Card } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import {
  ClockGlassIcon,
  GlobeGlassIcon,
  ChartLineGlassIcon,
  CheckGlassOutlineIcon,
} from "@thesvg/ui-react"

const RELIABILITY_CARDS = [
  {
    title: "Timing",
    badge: "1-second precision",
    icon: ClockGlassIcon,
    description:
      "Native Internet Computer canister timers wake up with deterministic 1-second consensus precision, eliminating server clock drift and cron jitter.",
  },
  {
    title: "Replication",
    badge: "13 subnet nodes",
    icon: GlobeGlassIcon,
    description:
      "State is replicated across the 13 independent node machines of the application subnet, providing Byzantine fault tolerance without single points of failure.",
  },
  {
    title: "Observability",
    badge: "Execution history",
    icon: ChartLineGlassIcon,
    description:
      "Inspect execution latencies, HTTP status codes, Candid return payloads, and complete retry records for every job in real time.",
  },
]

const SPECS = [
  "Byzantine fault tolerance across 13 subnet nodes",
  "Zero keeper bots or off-chain daemons to maintain",
  "Automated retries with configurable exponential backoff",
  "Dead letter queue with full error payload capture",
]

export function GalleryShowcase() {
  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Reliability
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            How icCron runs and what you can inspect.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-border/80 bg-card p-6 shadow-sm md:p-8">
          <div className="grid gap-6 md:grid-cols-3">
            {RELIABILITY_CARDS.map((item, idx) => (
              <Card
                key={idx}
                className="flex flex-col justify-between rounded-xl border border-border/60 bg-muted/20 p-5 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground">
                      <Icon icon={item.icon} className="size-4" />
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {item.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-border/60 bg-muted/30 p-6">
            <h3 className="text-sm font-bold text-foreground">
              Fault tolerance and state guarantees
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Every job schedule and execution log is committed directly to on-chain stable memory on the Internet Computer.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
              {SPECS.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-foreground">
                  <Icon icon={CheckGlassOutlineIcon} className="size-4 text-primary shrink-0" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
