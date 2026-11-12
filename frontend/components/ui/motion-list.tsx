"use client"

import type * as React from "react"
import { motion, type HTMLMotionProps, type Variants } from "motion/react"
import { cn } from "@/lib/ui/utils"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
}

export function MotionList({
  children,
  className,
  variants = containerVariants,
  initial = "hidden",
  animate = "visible",
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={variants}
      initial={initial}
      animate={animate}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function MotionListItem({
  children,
  className,
  variants = itemVariants,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={variants}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
