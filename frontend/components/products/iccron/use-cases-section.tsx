"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Coins01Icon,
  CloudIcon,
  CodeIcon,
  ShoppingBag01Icon,
  ShieldIcon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
} from "@hugeicons/core-free-icons"

const RECIPES = [
  {
    id: "defi",
    title: "DeFi Yield Compounding",
    icon: Coins01Icon,
    image: "/images/pages/iccron/defi-finance.jpg",
    schedule: "0 0 * * *",
    scheduleLabel: "Daily at 00:00 UTC",
    targetType: "Candid Canister Call",
    endpoint: "swap_pool.harvest_and_distribute()",
    description:
      "Automate liquidity pool reward collection and yield reinvestment without running an off-chain Python keeper bot or exposing a private key on a centralized cloud server.",
    metrics: [
      { label: "Execution Cost", value: "$0.0005/day" },
      { label: "Key Security", value: "100% On-Chain" },
      { label: "Failover", value: "Automatic Subnet Retry" },
    ],
    samplePayload: `{\n  "action": "harvest_and_reinvest",\n  "pool_id": "icp_ckbtc_lp",\n  "min_return": 100000\n}`,
  },
  {
    id: "backup",
    title: "Database Backup to icBucket",
    icon: CloudIcon,
    image: "/images/pages/iccron/cloud-network.jpg",
    schedule: "0 2 * * *",
    scheduleLabel: "Every night at 02:00 UTC",
    targetType: "HTTPS Webhook",
    endpoint: "POST https://api.my-app.com/v1/jobs/db-dump",
    description:
      "Trigger an automated PostgreSQL or MongoDB snapshot, encrypt it with AES-256, and stream it directly to decentralized icBucket S3 on-chain storage.",
    metrics: [
      { label: "Cadence", value: "Nightly 2 AM" },
      { label: "Storage Target", value: "icBucket S3" },
      { label: "Egress Fees", value: "$0.00 Forever" },
    ],
    samplePayload: `{\n  "target": "icbucket://backups/prod-db.sql.gz",\n  "retention_days": 30\n}`,
  },
  {
    id: "vercel",
    title: "Bypassing Vercel's Cron Tax",
    icon: CodeIcon,
    image: "/images/pages/iccron/developer-code.jpg",
    schedule: "0 * * * *",
    scheduleLabel: "Hourly at minute 0",
    targetType: "HTTPS Webhook",
    endpoint: "POST https://my-app.vercel.app/api/cron/sync",
    description:
      "Vercel Free restricts cron jobs to once per 24 hours. icCron triggers your Next.js route handlers every hour (or every 5 minutes) for just pennies per year.",
    metrics: [
      { label: "Vercel Pro Cost", value: "$240.00/yr" },
      { label: "icCron Cost", value: "$4.32/yr" },
      { label: "Net Savings", value: "98.2% Saved" },
    ],
    samplePayload: `{\n  "job": "sync_inventory",\n  "source": "shopify_webhook",\n  "batch_size": 250\n}`,
  },
  {
    id: "commerce",
    title: "Abandoned Cart Reminders",
    icon: ShoppingBag01Icon,
    image: "/images/pages/iccron/workflow-automation.jpg",
    schedule: "*/30 * * * *",
    scheduleLabel: "Every 30 minutes",
    targetType: "HTTPS Webhook",
    endpoint: "POST https://store.com/api/webhooks/abandoned",
    description:
      "Regularly query checkout sessions idle for more than 1 hour and dispatch personalized email discount drip notifications via Resend or SendGrid.",
    metrics: [
      { label: "Trigger Interval", value: "Every 30 Min" },
      { label: "Recovery Rate", value: "+14.8% Sales" },
      { label: "DLQ Protection", value: "Auto-Circuit Breaker" },
    ],
    samplePayload: `{\n  "idle_threshold_minutes": 60,\n  "coupon_code": "SAVE10",\n  "max_notifications": 100\n}`,
  },
  {
    id: "sentinel",
    title: "Canister Cycle Top-Up Sentinel",
    icon: ShieldIcon,
    image: "/images/pages/iccron/security-shield.jpg",
    schedule: "0 */6 * * *",
    scheduleLabel: "Every 6 hours",
    targetType: "Candid Canister Call",
    endpoint: "sentinel.check_runway_and_mint()",
    description:
      "Monitor cycles balance across your entire canister fleet. When any canister drops below the 30-day freezing threshold, automatically mint cycles from your wallet.",
    metrics: [
      { label: "Fleet Protection", value: "Zero Downtime" },
      { label: "Cycle Reserve", value: "> 30 Days" },
      { label: "Authentication", value: "Caller Principal" },
    ],
    samplePayload: `{\n  "canister_ids": ["6vbhm-nqaaa-aaaan-q6muq-cai"],\n  "min_cycles": 500000000000\n}`,
  },
]

export function UseCasesSection() {
  const [activeTab, setActiveTab] = useState(RECIPES[0].id)
  const [copied, setCopied] = useState(false)

  const activeRecipe = RECIPES.find((r) => r.id === activeTab) ?? RECIPES[0]

  const copyPayload = () => {
    navigator.clipboard.writeText(activeRecipe.samplePayload)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            Real-World Solutions
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Production Automation Recipes
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            See how forward-thinking engineering teams deploy icCron to power DeFi protocols, database syncs, and cloud workloads.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {RECIPES.map((recipe) => (
            <button
              key={recipe.id}
              type="button"
              onClick={() => setActiveTab(recipe.id)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold transition-all ${
                activeTab === recipe.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "border border-border bg-card/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <HugeiconsIcon icon={recipe.icon} className="size-4" />
              {recipe.title}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <Card className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/80 p-6 shadow-xl md:p-8">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="space-y-6 lg:col-span-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs text-primary font-semibold">
                      {activeRecipe.schedule}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">
                      {activeRecipe.scheduleLabel}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-foreground">
                    {activeRecipe.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {activeRecipe.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 border-y border-border/50 py-4">
                  {activeRecipe.metrics.map((metric, i) => (
                    <div key={i}>
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                      <p className="text-sm font-bold text-foreground">{metric.value}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground">Sample Payload Preview</span>
                    <button
                      type="button"
                      onClick={copyPayload}
                      className="flex items-center gap-1 text-primary hover:underline font-medium"
                    >
                      <HugeiconsIcon
                        icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
                        className="size-3.5"
                      />
                      {copied ? "Copied" : "Copy Payload"}
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-xl border border-border bg-background p-3.5 font-mono text-xs text-muted-foreground">
                    {activeRecipe.samplePayload}
                  </pre>
                </div>

                <div className="pt-2">
                  <Button
                    size="default"
                    className="gap-2 rounded-xl text-xs font-semibold"
                    nativeButton={false}
                    render={<Link href="/login" />}
                  >
                    Deploy This Recipe
                    <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                  </Button>
                </div>
              </div>

              <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-border lg:col-span-6">
                <Image
                  src={activeRecipe.image}
                  alt={activeRecipe.title}
                  fill
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-border/80 bg-card/90 p-3.5 backdrop-blur-md">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Target Execution
                  </p>
                  <p className="font-mono text-xs font-bold text-foreground truncate">
                    {activeRecipe.endpoint}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
