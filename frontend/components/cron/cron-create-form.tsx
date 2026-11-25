"use client"

import * as React from "react"
import { Principal } from "@icp-sdk/core/principal"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { CopyButton } from "@/components/ui/copy-button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Icon } from "@/components/ui/icon"
import { DiscordIcon, NextjsIcon } from "@dev.icons/react"
import {
  CodeGlassIcon,
  SettingsGlassIcon,
  ClockGlassIcon,
  CircleCheckGlassIcon,
  InfoGlassIcon,
} from "@thesvg/ui-react"
import { toast } from "@/components/ui/sonner"
import { useAuth } from "@/components/auth/auth-provider"
import { useInvalidateCronCache } from "@/hooks/cron/useCron"
import { createJob } from "@/services/cron/client"
import type { RemoteJobTarget } from "@/services/cron/types"
import {
  MINUTE_OPTIONS,
  HOUR_OPTIONS,
  DAY_OPTIONS,
  MONTH_OPTIONS,
  WEEKDAY_OPTIONS,
} from "./cron-types"

type TemplateType = "discord_telegram" | "vercel_api" | "canister" | "custom"

interface CronCreateFormProps {
  projectId: bigint
  onJobCreated?: () => void
}

export function CronCreateForm({ projectId, onJobCreated }: CronCreateFormProps) {
  const { identity } = useAuth()
  const invalidateCron = useInvalidateCronCache()
  const t = useTranslations("cron")

  const [template, setTemplate] = React.useState<TemplateType>("discord_telegram")
  const [label, setLabel] = React.useState("Daily Community Broadcast")
  const [url, setUrl] = React.useState("https://discord.com/api/webhooks/123456789/abcdef...")
  const [canisterTarget, setCanisterTarget] = React.useState("ryjl3-tyaaa-aaaaa-aaaba-cai::get_account_identifier")
  const [method, setMethod] = React.useState<"GET" | "POST">("POST")
  const [authHeader, setAuthHeader] = React.useState("")
  const [body, setBody] = React.useState('{\n  "content": "Good morning! Automated daily broadcast from icCron on ICP."\n}')

  const [commonPreset, setCommonPreset] = React.useState("0 9 * * *")
  const [showCustomDropdowns, setShowCustomDropdowns] = React.useState(false)
  const [minute, setMinute] = React.useState("0")
  const [hour, setHour] = React.useState("9")
  const [day, setDay] = React.useState("*")
  const [month, setMonth] = React.useState("*")
  const [weekday, setWeekday] = React.useState("*")

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const isPlatformPreset = template === "discord_telegram" || template === "vercel_api"

  const activeShortcuts = React.useMemo(() => {
    if (template === "discord_telegram") {
      return [
        { label: "Daily at 9:00 AM", value: "0 9 * * *" },
        { label: "Every 6 hours", value: "0 */6 * * *" },
        { label: "Every 12 hours", value: "0 */12 * * *" },
        { label: "Weekly (Monday)", value: "0 9 * * 1" },
      ]
    }
    if (template === "vercel_api") {
      return [
        { label: "Every 10 min", value: "*/10 * * * *" },
        { label: "Every 15 min", value: "*/15 * * * *" },
        { label: "Every hour", value: "0 * * * *" },
        { label: "Every 6 hours", value: "0 */6 * * *" },
        { label: "Daily at midnight", value: "0 0 * * *" },
      ]
    }
    return [
      { label: "Every 10 min", value: "*/10 * * * *" },
      { label: "Every hour", value: "0 * * * *" },
      { label: "Every 6 hours", value: "0 */6 * * *" },
      { label: "Daily at 9:00 AM", value: "0 9 * * *" },
      { label: "Weekly (Monday)", value: "0 9 * * 1" },
    ]
  }, [template])

  const cronExpression = React.useMemo(() => {
    return `${minute} ${hour} ${day} ${month} ${weekday}`.trim()
  }, [minute, hour, day, month, weekday])

  const applySchedule = React.useCallback((presetValue: string) => {
    setCommonPreset(presetValue)
    if (!presetValue) return
    const parts = presetValue.split(" ")
    if (parts.length === 5) {
      setMinute(parts[0])
      setHour(parts[1])
      setDay(parts[2])
      setMonth(parts[3])
      setWeekday(parts[4])
    }
  }, [])

  const handleTemplateChange = (nextTemplate: TemplateType) => {
    setTemplate(nextTemplate)
    setError(null)
    setSuccess(false)

    if (nextTemplate === "discord_telegram") {
      setLabel("Daily Community Broadcast")
      setUrl("https://discord.com/api/webhooks/123456789/abcdef...")
      setMethod("POST")
      setAuthHeader("")
      setBody('{\n  "content": "Good morning! Automated daily broadcast from icCron on ICP."\n}')
      setShowCustomDropdowns(false)
      applySchedule("0 9 * * *")
    } else if (nextTemplate === "vercel_api") {
      setLabel("Vercel Sync Trigger")
      setUrl("https://my-app.vercel.app/api/cron/sync")
      setMethod("GET")
      setAuthHeader("Bearer your_cron_secret")
      setBody("")
      setShowCustomDropdowns(false)
      applySchedule("*/10 * * * *")
    } else if (nextTemplate === "canister") {
      setLabel("Canister Execution Call")
      setCanisterTarget("ryjl3-tyaaa-aaaaa-aaaba-cai::get_account_identifier")
      setShowCustomDropdowns(false)
      applySchedule("0 * * * *")
    } else {
      setLabel("Custom Webhook")
      setUrl("https://api.example.com/webhook")
      setMethod("POST")
      setAuthHeader("")
      setBody('{\n  "status": "ping"\n}')
      setShowCustomDropdowns(true)
      applySchedule("0 * * * *")
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (template === "canister" && !canisterTarget.trim()) {
      setError("Please specify a canister target in format: <canister_id>::<method_name>")
      return
    }

    if (template !== "canister" && !url.trim()) {
      setError("Please specify a destination webhook URL.")
      return
    }

    setLoading(true)

    try {
      let target: RemoteJobTarget

      if (template === "canister") {
        const [canisterStr, methodStr] = canisterTarget.split("::")
        if (!canisterStr || !methodStr) {
          throw new Error("Canister target format must be: <canister_id>::<method_name>")
        }
        target = {
          CanisterCall: {
            canister_id: Principal.fromText(canisterStr.trim()),
            method: methodStr.trim(),
            payload: new Uint8Array(),
          },
        }
      } else {
        let cleanUrl = url.trim()
        if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
          cleanUrl = `https://${cleanUrl}`
        }

        let host = ""
        try {
          host = new URL(cleanUrl).host
        } catch {
          host = ""
        }

        const headers: [string, string][] = [
          ["User-Agent", "Mozilla/5.0 (compatible; icCron/1.0; +https://icpay.app)"],
          ["Accept", "*/*"],
        ]
        if (host) {
          headers.push(["Host", host])
        }
        if (method === "POST") {
          headers.push(["Content-Type", "application/json"])
        }
        if (authHeader.trim()) {
          headers.push(["Authorization", authHeader.trim()])
        }

        const encodedBody: [] | [Uint8Array] =
          method === "POST" && body.trim()
            ? [new TextEncoder().encode(body.trim())]
            : []

        target = {
          HttpWebhook: {
            url: cleanUrl,
            method: method === "POST" ? { POST: null } : { GET: null },
            headers,
            body: encodedBody,
          },
        }
      }

      if (!identity) {
        throw new Error("Please sign in with Internet Identity first.")
      }

      const created = await createJob(
        {
          project_id: projectId,
          label: label.trim() || "Cron Job",
          target,
          cron_expression: cronExpression,
          max_retries: [10],
        },
        identity
      )

      await invalidateCron()
      setSuccess(true)
      toast.success(`Job "${created.label}" created successfully.`)
      if (onJobCreated) {
        onJobCreated()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create cron job"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full border border-border/80 bg-card text-card-foreground shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">
            Job Configuration
          </CardTitle>
          <Badge variant="outline" className="w-fit text-xs font-mono border-border/60">
            $0.0005 / run
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-foreground">
              Select Preset Template
            </Label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleTemplateChange("discord_telegram")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleTemplateChange("discord_telegram")
                }}
                className={`flex flex-col gap-1.5 rounded-lg border p-3 text-left cursor-pointer transition-all duration-200 select-none ${
                  template === "discord_telegram"
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                    : "border-border/70 bg-card/60 hover:border-border hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                      <DiscordIcon size={14} className="size-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground truncate">
                      Telegram & Discord
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <HoverCard>
                      <HoverCardTrigger
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-help p-1 rounded-full text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                      >
                        <Icon icon={InfoGlassIcon} className="size-3.5" />
                      </HoverCardTrigger>
                      <HoverCardContent side="top" align="center" className="w-84 sm:w-96 space-y-2.5 p-3.5 text-xs bg-popover text-popover-foreground shadow-xl border border-border">
                        <div className="flex items-center justify-between border-b border-border/60 pb-2">
                          <div className="flex items-center gap-2 font-semibold text-foreground">
                            <DiscordIcon size={14} className="size-3.5" />
                            <span>Telegram &amp; Discord Setup</span>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            Webhooks
                          </span>
                        </div>
                        <div className="space-y-2 text-[11px] text-muted-foreground leading-relaxed">
                          <div>
                            <span className="font-semibold text-foreground">Discord Setup:</span>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              Server Settings &rarr; Integrations &rarr; Webhooks &rarr; New Webhook &rarr; Copy URL.
                            </div>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Telegram Endpoint:</span>
                            <div className="flex items-center justify-between gap-1.5 font-mono text-[10px] bg-muted/80 px-2 py-1 rounded border border-border/50 text-foreground mt-0.5">
                              <span className="truncate">https://api.telegram.org/bot&lt;TOKEN&gt;/sendMessage</span>
                              <CopyButton text="https://api.telegram.org/bot<TOKEN>/sendMessage" successMessage="Copied Telegram URL template" />
                            </div>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Sample Payload:</span>
                            <div className="flex items-center justify-between gap-1.5 font-mono text-[10px] bg-muted/80 px-2 py-1 rounded border border-border/50 text-foreground mt-0.5">
                              <span className="truncate">{`{"content":"Automated update from icCron"}`}</span>
                              <CopyButton text={`{"content":"Automated update from icCron"}`} successMessage="Copied sample JSON payload" />
                            </div>
                          </div>
                          <div className="pt-1 border-t border-border/50">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-foreground">AI / Cursor Prompt:</span>
                              <CopyButton
                                text="Write a TypeScript webhook payload generator for Discord and Telegram bot messages with custom embeds and markdown formatting."
                                successMessage="Copied AI prompt to clipboard"
                              />
                            </div>
                            <div className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 italic">
                              &quot;Write a TypeScript webhook payload generator for Discord and Telegram...&quot;
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    {template === "discord_telegram" && (
                      <Icon icon={CircleCheckGlassIcon} className="size-4 shrink-0 text-primary" />
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground leading-tight pl-8">
                  Community posts & alerts
                </div>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => handleTemplateChange("vercel_api")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleTemplateChange("vercel_api")
                }}
                className={`flex flex-col gap-1.5 rounded-lg border p-3 text-left cursor-pointer transition-all duration-200 select-none ${
                  template === "vercel_api"
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                    : "border-border/70 bg-card/60 hover:border-border hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                      <NextjsIcon size={14} className="size-3.5 dark:invert" />
                    </div>
                    <span className="text-xs font-semibold text-foreground truncate">
                      Vercel & Next.js
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <HoverCard>
                      <HoverCardTrigger
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-help p-1 rounded-full text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                      >
                        <Icon icon={InfoGlassIcon} className="size-3.5" />
                      </HoverCardTrigger>
                      <HoverCardContent side="top" align="center" className="w-84 sm:w-96 space-y-2.5 p-3.5 text-xs bg-popover text-popover-foreground shadow-xl border border-border">
                        <div className="flex items-center justify-between border-b border-border/60 pb-2">
                          <div className="flex items-center gap-2 font-semibold text-foreground">
                            <NextjsIcon size={14} className="size-3.5 dark:invert" />
                            <span>Vercel Cron Setup</span>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            CRON_SECRET
                          </span>
                        </div>
                        <div className="space-y-2 text-[11px] text-muted-foreground leading-relaxed">
                          <div>
                            <span className="font-semibold text-foreground">1. Generate Secret (Terminal):</span>
                            <div className="flex items-center justify-between gap-1.5 font-mono text-[10px] bg-muted/80 px-2 py-1 rounded border border-border/50 text-foreground mt-0.5">
                              <span className="truncate">openssl rand -hex 32</span>
                              <CopyButton text="openssl rand -hex 32" successMessage="Copied terminal command" />
                            </div>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">2. Add to Vercel:</span>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              Project Settings &rarr; Environment Variables &rarr; Add <code className="text-foreground font-mono">CRON_SECRET</code>.
                            </div>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">3. Next.js Guard (app/api/cron/sync/route.ts):</span>
                            <div className="flex items-center justify-between gap-1.5 font-mono text-[10px] bg-muted/80 px-2 py-1 rounded border border-border/50 text-foreground mt-0.5">
                              <span className="truncate">req.headers.get(&quot;authorization&quot;) === `Bearer ${"$"}{"{"}process.env.CRON_SECRET{"}"}`</span>
                              <CopyButton
                                text={`if (req.headers.get("authorization") !== \`Bearer \${process.env.CRON_SECRET}\`) return new Response("Unauthorized", { status: 401 });`}
                                successMessage="Copied Next.js route guard snippet"
                              />
                            </div>
                          </div>
                          <div className="pt-1.5 border-t border-border/50">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-foreground text-[11px]">AI / Cursor Prompt:</span>
                              <CopyButton
                                text="Create a protected Next.js App Router API route at app/api/cron/sync/route.ts that verifies request.headers.get('authorization') === 'Bearer ' + process.env.CRON_SECRET and executes my scheduled task."
                                successMessage="Copied AI prompt to clipboard"
                              />
                            </div>
                            <div className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 italic">
                              &quot;Create a protected Next.js App Router API route verifying Bearer CRON_SECRET...&quot;
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    {template === "vercel_api" && (
                      <Icon icon={CircleCheckGlassIcon} className="size-4 shrink-0 text-primary" />
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground leading-tight pl-8">
                  Sub-daily crons without $20/mo
                </div>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => handleTemplateChange("canister")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleTemplateChange("canister")
                }}
                className={`flex flex-col gap-1.5 rounded-lg border p-3 text-left cursor-pointer transition-all duration-200 select-none ${
                  template === "canister"
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                    : "border-border/70 bg-card/60 hover:border-border hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                      <Icon icon={CodeGlassIcon} className="size-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground truncate">
                      Canister Call
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <HoverCard>
                      <HoverCardTrigger
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-help p-1 rounded-full text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                      >
                        <Icon icon={InfoGlassIcon} className="size-3.5" />
                      </HoverCardTrigger>
                      <HoverCardContent side="top" align="center" className="w-84 sm:w-96 space-y-2.5 p-3.5 text-xs bg-popover text-popover-foreground shadow-xl border border-border">
                        <div className="flex items-center justify-between border-b border-border/60 pb-2">
                          <div className="flex items-center gap-2 font-semibold text-foreground">
                            <Icon icon={CodeGlassIcon} className="size-3.5" />
                            <span>Canister Smart Contract Setup</span>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            On-Chain
                          </span>
                        </div>
                        <div className="space-y-2 text-[11px] text-muted-foreground leading-relaxed">
                          <div>
                            <span className="font-semibold text-foreground">Target Format:</span>
                            <div className="flex items-center justify-between gap-1.5 font-mono text-[10px] bg-muted/80 px-2 py-1 rounded border border-border/50 text-foreground mt-0.5">
                              <span className="truncate">ryjl3-tyaaa-aaaaa-aaaba-cai::get_account_identifier</span>
                              <CopyButton text="ryjl3-tyaaa-aaaaa-aaaba-cai::get_account_identifier" successMessage="Copied sample target format" />
                            </div>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Motoko Trigger Method:</span>
                            <div className="flex items-center justify-between gap-1.5 font-mono text-[10px] bg-muted/80 px-2 py-1 rounded border border-border/50 text-foreground mt-0.5">
                              <span className="truncate">public shared func cronTrigger() : async ()</span>
                              <CopyButton text="public shared ({ caller }) func cronTrigger() : async () { return; }" successMessage="Copied Motoko snippet" />
                            </div>
                          </div>
                          <div className="pt-1.5 border-t border-border/50">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-foreground text-[11px]">AI / Motoko Prompt:</span>
                              <CopyButton
                                text="Write a secure Motoko canister method that can be triggered periodically by an autonomous ICP timer with caller verification and zero cycles drain."
                                successMessage="Copied AI prompt to clipboard"
                              />
                            </div>
                            <div className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 italic">
                              &quot;Write a secure Motoko canister method triggered periodically by autonomous ICP timer...&quot;
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    {template === "canister" && (
                      <Icon icon={CircleCheckGlassIcon} className="size-4 shrink-0 text-primary" />
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground leading-tight pl-8">
                  On-chain smart contracts
                </div>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => handleTemplateChange("custom")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleTemplateChange("custom")
                }}
                className={`flex flex-col gap-1.5 rounded-lg border p-3 text-left cursor-pointer transition-all duration-200 select-none ${
                  template === "custom"
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                    : "border-border/70 bg-card/60 hover:border-border hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                      <Icon icon={SettingsGlassIcon} className="size-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground truncate">
                      Custom Webhook
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <HoverCard>
                      <HoverCardTrigger
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-help p-1 rounded-full text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                      >
                        <Icon icon={InfoGlassIcon} className="size-3.5" />
                      </HoverCardTrigger>
                      <HoverCardContent side="top" align="center" className="w-84 sm:w-96 space-y-2.5 p-3.5 text-xs bg-popover text-popover-foreground shadow-xl border border-border">
                        <div className="flex items-center justify-between border-b border-border/60 pb-2">
                          <div className="flex items-center gap-2 font-semibold text-foreground">
                            <Icon icon={SettingsGlassIcon} className="size-3.5" />
                            <span>Custom Webhook Guide</span>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            HTTP Outcall
                          </span>
                        </div>
                        <div className="space-y-2 text-[11px] text-muted-foreground leading-relaxed">
                          <div>
                            <span className="font-semibold text-foreground">cURL Test Command:</span>
                            <div className="flex items-center justify-between gap-1.5 font-mono text-[10px] bg-muted/80 px-2 py-1 rounded border border-border/50 text-foreground mt-0.5">
                              <span className="truncate">curl -X POST https://api.example.com/webhook ...</span>
                              <CopyButton text={`curl -X POST https://api.example.com/webhook -H "Content-Type: application/json" -d '{"cron":"ping"}'`} successMessage="Copied cURL command" />
                            </div>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Sample Auth Header:</span>
                            <div className="flex items-center justify-between gap-1.5 font-mono text-[10px] bg-muted/80 px-2 py-1 rounded border border-border/50 text-foreground mt-0.5">
                              <span className="truncate">Authorization: Bearer your_api_secret</span>
                              <CopyButton text="Bearer your_api_secret_here" successMessage="Copied auth header sample" />
                            </div>
                          </div>
                          <div className="pt-1.5 border-t border-border/50">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-foreground text-[11px]">AI / Webhook Prompt:</span>
                              <CopyButton
                                text="Write a resilient webhook handler in TypeScript that verifies incoming cron payloads, handles idempotency, and logs execution timing."
                                successMessage="Copied AI prompt to clipboard"
                              />
                            </div>
                            <div className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 italic">
                              &quot;Write a resilient webhook handler in TypeScript that verifies incoming cron payloads...&quot;
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    {template === "custom" && (
                      <Icon icon={CircleCheckGlassIcon} className="size-4 shrink-0 text-primary" />
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground leading-tight pl-8">
                  Any URL, headers, and body
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="job-label" className="text-xs font-medium text-foreground">
              {t("jobLabel")}
            </Label>
            <Input
              id="job-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Daily Community Broadcast"
              className="text-sm bg-background border-border"
              required
            />
          </div>

          {template === "canister" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="canister-target" className="text-xs font-medium text-foreground">
                Canister Target (<span className="font-mono text-muted-foreground">&lt;canister_id&gt;::&lt;method_name&gt;</span>)
              </Label>
              <Input
                id="canister-target"
                value={canisterTarget}
                onChange={(e) => setCanisterTarget(e.target.value)}
                placeholder="ryjl3-tyaaa-aaaaa-aaaba-cai::get_account_identifier"
                className="font-mono text-sm bg-background border-border"
                required
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {template === "discord_telegram" ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="webhook-url" className="text-xs font-medium text-foreground">
                      Telegram or Discord Webhook URL
                    </Label>
                    <Badge variant="outline" className="text-[10px] font-mono border-border/70 text-primary">
                      POST (JSON)
                    </Badge>
                  </div>
                  <Input
                    id="webhook-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/... or https://api.telegram.org/bot<TOKEN>/sendMessage"
                    className="font-mono text-sm bg-background border-border"
                    required
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <div className="sm:col-span-1 flex flex-col gap-2">
                    <Label htmlFor="http-method" className="text-xs font-medium text-foreground">
                      Method
                    </Label>
                    <NativeSelect
                      id="http-method"
                      value={method}
                      onChange={(e) => setMethod(e.target.value as "GET" | "POST")}
                      className="w-full bg-background border-border text-sm"
                    >
                      <NativeSelectOption value="GET">GET</NativeSelectOption>
                      <NativeSelectOption value="POST">POST</NativeSelectOption>
                    </NativeSelect>
                  </div>

                  <div className="sm:col-span-3 flex flex-col gap-2">
                    <Label htmlFor="webhook-url" className="text-xs font-medium text-foreground">
                      Destination Webhook URL
                    </Label>
                    <Input
                      id="webhook-url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://my-app.vercel.app/api/cron/sync"
                      className="font-mono text-sm bg-background border-border"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auth-header" className="text-xs font-medium text-foreground">
                    Authorization Header (Optional)
                  </Label>
                  {template === "vercel_api" && (
                    <span className="text-[11px] text-muted-foreground">
                      Protects your Next.js route with <code className="text-foreground">CRON_SECRET</code>
                    </span>
                  )}
                </div>
                <Input
                  id="auth-header"
                  value={authHeader}
                  onChange={(e) => setAuthHeader(e.target.value)}
                  placeholder="Bearer your_secret_token_here"
                  className="font-mono text-sm bg-background border-border"
                />
              </div>

              {method === "POST" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="json-body" className="text-xs font-medium text-foreground">
                      JSON Payload Body
                    </Label>
                    <span className="text-[11px] text-muted-foreground">
                      Auto-sets Content-Type: application/json
                    </span>
                  </div>
                  <Textarea
                    id="json-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    placeholder='{"content": "Automated update message"}'
                    className="font-mono text-xs bg-background border-border"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2 border-t border-border/60">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Icon icon={ClockGlassIcon} className="size-3.5 text-primary" />
                Schedule & Frequency
              </Label>
              <div className="text-xs font-mono text-muted-foreground">
                Cron: <span className="text-foreground font-semibold">{cronExpression}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {activeShortcuts.map((sc) => (
                <Button
                  key={sc.value}
                  type="button"
                  variant={commonPreset === sc.value && !showCustomDropdowns ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    applySchedule(sc.value)
                    if (isPlatformPreset) {
                      setShowCustomDropdowns(false)
                    }
                  }}
                  className="h-7 text-[11px] px-2.5 rounded-full"
                >
                  {sc.label}
                </Button>
              ))}

              {isPlatformPreset && (
                <Button
                  type="button"
                  variant={showCustomDropdowns ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowCustomDropdowns(!showCustomDropdowns)}
                  className="h-7 text-[11px] px-2.5 rounded-full text-muted-foreground hover:text-foreground"
                >
                  {showCustomDropdowns ? "Hide custom dropdowns" : "Custom expression..."}
                </Button>
              )}
            </div>

            {(!isPlatformPreset || showCustomDropdowns) && (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mt-1 transition-all duration-200">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="select-minute" className="text-[11px] font-medium text-muted-foreground">
                    {t("minute")}
                  </Label>
                  <NativeSelect
                    id="select-minute"
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    className="w-full text-xs bg-background border-border"
                  >
                    {MINUTE_OPTIONS.map((opt) => (
                      <NativeSelectOption key={opt.value} value={opt.value}>
                        {opt.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="select-hour" className="text-[11px] font-medium text-muted-foreground">
                    {t("hour")}
                  </Label>
                  <NativeSelect
                    id="select-hour"
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                    className="w-full text-xs bg-background border-border"
                  >
                    {HOUR_OPTIONS.map((opt) => (
                      <NativeSelectOption key={opt.value} value={opt.value}>
                        {opt.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="select-day" className="text-[11px] font-medium text-muted-foreground">
                    {t("day")}
                  </Label>
                  <NativeSelect
                    id="select-day"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full text-xs bg-background border-border"
                  >
                    {DAY_OPTIONS.map((opt) => (
                      <NativeSelectOption key={opt.value} value={opt.value}>
                        {opt.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="select-month" className="text-[11px] font-medium text-muted-foreground">
                    {t("month")}
                  </Label>
                  <NativeSelect
                    id="select-month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full text-xs bg-background border-border"
                  >
                    {MONTH_OPTIONS.map((opt) => (
                      <NativeSelectOption key={opt.value} value={opt.value}>
                        {opt.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="select-weekday" className="text-[11px] font-medium text-muted-foreground">
                    {t("weekday")}
                  </Label>
                  <NativeSelect
                    id="select-weekday"
                    value={weekday}
                    onChange={(e) => setWeekday(e.target.value)}
                    className="w-full text-xs bg-background border-border"
                  >
                    {WEEKDAY_OPTIONS.map((opt) => (
                      <NativeSelectOption key={opt.value} value={opt.value}>
                        {opt.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="min-w-32 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? <Spinner data-icon="inline-start" /> : null}
              <span>{t("save")}</span>
            </Button>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
              Cron job successfully created and scheduled on-chain!
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
