"use client"

import { Card } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import {
  ClockGlassIcon,
  GlobeGlassIcon,
  ShieldGlassIcon,
  CalendarClockGlassIcon,
  CpuGlassIcon,
  CircleCheckGlassIcon,
  SendGlassIcon,
} from "@thesvg/ui-react"

const HOW_STEPS = [
  {
    number: "1",
    title: "Create a job",
    description: "Set a cron expression and a target endpoint or canister method.",
    icon: CalendarClockGlassIcon,
  },
  {
    number: "2",
    title: "Wait",
    description: "A canister timer wakes at the scheduled due time.",
    icon: CpuGlassIcon,
  },
  {
    number: "3",
    title: "Call",
    description: "icCron sends an HTTPS outcall or an inter-canister call.",
    icon: SendGlassIcon,
  },
  {
    number: "4",
    title: "Review",
    description: "Inspect execution logs, retries, and dead letter queue status.",
    icon: CircleCheckGlassIcon,
  },
]

const FEATURE_CARDS = [
  {
    icon: ClockGlassIcon,
    title: "Canister timers",
    description:
      "Native Internet Computer system timers sleep at 0 cycle burn between jobs, waking up with 1-second consensus precision instead of continuous polling.",
  },
  {
    icon: GlobeGlassIcon,
    title: "HTTPS and canister calls",
    description:
      "Dispatch triggers to any public URL with threshold-signed HTTPS outcalls, or call update methods directly on any canister smart contract.",
  },
  {
    icon: ShieldGlassIcon,
    title: "Retries and dead letter queue",
    description:
      "Exponential backoff protects targets from cascading failures. Endpoints failing repeatedly are moved to a dead letter queue with full status logs.",
  },
]

export function WhatIsSection() {
  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            How icCron works
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            icCron runs your schedule in a canister on the Internet Computer and calls your endpoint when a job is due.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-border/80 bg-card p-6 shadow-sm md:p-8">
          <div className="relative my-4">
            <div className="hidden sm:block absolute top-8 left-[10%] right-[10%] h-0.5 border-t border-dashed border-border/80" />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
              {HOW_STEPS.map((item) => (
                <div key={item.number} className="relative flex flex-col items-start sm:items-center text-left sm:text-center space-y-2.5">
                  <div className="relative z-10 flex size-14 items-center justify-center rounded-2xl border border-border bg-card p-3 shadow-xs">
                    <Icon icon={item.icon} className="size-6 text-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-semibold text-muted-foreground">Step {item.number}</p>
                    <h3 className="text-sm font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground max-w-[220px]">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3 border-t border-border/60 pt-8">
            {FEATURE_CARDS.map((card, idx) => (
              <Card
                key={idx}
                className="flex flex-col justify-between rounded-xl border border-border/60 bg-muted/20 p-5 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Icon icon={card.icon} className="size-4" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    {card.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {card.description}
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
