"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Icon } from "@/components/ui/icon"
import { CopyGlassIcon, CheckGlassOutlineIcon } from "@thesvg/ui-react"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { copyText } from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"

export interface CopyIconIndicatorProps {
  copied: boolean
  className?: string
  iconClassName?: string
}

export function CopyIconIndicator({
  copied,
  className,
  iconClassName = "size-3",
}: CopyIconIndicatorProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <span className={cn("relative flex items-center justify-center", iconClassName, className)}>
      <motion.span
        initial={false}
        animate={
          shouldReduceMotion
            ? { opacity: copied ? 0 : 1 }
            : {
                scale: copied ? 0 : 1,
                opacity: copied ? 0 : 1,
              }
        }
        transition={{ duration: 0.15 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Icon icon={CopyGlassIcon} className={iconClassName} strokeWidth={2} />
      </motion.span>
      <motion.span
        initial={false}
        animate={
          shouldReduceMotion
            ? { opacity: copied ? 1 : 0 }
            : {
                scale: copied ? 1 : 0,
                opacity: copied ? 1 : 0,
              }
        }
        transition={{ type: "spring", stiffness: 380, damping: 20 }}
        className="absolute inset-0 flex items-center justify-center text-success"
      >
        <Icon icon={CheckGlassOutlineIcon} className="size-full text-success" strokeWidth={2.5} />
      </motion.span>
    </span>
  )
}

export interface CopyButtonProps extends React.ComponentProps<typeof Button> {
  value?: string
  text?: string
  successMessage?: string
  iconClassName?: string
  onCopySuccess?: () => void
}

export function CopyButton({
  value,
  text,
  successMessage = "Successfully copied",
  iconClassName = "size-3",
  onCopySuccess,
  className,
  onClick,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const targetText = value ?? text ?? ""

  const handleCopy: React.ComponentProps<typeof Button>["onClick"] = async (e) => {
    onClick?.(e)
    if (e.defaultPrevented || !targetText) return

    try {
      await copyText(targetText)
      setCopied(true)
      toast.add({
        title: successMessage,
        type: "info",
      })
      onCopySuccess?.()
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.add({
        title: "Failed to copy",
        type: "error",
      })
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={handleCopy}
      className={cn("shrink-0 cursor-pointer", className)}
      {...props}
    >
      <CopyIconIndicator copied={copied} iconClassName={iconClassName} />
    </Button>
  )
}
