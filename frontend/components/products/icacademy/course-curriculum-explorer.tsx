"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { ToastSuccessIcon } from "@/components/ui/sonner"
import {
  fetchCourses,
  fetchCourseDetail,
  getLocalLessonProgress,
  saveLocalLessonProgress,
  saveLocalCourseProgressPercent,
} from "@/services/academy/client"
import { remoteCourseDetailToCourse, type Course, type Lesson } from "./academy-data"
import { LessonVideoPlayer } from "./lesson-video-player"

export function CourseCurriculumExplorer() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(0)
  const [activeCourse, setActiveCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [activeModuleIndex, setActiveModuleIndex] = useState(0)
  const [activeLessonIndex, setActiveLessonIndex] = useState(0)
  const [completedLessonIds, setCompletedLessonIds] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const list = await fetchCourses(false)
        if (list.length > 0) {
          const detail = await fetchCourseDetail(list[0].id)
          if (mounted && detail) {
            const courseObj = remoteCourseDetailToCourse(detail)
            setActiveCourse(courseObj)
            setCourses([courseObj])
            setCompletedLessonIds(getLocalLessonProgress(courseObj.id))
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
  }, [])

  const currentCourse = activeCourse
  const currentModule = currentCourse?.modules?.[activeModuleIndex] ?? currentCourse?.modules?.[0]
  const currentLesson = currentModule?.lessons?.[activeLessonIndex] ?? currentModule?.lessons?.[0]

  const allLessonsInCourse: { moduleIndex: number; lessonIndex: number; lesson: Lesson }[] = []
  if (currentCourse?.modules) {
    currentCourse.modules.forEach((mod, mIdx) => {
      if (mod?.lessons) {
        mod.lessons.forEach((les, lIdx) => {
          allLessonsInCourse.push({ moduleIndex: mIdx, lessonIndex: lIdx, lesson: les })
        })
      }
    })
  }

  const currentFlatIndex = currentLesson
    ? allLessonsInCourse.findIndex((item) => item.lesson.id === currentLesson.id)
    : -1

  const hasPrevious = currentFlatIndex > 0
  const hasNext = currentFlatIndex < allLessonsInCourse.length - 1

  const handlePreviousLesson = () => {
    if (hasPrevious) {
      const prev = allLessonsInCourse[currentFlatIndex - 1]
      setActiveModuleIndex(prev.moduleIndex)
      setActiveLessonIndex(prev.lessonIndex)
    }
  }

  const handleNextLesson = () => {
    if (hasNext) {
      const next = allLessonsInCourse[currentFlatIndex + 1]
      setActiveModuleIndex(next.moduleIndex)
      setActiveLessonIndex(next.lessonIndex)
    }
  }

  const handleToggleComplete = (lessonId: string) => {
    if (!currentCourse) return
    const isNowCompleted = !completedLessonIds[lessonId]
    const updated = {
      ...completedLessonIds,
      [lessonId]: isNowCompleted,
    }
    setCompletedLessonIds(updated)
    saveLocalLessonProgress(currentCourse.id, updated)
    const count = allLessonsInCourse.filter((item) => updated[item.lesson.id]).length
    const pct = allLessonsInCourse.length > 0 ? Math.round((count / allLessonsInCourse.length) * 100) : 0
    saveLocalCourseProgressPercent(currentCourse.id, pct)
  }

  const completedCount = allLessonsInCourse.filter(
    (item) => completedLessonIds[item.lesson.id]
  ).length
  const progressPercent = allLessonsInCourse.length > 0
    ? Math.round((completedCount / allLessonsInCourse.length) * 100)
    : 0

  if (isLoading) {
    return (
      <section id="curriculum" className="border-b border-border/60 bg-muted/10 py-16 md:py-24">
        <div className="flex min-h-[300px] w-full items-center justify-center">
          <Spinner className="size-8 text-primary" />
        </div>
      </section>
    )
  }

  if (!currentCourse || !currentModule || !currentLesson) {
    return null
  }

  return (
    <section id="curriculum" className="border-b border-border/60 bg-muted/10 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto mb-10 max-w-3xl space-y-3 text-center">
          <Badge variant="outline" className="px-3 py-1 text-xs">
            Interactive Curriculum Explorer
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Course Modules & Hands-On Labs
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            Select a specialized track to browse modules, watch architectural lectures, and complete verified engineering labs.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {courses.map((c, idx) => (
            <Button
              key={c.id}
              variant={selectedCourseIndex === idx ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedCourseIndex(idx)
                setActiveCourse(c)
                setActiveModuleIndex(0)
                setActiveLessonIndex(0)
              }}
              className="rounded-full text-xs font-semibold"
            >
              {c.title}
            </Button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="space-y-4 lg:col-span-5">
            <Card className="border-border/70 bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Track Completion</span>
                <span className="font-bold text-primary">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="mt-2 h-2" />
              <p className="mt-2 text-[11px] text-muted-foreground">
                {completedCount} of {allLessonsInCourse.length} lessons verified on local state
              </p>
            </Card>

            <Accordion
              defaultValue={["mod-0"]}
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

                  <AccordionContent className="px-3 pt-1 pb-3">
                    <div className="space-y-1">
                      {module.lessons.map((lesson, lIdx) => {
                        const isCurrentActive =
                          activeModuleIndex === mIdx && activeLessonIndex === lIdx
                        const isDone = completedLessonIds[lesson.id]

                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => {
                              setActiveModuleIndex(mIdx)
                              setActiveLessonIndex(lIdx)
                            }}
                            className={`group flex w-full cursor-pointer flex-col gap-1 rounded-xl px-3 py-2.5 text-left transition-all ${
                              isCurrentActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <div className="flex w-full items-center justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-2">
                                {isDone ? (
                                  <ToastSuccessIcon />
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

          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentCourse.id}-${currentLesson.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <LessonVideoPlayer
                  lesson={currentLesson}
                  moduleTitle={currentModule.title}
                  courseTitle={currentCourse.title}
                  lessonIndex={activeLessonIndex}
                  totalLessonsInModule={currentModule.lessons.length}
                  hasPrevious={hasPrevious}
                  hasNext={hasNext}
                  onPrevious={handlePreviousLesson}
                  onNext={handleNextLesson}
                  isCompleted={!!completedLessonIds[currentLesson.id]}
                  onToggleComplete={() => handleToggleComplete(currentLesson.id)}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
