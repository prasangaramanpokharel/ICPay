"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Icon } from "@/components/ui/icon"
import { ArrowRightIcon, CircleCheckGlassIcon } from "@thesvg/ui-react"

const FREQUENCIES = [
  { label: "Every 5 min", multiplier: 105120 },
  { label: "Every 15 min", multiplier: 35040 },
  { label: "Hourly", multiplier: 8760 },
  { label: "Daily", multiplier: 365 },
]

export function PricingCalculator() {
  const [jobCount, setJobCount] = useState<number[]>([3])
  const [freqIndex, setFreqIndex] = useState(2)

  const activeFreq = FREQUENCIES[freqIndex]
  const jobs = jobCount[0] ?? 3

  const stats = useMemo(() => {
    const annualRuns = jobs * activeFreq.multiplier
    const iccronAnnualCost = Math.max(0.01, annualRuns * 0.0005)
    const vercelAnnualCost = 240
    const awsAnnualCost = Math.max(15, annualRuns * 0.000001 + 25)
    const savingsAmount = Math.max(0, vercelAnnualCost - iccronAnnualCost)
    const savingsPct = Math.round((savingsAmount / vercelAnnualCost) * 100)

    return {
      annualRuns,
      iccronAnnualCost: iccronAnnualCost.toFixed(2),
      vercelAnnualCost: vercelAnnualCost.toFixed(2),
      awsAnnualCost: awsAnnualCost.toFixed(2),
      savingsAmount: savingsAmount.toFixed(2),
      savingsPct,
    }
  }, [jobs, activeFreq])

  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            ROI & Pricing Calculator
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Save Up to 98.2% on Cron Overhead
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            See how much your team saves by eliminating centralized cloud cron subscription taxes and switching to on-chain execution.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="space-y-6 lg:col-span-7">
            <Card className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm md:p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">Active Jobs</p>
                    <p className="text-xs text-muted-foreground">Number of scheduled background routines</p>
                  </div>
                  <span className="font-mono text-2xl font-extrabold text-primary">
                    {jobs} {jobs === 1 ? "Job" : "Jobs"}
                  </span>
                </div>

                <Slider
                  min={1}
                  max={25}
                  step={1}
                  value={jobCount}
                  onValueChange={(val) =>
                    setJobCount(Array.isArray(val) ? [...val] : [Number(val)])
                  }
                  className="py-2"
                />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>1 Job</span>
                  <span>12 Jobs</span>
                  <span>25 Jobs</span>
                </div>
              </div>

              <div className="space-y-3 border-t border-border/50 pt-5">
                <div>
                  <p className="text-sm font-bold text-foreground">Trigger Cadence</p>
                  <p className="text-xs text-muted-foreground">Execution interval per job</p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {FREQUENCIES.map((f, i) => (
                    <button
                      key={f.label}
                      type="button"
                      onClick={() => setFreqIndex(i)}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                        freqIndex === i
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "border border-border bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-border/50 pt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total Dispatched Executions:</span>
                  <span className="font-mono font-bold text-foreground">
                    {stats.annualRuns.toLocaleString()} runs/yr
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-1">
                    <p className="text-[11px] font-semibold text-primary">icCron Cost</p>
                    <p className="font-mono text-2xl font-black text-foreground">
                      ${stats.iccronAnnualCost}
                    </p>
                    <p className="text-[10px] text-muted-foreground">/ year</p>
                  </div>

                  <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 space-y-1">
                    <p className="text-[11px] font-semibold text-destructive">Vercel Pro</p>
                    <p className="font-mono text-2xl font-black text-muted-foreground line-through">
                      ${stats.vercelAnnualCost}
                    </p>
                    <p className="text-[10px] text-muted-foreground">/ year base</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-1">
                    <p className="text-[11px] font-semibold text-muted-foreground">AWS EventBridge</p>
                    <p className="font-mono text-2xl font-black text-muted-foreground">
                      ${stats.awsAnnualCost}
                    </p>
                    <p className="text-[10px] text-muted-foreground">+ CloudWatch</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <Card className="rounded-3xl border border-primary/30 bg-card p-6 shadow-xl space-y-6 md:p-8">
              <div className="space-y-2">
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-xs font-semibold text-primary">
                  Net Savings
                </Badge>
                <h3 className="text-3xl font-black tracking-tight text-foreground">
                  Save ${stats.savingsAmount}{" "}
                  <span className="text-primary text-xl">({stats.savingsPct}%)</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every dollar spent goes strictly to on-chain execution, not recurring SaaS seats or idle cloud server hours.
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border border-border/60 bg-secondary/20 p-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <Icon icon={CircleCheckGlassIcon} className="mt-0.5 size-4 text-primary shrink-0" />
                  <span>
                    <strong className="text-foreground">60 Free Monthly Runs:</strong> Permanent allowance with zero credit card required.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Icon icon={CircleCheckGlassIcon} className="mt-0.5 size-4 text-primary shrink-0" />
                  <span>
                    <strong className="text-foreground">$0.0005 per Run:</strong> Ultra-predictable prepaid credits that never expire.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Icon icon={CircleCheckGlassIcon} className="mt-0.5 size-4 text-primary shrink-0" />
                  <span>
                    <strong className="text-foreground">No Minimum:</strong> Top up with ICP or fiat only as needed.
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  size="lg"
                  className="w-full gap-2 rounded-xl font-semibold shadow-sm"
                  nativeButton={false}
                  render={<Link href="/login" />}
                >
                  Start
                  <ArrowRightIcon className="size-4" />
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
                  Internet Identity login · No credit card required
                </p>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Card className="rounded-2xl border border-border/70 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-foreground">Free Starter</h4>
              <Badge variant="secondary">Permanent</Badge>
            </div>
            <div>
              <p className="font-mono text-3xl font-extrabold text-foreground">$0</p>
              <p className="text-xs text-muted-foreground">60 runs / month</p>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Icon icon={CircleCheckGlassIcon} className="size-3.5 text-primary" />
                Webhook & Candid targets
              </li>
              <li className="flex items-center gap-2">
                <Icon icon={CircleCheckGlassIcon} className="size-3.5 text-primary" />
                Sub-second precision
              </li>
              <li className="flex items-center gap-2">
                <Icon icon={CircleCheckGlassIcon} className="size-3.5 text-primary" />
                7-day execution logs
              </li>
            </ul>
          </Card>

          <Card className="relative rounded-2xl border border-primary/40 bg-card p-6 space-y-4 shadow-sm">
            <div className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
              POPULAR
            </div>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-foreground">Developer Pack</h4>
              <Badge variant="outline" className="border-primary/30 text-primary">Prepaid</Badge>
            </div>
            <div>
              <p className="font-mono text-3xl font-extrabold text-foreground">$5.00</p>
              <p className="text-xs text-muted-foreground">10,000 execution credits ($0.0005/run)</p>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Icon icon={CircleCheckGlassIcon} className="size-3.5 text-primary" />
                Never-expiring credits
              </li>
              <li className="flex items-center gap-2">
                <Icon icon={CircleCheckGlassIcon} className="size-3.5 text-primary" />
                Automated exponential retries
              </li>
              <li className="flex items-center gap-2">
                <Icon icon={CircleCheckGlassIcon} className="size-3.5 text-primary" />
                Dead Letter Queue (DLQ)
              </li>
              <li className="flex items-center gap-2">
                <Icon icon={CircleCheckGlassIcon} className="size-3.5 text-primary" />
                30-day execution audit logs
              </li>
            </ul>
          </Card>

          <Card className="rounded-2xl border border-border/70 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-foreground">Enterprise Fleet</h4>
              <Badge variant="secondary">High-Volume</Badge>
            </div>
            <div>
              <p className="font-mono text-3xl font-extrabold text-foreground">Custom</p>
              <p className="text-xs text-muted-foreground">&gt; 1M runs / month</p>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Icon icon={CircleCheckGlassIcon} className="size-3.5 text-primary" />
                Dedicated subnet scheduling
              </li>
              <li className="flex items-center gap-2">
                <Icon icon={CircleCheckGlassIcon} className="size-3.5 text-primary" />
                Custom cycle reserve management
              </li>
              <li className="flex items-center gap-2">
                <Icon icon={CircleCheckGlassIcon} className="size-3.5 text-primary" />
                Priority SLA support & Discord bridge
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </section>
  )
}
