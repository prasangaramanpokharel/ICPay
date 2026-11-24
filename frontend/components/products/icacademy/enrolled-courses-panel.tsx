"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Icon } from "@/components/ui/icon"
import { ArrowRightGlassIcon, BookOpenGlassIcon, CheckGlassIcon, AwardGlassIcon } from "@thesvg/ui-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useAuth } from "@/components/auth/auth-provider"
import {
  fetchCourses,
  fetchMyEnrollments,
  getLocalUserEnrollments,
  getLocalCourseProgressPercent,
  syncCourseProgress,
  getLocalCertificate,
} from "@/services/academy/client"
import type { RemoteCertificate } from "@/services/academy/types"
import { remoteCourseToCourse, type Course } from "./academy-data"
import { AcademyCertificateModal } from "./academy-certificate-modal"

export function EnrolledCoursesPanel() {
  const { identity } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})
  const [certModalOpen, setCertModalOpen] = useState(false)
  const [selectedCert, setSelectedCert] = useState<RemoteCertificate | null>(null)
  const [selectedCertCourse, setSelectedCertCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const principalText = identity?.getPrincipal().toText()
        const localEnrolled = getLocalUserEnrollments(principalText)

        let allIds = [...localEnrolled]
        if (identity) {
          const remoteList = await fetchMyEnrollments(identity)
          const remoteIds = remoteList.map((e) => e.course_id)
          allIds = Array.from(new Set([...allIds, ...remoteIds]))
        }

        const allCourses = await fetchCourses(false, identity)
        const mapped = allCourses.map((c) => remoteCourseToCourse(c))
        const enrolledCourses = mapped.filter((c) => allIds.includes(c.id))

        if (mounted) {
          setCourses(enrolledCourses)
          const initialMap: Record<string, number> = {}
          for (const c of enrolledCourses) {
            initialMap[c.id] = getLocalCourseProgressPercent(c.id, c.totalLessons, principalText)
          }
          setProgressMap(initialMap)
        }

        if (identity) {
          for (const c of enrolledCourses) {
            void syncCourseProgress(c.id, identity).then((res) => {
              if (mounted && res) {
                setProgressMap((prev) => ({
                  ...prev,
                  [c.id]: Math.max(prev[c.id] ?? 0, res.percent),
                }))
              }
            })
          }
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [identity])

  useEffect(() => {
    const handleProgressChange = () => {
      const principalText = identity?.getPrincipal().toText()
      setProgressMap((prev) => {
        const updated = { ...prev }
        for (const c of courses) {
          updated[c.id] = getLocalCourseProgressPercent(c.id, c.totalLessons, principalText)
        }
        return updated
      })
    }

    window.addEventListener("icpay_academy_progress_changed", handleProgressChange)
    window.addEventListener("storage", handleProgressChange)
    return () => {
      window.removeEventListener("icpay_academy_progress_changed", handleProgressChange)
      window.removeEventListener("storage", handleProgressChange)
    }
  }, [courses, identity])

  return (
    <div className="space-y-8 p-4 md:p-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/academy" />}>Academy</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>My Enrolled Courses</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            My Enrolled Courses
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your Web3 engineering progress, resume active masterclasses, and claim verifiable credentials.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="gap-2 rounded-full text-xs font-semibold"
          nativeButton={false}
          render={<Link href="/academy#courses" />}
        >
          <Icon icon={BookOpenGlassIcon} className="size-3.5" />
          <span>Browse All Courses</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/70 bg-card p-5 shadow-xs">
          <CardContent className="space-y-1 p-0">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Active Courses</span>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {isLoading ? "..." : `${courses.length} Enrolled`}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card p-5 shadow-xs">
          <CardContent className="space-y-1 p-0">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Catalog Status</span>
            <p className="text-2xl font-bold tracking-tight text-foreground">Live On-Chain</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card p-5 shadow-xs">
          <CardContent className="space-y-1 p-0">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Soulbound Credentials</span>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {courses.filter((c) => (progressMap[c.id] ?? getLocalCourseProgressPercent(c.id, c.totalLessons, identity?.getPrincipal().toText())) >= 100).length > 0
                ? `${courses.filter((c) => (progressMap[c.id] ?? getLocalCourseProgressPercent(c.id, c.totalLessons, identity?.getPrincipal().toText())) >= 100).length} Earned`
                : "Verifiable"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">
          Continue Learning
        </h2>

        {isLoading ? (
          <div className="flex min-h-[200px] w-full items-center justify-center">
            <Spinner className="size-8 text-primary" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex min-h-[220px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm font-medium text-foreground">No active course enrollments yet</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Enroll in a masterclass to gain permanent access to video lessons, code labs, and soulbound certificates.
            </p>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/academy#courses" />}
              className="mt-2 gap-1.5"
            >
              Explore Course Catalog
              <Icon icon={ArrowRightGlassIcon} className="size-3.5" />
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((course) => {
              const principalText = identity?.getPrincipal().toText()
              const percent = progressMap[course.id] ?? getLocalCourseProgressPercent(course.id, course.totalLessons, principalText)
              const isCompleted = percent >= 100

              return (
                <Card
                  key={course.id}
                  className="overflow-hidden border-border/70 bg-card shadow-sm transition-all hover:border-border"
                >
                  <div className="relative aspect-video w-full overflow-hidden border-b border-border/60 bg-muted/40">
                    <Image
                      src={course.coverImage}
                      alt={course.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      {isCompleted ? (
                        <Badge variant="outline" className="gap-1 bg-card/90 shadow-xs backdrop-blur-md text-foreground border-border text-xs">
                          <Icon icon={CheckGlassIcon} className="size-3 text-primary" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="shadow-xs backdrop-blur-md">
                          Enrolled
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="space-y-4 p-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {course.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {course.totalHours} Hours · {course.totalLessons} Lessons
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-foreground">
                        {course.title}
                      </h3>

                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {course.description}
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-border/60 pt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Curriculum Progress</span>
                        <span className="font-semibold text-primary">{percent}%</span>
                      </div>
                      <Progress value={percent} className="h-1.5" />
                    </div>

                    <div className="pt-1 flex flex-col gap-2">
                      <Button
                        size="sm"
                        className="w-full gap-2 rounded-full font-semibold"
                        nativeButton={false}
                        render={<Link href={`/academy/course?id=${course.id}`} />}
                      >
                        <span>{isCompleted ? "Review Masterclass" : "Resume Masterclass"}</span>
                        <Icon icon={ArrowRightGlassIcon} className="size-3.5" />
                      </Button>
                      {isCompleted && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const cert = getLocalCertificate(course.id, principalText)
                            setSelectedCert(cert)
                            setSelectedCertCourse(course)
                            setCertModalOpen(true)
                          }}
                          className="w-full gap-2 rounded-full text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10"
                        >
                          <Icon icon={AwardGlassIcon} className="size-3.5" />
                          <span>View Soulbound Certificate</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <AcademyCertificateModal
        open={certModalOpen}
        onOpenChange={setCertModalOpen}
        certificate={selectedCert}
        courseTitle={selectedCertCourse?.title || ""}
        recipientPrincipal={identity?.getPrincipal().toText()}
      />
    </div>
  )
}
