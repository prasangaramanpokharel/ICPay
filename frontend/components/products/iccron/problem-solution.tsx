"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { CircleAlertGlassIcon, CircleCheckGlassIcon, DollarSignGlassIcon, CpuGlassIcon, LockGlassIcon, CloudGlassIcon } from "@thesvg/ui-react"

const PAIN_POINTS = [
  {
    icon: DollarSignGlassIcon,
    category: "Cost & Markups",
    problemTitle: "The Vercel $20/mo Cron Tax",
    problemDesc:
      "Vercel Free restricts cron triggers to once every 24 hours. Scheduling an hourly job forces an upgrade to Vercel Pro at $20/month per team member ($240/yr minimum).",
    solutionTitle: "Pay Only $0.0005 per Run",
    solutionDesc:
      "Point icCron at your Next.js route handler. Run jobs hourly for $0.36/month ($4.32/yr) — a 98.2% cost reduction with 60 free runs included every month.",
    savings: "98.2% Less",
  },
  {
    icon: CpuGlassIcon,
    category: "Reliability",
    problemTitle: "Fragile 24/7 Keeper Bots",
    problemDesc:
      "Running continuous scripts on AWS EC2 or VPS instances to trigger smart contracts requires babysitting server uptime, process managers, memory leaks, and OS security patches.",
    solutionTitle: "100% On-Chain Canister Timers",
    solutionDesc:
      "icCron executes inside a replicated Internet Computer WebAssembly canister. Backed by dozens of independent node providers with automatic failover.",
    savings: "Zero Downtime",
  },
  {
    icon: LockGlassIcon,
    category: "Security",
    problemTitle: "Hot Private Key Exposure",
    problemDesc:
      "Off-chain keeper bots require storing plaintext private keys and mnemonics in server .env files to sign blockchain transactions, creating critical exploit vectors.",
    solutionTitle: "Cryptographic Caller Identity",
    solutionDesc:
      "No private keys or passwords. icCron calls other canisters directly as an authenticated canister principal, eliminating hot-wallet theft vectors entirely.",
    savings: "Zero Hot Keys",
  },
  {
    icon: CloudGlassIcon,
    category: "Simplicity",
    problemTitle: "AWS Cloud Sprawl & IAM",
    problemDesc:
      "Building a reliable scheduler on AWS requires configuring EventBridge rules, CloudWatch alarms, IAM execution roles, SQS dead-letter queues, and API Gateway endpoints.",
    solutionTitle: "30-Second One-Click Dispatch",
    solutionDesc:
      "Paste your webhook URL or Canister ID, set your cron expression, and deploy immediately. Automated exponential retries and DLQ logging built right in.",
    savings: "30s Setup",
  },
]

export function ProblemSolution() {
  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            Why We Built icCron
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            The Traditional Cron Infrastructure is Broken
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Developers shouldn&apos;t have to pay enterprise SaaS markups or manage fragile server fleets just to run scheduled background tasks.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PAIN_POINTS.map((item, idx) => (
            <Card
              key={idx}
              className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/60 p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon icon={item.icon} className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {item.category}
                    </p>
                    <p className="text-base font-bold text-foreground">{item.problemTitle}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-semibold text-primary">
                  {item.savings}
                </Badge>
              </div>

              <div className="mt-5 space-y-4 text-sm">
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                  <div className="flex items-start gap-2.5">
                    <Icon
                      icon={CircleAlertGlassIcon}
                      className="mt-0.5 size-4 text-destructive shrink-0"
                    />
                    <div className="space-y-1">
                      <p className="font-semibold text-destructive">Legacy Workaround</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {item.problemDesc}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-start gap-2.5">
                    <Icon
                      icon={CircleCheckGlassIcon}
                      className="mt-0.5 size-4 text-primary shrink-0"
                    />
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{item.solutionTitle}</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {item.solutionDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
