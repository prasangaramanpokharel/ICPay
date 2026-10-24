"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Book01Icon,
  Tick02Icon,
  Time02Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShineBorder } from "@/components/ui/shine-border"
import { toast } from "sonner"
import type { Lesson } from "./academy-data"

interface LessonReadingPlayerProps {
  lesson: Lesson
  isCompleted: boolean
  onComplete: () => void
  onNext?: () => void
}

export function LessonReadingPlayer({
  lesson,
  isCompleted,
  onComplete,
  onNext,
}: LessonReadingPlayerProps) {
  const handleComplete = () => {
    if (!isCompleted) {
      onComplete()
      toast.success("Reading completed! Lesson marked as done.")
    }
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-t-xl border-b border-border/60 bg-gradient-to-b from-card via-card/95 to-background p-5 sm:p-7 flex flex-col justify-between">
      <ShineBorder
        className="rounded-[inherit] pointer-events-none"
        borderWidth={1}
        duration={14}
        shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
      />

      <div className="relative z-10 flex items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 border-secondary/50 bg-secondary/20 text-secondary-foreground text-xs"
          >
            <HugeiconsIcon icon={Book01Icon} className="size-3.5" />
            <span>Architectural Deep Dive</span>
          </Badge>
          <span className="text-xs font-semibold text-muted-foreground">
            Documented Protocol Reference
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <HugeiconsIcon icon={Time02Icon} className="size-3.5" />
          <span>{lesson.durationMinutes} min read</span>
        </div>
      </div>

      <div className="relative z-10 my-auto py-2 space-y-3 overflow-y-auto max-h-48 pr-1">
        <h3 className="text-base font-bold text-foreground sm:text-lg">
          {lesson.title}
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {lesson.description}
        </p>
        {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Core Principles
            </span>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {lesson.keyTakeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="relative z-10 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
        <span className="text-xs text-muted-foreground">
          {isCompleted ? "Reading verified" : "Review the material above before proceeding."}
        </span>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isCompleted ? "secondary" : "default"}
            onClick={handleComplete}
            className="gap-1.5 text-xs font-semibold px-4"
          >
            <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
            <span>{isCompleted ? "Completed" : "Complete Reading"}</span>
          </Button>

          {isCompleted && onNext && (
            <Button
              size="sm"
              variant="outline"
              onClick={onNext}
              className="gap-1.5 text-xs font-semibold"
            >
              <span>Next Lesson</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
