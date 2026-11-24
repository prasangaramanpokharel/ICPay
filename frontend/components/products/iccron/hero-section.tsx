"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ShineBorder } from "@/components/ui/shine-border"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"
import { Icon } from "@/components/ui/icon"
import { ArrowRightIcon, ArrowRightGlassIcon, CheckGlassOutlineIcon, ClockGlassIcon, CopyGlassIcon, GlobeGlassIcon, ExternalLinkGlassIcon, PlayGlassIcon, ZapGlassIcon } from "@thesvg/ui-react"

const PRESETS = [
  { label: "Hourly", expr: "0 * * * *", desc: "Every hour at minute 0" },
  { label: "Every 2h", expr: "0 */2 * * *", desc: "Every 2 hours at minute 0" },
  { label: "Daily", expr: "0 0 * * *", desc: "Daily at 00:00 UTC" },
  { label: "Every 15m", expr: "*/15 * * * *", desc: "Every 15 minutes" },
  { label: "Weekdays", expr: "0 9 * * 1-5", desc: "Mon-Fri at 09:00 UTC" },
]

export function HeroSection() {
  const [cronExpr, setCronExpr] = useState("0 */2 * * *")
  const [targetMode, setTargetMode] = useState<"webhook" | "canister">("webhook")
  const [copied, setCopied] = useState(false)

  const activePreset = PRESETS.find((p) => p.expr === cronExpr)
  const cronDescription = activePreset ? activePreset.desc : "Custom cron schedule"

  const nextRuns = useMemo(() => {
    const runs: string[] = []
    const now = new Date()
    const stepHours = cronExpr.includes("*/15")
      ? 0.25
      : cronExpr.includes("*/2")
        ? 2
        : cronExpr === "0 0 * * *"
          ? 24
          : 1
    for (let i = 1; i <= 5; i++) {
      const d = new Date(now.getTime() + i * stepHours * 60 * 60 * 1000)
      runs.push(d.toISOString().replace("T", " ").substring(0, 19) + " UTC")
    }
    return runs
  }, [cronExpr])

  const copySnippet = () => {
    const text = targetMode === "webhook"
      ? `curl -X POST https://iccron.icpay.app/api/v1/jobs -d '{"schedule":"${cronExpr}","url":"https://my-app.com/api/cron"}'`
      : `dfx canister call uzt4z-lp777-77774-qaabq-cai create_job '(record { schedule = "${cronExpr}"; ... })'`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-background py-16 md:py-24">
      <div className="absolute inset-0 -z-10 opacity-15">
        <Image
          src="/images/pages/iccron/hero-automation.jpg"
          alt="Autonomous Cron Engine"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="space-y-6 lg:col-span-7">
            <Link
              href="/cron"
              className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 py-1 pl-1.5 pr-2 text-xs font-medium text-foreground shadow-xs backdrop-blur-xs transition-all duration-200 hover:border-border hover:bg-card hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary dark:bg-primary/20">
                Live
              </span>
              <AnimatedShinyText className="inline-flex items-center gap-1.5 text-xs">
                <span className="font-medium text-foreground">Decentralized Job Orchestration</span>
                <span className="hidden text-muted-foreground sm:inline">· icCron Engine</span>
              </AnimatedShinyText>
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-transform duration-200 group-hover:translate-x-0.5">
                <ArrowRightIcon className="size-3" />
              </span>
            </Link>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Autonomous On-Chain{" "}
              <span className="bg-gradient-to-r from-primary via-accent-foreground to-primary bg-clip-text text-transparent">
                Cron & Webhook
              </span>{" "}
              Dispatcher
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Trigger HTTP webhooks and inter-canister smart contracts with sub-second precision.
              Zero keeper bots, zero plaintext private keys, and no Vercel Pro $20/month tax.
              Powered directly by the Internet Computer blockchain.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                size="lg"
                className="rounded-xl px-6 font-semibold shadow-md"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Start Free (60 runs/mo)
                <Icon icon={ArrowRightGlassIcon} className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 rounded-xl px-5 font-medium"
                nativeButton={false}
                render={
                  <Link
                    href="https://dashboard.internetcomputer.org/canister/uzt4z-lp777-77774-qaabq-cai"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <Icon icon={ExternalLinkGlassIcon} className="size-4" />
                Live Canister
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50 text-left">
              <div>
                <p className="text-2xl font-bold tracking-tight text-foreground">99.4%</p>
                <p className="text-xs text-muted-foreground">Cycle Reduction vs Heartbeat</p>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-foreground">$0.0005</p>
                <p className="text-xs text-muted-foreground">Per Execution Run</p>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-foreground">0 Servers</p>
                <p className="text-xs text-muted-foreground">Zero Devops Overhead</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-3xl p-px">
              <Card className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/95 p-6 shadow-2xl backdrop-blur-md">
                <ShineBorder
                  borderWidth={1.5}
                  duration={12}
                  shineColor={["var(--primary)", "var(--accent)", "var(--success)"]}
                />

                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon icon={ClockGlassIcon} className="size-4" />
                      </div>
                      <span className="text-sm font-semibold tracking-tight text-foreground">
                        Interactive Cron Sandbox
                      </span>
                    </div>
                    <Badge variant="outline" className="border-border text-xs text-muted-foreground">
                      Sub-Second Precision
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {PRESETS.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setCronExpr(p.expr)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                            cronExpr === p.expr
                              ? "bg-primary text-primary-foreground"
                              : "border border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2.5">
                      <Icon icon={PlayGlassIcon} className="size-4 text-primary shrink-0" />
                      <Input
                        value={cronExpr}
                        onChange={(e) => setCronExpr(e.target.value)}
                        className="h-7 border-0 bg-transparent p-0 font-mono text-sm font-bold shadow-none focus-visible:ring-0"
                        placeholder="* * * * *"
                      />
                      <Badge variant="secondary" className="text-xs font-mono shrink-0">
                        {cronDescription}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-2xl border border-border/70 bg-secondary/30 p-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                        Target Protocol
                      </span>
                      <div className="flex rounded-lg border border-border bg-background p-0.5">
                        <button
                          type="button"
                          onClick={() => setTargetMode("webhook")}
                          className={`rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors ${
                            targetMode === "webhook"
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          HTTPS Webhook
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetMode("canister")}
                          className={`rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors ${
                            targetMode === "canister"
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Candid Canister
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-background/80 p-2.5 font-mono text-xs text-muted-foreground">
                      {targetMode === "webhook" ? (
                        <div className="space-y-1">
                          <p className="flex items-center gap-1.5 text-foreground font-semibold">
                            <Icon icon={GlobeGlassIcon} className="size-3.5 text-primary" />
                            POST https://api.my-app.com/api/cron
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Authorization: Bearer cr_live_9f82...
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="flex items-center gap-1.5 text-foreground font-semibold">
                            <Icon icon={ZapGlassIcon} className="size-3.5 text-primary" />
                            canister.trigger_action(record {"{}"})
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Caller: uzt4z-lp777-77774-qaabq-cai
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Upcoming 5 Scheduled Executions
                    </p>
                    <div className="space-y-1 rounded-xl border border-border/50 bg-background/50 p-2.5 font-mono text-[11px] text-muted-foreground">
                      {nextRuns.map((run, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-primary" />
                            Run #{idx + 1}
                          </span>
                          <span className="text-foreground">{run}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copySnippet}
                      className="w-full gap-2 rounded-xl text-xs font-medium"
                    >
                      {copied ? (
                        <>
                          <Icon icon={CheckGlassOutlineIcon} className="size-4 text-success" strokeWidth={2.5} />
                          <span className="text-success font-medium">Copied Snippet</span>
                        </>
                      ) : (
                        <>
                          <Icon icon={CopyGlassIcon} className="size-3.5" strokeWidth={2} />
                          <span>Copy Schedule CLI Command</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
