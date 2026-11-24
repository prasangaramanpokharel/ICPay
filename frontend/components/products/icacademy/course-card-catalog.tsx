"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Icon } from "@/components/ui/icon"
import { ArrowRightGlassIcon } from "@thesvg/ui-react"
import {
  CutoutCard,
  CutoutCardMedia,
  CutoutCardImage,
  CutoutCardOverlay,
  CutoutCardInsetLabel,
  CutoutCardPin,
  CutoutCorner,
  CutoutCardContent,
  CutoutCardFooter,
  cutoutCardSurfaceClassName,
  useCutoutContentStaggerVariants,
} from "@/components/ui/cutout-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/ui/utils"
import { fetchCourses } from "@/services/academy/client"
import { remoteCourseToCourse, type Course } from "./academy-data"

export function CourseCardCatalog() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const stagger = useCutoutContentStaggerVariants()

  useEffect(() => {
    let mounted = true
    fetchCourses(false)
      .then((remotes) => {
        if (mounted) {
          setCourses(remotes.map((r) => remoteCourseToCourse(r)))
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (mounted) setIsLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section id="courses" className="border-b border-border/60 bg-muted/10 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-3xl space-y-3 text-center">
          <Badge variant="outline" className="px-3 py-1 text-xs">
            Flagship Courses
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Featured On-Chain Curriculum
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            Select a verified curriculum to start learning. Includes free preview lessons, interactive video masterclasses, and verifiable on-chain certificates.
          </p>
        </div>

        {isLoading ? (
          <div className="flex min-h-[300px] w-full items-center justify-center">
            <Spinner className="size-8 text-primary" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex min-h-[200px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No active courses published yet.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CutoutCard
                key={course.id}
                className={cn(cutoutCardSurfaceClassName, "flex flex-col")}
              >
                <CutoutCardMedia className="relative h-60 sm:h-64 w-full">
                  <CutoutCardImage
                    alt={course.title}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={course.coverImage}
                  />
                  <CutoutCardOverlay />
                  <CutoutCardInsetLabel className="bg-card bottom-0 left-0 rounded-tr-[20px] px-5 py-3">
                    <span className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
                      {course.badge}
                    </span>
                    <CutoutCorner className="text-card absolute -right-[31px] -bottom-px rotate-90" />
                    <CutoutCorner className="text-card absolute -top-[31px] -left-px rotate-90" />
                  </CutoutCardInsetLabel>
                  <CutoutCardPin className="bg-primary text-primary-foreground shadow-foreground/10 ring-border/30 top-0 right-0 rounded-bl-[16px] px-4 py-2 text-xs font-semibold shadow-md ring-1">
                    {course.price}
                    <CutoutCorner
                      className="text-primary absolute top-0 -left-[23px] -rotate-90"
                      size={24}
                    />
                    <CutoutCorner
                      className="text-primary absolute right-0 -bottom-[23px] -rotate-90"
                      size={24}
                    />
                  </CutoutCardPin>
                </CutoutCardMedia>

                <CutoutCardContent className="flex flex-1 flex-col justify-between p-6">
                  <motion.div
                    animate="show"
                    className="contents"
                    initial="hidden"
                    variants={stagger.container}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {course.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {course.totalHours} Hours · {course.totalLessons} Lessons
                        </span>
                      </div>

                      <motion.h3
                        className="text-card-foreground text-xl font-bold leading-snug tracking-tight"
                        variants={stagger.item}
                      >
                        <Link href={`/academy/course?id=${course.id}`} className="hover:underline">
                          {course.title}
                        </Link>
                      </motion.h3>

                      <motion.p
                        className="text-muted-foreground text-xs leading-relaxed"
                        variants={stagger.item}
                      >
                        {course.headline}
                      </motion.p>
                    </div>

                    <CutoutCardFooter className="border-border/80 border-t pt-5 mt-6">
                      <Button
                        size="sm"
                        className="w-full gap-2 rounded-full font-semibold"
                        nativeButton={false}
                        render={<Link href={`/academy/course?id=${course.id}`} />}
                      >
                        <span>Enroll Now</span>
                        <Icon icon={ArrowRightGlassIcon} className="size-3.5" />
                      </Button>
                    </CutoutCardFooter>
                  </motion.div>
                </CutoutCardContent>
              </CutoutCard>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
