"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { useTranslations } from "next-intl"
import { toast } from "@/components/ui/toast"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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
import { CanisterSnapshotsGuide } from "@/components/canister/details/canister-snapshots-guide"
import { SnapshotsCard } from "@/components/canister/details/snapshots-card"
import { CanisterLogsCard } from "@/components/canister/details/canister-logs-card"
import { CanisterSettingsView } from "@/components/canister/settings"
import { ConnectControllerDialog } from "@/components/canister/connect-controller-dialog"
import { RenameCanisterDialog } from "@/components/canister/details/rename-canister-dialog"

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

export type CanisterDetailTab = "overview" | "logs" | "settings" | "snapshots"

export function MyCanisterDetails({
  canisterId,
  localName,
  meta,
  status,
  onRefresh,
  defaultTab = "overview",
  onTabChange,
}: {
  canisterId: string
  localName: string
  meta: ControlledCanister | null
  status: CanisterStatusState
  onCopyId?: () => void
  onRefresh: () => void
  defaultTab?: CanisterDetailTab
  onTabChange?: (tab: CanisterDetailTab) => void
}) {
  const t = useTranslations("myCanisters")
  const { identity } = useAuth()
  const principal = identity?.getPrincipal().toText() ?? null
  const [activeTab, setActiveTab] = useState<string>(defaultTab)
  const [technicalOpen, setTechnicalOpen] = useState(true)
  const [connectOpen, setConnectOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [overrideName, setOverrideName] = useState<string | null>(null)

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab)
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

  const formatMetricDisplay = (val: string | undefined) => {
    if (status.kind !== "ok") {
      return <p className="text-xl font-bold tracking-tight text-foreground tabular-nums">—</p>
    }
    if (val && val !== "—") {
      return <p className="text-xl font-bold tracking-tight text-foreground tabular-nums">{val}</p>
    }
    if (!isController) {
      return <p className="text-xs font-medium text-muted-foreground pt-1">Requires controller</p>
    }
    return <p className="text-xl font-bold tracking-tight text-foreground tabular-nums">—</p>
  }

  return (
    <div className="space-y-5">
      <Breadcrumb className="mb-1">
        <BreadcrumbList className="text-xs">
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/canister" />}>Canisters</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" strokeWidth={1.75} />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="truncate max-w-[200px] sm:max-w-none">
              {displayName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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

        <div className="flex flex-wrap items-center gap-3">
          {status.kind === "ok" ? (
            <>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
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

              <MyCanisterControls
                canisterId={canisterId}
                status={status}
                onRefresh={onRefresh}
                onConnect={() => setConnectOpen(true)}
                onSelectTab={handleTabSelect}
              />
            </>
          ) : status.kind === "loading" ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span className="size-2 rounded-full shrink-0 bg-muted-foreground/60" />
                <span>{status.kind === "denied" ? "Connected" : "Unavailable"}</span>
              </div>
              <MyCanisterControls
                canisterId={canisterId}
                status={status}
                onRefresh={onRefresh}
                onConnect={() => setConnectOpen(true)}
                onSelectTab={handleTabSelect}
              />
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabSelect} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="cursor-pointer">
            Overview
          </TabsTrigger>
          <TabsTrigger value="logs" className="cursor-pointer">
            Logs
          </TabsTrigger>
          <TabsTrigger value="settings" className="cursor-pointer">
            Settings
          </TabsTrigger>
          <TabsTrigger value="snapshots" className="cursor-pointer">
            Snapshots
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-0.5">
                <CardTitle className="text-xs font-medium text-muted-foreground">Cycles Balance</CardTitle>
                <CardDescription className="text-xs">
                  Fuel for canister execution and persistent storage
                </CardDescription>
              </div>
              <HoverCard>
                <HoverCardTrigger className="cursor-help inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <HugeiconsIcon icon={InformationCircleIcon} className="size-3.5 text-muted-foreground/70" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80 space-y-2 text-xs">
                  <p className="font-semibold text-foreground">Canister Cycles Balance</p>
                  <p className="text-muted-foreground">
                    Cycles represent computation and memory fuel on the Internet Computer. 1 Trillion cycles (1 T) is pegged to 1 XDR (~$1.35 USD). Canisters consume cycles continuously for message execution and storage.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </CardHeader>
            <CardContent className="space-y-3">
              {status.kind === "ok" ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-foreground tabular-nums sm:text-5xl">
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

              <div className="border-t border-border/40 pt-3 text-xs text-muted-foreground/80">
                {status.kind === "ok" && isController ? (
                  <>
                    Live from <span className="font-mono text-muted-foreground">canister_status</span> · visible because you&apos;re a controller
                  </>
                ) : status.kind === "ok" && !isController ? (
                  <>
                    Live from <span className="font-mono text-muted-foreground">canister_status</span> · read-only view
                  </>
                ) : (
                  <>
                    Anyone can permissionlessly top up cycles to keep this canister running.
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid grid-cols-2 divide-y p-5 md:grid-cols-4 md:divide-y-0 md:divide-x divide-border/40 gap-y-4 md:gap-y-0">
              <div className="md:px-4 first:pl-0 space-y-1">
                <HoverCard>
                  <HoverCardTrigger className="cursor-help inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <span>Memory</span>
                    <HugeiconsIcon icon={InformationCircleIcon} className="size-3 text-muted-foreground/70" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-72 space-y-1.5 text-xs">
                    <p className="font-semibold text-foreground">Total Memory Size</p>
                    <p className="text-muted-foreground">
                      Aggregate memory footprint consumed by this canister across 32-bit WASM heap, 64-bit stable memory, snapshots, and runtime state.
                    </p>
                  </HoverCardContent>
                </HoverCard>
                {formatMetricDisplay(status.kind === "ok" ? status.data.memoryLabel : undefined)}
              </div>

              <div className="md:px-4 space-y-1 pt-3 md:pt-0">
                <HoverCard>
                  <HoverCardTrigger className="cursor-help inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <span>Wasm memory</span>
                    <HugeiconsIcon icon={InformationCircleIcon} className="size-3 text-muted-foreground/70" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-72 space-y-1.5 text-xs">
                    <p className="font-semibold text-foreground">Wasm Heap Memory</p>
                    <p className="text-muted-foreground">
                      32-bit WebAssembly linear heap occupied by the canister runtime code and heap allocations. Protocol limit is 4 GiB.
                    </p>
                  </HoverCardContent>
                </HoverCard>
                {formatMetricDisplay(status.kind === "ok" ? status.data.wasmMemory : undefined)}
              </div>

              <div className="md:px-4 space-y-1 pt-3 md:pt-0">
                <HoverCard>
                  <HoverCardTrigger className="cursor-help inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <span>Stable memory</span>
                    <HugeiconsIcon icon={InformationCircleIcon} className="size-3 text-muted-foreground/70" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-72 space-y-1.5 text-xs">
                    <p className="font-semibold text-foreground">Persistent Stable Memory</p>
                    <p className="text-muted-foreground">
                      64-bit persistent storage on the Internet Computer. Survives canister code upgrades and can scale up to 400 GiB.
                    </p>
                  </HoverCardContent>
                </HoverCard>
                {formatMetricDisplay(status.kind === "ok" ? status.data.stableMemory : undefined)}
              </div>

              <div className="md:px-4 last:pr-0 space-y-1 pt-3 md:pt-0">
                <HoverCard>
                  <HoverCardTrigger className="cursor-help inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <span>Reserved cycles</span>
                    <HugeiconsIcon icon={InformationCircleIcon} className="size-3 text-muted-foreground/70" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-72 space-y-1.5 text-xs">
                    <p className="font-semibold text-foreground">Reserved Cycles</p>
                    <p className="text-muted-foreground">
                      Cycles held in reserve by the subnet to allocate storage space and resource limits for this canister.
                    </p>
                  </HoverCardContent>
                </HoverCard>
                {formatMetricDisplay(status.kind === "ok" ? status.data.reservedLabel : undefined)}
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
                        ? status.data.freezingThreshold
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
              key={`${canisterId}-${settingsData.version}`}
              canisterId={canisterId}
              data={settingsData}
              isController={isController}
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
          <CanisterSnapshotsGuide />
          <SnapshotsCard canisterId={canisterId} embedded isController={isController} />
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
