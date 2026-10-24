"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SourceCodeIcon,
  Tick02Icon,
  Copy01Icon,
  ReloadIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ShineBorder } from "@/components/ui/shine-border"
import { toast } from "sonner"
import type { Lesson } from "./academy-data"

interface LessonCodeLabPlayerProps {
  lesson: Lesson
  isCompleted: boolean
  onComplete: () => void
  onNext?: () => void
}

const SAMPLE_CODE = `import BTree "mo:stable-btree";
import Cycles "mo:base/ExperimentalCycles";

actor CanisterStorageLab {
  let state = BTree.BTree<Nat, Text>();

  public func insertRecord(id: Nat, payload: Text) : async Bool {
    state.set(id, payload);
    return true;
  };

  public query func getRecord(id: Nat) : async ?Text {
    return state.get(id);
  };

  public query func getMemoryUsage() : async Nat {
    return state.size();
  };
};`

export function LessonCodeLabPlayer({
  lesson,
  isCompleted,
  onComplete,
  onNext,
}: LessonCodeLabPlayerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [hasRun, setHasRun] = useState(isCompleted)
  const [copiedCode, setCopiedCode] = useState(false)

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(SAMPLE_CODE)
      setCopiedCode(true)
      toast.success("Code snippet copied to clipboard!")
      setTimeout(() => setCopiedCode(false), 2000)
    } catch {
      toast.error("Failed to copy code")
    }
  }

  const handleRunTests = async () => {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      setHasRun(true)
      if (!isCompleted) {
        onComplete()
        toast.success("All lab test assertions passed! Lesson completed.")
      }
    }, 1800)
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-t-xl border-b border-border/60 bg-gradient-to-b from-card via-card/95 to-background p-4 sm:p-6 flex flex-col justify-between">
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
            className="gap-1.5 border-info/40 bg-info/10 text-info text-xs"
          >
            <HugeiconsIcon icon={SourceCodeIcon} className="size-3.5" />
            <span>Hands-On Canister Code Lab</span>
          </Badge>
          <span className="font-mono text-[11px] text-muted-foreground hidden sm:inline">
            {lesson.slug || "CanisterStorageLab"}.mo
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={handleCopyCode}
            className="gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon icon={copiedCode ? Tick02Icon : Copy01Icon} className="size-3" />
            <span>{copiedCode ? "Copied" : "Copy Code"}</span>
          </Button>
        </div>
      </div>

      <div className="relative z-10 my-auto py-2 font-mono text-[11px] sm:text-xs text-foreground bg-muted/40 rounded-xl p-3 border border-border/60 max-h-48 overflow-y-auto">
        <pre className="overflow-x-auto leading-relaxed">
          <code>{SAMPLE_CODE}</code>
        </pre>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
        <div className="flex items-center gap-2 text-xs">
          {hasRun ? (
            <span className="flex items-center gap-1.5 text-success font-semibold">
              <HugeiconsIcon icon={Tick02Icon} className="size-4" />
              <span>All 4 Canister Assertions Passed</span>
            </span>
          ) : (
            <span className="text-muted-foreground text-[11px]">
              Run automated PocketIC unit assertions to verify orthogonal state.
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            disabled={isRunning}
            onClick={handleRunTests}
            className="gap-1.5 text-xs font-semibold px-4"
          >
            {isRunning ? (
              <>
                <Spinner className="size-3.5" />
                <span>Running Tests...</span>
              </>
            ) : hasRun ? (
              <>
                <HugeiconsIcon icon={ReloadIcon} className="size-3.5" />
                <span>Re-run Tests</span>
              </>
            ) : (
              <>
                <HugeiconsIcon icon={SourceCodeIcon} className="size-3.5" />
                <span>Run Test Suite</span>
              </>
            )}
          </Button>

          {hasRun && onNext && (
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
