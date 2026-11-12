"use client"

import type * as React from "react"
import { motion, AnimatePresence, type HTMLMotionProps } from "motion/react"
import { cn } from "@/lib/ui/utils"

export function MotionTabIndicator({
  layoutId = "active-tab-indicator",
  className,
  ...props
}: HTMLMotionProps<"span"> & { layoutId?: string }) {
  return (
    <motion.span
      layoutId={layoutId}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      className={cn(
        "absolute inset-0 -z-10 rounded-xl bg-background shadow-xs dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

export function MotionTabPanel({
  tabKey,
  children,
  className,
  ...props
}: HTMLMotionProps<"div"> & { tabKey: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={tabKey}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={cn("w-full min-w-0", className)}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
