"use client"

import type { ReactNode } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/ui/utils"
import { AppPageHeader } from "@/components/layout/dashboard/app-page-header"

export function AppPage({
  title,
  description,
  actions,
  accessory,
  back,
  children,
  className,
}: {
  title?: ReactNode
  description?: string
  actions?: ReactNode
  accessory?: ReactNode
  back?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className={cn("space-y-6", className)}
    >
      {title ? (
        <AppPageHeader
          title={title}
          description={description}
          actions={actions}
          accessory={accessory}
          back={back}
        />
      ) : null}
      {children}
    </motion.div>
  )
}
