"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import {
  CoinsGlassIcon,
  CloudGlassIcon,
  ShoppingBagGlassIcon,
  ShieldGlassIcon,
  CopyGlassIcon,
  CheckGlassOutlineIcon,
} from "@thesvg/ui-react"

const RECIPES = [
  {
    id: "yield",
    title: "Yield compounding",
    icon: CoinsGlassIcon,
    schedule: "0 0 * * *",
    scheduleLabel: "Daily at 00:00 UTC",
    targetType: "Candid canister call",
    endpoint: "swap_pool.harvest_and_reinvest()",
    description:
      "Automate liquidity pool reward collection and reinvestment without running an off-chain keeper bot or exposing a private key on a server.",
    samplePayload: `{\n  "action": "harvest_and_reinvest",\n  "pool_id": "icp_ckbtc_lp",\n  "min_return_e8s": 100000000\n}`,
  },
  {
    id: "backup",
    title: "Database backup",
    icon: CloudGlassIcon,
    schedule: "0 2 * * *",
    scheduleLabel: "Daily at 02:00 UTC",
    targetType: "HTTPS webhook",
    endpoint: "POST https://api.example.com/v1/jobs/db-dump",
    description:
      "Trigger an automated database snapshot, encrypt it with AES-256, and stream it directly to decentralized object storage.",
    samplePayload: `{\n  "target": "s3://backups/prod-db.sql.gz",\n  "retention_days": 30\n}`,
  },
  {
    id: "cart",
    title: "Cart reminders",
    icon: ShoppingBagGlassIcon,
    schedule: "*/30 * * * *",
    scheduleLabel: "Every 30 minutes",
    targetType: "HTTPS webhook",
    endpoint: "POST https://store.example.com/api/webhooks/abandoned",
    description:
      "Query checkout sessions idle for more than 1 hour and dispatch notifications through your email service provider.",
    samplePayload: `{\n  "idle_threshold_minutes": 60,\n  "coupon_code": "SAVE10",\n  "max_notifications": 100\n}`,
  },
  {
    id: "cycles",
    title: "Cycle top-up",
    icon: ShieldGlassIcon,
    schedule: "0 */6 * * *",
    scheduleLabel: "Every 6 hours",
    targetType: "Candid canister call",
    endpoint: "sentinel.check_runway_and_top_up()",
    description:
      "Monitor cycles balance across your canister fleet and automatically trigger top-up when balance drops below 30 days of runway.",
    samplePayload: `{\n  "canister_ids": ["6vbhm-nqaaa-aaaan-q6muq-cai"],\n  "min_cycles_threshold": 500000000000\n}`,
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
        <div className="max-w-3xl space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Example jobs
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Common schedules and the payload each one sends.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {RECIPES.map((recipe) => (
            <button
              key={recipe.id}
              type="button"
              onClick={() => setActiveTab(recipe.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === recipe.id
                  ? "bg-foreground text-background shadow-xs"
                  : "border border-border/70 bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon icon={recipe.icon} className="size-4" />
              <span>{recipe.title}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-border/80 bg-card p-6 shadow-sm md:p-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="space-y-4 lg:col-span-5">
              <div>
                <Badge variant="outline" className="font-mono text-xs">
                  {activeRecipe.targetType}
                </Badge>
                <h3 className="mt-2 text-xl font-bold text-foreground">
                  {activeRecipe.title}
                </h3>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                {activeRecipe.description}
              </p>

              <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Schedule: </span>
                  <span className="font-mono font-semibold text-foreground">{activeRecipe.schedule}</span>
                  <span className="text-muted-foreground"> ({activeRecipe.scheduleLabel})</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Target: </span>
                  <span className="font-mono text-foreground break-all">{activeRecipe.endpoint}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <Card className="overflow-hidden rounded-xl border border-border/70 bg-zinc-950 text-zinc-100 dark:bg-black/80">
                <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
                  <span className="font-mono text-xs text-zinc-400">payload.json</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyPayload}
                    className="h-7 gap-1.5 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer"
                  >
                    <Icon icon={copied ? CheckGlassOutlineIcon : CopyGlassIcon} className="size-3.5" />
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </Button>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-200">
                  {activeRecipe.samplePayload}
                </pre>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
