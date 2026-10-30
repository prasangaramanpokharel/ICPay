"use client"

import type React from "react"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/ui/utils"
import { createPolymorphic } from "@/lib/as-child"

const ark = {
  div: createPolymorphic("div"),
}

const ITEM = '[data-slot="motion-highlight-item"]'

interface MotionHighlightContextValue {
  current: string | null
  hover: boolean
  select: (value: string) => void
  setHovered: (value: string | null) => void
  value: string | null
}

const MotionHighlightContext = createContext<MotionHighlightContextValue>({
  current: null,
  hover: false,
  select: () => undefined,
  setHovered: () => undefined,
  value: null,
})

const itemsOf = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(ITEM)).filter(
    (item) => item.closest('[data-slot="motion-highlight"]') === root
  )

const offsetIn = (node: HTMLElement, root: HTMLElement) => {
  let left = 0
  let top = 0
  let current: HTMLElement | null = node
  while (current && current !== root) {
    left += current.offsetLeft
    top += current.offsetTop
    current = current.offsetParent as HTMLElement | null
  }
  return { height: node.offsetHeight, left, top, width: node.offsetWidth }
}

const place = (root: HTMLElement, current: string | null) => {
  const highlight = root.querySelector<HTMLElement>(
    '[data-slot="motion-highlight-indicator"]'
  )
  if (!highlight) {
    return
  }
  const item =
    current === null
      ? undefined
      : itemsOf(root).find(
          (node) => node.getAttribute("data-value") === current
        )
  if (!item) {
    highlight.removeAttribute("data-visible")
    return
  }
  const first = !highlight.hasAttribute("data-placed")
  const out =
    !highlight.hasAttribute("data-visible") &&
    getComputedStyle(highlight).opacity === "0"
  const box = offsetIn(item, root)
  if (first || out) {
    highlight.style.transitionProperty = "none"
  }
  highlight.style.setProperty("--motion-highlight-x", `${box.left}px`)
  highlight.style.setProperty("--motion-highlight-y", `${box.top}px`)
  highlight.style.setProperty("--motion-highlight-width", `${box.width}px`)
  highlight.style.setProperty("--motion-highlight-height", `${box.height}px`)
  if (first) {
    highlight.setAttribute("data-visible", "")
  }
  if (first || out) {
    highlight.getBoundingClientRect()
    highlight.style.transitionProperty = ""
  }
  highlight.setAttribute("data-placed", "")
  highlight.setAttribute("data-visible", "")
}

export interface MotionHighlightProps
  extends Omit<React.ComponentProps<"div">, "defaultValue"> {
  defaultValue?: string
  highlightClassName?: string
  hover?: boolean
  onValueChange?: (value: string) => void
  value?: string | null
}

export const MotionHighlight = (props: MotionHighlightProps) => {
  const {
    defaultValue,
    highlightClassName,
    hover = false,
    onValueChange,
    value: valueProp,
    className,
    children,
    ...rest
  } = props

  const ref = useRef<HTMLDivElement>(null)
  const [uncontrolled, setUncontrolled] = useState<string | null>(
    defaultValue ?? null
  )
  const [hovered, setHovered] = useState<string | null>(null)
  const value = valueProp === undefined ? uncontrolled : valueProp
  const current = hovered ?? value

  const select = (next: string) => {
    if (valueProp === undefined && !hover) {
      setUncontrolled(next)
    }
    onValueChange?.(next)
  }

  useEffect(() => {
    const root = ref.current
    if (!root) {
      return
    }
    place(root, current)
    const observer = new ResizeObserver(() => place(root, current))
    observer.observe(root)
    for (const item of itemsOf(root)) {
      observer.observe(item)
    }
    return () => observer.disconnect()
  }, [current])

  return (
    <MotionHighlightContext.Provider
      value={{ current, hover, select, setHovered, value }}
    >
      <div
        className={cn("relative isolate", className)}
        data-slot="motion-highlight"
        ref={ref}
        {...rest}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-0 left-0 -z-10",
            "h-(--motion-highlight-height) w-(--motion-highlight-width) [translate:var(--motion-highlight-x)_var(--motion-highlight-y)]",
            "rounded-md bg-muted",
            "opacity-0 delay-150 data-visible:opacity-100 data-visible:delay-0",
            "transition-[translate,width,height,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "motion-reduce:transition-none!",
            highlightClassName
          )}
          data-slot="motion-highlight-indicator"
        />
        {children}
      </div>
    </MotionHighlightContext.Provider>
  )
}

export interface MotionHighlightItemProps
  extends React.ComponentProps<typeof ark.div> {
  disabled?: boolean
  value: string
}

export const MotionHighlightItem = (props: MotionHighlightItemProps) => {
  const { disabled = false, value, onClick, ...rest } = props
  const {
    current,
    hover,
    select,
    setHovered,
    value: chosen,
  } = useContext(MotionHighlightContext)

  return (
    <ark.div
      data-active={chosen && chosen === value ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-highlighted={current && current === value ? "" : undefined}
      data-slot="motion-highlight-item"
      data-value={value}
      onBlur={() => {
        if (hover) {
          setHovered(null)
        }
      }}
      onClick={(event: React.MouseEvent<HTMLDivElement>) => {
        onClick?.(event)
        if (!disabled && !hover) {
          select(value)
        }
      }}
      onFocus={(event: React.FocusEvent<HTMLDivElement>) => {
        if (
          hover &&
          !disabled &&
          (event.target as HTMLElement).matches(":focus-visible")
        ) {
          setHovered(value)
        }
      }}
      onPointerEnter={() => {
        if (hover && !disabled) {
          setHovered(value)
        }
      }}
      onPointerLeave={() => {
        if (hover) {
          setHovered(null)
        }
      }}
      {...rest}
    />
  )
}
