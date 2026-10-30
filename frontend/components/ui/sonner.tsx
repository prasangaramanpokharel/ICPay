"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  Cancel01Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/ui/utils"

export function ToastSuccessIcon({ className }: { className?: string } = {}) {
  return (
    <HugeiconsIcon
      icon={CheckmarkCircle02Icon}
      className={cn("size-4 text-success shrink-0", className)}
      strokeWidth={2}
    />
  )
}

const Toaster = ({ position = "bottom-center", ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position={position}
      className="toaster group"
      closeButton={false}
      icons={{
        success: <ToastSuccessIcon />,
        info: (
          <HugeiconsIcon
            icon={InformationCircleIcon}
            className="size-4 text-primary shrink-0"
            strokeWidth={2}
          />
        ),
        warning: (
          <HugeiconsIcon
            icon={Alert02Icon}
            className="size-4 text-warning shrink-0"
            strokeWidth={2}
          />
        ),
        error: (
          <HugeiconsIcon
            icon={CancelCircleIcon}
            className="size-4 text-destructive shrink-0"
            strokeWidth={2}
          />
        ),
        loading: <Spinner className="size-4 shrink-0 text-foreground" />,
        close: (
          <HugeiconsIcon
            icon={Cancel01Icon}
            className="size-3 text-muted-foreground hover:text-foreground"
            strokeWidth={2}
          />
        ),
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
            "group-[.toaster]:border group-[.toaster]:border-border/70",
            "group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
            "group-[.toaster]:py-2 group-[.toaster]:px-3.5",
            "group-[.toaster]:gap-2.5",
            "group-[.toaster]:text-xs group-[.toaster]:font-medium",
            "group-[.toaster]:w-fit group-[.toaster]:max-w-[420px]"
          ),
          title: "text-xs font-medium text-foreground tracking-tight leading-snug",
          description: "text-[11px] text-muted-foreground leading-normal mt-0.5",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:px-2.5 group-[.toast]:py-1 group-[.toast]:text-xs font-medium cursor-pointer",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:px-2.5 group-[.toast]:py-1 group-[.toast]:text-xs font-medium cursor-pointer",
          closeButton:
            "group-[.toast]:bg-card group-[.toast]:text-muted-foreground hover:group-[.toast]:text-foreground group-[.toast]:border-border/60",
          icon: "shrink-0 mr-0 self-center",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
