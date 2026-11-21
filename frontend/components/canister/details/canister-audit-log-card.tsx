"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Clock01Icon,
  RefreshIcon,
  InformationCircleIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/ui/copy-button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/components/auth/auth-provider"
import { useCanisterInfo } from "@/hooks/canister/useCanisterInfo"
import type { CanisterChangeKind } from "@/services/canister/canisterInfo"

function changeKindLabel(kind: CanisterChangeKind): string {
  switch (kind) {
    case "code_deployment":
      return "Deployment"
    case "creation":
      return "Creation"
    case "controllers_change":
      return "Controllers"
    case "load_snapshot":
      return "Restore"
    case "code_uninstall":
      return "Uninstall"
    case "rename_canister":
      return "Rename"
    default:
      return "Change"
  }
}

export function CanisterAuditLogCard({
  canisterId,
}: {
  canisterId: string
}) {
  const t = useTranslations("myCanisters")
  const { identity, isAuthenticated } = useAuth()
  const { state, refresh, isLoading } = useCanisterInfo(identity, canisterId, Boolean(isAuthenticated))

  return (
    <Card className="rounded-xl border border-border/40 bg-card p-6 gap-4">
      <CardHeader className="flex flex-col gap-4 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between p-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Clock01Icon} className="size-4 text-muted-foreground" strokeWidth={1.5} />
            <CardTitle className="text-base font-semibold text-foreground">
              {t("auditTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            {t("auditSubtitle")}
          </CardDescription>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
          className="h-8 gap-1.5 text-xs cursor-pointer"
        >
          <HugeiconsIcon icon={RefreshIcon} className={isLoading ? "size-3.5 animate-spin" : "size-3.5"} />
          <span>{t("refresh")}</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 p-0">
        {state.kind === "loading" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
            <Skeleton className="h-44 w-full rounded-lg" />
          </div>
        )}

        {state.kind === "error" && (
          <div className="rounded-lg border border-border/40 bg-muted/20 p-8 text-center space-y-2">
            <HugeiconsIcon icon={InformationCircleIcon} className="size-5 text-muted-foreground mx-auto" />
            <p className="text-xs font-medium text-foreground">{t("standardCanister")}</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">{state.error}</p>
          </div>
        )}

        {state.kind === "ok" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-border/40 bg-muted/20 p-3 space-y-1">
                <span className="text-xs text-muted-foreground font-medium">{t("installedWasm")}</span>
                <div className="flex items-center gap-1.5">
                  <p className="text-base font-semibold text-foreground font-mono tabular-nums truncate">
                    {state.data.moduleHash}
                  </p>
                  {state.data.moduleHash !== "—" && (
                    <CopyButton
                      value={state.data.moduleHash}
                      aria-label="Copy module hash"
                      className="size-4 p-0 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                      iconClassName="size-2.5"
                    />
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-border/40 bg-muted/20 p-3 space-y-1">
                <span className="text-xs text-muted-foreground font-medium">{t("controllerLabel")}s</span>
                <p className="text-base font-semibold text-foreground font-mono tabular-nums">
                  {state.data.controllers.length}
                </p>
              </div>

              <div className="rounded-lg border border-border/40 bg-muted/20 p-3 space-y-1">
                <span className="text-xs text-muted-foreground font-medium">{t("role")}</span>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <Badge variant="outline" className="text-[11px] gap-1 px-2 py-0.5 border-border text-muted-foreground">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3 text-muted-foreground" />
                    <span>{t("verified")}</span>
                  </Badge>
                </div>
              </div>
            </div>

            {state.data.restrictedByReplica ? (
              <div className="rounded-lg border border-border/40 bg-muted/20 p-4 space-y-3 text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{t("protocolNotice")}</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("protocolNoticeDesc")}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/40">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {t("controllerLabel")}s ({state.data.controllers.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {state.data.controllers.map((ctrl) => (
                      <div
                        key={ctrl}
                        className="flex items-center justify-between gap-2 rounded-md border border-border/40 bg-card/60 px-3 py-1.5 font-mono text-[11px]"
                      >
                        <span className="truncate text-foreground">{ctrl}</span>
                        <CopyButton
                          value={ctrl}
                          aria-label="Copy controller principal"
                          className="size-4 p-0 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                          iconClassName="size-2.5"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : state.data.recentChanges.length === 0 ? (
              <div className="rounded-lg border border-border/40 p-8 text-center text-xs text-muted-foreground">
                {t("noAuditLogs")}
              </div>
            ) : (
              <div className="rounded-lg border border-border/40 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/40 hover:bg-transparent">
                      <TableHead className="w-20 text-xs">Version</TableHead>
                      <TableHead className="w-28 text-xs">{t("colType")}</TableHead>
                      <TableHead className="text-xs">Summary</TableHead>
                      <TableHead className="text-xs">Origin</TableHead>
                      <TableHead className="text-right text-xs pr-4">{t("colTime")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.data.recentChanges.map((change, idx) => (
                      <TableRow key={`${change.timestampNanos.toString()}-${idx}`} className="border-b border-border/40 hover:bg-muted/30">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          v{change.canisterVersion}
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="border-border text-muted-foreground text-[10px] px-1.5 py-0">
                            {changeKindLabel(change.kind)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-foreground">
                          {change.summary}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[140px]">{change.origin}</span>
                            <CopyButton value={change.origin} size="icon-xs" variant="ghost" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono text-muted-foreground pr-4">
                          {change.timeFormatted}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
