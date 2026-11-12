"use client"

import type * as React from "react"
import { MotionConfig } from "motion/react"

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
    >
      {children}
    </MotionConfig>
  )
}
