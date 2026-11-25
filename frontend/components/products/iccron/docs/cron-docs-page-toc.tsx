"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/ui/utils"
import type { CronDocHeading } from "@/lib/cron/docs/types"

export function CronDocsPageToc({
  headings,
  className,
}: {
  headings: CronDocHeading[]
  className?: string
}) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "")

  useEffect(() => {
    if (headings.length === 0) return

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) setActiveId(visible[0].target.id)
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.25, 0.5, 1] }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className={cn("space-y-3", className)} aria-label="On this page">
      <p className="text-xs font-semibold text-muted-foreground">On this page</p>
      <div className="space-y-1 border-l border-border/60">
        {headings.map((heading, idx) => {
          const isActive = activeId === heading.id

          return (
            <a
              key={`${heading.id}-${idx}`}
              href={`#${heading.id}`}
              className={cn(
                "block text-xs leading-relaxed transition-colors -ml-px border-l-2 py-1",
                heading.level === 3 ? "pl-5" : "pl-3",
                isActive
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {heading.text}
            </a>
          )
        })}
      </div>
    </nav>
  )
}
