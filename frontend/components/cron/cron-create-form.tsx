"use client"

import * as React from "react"
import { Principal } from "@icp-sdk/core/principal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import { createJob } from "@/services/cron/client"
import type { RemoteJobTarget } from "@/services/cron/types"
import {
  COMMON_PRESETS,
  MINUTE_OPTIONS,
  HOUR_OPTIONS,
  DAY_OPTIONS,
  MONTH_OPTIONS,
  WEEKDAY_OPTIONS,
} from "./cron-types"

interface CronCreateFormProps {
  projectId: bigint
  onJobCreated?: () => void
}

export function CronCreateForm({ projectId, onJobCreated }: CronCreateFormProps) {
  const [jobType, setJobType] = React.useState<"php" | "custom" | "canister">("custom")
  const [command, setCommand] = React.useState(
    "wget -O /dev/null https://commandosecurity.com.np/wp-cron.php/"
  )
  const [label, setLabel] = React.useState("My Cron Job")

  const [commonPreset, setCommonPreset] = React.useState("")
  const [minute, setMinute] = React.useState("*")
  const [hour, setHour] = React.useState("*")
  const [day, setDay] = React.useState("*")
  const [month, setMonth] = React.useState("*")
  const [weekday, setWeekday] = React.useState("*")

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const cronExpression = React.useMemo(() => {
    return `${minute} ${hour} ${day} ${month} ${weekday}`.trim()
  }, [minute, hour, day, month, weekday])

  const handlePresetChange = (presetValue: string) => {
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
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim()) {
      setError("Please specify a command or URL to execute.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      let target: RemoteJobTarget

      if (jobType === "canister") {
        const [canisterStr, method] = command.split("::")
        if (!canisterStr || !method) {
          throw new Error("Canister target format must be: <canister_id>::<method_name>")
        }
        target = {
          CanisterCall: {
            canister_id: Principal.fromText(canisterStr.trim()),
            method: method.trim(),
            payload: new Uint8Array(),
          },
        }
      } else {
        let cleanUrl = command.trim()
        if (cleanUrl.startsWith("wget -O /dev/null ")) {
          cleanUrl = cleanUrl.replace("wget -O /dev/null ", "").trim()
        }
        if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
          cleanUrl = `https://${cleanUrl}`
        }

        target = {
          HttpWebhook: {
            url: cleanUrl,
            method: { GET: null },
            headers: [["User-Agent", "icCron/1.0"]],
            body: [],
          },
        }
      }

      await createJob({
        project_id: projectId,
        label: label.trim() || "Cron Job",
        target,
        cron_expression: cronExpression,
        max_retries: [10],
      })

      setSuccess(true)
      if (onJobCreated) {
        onJobCreated()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create cron job")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border border-border/80 bg-card text-card-foreground shadow-xs">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          Create a New Cron Job
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="jobType"
                value="php"
                checked={jobType === "php"}
                onChange={() => {
                  setJobType("php")
                  setCommand("wget -O /dev/null https://commandosecurity.com.np/wp-cron.php/")
                }}
                className="size-4 accent-primary"
              />
              <span className="font-medium">PHP</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="jobType"
                value="custom"
                checked={jobType === "custom"}
                onChange={() => setJobType("custom")}
                className="size-4 accent-primary"
              />
              <span className="font-medium">Custom</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="jobType"
                value="canister"
                checked={jobType === "canister"}
                onChange={() => {
                  setJobType("canister")
                  setCommand("ryjl3-tyaaa-aaaaa-aaaba-cai::get_account_identifier")
                }}
                className="size-4 accent-primary"
              />
              <span className="font-medium">Canister Call</span>
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="job-label" className="text-sm font-medium text-foreground">
              Job Name / Label
            </Label>
            <Input
              id="job-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Sync Balances"
              className="text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="command" className="text-sm font-medium text-foreground">
              Command to Run
            </Label>
            <Input
              id="command"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="wget -O /dev/null https://commandosecurity.com.np/wp-cron.php/"
              className="font-mono text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="job-label" className="text-sm font-medium text-foreground">
              Job Name / Label
            </Label>
            <Input
              id="job-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Sync Balances"
              className="text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="common-options" className="text-sm font-medium text-foreground">
              Common Options
            </Label>
            <NativeSelect
              id="common-options"
              value={commonPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full"
            >
              {COMMON_PRESETS.map((opt) => (
                <NativeSelectOption key={opt.value} value={opt.value}>
                  {opt.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="select-minute" className="text-sm font-medium text-muted-foreground">
                Minute
              </Label>
              <NativeSelect
                id="select-minute"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="w-full"
              >
                {MINUTE_OPTIONS.map((opt) => (
                  <NativeSelectOption key={opt.value} value={opt.value}>
                    {opt.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="select-hour" className="text-sm font-medium text-muted-foreground">
                Hour
              </Label>
              <NativeSelect
                id="select-hour"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-full"
              >
                {HOUR_OPTIONS.map((opt) => (
                  <NativeSelectOption key={opt.value} value={opt.value}>
                    {opt.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="select-day" className="text-sm font-medium text-muted-foreground">
                Day
              </Label>
              <NativeSelect
                id="select-day"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full"
              >
                {DAY_OPTIONS.map((opt) => (
                  <NativeSelectOption key={opt.value} value={opt.value}>
                    {opt.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="select-month" className="text-sm font-medium text-muted-foreground">
                Month
              </Label>
              <NativeSelect
                id="select-month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full"
              >
                {MONTH_OPTIONS.map((opt) => (
                  <NativeSelectOption key={opt.value} value={opt.value}>
                    {opt.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="select-weekday" className="text-sm font-medium text-muted-foreground">
                Weekday
              </Label>
              <NativeSelect
                id="select-weekday"
                value={weekday}
                onChange={(e) => setWeekday(e.target.value)}
                className="w-full"
              >
                {WEEKDAY_OPTIONS.map((opt) => (
                  <NativeSelectOption key={opt.value} value={opt.value}>
                    {opt.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs font-mono text-muted-foreground">
              Expression: <span className="text-foreground font-semibold">{cronExpression}</span>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="min-w-28 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? <Spinner className="size-4" /> : "Save"}
            </Button>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
              Cron job successfully created and armed in on-chain scheduler!
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
