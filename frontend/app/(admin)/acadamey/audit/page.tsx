"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SecurityCheckIcon,
  Copy01Icon,
} from "@hugeicons/core-free-icons"
import { useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { fetchAuditLogs, type ClientAuditLog } from "@/services/academy/client"

export default function AcademyAdminAuditPage() {
  const { identity } = useAuth()
  const [logs, setLogs] = useState<ClientAuditLog[]>([])
  const [filterAction, setFilterAction] = useState<string>("all")

  useEffect(() => {
    let mounted = true
    fetchAuditLogs(50, identity).then((data) => {
      if (mounted) setLogs(data)
    })
    return () => {
      mounted = false
    }
  }, [identity])

  const filteredLogs = logs.filter((l) => {
    if (filterAction === "all") return true
    return l.action.toLowerCase().includes(filterAction.toLowerCase())
  })

  const exportAuditJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2))
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `icacademy-audit-${Date.now()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("delete")) return "border-destructive/30 bg-destructive/10 text-destructive"
    if (action.includes("create") || action.includes("add")) return "border-success/30 bg-success/10 text-success"
    if (action.includes("price")) return "border-warning/30 bg-warning/10 text-warning"
    return "border-primary/20 bg-primary/10 text-primary"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/acadamey/dashboard">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Administrative Audit Trail</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Audit Trail & Governance Log
          </h1>
          <p className="text-sm text-muted-foreground">
            Immutable log of all administrative course creations, lifecycle state toggles, and price modifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={exportAuditJson}
            disabled={logs.length === 0}
            className="gap-2 border-border bg-card text-xs font-semibold text-foreground hover:bg-accent"
          >
            <HugeiconsIcon icon={Copy01Icon} className="size-4" />
            Export Audit Log (JSON)
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {["all", "create", "delete", "price", "publish"].map((f) => (
          <Button
            key={f}
            variant={filterAction === f ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilterAction(f)}
            className="h-7 text-xs font-medium capitalize"
          >
            {f === "all" ? "All Operations" : `${f} actions`}
          </Button>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-foreground">
            Audit Records ({filteredLogs.length})
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Timestamped operations verified with authenticated admin identity
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground">
              <HugeiconsIcon icon={SecurityCheckIcon} className="mb-2 size-8 text-muted-foreground/50" />
              No audit logs matching selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/30">
                    <TableHead className="w-36 text-xs">Timestamp</TableHead>
                    <TableHead className="w-32 text-xs">Action</TableHead>
                    <TableHead className="w-48 text-xs">Administrator</TableHead>
                    <TableHead className="w-40 text-xs">Target ID</TableHead>
                    <TableHead className="text-xs">Operation Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-border hover:bg-muted/20">
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {new Date(log.timestamp).toLocaleString([], {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold uppercase tracking-wider ${getActionBadgeVariant(log.action)}`}
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-foreground">
                        {log.admin}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {log.targetId}
                      </TableCell>
                      <TableCell className="text-xs text-foreground">
                        {log.details}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
