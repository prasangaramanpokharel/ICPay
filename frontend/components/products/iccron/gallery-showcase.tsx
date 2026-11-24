"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import {
  ClockGlassIcon,
  GlobeGlassIcon,
  ChartLineGlassIcon,
  CpuGlassIcon,
  ZapGlassIcon,
  ShieldGlassIcon,
  CheckGlassOutlineIcon,
} from "@thesvg/ui-react"

const HIGHLIGHTS = [
  {
    image: "/images/pages/iccron/precision-timer.jpg",
    title: "Nanosecond Canister Precision",
    badge: "Sub-Second",
    icon: ClockGlassIcon,
    description:
      "Native IC 64-bit nanosecond canister timers wake up at the scheduled microsecond without server clock drift or cron jitter.",
    span: "col-span-12 md:col-span-6 lg:col-span-6",
  },
  {
    image: "/images/pages/iccron/global-nodes.jpg",
    title: "Decentralized Subnet Consensus",
    badge: "Consensus-Backed",
    icon: GlobeGlassIcon,
    description:
      "Replicated state machine running across dozens of sovereign data centers with automatic Byzantine fault tolerance.",
    span: "col-span-12 md:col-span-6 lg:col-span-6",
  },
  {
    image: "/images/pages/iccron/execution-metrics.jpg",
    title: "Live Observability & Latency",
    badge: "Audit Trails",
    icon: ChartLineGlassIcon,
    description:
      "Instant inspection of execution latencies, HTTP response codes, Candid return payloads, and complete retry history.",
    span: "col-span-12 md:col-span-4",
  },
  {
    image: "/images/pages/iccron/autonomous-dispatch.jpg",
    title: "Autonomous Webhook Engine",
    badge: "Zero Servers",
    icon: CpuGlassIcon,
    description:
      "Trigger Next.js endpoints, Supabase edge functions, AWS Lambdas, or smart contracts without maintaining server fleets.",
    span: "col-span-12 md:col-span-4",
  },
  {
    image: "/images/pages/iccron/instant-webhooks.jpg",
    title: "Threshold-Signed Outcalls",
    badge: "Cryptographic",
    icon: ZapGlassIcon,
    description:
      "Outbound HTTP requests signed with subnet threshold keys, ensuring trustless execution and verifiable delivery.",
    span: "col-span-12 md:col-span-4",
  },
]

export function GalleryShowcase() {
  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            Autonomous Infrastructure
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Built for High-Frequency Reliability
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Inspect the high-performance visual mechanics powering decentralized cron jobs, scheduled payouts, and background automation.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-12 gap-6">
          {HIGHLIGHTS.map((item, idx) => (
            <Card
              key={idx}
              className={`group flex flex-col justify-between overflow-hidden rounded-3xl border border-border/70 bg-card p-4 shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-md ${item.span}`}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border/40 bg-muted">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-background/85 backdrop-blur-md text-primary shadow-xs">
                    <Icon icon={item.icon} className="size-3.5" />
                  </div>
                  <Badge variant="secondary" className="bg-background/85 backdrop-blur-md text-[11px] font-semibold">
                    {item.badge}
                  </Badge>
                </div>
              </div>

              <div className="p-3 pt-4 space-y-1.5">
                <h3 className="text-base font-bold text-foreground tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </Card>
          ))}

          <Card className="col-span-12 overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-xs md:p-8">
            <div className="grid gap-8 md:grid-cols-12 md:items-center">
              <div className="space-y-4 md:col-span-6 lg:col-span-7">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon icon={ShieldGlassIcon} className="size-4" />
                  </div>
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    High Availability
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Zero Single Point of Failure
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Unstoppable decentralized infrastructure immune to single cloud outages, regional blackouts, or DNS hijacking. Every task is confirmed by independent node providers on the Internet Computer.
                </p>
                <div className="grid gap-2.5 pt-2 sm:grid-cols-2 text-xs">
                  <div className="flex items-center gap-2 text-foreground">
                    <Icon icon={CheckGlassOutlineIcon} className="size-4 text-primary shrink-0" />
                    <span>Byzantine Fault Tolerance</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Icon icon={CheckGlassOutlineIcon} className="size-4 text-primary shrink-0" />
                    <span>State Replicated Across Subnet</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Icon icon={CheckGlassOutlineIcon} className="size-4 text-primary shrink-0" />
                    <span>Autonomous Self-Healing Queue</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Icon icon={CheckGlassOutlineIcon} className="size-4 text-primary shrink-0" />
                    <span>99.99% Execution Delivery</span>
                  </div>
                </div>
              </div>

              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-sm md:col-span-6 lg:col-span-5">
                <Image
                  src="/images/pages/iccron/decentralized-cloud.jpg"
                  alt="Zero Single Point of Failure Architecture"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
