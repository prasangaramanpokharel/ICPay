"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ShineBorder } from "@/components/ui/shine-border"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"
import { Icon } from "@/components/ui/icon"
import {
  ArrowRightIcon,
  ExternalLinkGlassIcon,
  ClockGlassIcon,
  DeltaVIcon,
  SocialDiscordIcon,
  SocialTelegramIcon,
  CheckGlassOutlineIcon,
  ZapGlassIcon,
} from "@thesvg/ui-react"

const PRESETS = [
  { label: "Hourly", expr: "0 * * * *" },
  { label: "Every 2h", expr: "0 */2 * * *" },
  { label: "Daily", expr: "0 0 * * *" },
  { label: "15 Min", expr: "*/15 * * * *" },
]

type PlatformKey = "vercel" | "discord" | "telegram"

interface PlatformConfig {
  name: string
  icon: typeof DeltaVIcon
  url: string
  header: string
  badge: string
  responseSnippet: string
}

const PLATFORMS: Record<PlatformKey, PlatformConfig> = {
  vercel: {
    name: "Vercel",
    icon: DeltaVIcon,
    url: "https://my-app.vercel.app/api/cron/sync",
    header: "Authorization: Bearer CRON_SECRET",
    badge: "Next.js Route",
    responseSnippet: '{"ok": true, "status": 200, "sync": "completed"}',
  },
  discord: {
    name: "Discord",
    icon: SocialDiscordIcon,
    url: "https://discord.com/api/webhooks/12984.../token",
    header: "Content-Type: application/json",
    badge: "Channel Webhook",
    responseSnippet: '{"id": "12984128", "channel_id": "9921", "status": "sent"}',
  },
  telegram: {
    name: "Telegram",
    icon: SocialTelegramIcon,
    url: "https://api.telegram.org/bot<token>/sendMessage",
    header: 'chat_id: "@alerts" · parse_mode: "HTML"',
    badge: "Bot Dispatch",
    responseSnippet: '{"ok": true, "result": {"message_id": 8412, "date": 1732452000}}',
  },
}

const STEPS = [
  { label: "Timer Tick", detail: "0ms · Nanosecond canister timer" },
  { label: "Subnet Sign", detail: "48ms · Threshold consensus outcall" },
  { label: "200 OK", detail: "142ms · Webhook delivered successfully" },
]

export function HeroSection() {
  const [cronExpr, setCronExpr] = useState("0 */2 * * *")
  const [platform, setPlatform] = useState<PlatformKey>("vercel")
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length)
    }, 2400)
    return () => clearInterval(timer)
  }, [])

  const currentPlatform = PLATFORMS[platform]

  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-background py-16 md:py-24">
      <div className="absolute inset-0 -z-10 opacity-15">
        <Image
          src="/images/pages/iccron/hero-automation.jpg"
          alt="Autonomous Cron Engine"
          fill
          priority
          sizes="100vw"
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
                className="gap-2 rounded-xl px-7 font-semibold shadow-sm"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Start
                <ArrowRightIcon className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 rounded-xl px-6 font-medium"
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
                Explorer
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
              <Card className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/95 p-5 shadow-xl backdrop-blur-md space-y-4">
                <ShineBorder
                  borderWidth={1.5}
                  duration={12}
                  shineColor={["var(--primary)", "var(--accent)", "var(--success)"]}
                />

                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon icon={ClockGlassIcon} className="size-4" />
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      Execution Sandbox
                    </span>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1.5 text-xs text-success">
                    <span className="size-1.5 rounded-full bg-success animate-pulse" />
                    Live
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground">Cadence</span>
                    <span className="font-mono text-primary font-bold">{cronExpr}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setCronExpr(p.expr)}
                        className={`rounded-xl px-2 py-1.5 text-xs font-semibold transition-all ${
                          cronExpr === p.expr
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "border border-border bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 rounded-2xl border border-border/70 bg-secondary/20 p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground">Target Destination</span>
                    <div className="flex rounded-lg border border-border bg-background p-0.5 gap-0.5">
                      {(Object.keys(PLATFORMS) as PlatformKey[]).map((key) => {
                        const plat = PLATFORMS[key]
                        const isSelected = platform === key
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setPlatform(key)}
                            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                              isSelected
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                            }`}
                          >
                            <Icon icon={plat.icon} className="size-3" />
                            <span>{plat.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={platform}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      transition={{ duration: 0.18 }}
                      className="rounded-xl border border-border/60 bg-background/90 p-3 font-mono text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-foreground font-semibold truncate">
                          <Icon icon={currentPlatform.icon} className="size-3.5 text-primary shrink-0" />
                          <span className="truncate">POST {currentPlatform.url}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0 font-normal">
                          {currentPlatform.badge}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {currentPlatform.header}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="space-y-2 rounded-2xl border border-border/60 bg-background/70 p-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-muted-foreground">Execution Pipeline</span>
                    <span className="font-mono text-[11px] text-muted-foreground">~ In 14m 22s</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    {STEPS.map((step, idx) => {
                      const isActive = activeStep === idx
                      const isPast = activeStep > idx
                      return (
                        <div
                          key={step.label}
                          className={`relative overflow-hidden rounded-xl border p-2 text-center transition-all ${
                            isActive
                              ? "border-primary bg-primary/10 shadow-xs"
                              : isPast
                                ? "border-success/40 bg-success/5"
                                : "border-border/50 bg-secondary/30 opacity-70"
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="step-indicator"
                              className="absolute inset-x-0 top-0 h-0.5 bg-primary"
                              transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            />
                          )}
                          <div className="flex items-center justify-center gap-1">
                            {isPast ? (
                              <Icon icon={CheckGlassOutlineIcon} className="size-3 text-success shrink-0" strokeWidth={2.5} />
                            ) : isActive ? (
                              <Icon icon={ZapGlassIcon} className="size-3 text-primary shrink-0 animate-pulse" />
                            ) : null}
                            <span className={`text-[11px] font-bold ${isActive ? "text-primary" : isPast ? "text-success" : "text-muted-foreground"}`}>
                              {step.label}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${platform}-${activeStep}`}
                      initial={{ opacity: 0, y: 2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -2 }}
                      transition={{ duration: 0.15 }}
                      className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 font-mono text-[11px]"
                    >
                      {activeStep === 0 && (
                        <span className="text-muted-foreground">
                          [TICK] Canister timer evaluated at 0 cycle idle burn
                        </span>
                      )}
                      {activeStep === 1 && (
                        <span className="text-primary font-medium">
                          [SUBNET] Threshold consensus signed outcall dispatched
                        </span>
                      )}
                      {activeStep === 2 && (
                        <div className="space-y-0.5">
                          <span className="text-success font-semibold flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-success" />
                            200 OK · 142ms · 0 cycle penalty
                          </span>
                          <span className="text-muted-foreground block truncate">
                            {currentPlatform.responseSnippet}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
