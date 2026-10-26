"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { InfoIcon, TriangleAlertIcon, OctagonXIcon } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/ui/utils"

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

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton={true}
      icons={{
        success: <ToastSuccessIcon />,
        info: <InfoIcon className="size-4 text-primary shrink-0" />,
        warning: <TriangleAlertIcon className="size-4 text-warning shrink-0" />,
        error: <OctagonXIcon className="size-4 text-destructive shrink-0" />,
        loading: <Spinner className="size-4 shrink-0" />,
        close: "Close",
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "calc(var(--radius) - 2px)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: cn(
            "group toast font-sans",
            "group-[.toaster]:bg-card/95 group-[.toaster]:backdrop-blur-md",
            "group-[.toaster]:text-card-foreground",
            "group-[.toaster]:border group-[.toaster]:border-border/80",
            "group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
            "group-[.toaster]:py-2.5 group-[.toaster]:px-3.5",
            "group-[.toaster]:gap-2.5",
            "group-[.toaster]:text-xs group-[.toaster]:font-medium",
            "group-[.toaster]:min-w-[260px] group-[.toaster]:max-w-[340px]"
          ),
          title: "text-xs font-medium text-foreground tracking-tight leading-snug",
          description: "text-[11px] text-muted-foreground leading-normal mt-0.5",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:px-2.5 group-[.toast]:py-1 group-[.toast]:text-xs font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:px-2.5 group-[.toast]:py-1 group-[.toast]:text-xs font-medium",
          icon: "shrink-0 mr-0 self-center",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

