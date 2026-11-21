"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ConnectIcon,
  InformationCircleIcon,
  Link01Icon,
  PencilEdit01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CopyButton } from "@/components/ui/copy-button"

import { MyCanisterControls } from "@/components/canister/details/my-canister-controls"
import { SubnetCountryFlags } from "@/components/canister/subnet-country-flags"
import { SnapshotsCard } from "@/components/canister/details/snapshots-card"
import { CanisterLogsCard } from "@/components/canister/details/canister-logs-card"
import { CanisterRadialChart } from "@/components/canister/details/canister-radial-chart"
import { CanisterSettingsView } from "@/components/canister/settings"
import { ConnectControllerDialog } from "@/components/canister/connect-controller-dialog"
import { RenameCanisterDialog } from "@/components/canister/details/rename-canister-dialog"
import { CanisterAuditLogCard } from "@/components/canister/details/canister-audit-log-card"
import { AssetExplorerCard } from "@/components/canister/details/asset-explorer-card"
import { CanisterVisitMenu } from "@/components/canister/details/canister-visit-menu"

import { useAuth } from "@/components/auth/auth-provider"
import type { CanisterStatusState } from "@/hooks/canister/useCanisterStatus"
import type { ControlledCanister } from "@/services/canister/controlledCanisters"
import { fetchSubnetIndexDetail } from "@/services/canister/controlledCanisters"
import { shortSubnetId } from "@/services/canister/subnetLocations"
import { shortCanisterId } from "@/lib/canister/savedCanisters"
import { cn } from "@/lib/ui/utils"

function shortHash(hash: string): string {
  const h = hash.trim()
  if (h.length <= 16) return h
  return `${h.slice(0, 8)}…${h.slice(-8)}`
}

function runwayTone(days: number | null): string {
  if (days === null) return "text-muted-foreground font-medium"
  if (days < 7) return "text-destructive font-semibold"
  if (days < 30) return "text-amber-500 font-medium"
  return "text-foreground font-medium"
}

export type CanisterDetailTab = "overview" | "logs" | "settings" | "snapshots" | "audit" | "assets"

export function MyCanisterDetails({
  canisterId,
  localName,
  meta,
  status,
  onRefresh,
  defaultTab = "overview",
  activeSection = "controllers",
  onTabChange,
  onSectionChange,
}: {
  canisterId: string
  localName: string
  meta: ControlledCanister | null
  status: CanisterStatusState
  onCopyId?: () => void
  onRefresh: () => void
  defaultTab?: CanisterDetailTab
  activeSection?: string
  onTabChange?: (tab: CanisterDetailTab) => void
  onSectionChange?: (section: string) => void
}) {
  const t = useTranslations("myCanisters")
  const { identity } = useAuth()
  const principal = identity?.getPrincipal().toText() ?? null
  const [internalTab, setInternalTab] = useState<string>(defaultTab)
  const [technicalOpen, setTechnicalOpen] = useState(true)
  const [connectOpen, setConnectOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [overrideName, setOverrideName] = useState<string | null>(null)

  const activeTab = onTabChange ? defaultTab : internalTab

  const handleTabSelect = (tab: string) => {
    if (!onTabChange) setInternalTab(tab)
    onTabChange?.(tab as CanisterDetailTab)
  }

  const { data: subnet } = useSWR(
    meta?.subnetId ? (["subnet-index", meta.subnetId] as const) : null,
    ([, id]) => fetchSubnetIndexDetail(id),
    { revalidateOnFocus: false, dedupingInterval: 300_000 }
  )

  const displayName = overrideName || localName || meta?.name || shortCanisterId(canisterId)
  const isController = status.kind === "ok" && status.data.isController
  const runStatus = status.kind === "ok" ? status.data.runStatus : null

  const cyclesParts = useMemo(() => {
    if (status.kind !== "ok") return { number: "—", unit: "" }
    const match = status.data.cyclesLabel.match(/^([\d.]+)\s*(.*)$/)
    if (match) {
      return { number: match[1], unit: match[2] }
    }
    return { number: status.data.cyclesLabel, unit: "" }
  }, [status])

  const daysLeft = useMemo(() => {
    if (
      status.kind !== "ok" ||
      !status.data.idleCyclesBurnedPerDay ||
      status.data.idleCyclesBurnedPerDay === 0n
    ) {
      return null
    }
    const days = Number(status.data.cycles / status.data.idleCyclesBurnedPerDay)
    return days > 0 ? days : null
  }, [status])

  const reserveFormatted = useMemo(() => {
    if (status.kind !== "ok") return null
    if (
      status.data.freezingThresholdSeconds &&
      status.data.freezingThresholdSeconds >= 86400n
    ) {
      const days = Number(status.data.freezingThresholdSeconds / 86400n)
      return `${status.data.freezingThreshold} (${days}d)`
    }
    return status.data.freezingThreshold || null
  }, [status])

  const moduleHash =
    (status.kind === "ok" && status.data.moduleHash !== "—"
      ? status.data.moduleHash
      : meta?.moduleHash) || "—"

  const versionDisplay =
    status.kind === "ok" && status.data.version && status.data.version !== "—"
      ? `v${status.data.version}`
      : "—"

  const controllers = useMemo(() => {
    if (status.kind === "ok" && status.data.controllers.length > 0) {
      return status.data.controllers
    }
    return meta?.controllers ?? []
  }, [status, meta])

  const settingsData = useMemo(() => {
    if (status.kind !== "ok") return null
    return {
      ...status.data,
      controllers:
        status.data.controllers.length > 0
          ? status.data.controllers
          : (meta?.controllers ?? []),
    }
  }, [status, meta])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1
              onClick={() => setRenameOpen(true)}
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl cursor-pointer hover:opacity-85 transition-opacity"
              title="Click to rename"
            >
              {displayName}
            </h1>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setRenameOpen(true)}
              className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Edit canister name"
            >
              <HugeiconsIcon icon={PencilEdit01Icon} className="size-4" strokeWidth={1.75} />
            </Button>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 px-2.5 py-1 font-mono text-xs text-muted-foreground">
            <span>{canisterId}</span>
            <CopyButton
              value={canisterId}
              aria-label={t("copyId")}
              className="size-5 p-0 text-muted-foreground hover:bg-transparent hover:text-foreground cursor-pointer"
              iconClassName="size-3.5"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {status.kind === "ok" ? (
            <>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground mr-0.5">
                <span
                  className={cn(
                    "size-2 rounded-full shrink-0",
                    runStatus === "running"
                      ? "bg-success"
                      : runStatus === "stopped"
                        ? "bg-muted-foreground"
                        : "bg-destructive"
                  )}
                />
                <span className="capitalize">{runStatus ?? "Unknown"}</span>
              </div>

              <CanisterVisitMenu canisterId={canisterId} />

              <MyCanisterControls
                canisterId={canisterId}
                status={status}
                onRefresh={onRefresh}
                onConnect={() => setConnectOpen(true)}
                onSelectTab={handleTabSelect}
                topupVariant={activeTab === "assets" || activeTab === "settings" ? "outline" : "default"}
              />
            </>
          ) : status.kind === "loading" ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground mr-0.5">
                <span className="size-2 rounded-full shrink-0 bg-muted-foreground/60" />
                <span>{status.kind === "denied" ? "Connected" : "Unavailable"}</span>
              </div>
              <CanisterVisitMenu canisterId={canisterId} />
              <MyCanisterControls
                canisterId={canisterId}
                status={status}
                onRefresh={onRefresh}
                onConnect={() => setConnectOpen(true)}
                onSelectTab={handleTabSelect}
                topupVariant={activeTab === "assets" || activeTab === "settings" ? "outline" : "default"}
              />
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabSelect} className="space-y-4">
        <div className="md:hidden">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview" className="cursor-pointer text-xs">
              Overview
            </TabsTrigger>
            <TabsTrigger value="logs" className="cursor-pointer text-xs">
              Logs
            </TabsTrigger>
            <TabsTrigger value="settings" className="cursor-pointer text-xs">
              Settings
            </TabsTrigger>
            <TabsTrigger value="snapshots" className="cursor-pointer text-xs">
              Snapshots
            </TabsTrigger>
            <TabsTrigger value="audit" className="cursor-pointer text-xs">
              Audit
            </TabsTrigger>
            <TabsTrigger value="assets" className="cursor-pointer text-xs">
              Assets
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <Card className="overflow-hidden py-0 gap-0">
            <CardHeader className="flex flex-row items-center justify-between px-5 py-3.5 border-b border-border/40">
              <div className="flex items-center justify-between w-full">
                <div className="space-y-0.5">
                  <CardTitle className="text-sm font-semibold text-foreground">Cycles Balance & Memory</CardTitle>
                  <CardDescription className="text-xs">
                    {t("fuelSubtitle")}
                  </CardDescription>
                </div>
                <HoverCard>
                  <HoverCardTrigger className="cursor-help inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <HugeiconsIcon icon={InformationCircleIcon} className="size-3.5 text-muted-foreground/70" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 space-y-2 text-xs">
                    <p className="font-semibold text-foreground">Canister Execution & Fuel</p>
                    <p className="text-muted-foreground">
                      {t("fuelDescription")}
                    </p>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 shrink-0">
                  {status.kind === "ok" ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-semibold tracking-tight text-foreground tabular-nums sm:text-5xl">
                        {cyclesParts.number}
                      </span>
                      {cyclesParts.unit ? (
                        <span className="text-xl font-medium text-muted-foreground sm:text-2xl">
                          {cyclesParts.unit}
                        </span>
                      ) : null}
                    </div>
                  ) : status.kind === "loading" ? (
                    <Skeleton className="h-12 w-48 rounded-lg" />
                  ) : (
                    <div className="space-y-1">
                      <p className="text-2xl font-semibold text-muted-foreground">—</p>
                      <p className="text-xs text-muted-foreground">
                        {status.kind === "denied"
                          ? "Private on-chain · Only controllers can query live cycles and memory."
                          : "Unable to retrieve status from canister."}
                      </p>
                    </div>
                  )}

                  {status.kind === "ok" && (
                    <p className="text-xs text-muted-foreground tabular-nums flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span>Burns {status.data.idleBurnLabel.replace(" / day", "/day")}</span>
                      {daysLeft !== null && (
                        <>
                          <span className="text-border">·</span>
                          <span className={runwayTone(daysLeft)}>
                            {t("daysLeft", { days: daysLeft.toLocaleString() })}
                          </span>
                          <span>{t("runwayIdleBurn")}</span>
                        </>
                      )}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 max-w-sm">
                  <div className="rounded-lg border border-border/40 bg-muted/20 p-3 space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">{t("stableMemoryTitle")}</p>
                    <p className="text-base font-semibold text-foreground font-mono tabular-nums">
                      {status.kind === "ok" ? status.data.stableMemory : "—"}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 truncate">{t("stableMemorySubtitle")}</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-muted/20 p-3 space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">{t("snapshotsTitle")}</p>
                    <p className="text-base font-semibold text-foreground font-mono tabular-nums">
                      {status.kind === "ok" ? status.data.snapshotsSize : "—"}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 truncate">{t("snapshotsSubtitle")}</p>
                  </div>
                </div>

                <CanisterRadialChart status={status.kind === "ok" ? status.data : undefined} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <HoverCard>
                  <HoverCardTrigger className="cursor-help inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors">
                    <CardTitle className="text-sm font-semibold">Subnet</CardTitle>
                    <HugeiconsIcon icon={InformationCircleIcon} className="size-3.5 text-muted-foreground/70" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 space-y-2 text-xs">
                    <p className="font-semibold text-foreground">Internet Computer Subnet</p>
                    <p className="text-muted-foreground">
                      Subnets are autonomous blockchains formed by independent data centers across multiple nations executing canisters in parallel.
                    </p>
                  </HoverCardContent>
                </HoverCard>

                <CardDescription className="text-xs">
                  {meta?.canisterType || subnet?.subnetType || "application"} subnet ·{" "}
                  {subnet ? `${subnet.upNodes} / ${subnet.totalNodes || subnet.upNodes} nodes up` : `${meta?.nodeCount || 13} nodes up`}
                  {subnet && subnet.runningCanisters > 0
                    ? ` · ${subnet.runningCanisters.toLocaleString()} canisters running, ${subnet.stoppedCanisters.toLocaleString()} stopped`
                    : ""}
                </CardDescription>
              </div>

              {meta?.subnetId ? (
                <HoverCard>
                  <HoverCardTrigger className="cursor-pointer">
                    <span className="rounded-lg border border-border/40 bg-muted/40 px-2.5 py-1 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                      {shortSubnetId(meta.subnetId)}
                    </span>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 space-y-2 text-xs">
                    <p className="font-semibold text-foreground">Subnet Identifier</p>
                    <p className="break-all font-mono text-[11px] text-muted-foreground">{meta.subnetId}</p>
                    <a
                      href={`https://dashboard.internetcomputer.org/subnet/${meta.subnetId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline pt-1"
                    >
                      <span>View subnet on explorer</span>
                      <HugeiconsIcon icon={Link01Icon} className="size-3" />
                    </a>
                  </HoverCardContent>
                </HoverCard>
              ) : null}
            </CardHeader>
            {meta && meta.countries && meta.countries.length > 0 ? (
              <CardContent className="pt-0">
                <SubnetCountryFlags countries={meta.countries} max={8} />
              </CardContent>
            ) : null}
          </Card>

          <Card>
            <Collapsible
              open={technicalOpen}
              onOpenChange={setTechnicalOpen}
              className="overflow-hidden"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between p-5 text-left hover:bg-muted/10 transition-colors cursor-pointer">
                <span className="text-sm font-semibold text-foreground">Technical details</span>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  className={cn("size-4 text-muted-foreground transition-transform duration-200", !technicalOpen && "-rotate-90")}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t border-border/40 p-5 space-y-4">
                <dl className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Canister Version</dt>
                    <dd className="font-mono font-medium text-foreground">{versionDisplay}</dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Module Hash</dt>
                    <dd className="flex items-center gap-1.5 font-mono text-muted-foreground">
                      {moduleHash !== "—" ? (
                        <>
                          <span>{shortHash(moduleHash)}</span>
                          <CopyButton
                            value={moduleHash}
                            aria-label="Copy module hash"
                            className="size-5 p-0 text-muted-foreground hover:bg-transparent hover:text-foreground cursor-pointer"
                            iconClassName="size-3"
                          />
                        </>
                      ) : (
                        <span>—</span>
                      )}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Freezing Threshold</dt>
                    <dd className="font-medium text-foreground">
                      {status.kind === "ok" && status.data.freezingThreshold !== "—"
                        ? reserveFormatted || status.data.freezingThreshold
                        : !isController
                          ? "Requires controller"
                          : "—"}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Compute Allocation</dt>
                    <dd className="font-medium text-foreground">
                      {status.kind === "ok" && status.data.computeAllocation !== "—"
                        ? status.data.computeAllocation
                        : !isController
                          ? "Requires controller"
                          : "—"}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Memory Allocation</dt>
                    <dd className="font-medium text-foreground">
                      {status.kind === "ok" && status.data.memoryAllocation !== "—"
                        ? status.data.memoryAllocation
                        : !isController
                          ? "Requires controller"
                          : "—"}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Snapshots Size</dt>
                    <dd className="font-medium text-foreground">
                      {status.kind === "ok" && status.data.snapshotsSize !== "—"
                        ? status.data.snapshotsSize
                        : !isController
                          ? "Requires controller"
                          : "—"}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Idle Burn Rate</dt>
                    <dd className="font-medium text-foreground">
                      {status.kind === "ok" && status.data.idleBurnLabel !== "—"
                        ? status.data.idleBurnLabel
                        : !isController
                          ? "Requires controller"
                          : "—"}
                    </dd>
                  </div>

                  {meta?.language ? (
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Language / Framework</dt>
                      <dd className="font-medium capitalize text-foreground">{meta.language}</dd>
                    </div>
                  ) : null}

                  {meta?.updatedAt ? (
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Last Modified</dt>
                      <dd className="text-foreground">{new Date(meta.updatedAt).toLocaleString()}</dd>
                    </div>
                  ) : null}

                  {controllers.length > 0 && (
                    <div className="border-t border-border/40 pt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">Controllers ({controllers.length})</dt>
                        <Button
                          variant="link"
                          size="sm"
                          type="button"
                          onClick={() => handleTabSelect("settings")}
                          className="h-auto p-0 inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
                        >
                          <HugeiconsIcon icon={Settings02Icon} className="size-3" />
                          <span>Manage in Settings</span>
                        </Button>
                      </div>
                      <div className="space-y-1.5">
                        {controllers.map((ctrl) => {
                          const isYou = principal === ctrl
                          return (
                            <div
                              key={ctrl}
                              className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/20 px-2.5 py-1.5 font-mono text-[11px]"
                            >
                              <span className="truncate text-muted-foreground">{ctrl}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                {isYou && (
                                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                                    You
                                  </Badge>
                                )}
                                <CopyButton
                                  value={ctrl}
                                  aria-label="Copy controller principal"
                                  className="size-5 p-0 text-muted-foreground hover:bg-transparent hover:text-foreground cursor-pointer"
                                  iconClassName="size-3"
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </dl>

                <div className="border-t border-border/40 pt-3 flex justify-between items-center">
                  <span className="text-[11px] text-muted-foreground">Explorer data</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs gap-1.5 cursor-pointer"
                    nativeButton={false}
                    render={
                      <a
                        href={`https://dashboard.internetcomputer.org/canister/${canisterId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <HugeiconsIcon icon={Link01Icon} className="size-3.5" />
                    <span>{t("dashboard")}</span>
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <CanisterLogsCard
            canisterId={canisterId}
            isController={isController}
            logVisibility={status.kind === "ok" ? status.data.logVisibility : undefined}
            onSelectTab={handleTabSelect}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {settingsData ? (
            <CanisterSettingsView
              key={canisterId}
              canisterId={canisterId}
              data={settingsData}
              isController={isController}
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              onRefresh={onRefresh}
            />
          ) : status.kind === "loading" ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ) : (
            <Card className="p-8 text-center space-y-3">
              <div className="flex size-10 mx-auto items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
                <HugeiconsIcon icon={InformationCircleIcon} className="size-5" />
              </div>
              <CardTitle className="text-sm font-semibold">
                {status.kind === "denied" ? "Controller Access Required" : "Canister Settings Unavailable"}
              </CardTitle>
              <CardDescription className="max-w-md mx-auto text-xs leading-relaxed">
                {status.kind === "denied"
                  ? "Your current Internet Identity is not registered as a controller of this canister. On the Internet Computer, only authorized controllers can configure controllers, compute allocations, and lifecycle settings."
                  : "Unable to query canister settings from the Internet Computer management canister."}
              </CardDescription>
              <CardContent className="pt-2 flex justify-center items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setConnectOpen(true)}
                  className="cursor-pointer gap-1.5"
                >
                  <HugeiconsIcon icon={ConnectIcon} className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                  <span>Connect as Controller</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  render={
                    <a
                      href={`https://dashboard.internetcomputer.org/canister/${canisterId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                  className="cursor-pointer gap-1.5"
                >
                  <HugeiconsIcon icon={Link01Icon} className="size-3.5" />
                  <span>View on IC Dashboard</span>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="snapshots" className="space-y-4">
          <SnapshotsCard canisterId={canisterId} embedded isController={isController} />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <CanisterAuditLogCard canisterId={canisterId} />
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <AssetExplorerCard canisterId={canisterId} isController={Boolean(isController)} />
        </TabsContent>
      </Tabs>

      <ConnectControllerDialog
        open={connectOpen}
        onOpenChange={setConnectOpen}
        principal={principal}
        initialCanisterId={canisterId}
        canisters={[{ id: canisterId, name: displayName }]}
      />

      <RenameCanisterDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        canisterId={canisterId}
        currentName={displayName}
        onSuccess={(newName) => setOverrideName(newName)}
      />
    </div>
  )
}
