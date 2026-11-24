"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { ClockGlassIcon, GlobeGlassIcon, ChartLineGlassIcon, CpuGlassIcon, ZapGlassIcon, ShieldGlassIcon } from "@thesvg/ui-react"

const GALLERY_ITEMS = [
  {
    image: "/images/pages/iccron/precision-timer.jpg",
    title: "Nanosecond Canister Precision",
    badge: "Sub-Second",
    icon: ClockGlassIcon,
    description:
      "Native IC 64-bit nanosecond canister timers wake up at the exact scheduled microsecond without server clock drift or cron jitter.",
    span: "col-span-12 lg:col-span-7",
  },
  {
    image: "/images/pages/iccron/global-nodes.jpg",
    title: "Decentralized Subnet Consensus",
    badge: "Consensus-Backed",
    icon: GlobeGlassIcon,
    description:
      "Replicated state machine running across dozens of sovereign data centers with automatic Byzantine fault tolerance.",
    span: "col-span-12 lg:col-span-5",
  },
  {
    image: "/images/pages/iccron/execution-metrics.jpg",
    title: "Live Observability & Latency",
    badge: "Audit Trails",
    icon: ChartLineGlassIcon,
    description:
      "Instant inspection of execution latencies, HTTP response codes, Candid return payloads, and retry history.",
    span: "col-span-12 lg:col-span-4",
  },
  {
    image: "/images/pages/iccron/autonomous-dispatch.jpg",
    title: "Autonomous Webhook Engine",
    badge: "Zero Servers",
    icon: CpuGlassIcon,
    description:
      "Trigger Next.js endpoints, Supabase edge functions, AWS Lambdas, or smart contracts without maintaining any server fleet.",
    span: "col-span-12 lg:col-span-4",
  },
  {
    image: "/images/pages/iccron/instant-webhooks.jpg",
    title: "Threshold-Signed HTTPS Outcalls",
    badge: "Cryptographic",
    icon: ZapGlassIcon,
    description:
      "Outbound HTTP requests signed with subnet threshold keys, ensuring trustless execution and verified delivery.",
    span: "col-span-12 lg:col-span-4",
  },
  {
    image: "/images/pages/iccron/decentralized-cloud.jpg",
    title: "Zero Single Point of Failure",
    badge: "High Availability",
    icon: ShieldGlassIcon,
    description:
      "Unstoppable decentralized infrastructure immune to single cloud outages, region blackouts, or DNS hijacking.",
    span: "col-span-12",
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
          {GALLERY_ITEMS.map((item, idx) => (
            <Card
              key={idx}
              className={`group relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-xl ${item.span}`}
            >
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-background/80 backdrop-blur-md text-primary shadow-xs">
                    <Icon icon={item.icon} className="size-4" />
                  </div>
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-md text-xs font-semibold">
                    {item.badge}
                  </Badge>
                </div>
              </div>

              <div className="relative -mt-16 p-6 space-y-2">
                <h3 className="text-lg font-bold text-foreground tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground max-w-xl">
                  {item.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
