"use client"

import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Tick02Icon,
  Time02Icon,
  SecurityLockIcon,
  Coins01Icon,
  Award01Icon,
  HelpCircleIcon,
  SourceCodeIcon,
  Book01Icon,
  PlayIcon,
} from "@hugeicons/core-free-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog"
import { ToastSuccessIcon } from "@/components/ui/sonner"
import { ShineBorder } from "@/components/ui/shine-border"
import { LessonQuizPlayer } from "./lesson-quiz-player"
import { LessonCodeLabPlayer } from "./lesson-code-lab-player"
import { LessonReadingPlayer } from "./lesson-reading-player"
import type { Lesson } from "./academy-data"

interface LessonVideoPlayerProps {
  lesson: Lesson
  moduleTitle: string
  courseTitle: string
  coursePrice?: string
  isLocked?: boolean
  isAuthenticated?: boolean
  onUnlock?: () => void
  onLogin?: () => void
  lessonIndex: number
  totalLessonsInModule: number
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
  isCompleted: boolean
  onToggleComplete: () => void
  isAllCompleted?: boolean
  onClaimCertificate?: () => void
}

export function LessonVideoPlayer({
  lesson,
  moduleTitle,
  courseTitle,
  coursePrice = "2 ICP",
  isLocked = false,
  isAuthenticated = false,
  onUnlock,
  onLogin,
  lessonIndex,
  totalLessonsInModule,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  isCompleted,
  onToggleComplete,
  isAllCompleted = false,
  onClaimCertificate,
}: LessonVideoPlayerProps) {
  const videoSource =
    lesson.videoUrl ||
    `https://www.youtube-nocookie.com/embed/${lesson.youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`

  const thumbnailSource =
    lesson.posterUrl || "/images/pages/icacademy/hero.png"

  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
      {isLocked ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-t-xl border-b border-border/60 bg-muted/40">
          <Image
            src={thumbnailSource}
            alt={lesson.title}
            fill
            className="object-cover blur-sm brightness-40"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-background/60 backdrop-blur-xs">
            <HugeiconsIcon icon={SecurityLockIcon} className="size-8 text-primary" strokeWidth={1.75} />
            <h3 className="mt-3 text-base font-bold text-foreground sm:text-lg">
              Unlock Full Course to Access This Lesson
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              This lesson and interactive code labs are reserved for enrolled students. Lifetime access via on-chain ICP payment.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {!isAuthenticated ? (
                <Button
                  onClick={onLogin}
                  className="relative overflow-hidden gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold px-4"
                >
                  <ShineBorder
                    className="rounded-[inherit]"
                    borderWidth={1.2}
                    duration={8}
                    shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <HugeiconsIcon icon={SecurityLockIcon} className="size-3.5" />
                    Connect Wallet to Unlock
                  </span>
                </Button>
              ) : (
                <Button
                  onClick={onUnlock}
                  className="relative overflow-hidden gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold px-4"
                >
                  <ShineBorder
                    className="rounded-[inherit]"
                    borderWidth={1.2}
                    duration={8}
                    shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <HugeiconsIcon icon={Coins01Icon} className="size-3.5" />
                    Unlock Course for {coursePrice}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : lesson.type === "quiz" ? (
        <LessonQuizPlayer
          key={lesson.id}
          lesson={lesson}
          isCompleted={isCompleted}
          onComplete={onToggleComplete}
          onNext={hasNext ? onNext : undefined}
        />
      ) : lesson.type === "code_lab" ? (
        <LessonCodeLabPlayer
          key={lesson.id}
          lesson={lesson}
          isCompleted={isCompleted}
          onComplete={onToggleComplete}
          onNext={hasNext ? onNext : undefined}
        />
      ) : lesson.type === "reading" ? (
        <LessonReadingPlayer
          key={lesson.id}
          lesson={lesson}
          isCompleted={isCompleted}
          onComplete={onToggleComplete}
          onNext={hasNext ? onNext : undefined}
        />
      ) : (
        <HeroVideoDialog
          key={lesson.id}
          animationStyle="from-center"
          videoSrc={videoSource}
          thumbnailSrc={thumbnailSource}
          thumbnailAlt={lesson.title}
          className="w-full"
          triggerClassName="rounded-t-xl rounded-b-none border-0 border-b border-border/60 shadow-none"
        />
      )}

      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {moduleTitle}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Lesson {lessonIndex + 1} of {totalLessonsInModule}
            </Badge>
            {lesson.type === "quiz" ? (
              <Badge
                variant="outline"
                className="gap-1 text-xs border-primary/40 bg-primary/10 text-primary"
              >
                <HugeiconsIcon icon={HelpCircleIcon} className="size-3" />
                <span>Interactive Quiz</span>
              </Badge>
            ) : lesson.type === "code_lab" ? (
              <Badge
                variant="outline"
                className="gap-1 text-xs border-info/40 bg-info/10 text-info"
              >
                <HugeiconsIcon icon={SourceCodeIcon} className="size-3" />
                <span>Hands-On Code Lab</span>
              </Badge>
            ) : lesson.type === "reading" ? (
              <Badge
                variant="outline"
                className="gap-1 text-xs border-secondary/50 bg-secondary/20 text-secondary-foreground"
              >
                <HugeiconsIcon icon={Book01Icon} className="size-3.5" />
                <span>Reading Deep Dive</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-xs">
                <HugeiconsIcon icon={PlayIcon} className="size-3" />
                <span>Video Masterclass</span>
              </Badge>
            )}
            {lesson.previewAvailable && (
              <Badge variant="default" className="text-xs">
                Free Preview Available
              </Badge>
            )}
            {isLocked && (
              <Badge variant="destructive" className="text-xs">
                Locked
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <HugeiconsIcon icon={Time02Icon} className="size-3.5" />
            <span>{lesson.durationMinutes} min</span>
          </div>
        </div>

        <CardTitle className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
          {lesson.title}
        </CardTitle>

        <p className="text-xs text-muted-foreground">
          Track: {courseTitle}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {lesson.description}
        </p>

        {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Architectural Takeaways
            </span>
            <ul className="space-y-2 text-xs text-muted-foreground md:text-sm">
              {lesson.keyTakeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Separator />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant={isCompleted ? "secondary" : "outline"}
            className="gap-2 text-xs font-medium"
            disabled={isLocked}
            onClick={onToggleComplete}
          >
            {isCompleted ? (
              <ToastSuccessIcon />
            ) : (
              <HugeiconsIcon
                icon={Tick02Icon}
                className="size-4 text-muted-foreground"
              />
            )}
            <span>{isCompleted ? "Completed" : "Mark as Completed"}</span>
          </Button>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrevious}
              onClick={onPrevious}
              className="gap-1.5 text-xs"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
              <span>Previous</span>
            </Button>
            {hasNext ? (
              <Button
                size="sm"
                onClick={onNext}
                className="gap-1.5 text-xs font-semibold"
              >
                <span>Next</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
              </Button>
            ) : isAllCompleted ? (
              <Button
                size="sm"
                onClick={onClaimCertificate}
                className="gap-1.5 text-xs font-semibold bg-primary text-primary-foreground shadow-xs"
              >
                <HugeiconsIcon icon={Award01Icon} className="size-3.5" />
                <span>Claim Certificate</span>
              </Button>
            ) : (
              <Button
                size="sm"
                disabled
                className="gap-1.5 text-xs font-semibold"
              >
                <span>Next</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
