"use client"

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"
import { CopyIconIndicator } from "@/components/ui/copy-button"

import { cn } from "@/lib/ui/utils"

interface CodeTab {
  label: string
  code: string
  language?: string
}

interface CodeBlockProps {
  tabs?: CodeTab[]
  code?: string
  language?: string
  className?: string
}

export function CodeBlock({
  tabs,
  code,
  language = "bash",
  className,
}: CodeBlockProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [copied, setCopied] = useState(false)
  const [direction, setDirection] = useState(0)
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicator, setIndicator] = useState<{
    left: number
    width: number
  } | null>(null)

  const measureIndicator = useCallback(() => {
    const container = tabsContainerRef.current
    const activeEl = tabRefs.current[activeTab]

    if (!container || !activeEl) {
      return
    }

    const containerRect = container.getBoundingClientRect()
    const tabRect = activeEl.getBoundingClientRect()

    setIndicator({
      left: tabRect.left - containerRect.left,
      width: tabRect.width,
    })
  }, [activeTab])

  const codeContent = useMemo(() => {
    if (tabs && tabs.length > 0) {
      return tabs
    }
    if (code) {
      return [{ label: language, code, language }]
    }
    return []
  }, [tabs, code, language])

  const currentCode = codeContent[activeTab]?.code || ""

  useLayoutEffect(() => {
    measureIndicator()

    const resizeObserver = new ResizeObserver(measureIndicator)
    const container = tabsContainerRef.current

    if (container) {
      resizeObserver.observe(container)
    }

    for (const tab of tabRefs.current) {
      if (tab) {
        resizeObserver.observe(tab)
      }
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [measureIndicator])

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentCode)
      }
      setCopied(true)
      toast.success("Successfully copied")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const handleTabChange = (index: number) => {
    setDirection(index > activeTab ? 1 : -1)
    setActiveTab(index)
  }

  if (codeContent.length === 0) return null

  return (
    <div
      className={cn(
        "group relative w-full min-w-0 max-w-full overflow-hidden rounded-2xl border p-0.5",
        "border-border/70 dark:border-white/10",
        "bg-card/75 dark:bg-card/50 backdrop-blur-xs",
        "text-foreground",
        className
      )}
    >
      {/* Tab Bar */}
      {codeContent.length > 1 && (
        <div className="relative flex items-center pr-2.5 border-b border-border/40">
          <div
            role="tablist"
            className={cn(
              "flex min-w-0 flex-1 gap-1 rounded-tl-xl text-xs leading-6",
              "overflow-x-auto overflow-y-hidden",
              "scrollbar-thin scrollbar-thumb-rounded",
              "scrollbar-thumb-black/15 hover:scrollbar-thumb-black/20",
              "dark:scrollbar-thumb-white/20 dark:hover:scrollbar-thumb-white/25"
            )}
          >
            <div ref={tabsContainerRef} className="relative flex gap-1 px-1">
              {codeContent.map((tab, index) => (
                <button
                  key={`${tab.label}-${index}`}
                  ref={(element) => {
                    tabRefs.current[index] = element
                  }}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === index}
                  onClick={() => handleTabChange(index)}
                  className={cn(
                    "relative my-1 mb-1.5 flex items-center gap-1.5 outline-0",
                    "font-medium whitespace-nowrap transition-colors duration-150 cursor-pointer",
                    "rounded-lg px-2 py-0.5",
                    "hover:bg-muted/60",
                    activeTab === index
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
              {indicator && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-primary"
                  initial={false}
                  animate={{
                    left: indicator.left,
                    width: indicator.width,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Code Content */}
      <div className="relative w-full min-w-0 max-w-full overflow-hidden">
        {/* Copy Button */}
        <motion.button
          onClick={handleCopy}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "absolute top-2.5 right-2.5 z-10",
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer",
            "text-muted-foreground",
            "bg-background/85 backdrop-blur-md dark:bg-card/85",
            "border border-border/60",
            "opacity-80 group-hover:opacity-100",
            "hover:bg-accent hover:text-foreground",
            "transition-all duration-150",
            "focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none"
          )}
          aria-label="Copy code"
        >
          <CopyIconIndicator copied={copied} iconClassName="size-3.5" />
          <span>{copied ? "Copied" : "Copy"}</span>
        </motion.button>
        <pre
          className={cn(
            "m-0 w-full min-w-0 p-4 pr-24 font-mono text-xs sm:text-sm leading-relaxed",
            "bg-muted/30 dark:bg-black/35",
            codeContent.length > 1 ? "rounded-b-2xl" : "rounded-2xl",
            "overflow-x-auto",
            "scrollbar-thin scrollbar-thumb-rounded",
            "scrollbar-thumb-black/15 hover:scrollbar-thumb-black/20",
            "dark:scrollbar-thumb-white/20 dark:hover:scrollbar-thumb-white/25",
            "[&::-webkit-scrollbar]:h-2",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
            "[&::-webkit-scrollbar-thumb]:bg-black/15",
            "[&::-webkit-scrollbar-thumb]:dark:bg-white/20",
            "[&::-webkit-scrollbar-thumb]:hover:bg-black/20",
            "[&::-webkit-scrollbar-thumb:hover]:dark:bg-white/25",
            "[&::-webkit-scrollbar-track]:bg-transparent"
          )}
        >
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.code
              key={activeTab}
              custom={direction}
              initial={{
                opacity: 0,
                x: direction > 0 ? 20 : -20,
                filter: "blur(4px)",
              }}
              animate={{
                opacity: 1,
                x: 0,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                x: direction > 0 ? -20 : 20,
                filter: "blur(4px)",
              }}
              transition={{
                duration: 0.15,
                ease: "easeOut",
              }}
              className="block w-fit min-w-full font-mono whitespace-pre text-foreground"
            >
              {currentCode}
            </motion.code>
          </AnimatePresence>
        </pre>
      </div>
    </div>
  )
}
