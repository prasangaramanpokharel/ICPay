"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useSidebar } from "@/components/ui/sidebar"
import { sortedBlogPosts } from "@/services/blog/blog"
import { cn } from "@/lib/ui/utils"

const GRADIENT_THEMES = [
  {
    bg: "from-indigo-600 via-purple-600 to-pink-500",
    wave: "text-amber-300",
    glow: "from-amber-400/40",
  },
  {
    bg: "from-cyan-500 via-blue-600 to-indigo-700",
    wave: "text-cyan-200",
    glow: "from-cyan-300/40",
  },
  {
    bg: "from-amber-500 via-rose-500 to-purple-600",
    wave: "text-yellow-200",
    glow: "from-yellow-300/40",
  },
  {
    bg: "from-violet-600 via-purple-600 to-pink-500",
    wave: "text-pink-200",
    glow: "from-pink-300/40",
  },
  {
    bg: "from-emerald-500 via-teal-600 to-blue-600",
    wave: "text-emerald-200",
    glow: "from-emerald-300/40",
  },
]

export function SidebarBlogCard() {
  const { state } = useSidebar()
  const [activeIdx, setActiveIdx] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const posts = useMemo(() => sortedBlogPosts().slice(0, 5), [])

  if (dismissed || posts.length === 0 || state === "collapsed") {
    return null
  }

  const currentPost = posts[activeIdx % posts.length]
  const nextPost = posts.length > 1 ? posts[(activeIdx + 1) % posts.length] : null

  const currentTheme = GRADIENT_THEMES[activeIdx % GRADIENT_THEMES.length]
  const nextTheme = GRADIENT_THEMES[(activeIdx + 1) % GRADIENT_THEMES.length]

  const handleDismiss = () => {
    if (activeIdx + 1 >= posts.length) {
      setDismissed(true)
    } else {
      setActiveIdx((prev) => prev + 1)
    }
  }

  return (
    <div className="relative w-full pt-2.5 pl-2">
      {/* Background stacked card (peeking from behind) */}
      {nextPost ? (
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-2 bottom-2.5 select-none rounded-2xl border border-border/50 bg-muted/40 p-3 opacity-60 shadow-xs pointer-events-none"
        >
          <p className="line-clamp-1 text-xs font-semibold text-foreground/80">
            {nextPost.title}
          </p>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
            {nextPost.description}
          </p>
          <div
            className={cn(
              "mt-2.5 h-14 w-full rounded-xl bg-gradient-to-tr opacity-50",
              nextTheme.bg,
            )}
          />
        </div>
      ) : null}

      {/* Front active card */}
      <div className="relative z-10 rounded-2xl border border-border/80 bg-card p-3 shadow-md shadow-black/5 dark:shadow-black/25">
        <h4 className="line-clamp-2 text-xs font-semibold leading-snug tracking-tight text-foreground">
          {currentPost.title}
        </h4>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {currentPost.description}
        </p>

        {/* Fluid wave gradient artwork */}
        <div
          className={cn(
            "relative mt-2.5 h-16 w-full overflow-hidden rounded-xl bg-gradient-to-tr shadow-inner",
            currentTheme.bg,
          )}
        >
          {/* Luminous glow */}
          <div
            className={cn(
              "absolute -inset-1 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] via-transparent to-transparent opacity-75",
              currentTheme.glow,
            )}
          />
          {/* Ambient shadow gradient */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent" />

          {/* Fluid wave ribbon */}
          <svg
            viewBox="0 0 200 80"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full opacity-45 mix-blend-screen"
          >
            <path
              d="M0,50 C40,25 90,70 140,35 C175,15 200,45 200,45 L200,80 L0,80 Z"
              fill="currentColor"
              className={currentTheme.wave}
            />
          </svg>
        </div>

        {/* Card actions */}
        <div className="mt-3 flex items-center justify-between pt-0.5">
          <Link
            href={`/blog/${currentPost.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-4 transition-colors hover:underline"
          >
            Read more
            <span aria-hidden="true">→</span>
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-md px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
