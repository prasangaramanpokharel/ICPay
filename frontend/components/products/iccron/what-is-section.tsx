"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import {
  ClockGlassIcon,
  GlobeGlassIcon,
  ZapGlassIcon,
  ShieldGlassIcon,
  ChartLineGlassIcon,
  CalendarClockGlassIcon,
  CpuGlassIcon,
  CircleCheckGlassIcon,
} from "@thesvg/ui-react"

const FLOW_STEPS = [
  {
    step: "01",
    title: "Define Schedule",
    subtitle: "Cron / Webhook",
    icon: CalendarClockGlassIcon,
    ringColor: "border-primary/50 text-primary shadow-primary/10",
  },
  {
    step: "02",
    title: "Compile Bitmask",
    subtitle: "O(1) Time Math",
    icon: ZapGlassIcon,
    ringColor: "border-accent text-foreground shadow-accent/10",
  },
  {
    step: "03",
    title: "Autonomous Tick",
    subtitle: "Zero Server Bots",
    icon: CpuGlassIcon,
    ringColor: "border-primary/50 text-primary shadow-primary/10",
  },
  {
    step: "04",
    title: "Execute & Log",
    subtitle: "Auto-Retry & DLQ",
    icon: CircleCheckGlassIcon,
    ringColor: "border-success/50 text-success shadow-success/10",
  },
]

const PILLARS = [
  {
    icon: ClockGlassIcon,
    title: "Canister Timers vs. Legacy Heartbeats",
    badge: "99.4% Cycle Efficiency",
    description:
      "Legacy ICP canisters executed heartbeat calls on every single consensus round (~1 second), wasting millions of cycles even when idle. icCron utilizes native IC Canister Timers with 64-bit nanosecond scheduling that sleep at 0 cycle burn until the exact scheduled second.",
  },
  {
    icon: GlobeGlassIcon,
    title: "Dual-Dispatch: HTTPS Outcalls & Candid",
    badge: "Universal Reach",
    description:
      "Dispatch triggers anywhere. Make secure HTTPS outcalls signed by subnet consensus to trigger Vercel API routes, Supabase webhooks, AWS Lambdas, or call smart contract update methods directly across any ICP canister.",
  },
  {
    icon: ZapGlassIcon,
    title: "O(1) Bitmask Cron Engine",
    badge: "Microsecond Matching",
    description:
      "Standard 5-field cron expressions are compiled into in-memory bitmask records (minutes: u64, hours: u32, days: u32, months: u16, weekdays: u8). The scheduler evaluates upcoming ticks in O(1) bitwise operations with zero regex parsing overhead.",
  },
  {
    icon: ShieldGlassIcon,
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

        <div className="mt-12 rounded-3xl border border-border/80 bg-card p-6 shadow-sm md:p-8">
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
                <Icon icon={ChartLineGlassIcon} className="size-3.5" />
                Deterministic Consensus
              </Badge>
            </div>
          </div>

          <div className="relative my-6 overflow-hidden rounded-2xl border border-border/60 bg-muted/30 p-6 md:p-8">
            <div className="relative mx-auto max-w-4xl">
              <div className="hidden sm:block absolute top-8 left-16 right-16 -z-0 h-0.5 border-t-2 border-dashed border-border" />
              <div className="hidden sm:block absolute top-8 left-16 right-16 -z-0 h-0.5 bg-gradient-to-r from-primary via-accent to-success opacity-40" />

              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4">
                {FLOW_STEPS.map((item) => (
                  <div key={item.step} className="flex flex-col items-center text-center space-y-3">
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`relative z-10 flex size-16 items-center justify-center rounded-full border-2 bg-card p-3 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-105 ${item.ringColor}`}
                      >
                        <Icon icon={item.icon} className="size-7" />
                      </div>
                      <span className="mt-2 inline-flex items-center rounded-full border border-border/70 bg-background px-2 py-0.5 font-mono text-[10px] font-bold text-primary shadow-2xs">
                        {item.step}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                        {item.title}
                      </h4>
                      <p className="font-mono text-[10px] sm:text-[11px] text-muted-foreground">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                      <Icon icon={pillar.icon} className="size-4" />
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
