"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Layers01Icon,
  Coins01Icon,
  Clock01Icon,
  ArrowRight01Icon,
  UserCircle02Icon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons"
import {
  fetchAcademyStats,
  fetchCourses,
  fetchAuditLogs,
  type ClientAuditLog,
} from "@/services/academy/client"
import { useAuth } from "@/components/auth/auth-provider"
import type { RemoteAcademyStats, RemoteCourse } from "@/services/academy/types"
import { cn } from "@/lib/ui/utils"

export default function AcademyAdminDashboardPage() {
  const { identity } = useAuth()
  const [stats, setStats] = useState<RemoteAcademyStats | null>(null)
  const [courses, setCourses] = useState<RemoteCourse[]>([])
  const [auditLogs, setAuditLogs] = useState<ClientAuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, coursesData, logsData] = await Promise.all([
          fetchAcademyStats(),
          fetchCourses(true, identity),
          fetchAuditLogs(5, identity),
        ])
        setStats(statsData)
        setCourses(coursesData)
        setAuditLogs(logsData)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [identity])

  const publishedCount = courses.filter((c) => c.is_published).length
  const draftCount = courses.filter((c) => !c.is_published).length
  const revenueIcp = stats ? (Number(stats.total_revenue_e8s) / 100_000_000).toFixed(2) : "0.00"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/home">App</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Admin</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Academy Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Academy Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Live operational metrics, enrollment rates, and curriculum tracking on the Internet Computer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/acadamey/courses"
            className={cn(
              buttonVariants({ variant: "default" }),
              "gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            <HugeiconsIcon icon={Layers01Icon} className="size-4" />
            Manage Courses
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Courses
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HugeiconsIcon icon={Layers01Icon} className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {isLoading ? "..." : stats?.total_courses ?? courses.length}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="border-success/30 bg-success/10 text-success text-[10px] px-1.5 py-0">
                {publishedCount} Published
              </Badge>
              {draftCount > 0 && (
                <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning text-[10px] px-1.5 py-0">
                  {draftCount} Draft
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Enrollments
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-info/10 text-info">
              <HugeiconsIcon icon={UserCircle02Icon} className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {isLoading ? "..." : stats?.total_enrollments.toString() ?? "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all published developer tracks
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today&apos;s Enrollments
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-success/10 text-success">
              <HugeiconsIcon icon={Clock01Icon} className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {isLoading ? "..." : stats?.today_enrollments.toString() ?? "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Students enrolled in last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Platform Revenue
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <HugeiconsIcon icon={Coins01Icon} className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {isLoading ? "..." : `${revenueIcp} ICP`}
            </div>
            <p className="text-xs text-muted-foreground">
              Verified on ICP Ledger
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Active Developer Tracks
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Overview of live courses and curriculum status
                </CardDescription>
              </div>
              <Link
                href="/acadamey/courses"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 gap-1 text-xs text-primary")}
              >
                View All
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {courses.slice(0, 4).map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 overflow-hidden rounded-lg border border-border bg-muted">
                        <Image
                          src={c.cover_image}
                          alt={c.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-foreground">
                          {c.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{c.total_lessons} lessons</span>
                          <span>•</span>
                          <span>{c.total_hours}h</span>
                          <span>•</span>
                          <span className="font-medium text-foreground">
                            {c.price_e8s === BigInt(0)
                              ? "Free"
                              : `${Number(c.price_e8s) / 100_000_000} ICP`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          c.is_published
                            ? "border-success/30 bg-success/10 text-success text-[10px]"
                            : "border-warning/30 bg-warning/10 text-warning text-[10px]"
                        }
                      >
                        {c.is_published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Audit Activity
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Recent actions by authenticated administrators
                </CardDescription>
              </div>
              <Link
                href="/acadamey/audit"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 gap-1 text-xs text-primary")}
              >
                Log
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-muted-foreground">
                  <HugeiconsIcon icon={SecurityCheckIcon} className="mb-2 size-6 text-muted-foreground/60" />
                  No administrative actions recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex flex-col gap-1 rounded-lg border border-border bg-muted/30 p-2.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-foreground">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {log.details}
                      </p>
                      <span className="text-[10px] text-muted-foreground/80">
                        by {log.admin}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                Completion & Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Completed Lessons</span>
                <span className="font-bold text-foreground">
                  {stats?.total_completed_lessons.toString() ?? "0"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Certificates Minted</span>
                <span className="font-bold text-foreground">
                  {stats?.total_certificates_issued.toString() ?? "0"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Active Students</span>
                <span className="font-bold text-foreground">
                  {stats?.total_students.toString() ?? "0"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
