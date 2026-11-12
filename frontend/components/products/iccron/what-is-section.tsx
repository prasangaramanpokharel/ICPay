"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Clock01Icon,
  GlobalIcon,
  ZapIcon,
  ShieldIcon,
  Analytics02Icon,
} from "@hugeicons/core-free-icons"

const PILLARS = [
  {
    icon: Clock01Icon,
    title: "Canister Timers vs. Legacy Heartbeats",
    badge: "99.4% Cycle Efficiency",
    description:
      "Legacy ICP canisters executed heartbeat calls on every single consensus round (~1 second), wasting millions of cycles even when idle. icCron utilizes native IC Canister Timers with 64-bit nanosecond scheduling that sleep at 0 cycle burn until the exact scheduled second.",
  },
  {
    icon: GlobalIcon,
    title: "Dual-Dispatch: HTTPS Outcalls & Candid",
    badge: "Universal Reach",
    description:
      "Dispatch triggers anywhere. Make secure HTTPS outcalls signed by subnet consensus to trigger Vercel API routes, Supabase webhooks, AWS Lambdas, or call smart contract update methods directly across any ICP canister.",
  },
  {
    icon: ZapIcon,
    title: "O(1) Bitmask Cron Engine",
    badge: "Microsecond Matching",
    description:
      "Standard 5-field cron expressions are compiled into in-memory bitmask records (minutes: u64, hours: u32, days: u32, months: u16, weekdays: u8). The scheduler evaluates upcoming ticks in O(1) bitwise operations with zero regex parsing overhead.",
  },
  {
    icon: ShieldIcon,
    title: "Automated Retries & Dead Letter Queue",
    badge: "Fault-Tolerant",
    description:
      "Configurable exponential backoff retries safeguard against transient downstream outages. Endpoints failing repeatedly are moved to a Dead Letter Queue (DLQ) with detailed latency, status codes, and error snippets to prevent cycle exhaustion.",
  },
]

export function WhatIsSection() {
  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            Engineering Foundations
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            What is icCron?
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            The decentralized, autonomous time machine for Web2 and Web3 workloads running natively on the Internet Computer.
          </p>
        </div>

        <div className="mt-12 rounded-3xl border border-border/80 bg-card/60 p-6 shadow-sm md:p-8">
          <div className="mb-8 flex flex-col items-center justify-between gap-4 border-b border-border/50 pb-6 sm:flex-row">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Execution Lifecycle
              </p>
              <h3 className="text-xl font-bold text-foreground">
                How icCron Dispatches Without Servers
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 border-primary/20 bg-primary/5 text-xs text-primary">
                <HugeiconsIcon icon={Analytics02Icon} className="size-3.5" />
                Deterministic Consensus
              </Badge>
            </div>
          </div>

          <div className="relative mx-auto my-4 flex justify-center overflow-hidden rounded-2xl bg-secondary/30 p-4">
            <Image
              src="/images/pages/iccron/cron-flow.svg"
              alt="icCron 4-step execution flow"
              width={900}
              height={140}
              className="h-auto w-full max-w-3xl object-contain dark:invert-0"
            />
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((pillar, idx) => (
              <Card
                key={idx}
                className="flex flex-col justify-between rounded-2xl border border-border/60 bg-background/60 p-5 shadow-xs transition-colors hover:border-primary/40"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <HugeiconsIcon icon={pillar.icon} className="size-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-primary">
                      {pillar.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground leading-tight">
                    {pillar.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {pillar.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
