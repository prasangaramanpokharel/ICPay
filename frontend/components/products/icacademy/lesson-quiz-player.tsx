"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  HelpCircleIcon,
  Tick02Icon,
  Cancel01Icon,
  ReloadIcon,
  Award01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ShineBorder } from "@/components/ui/shine-border"
import { toast } from "sonner"
import type { Lesson } from "./academy-data"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

function parseQuizQuestionsFromLesson(lesson: Lesson): QuizQuestion[] {
  const rawItems = lesson.keyTakeaways || []
  const parsedQuestions: QuizQuestion[] = []

  rawItems.forEach((raw, i) => {
    const trimmed = raw.trim()
    if (!trimmed) return

    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed)
        if (parsed.question && Array.isArray(parsed.options) && parsed.options.length >= 2) {
          parsedQuestions.push({
            id: `q-${i}`,
            question: parsed.question,
            options: parsed.options,
            correctIndex: typeof parsed.correctIndex === "number" ? parsed.correctIndex : 0,
            explanation: parsed.explanation || `"${parsed.options[parsed.correctIndex || 0]}" is the correct answer.`,
          })
          return
        }
      } catch {}
    }

    if (trimmed.includes("|")) {
      const parts = trimmed.split("|").map((p) => p.trim()).filter(Boolean)
      if (parts.length >= 3) {
        const questionText = parts[0].replace(/^Q\d*[:.]\s*/i, "")
        let correctIdx = 0
        const optionsList = parts.slice(1).map((opt, optIndex) => {
          if (opt.startsWith("*")) {
            correctIdx = optIndex
            return opt.substring(1).trim()
          }
          return opt
        })

        parsedQuestions.push({
          id: `q-${i}`,
          question: questionText,
          options: optionsList,
          correctIndex: correctIdx,
          explanation: `"${optionsList[correctIdx]}" is the correct answer verified by course curriculum.`,
        })
        return
      } else if (parts.length === 2) {
        const questionText = parts[0].replace(/^Q\d*[:.]\s*/i, "")
        const answerText = parts[1].replace(/^(Answer|A)[:.]\s*/i, "").trim()
        parsedQuestions.push({
          id: `q-${i}`,
          question: questionText,
          options: [
            answerText,
            "Operates in volatile unpersisted memory without cryptographic verification.",
            "Execution traps due to cycle exhaustion on the subnet.",
            "Requires third-party centralized cloud database synchronization.",
          ],
          correctIndex: 0,
          explanation: `"${answerText}" is the correct answer.`,
        })
        return
      }
    }

    const cleanTakeaway = trimmed.replace(/^[-*•\d.]+\s*/, "").trim()
    if (cleanTakeaway.length > 5) {
      parsedQuestions.push({
        id: `q-${i}`,
        question: `Curriculum Assessment: How is "${cleanTakeaway}" correctly verified in ${lesson.title}?`,
        options: [
          `By implementing deterministic state persistence and verified caller guards.`,
          `By disabling cycle reservations and bypassing execution limits.`,
          `By delegating all canister transactions to centralized external servers.`,
          `By storing unencrypted private keys directly in query variables.`,
        ],
        correctIndex: 0,
        explanation: `"${cleanTakeaway}" requires strict adherence to canister persistence and caller authentication standards.`,
      })
    }
  })

  if (parsedQuestions.length === 0) {
    parsedQuestions.push({
      id: "q-default",
      question: `Mastery Assessment: What is the core requirement taught in ${lesson.title}?`,
      options: [
        lesson.description || "Mastering canister smart contracts, orthogonal persistence, and deterministic execution.",
        "Running unauthenticated ingress calls without caller validation.",
        "Storing private seed phrases in plaintext on the canister.",
        "Disabling cycle burn checks on mainnet canisters.",
      ],
      correctIndex: 0,
      explanation: "Production canister development requires adhering to strict security and orthogonal persistence standards.",
    })
  }

  return parsedQuestions
}

interface LessonQuizPlayerProps {
  lesson: Lesson
  isCompleted: boolean
  onComplete: () => void
  onNext?: () => void
}

export function LessonQuizPlayer({
  lesson,
  isCompleted,
  onComplete,
  onNext,
}: LessonQuizPlayerProps) {
  const questions = parseQuizQuestionsFromLesson(lesson)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({})
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<number, boolean>>({})
  const [isFinished, setIsFinished] = useState(false)

  const currentQuestion = questions[currentIdx]
  const selectedOption = selectedOptions[currentIdx]
  const isCurrentSubmitted = !!submittedQuestions[currentIdx]

  const totalQuestions = questions.length
  const progressPercent = Math.round(((currentIdx + 1) / totalQuestions) * 100)

  const handleSelectOption = (index: number) => {
    if (isCurrentSubmitted) return
    setSelectedOptions((prev) => ({
      ...prev,
      [currentIdx]: index,
    }))
  }

  const handleSubmitCurrent = () => {
    if (selectedOption === undefined) return
    setSubmittedQuestions((prev) => ({
      ...prev,
      [currentIdx]: true,
    }))
  }

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1)
    } else {
      let correctCount = 0
      questions.forEach((q, idx) => {
        if (selectedOptions[idx] === q.correctIndex) {
          correctCount++
        }
      })
      const scorePercent = Math.round((correctCount / totalQuestions) * 100)
      if (scorePercent >= 70 && !isCompleted) {
        onComplete()
        toast.success(`Quiz passed with ${scorePercent}%! Lesson completed.`)
      }
      setIsFinished(true)
    }
  }

  const handlePrevious = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1)
    }
  }

  const handleRetake = () => {
    setSelectedOptions({})
    setSubmittedQuestions({})
    setCurrentIdx(0)
    setIsFinished(false)
  }

  let finalCorrect = 0
  questions.forEach((q, idx) => {
    if (selectedOptions[idx] === q.correctIndex) {
      finalCorrect++
    }
  })
  const finalScorePercent = Math.round((finalCorrect / totalQuestions) * 100)
  const isPassed = finalScorePercent >= 70

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
            className="gap-1.5 border-primary/40 bg-primary/10 text-primary text-xs"
          >
            <HugeiconsIcon icon={HelpCircleIcon} className="size-3.5" />
            <span>Interactive Knowledge Check</span>
          </Badge>
          <span className="text-xs font-semibold text-muted-foreground">
            Passing: 70%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-foreground">
            {isFinished ? "Completed" : `${currentIdx + 1} / ${totalQuestions}`}
          </span>
          <div className="w-20 sm:w-28">
            <Progress value={isFinished ? 100 : progressPercent} className="h-1.5" />
          </div>
        </div>
      </div>

      <div className="relative z-10 my-auto py-2">
        {isFinished ? (
          <div className="text-center space-y-3 py-2">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HugeiconsIcon icon={isPassed ? Award01Icon : ReloadIcon} className="size-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground sm:text-xl">
                {isPassed ? "Mastery Demonstrated!" : "Knowledge Review Recommended"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {isPassed
                  ? `You scored ${finalCorrect} of ${totalQuestions} (${finalScorePercent}%). Your progress has been updated on-chain.`
                  : `You scored ${finalCorrect} of ${totalQuestions} (${finalScorePercent}%). Review the key architectural takeaways and try again.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetake}
                className="gap-1.5 text-xs rounded-full"
              >
                <HugeiconsIcon icon={ReloadIcon} className="size-3.5" />
                <span>Retake Quiz</span>
              </Button>
              {isPassed && onNext && (
                <Button
                  size="sm"
                  onClick={onNext}
                  className="gap-1.5 text-xs rounded-full font-semibold"
                >
                  <span>Next Lesson</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <h4 className="text-sm font-semibold tracking-tight text-foreground sm:text-base leading-snug">
              {currentQuestion.question}
            </h4>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = selectedOption === optIdx
                const isCorrect = currentQuestion.correctIndex === optIdx

                let optionStyles = "border-border/70 bg-card hover:bg-muted/40 text-foreground"
                if (isCurrentSubmitted) {
                  if (isCorrect) {
                    optionStyles = "border-success/60 bg-success/10 text-success"
                  } else if (isSelected) {
                    optionStyles = "border-destructive/60 bg-destructive/10 text-destructive"
                  } else {
                    optionStyles = "border-border/40 bg-card/50 opacity-60 text-muted-foreground"
                  }
                } else if (isSelected) {
                  optionStyles = "border-primary bg-primary/10 text-primary shadow-xs"
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isCurrentSubmitted}
                    className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-left text-xs transition-all ${optionStyles}`}
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-border/80 font-mono text-[10px] font-bold">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="leading-snug flex-1">{option}</span>
                    {isCurrentSubmitted && isCorrect && (
                      <HugeiconsIcon icon={Tick02Icon} className="size-4 shrink-0 text-success" />
                    )}
                    {isCurrentSubmitted && isSelected && !isCorrect && (
                      <HugeiconsIcon icon={Cancel01Icon} className="size-4 shrink-0 text-destructive" />
                    )}
                  </button>
                )
              })}
            </div>

            {isCurrentSubmitted && (
              <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5 text-xs text-muted-foreground animate-in fade-in duration-150">
                <span className="font-semibold text-foreground">Explanation: </span>
                <span>{currentQuestion.explanation}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative z-10 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentIdx === 0 || isFinished}
          onClick={handlePrevious}
          className="gap-1 text-xs text-muted-foreground"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
          <span>Previous</span>
        </Button>

        {!isFinished && (
          <div>
            {!isCurrentSubmitted ? (
              <Button
                size="sm"
                disabled={selectedOption === undefined}
                onClick={handleSubmitCurrent}
                className="gap-1.5 text-xs font-semibold px-4"
              >
                <span>Check Answer</span>
                <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleNext}
                className="gap-1.5 text-xs font-semibold px-4"
              >
                <span>{currentIdx === totalQuestions - 1 ? "Finish Quiz" : "Next Question"}</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
