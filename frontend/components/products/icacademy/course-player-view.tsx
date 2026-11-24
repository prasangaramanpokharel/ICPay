"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { toast } from "@/components/ui/toast"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Progress } from "@/components/ui/progress"
import { ShineBorder } from "@/components/ui/shine-border"
import { Icon } from "@/components/ui/icon"
import { CoinsGlassIcon, ShieldCheckGlassIcon, CheckGlassIcon, SocialXGlassIcon, SocialTelegramGlassIcon, SocialFacebookGlassIcon, ArrowRightGlassIcon, AwardGlassIcon } from "@thesvg/ui-react"
import { CopyIconIndicator } from "@/components/ui/copy-button"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/components/auth/auth-provider"
import {
  isUserEnrolledInCourse,
  getLocalUserEnrollments,
  fetchCourses,
  fetchCourseDetail,
  completeLesson,
  claimCertificate,
  fetchMyProgress,
  getLocalLessonProgress,
  saveLocalLessonProgress,
  saveLocalCourseProgressPercent,
  syncCourseProgress,
  getLocalCertificate,
  saveLocalCertificate,
} from "@/services/academy/client"
import type { RemoteCertificate } from "@/services/academy/types"
import { remoteCourseDetailToCourse, type Course, type Lesson } from "./academy-data"
import { LessonVideoPlayer } from "./lesson-video-player"
import { AcademyPaymentModal } from "./academy-payment-modal"
import { AcademyCertificateModal } from "./academy-certificate-modal"

export function CoursePlayerView() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get("id")
  const { identity } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        let targetId = courseId
        if (!targetId) {
          const list = await fetchCourses(false, identity)
          if (list.length > 0) {
            targetId = list[0].id
          }
        }
        if (targetId) {
          const detail = await fetchCourseDetail(targetId, identity)
          if (mounted && detail) {
            setCourse(remoteCourseDetailToCourse(detail))
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
  }, [courseId, identity])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center p-8">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 p-8 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Course Not Found</h2>
        <p className="text-sm text-muted-foreground">The requested course could not be located in the on-chain catalog.</p>
        <Button nativeButton={false} render={<Link href="/academy#courses" />}>
          Browse All Courses
          <Icon icon={ArrowRightGlassIcon} className="size-4" />
        </Button>
      </div>
    )
  }

  return (
    <CoursePlayerContent
      key={`${course.id}-${identity?.getPrincipal().toText() ?? "guest"}`}
      currentCourse={course}
    />
  )
}

function CoursePlayerContent({ currentCourse }: { currentCourse: Course }) {
  const { identity, isAuthenticated, login } = useAuth()

  const isPaidCourse = currentCourse.price !== "Free" && currentCourse.price !== "0 ICP"

  const [isEnrolled, setIsEnrolled] = useState(() => {
    if (!isPaidCourse) return true
    if (typeof window === "undefined") return false
    const principalText = identity?.getPrincipal().toText()
    const local = getLocalUserEnrollments(principalText)
    return local.includes(currentCourse.id)
  })
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [activeModuleIndex, setActiveModuleIndex] = useState(0)
  const [activeLessonIndex, setActiveLessonIndex] = useState(0)
  const [openModules, setOpenModules] = useState<string[]>(["mod-0"])
  const [completedLessonIds, setCompletedLessonIds] = useState<Record<string, boolean>>(() => {
    const principalText = identity?.getPrincipal().toText()
    return getLocalLessonProgress(currentCourse.id, principalText)
  })
  const [certificateModalOpen, setCertificateModalOpen] = useState(false)
  const [claimedCertificate, setClaimedCertificate] = useState<RemoteCertificate | null>(() => {
    const principalText = identity?.getPrincipal().toText()
    return getLocalCertificate(currentCourse.id, principalText)
  })
  const [isClaiming, setIsClaiming] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const principalText = identity?.getPrincipal().toText()
    const handleCertClaimed = () => {
      const updatedCert = getLocalCertificate(currentCourse.id, principalText)
      if (updatedCert) setClaimedCertificate(updatedCert)
    }

    window.addEventListener("icpay_academy_certificate_claimed", handleCertClaimed)
    return () => {
      window.removeEventListener("icpay_academy_certificate_claimed", handleCertClaimed)
    }
  }, [currentCourse.id, identity])

  const handleClaimCertificate = async () => {
    if (claimedCertificate) {
      setCertificateModalOpen(true)
      return
    }
    if (!isAuthenticated || !identity) {
      void login()
      return
    }
    setIsClaiming(true)
    try {
      const completedLessonList = allLessons
        .filter((item) => completedLessonIds[item.lesson.id])
        .map((item) => item.lesson.id)

      if (completedLessonList.length < allLessons.length) {
        toast.error(`Please complete all ${allLessons.length} lessons before claiming your certificate.`)
        setIsClaiming(false)
        return
      }

      const remoteProg = await fetchMyProgress(currentCourse.id, identity)
      const remoteCompletedSet = new Set(remoteProg?.completed_lesson_ids || [])

      for (const lessonId of completedLessonList) {
        if (!remoteCompletedSet.has(lessonId)) {
          await completeLesson(currentCourse.id, lessonId, identity)
        }
      }

      const cert = await claimCertificate(currentCourse.id, identity)
      const principalText = identity.getPrincipal().toText()
      saveLocalCertificate(currentCourse.id, cert, principalText)
      setClaimedCertificate(cert)
      setCertificateModalOpen(true)
      toast.success("Soulbound certificate minted on-chain!")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to claim certificate"
      toast.error(msg)
    } finally {
      setIsClaiming(false)
    }
  }

  useEffect(() => {
    if (!identity) return
    let isMounted = true
    void syncCourseProgress(currentCourse.id, identity).then((res) => {
      if (isMounted && res) {
        setCompletedLessonIds((prev) => {
          const merged = { ...prev }
          let changed = false
          for (const id of res.completedLessonIds) {
            if (!merged[id]) {
              merged[id] = true
              changed = true
            }
          }
          return changed ? merged : prev
        })
      }
    })
    return () => {
      isMounted = false
    }
  }, [currentCourse.id, identity])

  const handleCopyShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://icpay.app/academy/course?id=${currentCourse.id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Course link copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

  const courseUrl = typeof window !== "undefined" ? window.location.href : `https://icpay.app/academy/course?id=${currentCourse.id}`
  const shareText = `Master ${currentCourse.title} on ICAcademy:`
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(courseUrl)}`
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(courseUrl)}&text=${encodeURIComponent(shareText)}`
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(courseUrl)}`

  useEffect(() => {
    if (currentCourse) {
      document.title = `${currentCourse.title} — ICAcademy | ICPay`
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute("content", currentCourse.description)
      }
    }
  }, [currentCourse])

  useEffect(() => {
    if (!isPaidCourse) return
    let isMounted = true
    isUserEnrolledInCourse(currentCourse.id, identity).then((enrolled) => {
      if (isMounted) {
        setIsEnrolled(enrolled)
      }
    })
    return () => {
      isMounted = false
    }
  }, [currentCourse.id, identity, isPaidCourse])

  const currentModule = currentCourse.modules[activeModuleIndex] ?? currentCourse.modules[0]
  const currentLesson = currentModule.lessons[activeLessonIndex] ?? currentModule.lessons[0]

  const isCurrentLessonLocked = isPaidCourse && !isEnrolled && !currentLesson.previewAvailable

  const allLessons: { moduleIndex: number; lessonIndex: number; lesson: Lesson }[] = []
  currentCourse.modules.forEach((mod, mIdx) => {
    mod.lessons.forEach((les, lIdx) => {
      allLessons.push({ moduleIndex: mIdx, lessonIndex: lIdx, lesson: les })
    })
  })

  const currentFlatIndex = allLessons.findIndex(
    (item) => item.lesson.id === currentLesson.id
  )

  const hasPrevious = currentFlatIndex > 0
  const hasNext = currentFlatIndex < allLessons.length - 1

  const handlePreviousLesson = () => {
    if (hasPrevious) {
      const prev = allLessons[currentFlatIndex - 1]
      setActiveModuleIndex(prev.moduleIndex)
      setActiveLessonIndex(prev.lessonIndex)
      setOpenModules((current) =>
        current.includes(`mod-${prev.moduleIndex}`)
          ? current
          : [...current, `mod-${prev.moduleIndex}`]
      )
    }
  }

  const handleNextLesson = () => {
    if (hasNext) {
      const next = allLessons[currentFlatIndex + 1]
      setActiveModuleIndex(next.moduleIndex)
      setActiveLessonIndex(next.lessonIndex)
      setOpenModules((current) =>
        current.includes(`mod-${next.moduleIndex}`)
          ? current
          : [...current, `mod-${next.moduleIndex}`]
      )
    }
  }

  const handleToggleComplete = (lessonId: string) => {
    const isNowCompleted = !completedLessonIds[lessonId]
    const updated = {
      ...completedLessonIds,
      [lessonId]: isNowCompleted,
    }
    setCompletedLessonIds(updated)

    const principalText = identity?.getPrincipal().toText()
    saveLocalLessonProgress(currentCourse.id, updated, principalText)
    const count = allLessons.filter((item) => updated[item.lesson.id]).length
    const pct = allLessons.length > 0 ? Math.round((count / allLessons.length) * 100) : 0
    saveLocalCourseProgressPercent(currentCourse.id, pct, principalText)

    if (identity && isNowCompleted) {
      void completeLesson(currentCourse.id, lessonId, identity).catch(() => {
        void 0
      })
    }
  }

  const completedCount = allLessons.filter(
    (item) => completedLessonIds[item.lesson.id]
  ).length
  const progressPercent = allLessons.length > 0
    ? Math.round((completedCount / allLessons.length) * 100)
    : 0

  return (
    <div className="py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-6 space-y-4">
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
                <BreadcrumbLink render={<Link href="/academy#courses" />}>Courses</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="truncate max-w-[200px] sm:max-w-none">
                  {currentCourse.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col gap-4 border-b border-border/60 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3.5 flex-1 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default" className="text-xs font-semibold">
                  {currentCourse.price}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {currentCourse.badge}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {currentCourse.level}
                </Badge>
                {isPaidCourse && isEnrolled && (
                  <Badge variant="outline" className="gap-1.5 text-xs">
                    <Icon icon={CheckGlassIcon} className="size-3" />
                    Lifetime access
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
                {currentCourse.title}
              </h1>
              <p className="text-xs text-muted-foreground md:text-sm">
                {currentCourse.headline}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="relative size-9 shrink-0 overflow-hidden rounded-full border border-border/70 bg-card shadow-xs">
                    <Image
                      src="/images/logo/logo-256.webp"
                      alt="ICPay"
                      width={36}
                      height={36}
                      className="size-full object-contain p-1"
                      priority
                    />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground">ICPay</span>
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                        Official
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {currentCourse.totalHours} Hours · {allLessons.length} Lessons
                    </p>
                  </div>
                </div>

                <ButtonGroup className="border border-border/70 rounded-full bg-card/60 p-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyShare}
                    className="size-7 rounded-full text-muted-foreground hover:text-foreground"
                    title={copied ? "Copied Link!" : "Copy Link"}
                  >
                    <CopyIconIndicator copied={copied} iconClassName="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    nativeButton={false}
                    render={
                      <a
                        href={twitterShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Share on X"
                      />
                    }
                    className="size-7 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <Icon icon={SocialXGlassIcon} className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    nativeButton={false}
                    render={
                      <a
                        href={telegramShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Share on Telegram"
                      />
                    }
                    className="size-7 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <Icon icon={SocialTelegramGlassIcon} className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    nativeButton={false}
                    render={
                      <a
                        href={facebookShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Share on Facebook"
                      />
                    }
                    className="size-7 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <Icon icon={SocialFacebookGlassIcon} className="size-3.5" />
                  </Button>
                </ButtonGroup>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              {isPaidCourse && !isEnrolled && (
                <Button
                  size="sm"
                  onClick={() => {
                    if (!isAuthenticated) {
                      void login()
                    } else {
                      setPaymentModalOpen(true)
                    }
                  }}
                  className="relative overflow-hidden gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-sm px-4"
                >
                  <ShineBorder
                    className="rounded-[inherit]"
                    borderWidth={1.2}
                    duration={8}
                    shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon icon={isAuthenticated ? CoinsGlassIcon : ShieldCheckGlassIcon} className="size-3.5" />
                    {isAuthenticated ? `Unlock Course (${currentCourse.price})` : "Connect Wallet to Unlock"}
                  </span>
                </Button>
              )}

              {progressPercent >= 100 ? (
                <div className="relative overflow-hidden flex flex-col gap-2.5 rounded-2xl border border-primary/40 bg-card p-4 shadow-sm lg:w-72">
                  <ShineBorder
                    className="rounded-[inherit]"
                    borderWidth={1.2}
                    duration={8}
                    shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                  />
                  <div className="relative z-10 flex items-center justify-between text-xs">
                    <Badge variant="outline" className="gap-1 border-primary/40 bg-primary/10 text-primary text-[10px] font-semibold">
                      <Icon icon={AwardGlassIcon} className="size-3" />
                      Masterclass Completed
                    </Badge>
                    <span className="font-semibold text-primary">100%</span>
                  </div>
                  <Progress value={100} className="relative z-10 w-full" />
                  <span className="relative z-10 text-[11px] text-muted-foreground">
                    All {allLessons.length} lessons completed
                  </span>
                  <Button
                    size="sm"
                    disabled={isClaiming}
                    onClick={handleClaimCertificate}
                    className="relative z-10 w-full gap-2 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-xs mt-0.5"
                  >
                    {isClaiming ? (
                      <Spinner className="size-3.5 text-primary-foreground" />
                    ) : (
                      <Icon icon={AwardGlassIcon} className="size-3.5" />
                    )}
                    <span>
                      {claimedCertificate
                        ? "View Soulbound Certificate"
                        : isClaiming
                        ? "Minting Certificate..."
                        : "Claim Soulbound Certificate"}
                    </span>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-muted/20 p-4 lg:w-72">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">Progress</span>
                    <span className="font-semibold text-primary">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="w-full" />
                  <span className="text-[11px] text-muted-foreground">
                    {completedCount} of {allLessons.length} lessons completed
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-8">
            <LessonVideoPlayer
              lesson={currentLesson}
              moduleTitle={currentModule.title}
              courseTitle={currentCourse.title}
              coursePrice={currentCourse.price}
              isLocked={isCurrentLessonLocked}
              isAuthenticated={isAuthenticated}
              onUnlock={() => setPaymentModalOpen(true)}
              onLogin={() => void login()}
              lessonIndex={activeLessonIndex}
              totalLessonsInModule={currentModule.lessons.length}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              onPrevious={handlePreviousLesson}
              onNext={handleNextLesson}
              isCompleted={!!completedLessonIds[currentLesson.id]}
              onToggleComplete={() => handleToggleComplete(currentLesson.id)}
              isAllCompleted={progressPercent >= 100}
              onClaimCertificate={handleClaimCertificate}
            />
          </div>

          <div className="space-y-3 lg:col-span-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Course Syllabus
              </span>
              <span className="text-xs text-muted-foreground">
                {currentCourse.modules.length} Modules · {allLessons.length} Lessons
              </span>
            </div>

            <Accordion
              value={openModules}
              onValueChange={setOpenModules}
              className="space-y-2 rounded-2xl border-0 bg-transparent"
            >
              {currentCourse.modules.map((module, mIdx) => (
                <AccordionItem
                  key={module.id}
                  value={`mod-${mIdx}`}
                  className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex flex-col items-start gap-0.5 text-left">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                        Module {module.order}
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {module.title.replace(/^Module \d+:\s*/, "")}
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="border-t border-border/50 bg-muted/10 p-2">
                    <div className="space-y-1">
                      {module.lessons.map((lesson, lIdx) => {
                        const isCurrentActive =
                          activeModuleIndex === mIdx && activeLessonIndex === lIdx
                        const isDone = completedLessonIds[lesson.id]
                        const isLessonLocked =
                          isPaidCourse && !isEnrolled && !lesson.previewAvailable

                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => {
                              setActiveModuleIndex(mIdx)
                              setActiveLessonIndex(lIdx)
                            }}
                            className={`group flex w-full cursor-pointer flex-col gap-1 rounded-xl px-3 py-2 text-left transition-all ${
                              isCurrentActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <div className="flex w-full items-center justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-2">
                                {isDone ? (
                                  <Icon
                                    icon={CheckGlassIcon}
                                    className={`size-3 shrink-0 ${
                                      isCurrentActive
                                        ? "text-primary-foreground"
                                        : "text-success"
                                    }`}
                                  />
                                ) : isLessonLocked ? (
                                  <Icon
                                    icon={ShieldCheckGlassIcon}
                                    className={`size-3 shrink-0 ${
                                      isCurrentActive
                                        ? "text-primary-foreground/80"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ) : (
                                  <span
                                    className={`shrink-0 text-[11px] font-semibold ${
                                      isCurrentActive
                                        ? "text-primary-foreground/80"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {mIdx + 1}.{lIdx + 1}
                                  </span>
                                )}
                                <span
                                  className={`truncate text-xs font-semibold leading-none ${
                                    isCurrentActive
                                      ? "text-primary-foreground"
                                      : "text-foreground"
                                  }`}
                                >
                                  {lesson.title}
                                </span>
                              </div>

                              {lesson.previewAvailable && !isCurrentActive && (
                                <Badge
                                  variant="secondary"
                                  className="h-4 shrink-0 px-1.5 text-[9px]"
                                >
                                  Preview
                                </Badge>
                              )}

                              {lesson.type === "quiz" && !isCurrentActive && (
                                <Badge
                                  variant="outline"
                                  className="h-4 shrink-0 px-1.5 text-[9px] border-primary/40 bg-primary/10 text-primary font-medium"
                                >
                                  Quiz
                                </Badge>
                              )}

                              {lesson.type === "code_lab" && !isCurrentActive && (
                                <Badge
                                  variant="outline"
                                  className="h-4 shrink-0 px-1.5 text-[9px] border-info/40 bg-info/10 text-info font-medium"
                                >
                                  Lab
                                </Badge>
                              )}

                              {lesson.type === "reading" && !isCurrentActive && (
                                <Badge
                                  variant="outline"
                                  className="h-4 shrink-0 px-1.5 text-[9px] border-secondary/50 bg-secondary/20 text-secondary-foreground font-medium"
                                >
                                  Reading
                                </Badge>
                              )}

                              {isLessonLocked && !isCurrentActive && (
                                <Badge
                                  variant="outline"
                                  className="h-4 shrink-0 px-1 text-[9px] border-border text-muted-foreground"
                                >
                                  Locked
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2 pl-6.5">
                              <span
                                className={`text-[10px] ${
                                  isCurrentActive
                                    ? "text-primary-foreground/75"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {lesson.durationMinutes} min
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>

      <AcademyPaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        course={currentCourse}
        onSuccess={() => {
          setIsEnrolled(true)
        }}
      />

      <AcademyCertificateModal
        open={certificateModalOpen}
        onOpenChange={setCertificateModalOpen}
        certificate={claimedCertificate}
        courseTitle={currentCourse.title}
        recipientPrincipal={identity?.getPrincipal().toText()}
      />
    </div>
  )
}
