"use client"

import { motion, useReducedMotion } from "motion/react"
import { Toaster, toast } from "@/components/ui/toast"

export function ToastSuccessIcon() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.span
      initial={{ scale: reduceMotion ? 1 : 0.6, opacity: reduceMotion ? 1 : 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className="flex size-4.5 items-center justify-center rounded-full bg-success text-background shrink-0 shadow-xs"
    >
      <svg
        className="size-2.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          d="M3.5 8.5L6.5 11.5L12.5 5"
          initial={{ pathLength: reduceMotion ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        />
      </svg>
    </motion.span>
  )
}

export { Toaster, toast }
