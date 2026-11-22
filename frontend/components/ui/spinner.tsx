import type * as React from "react"
import { cn } from "@/lib/ui/utils"

export type SpinnerProps = React.ComponentProps<"svg">

export function EightDotsRotateIcon({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <circle cx="12" cy="3" r="2" opacity="1" />
      <circle cx="18.36" cy="5.64" r="2" opacity="0.875" />
      <circle cx="21" cy="12" r="2" opacity="0.75" />
      <circle cx="18.36" cy="18.36" r="2" opacity="0.625" />
      <circle cx="12" cy="21" r="2" opacity="0.5" />
      <circle cx="5.64" cy="18.36" r="2" opacity="0.375" />
      <circle cx="3" cy="12" r="2" opacity="0.25" />
      <circle cx="5.64" cy="5.64" r="2" opacity="0.125" />
    </svg>
  )
}

function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <EightDotsRotateIcon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
export { SpinnerBadge } from "./spinner-badge"
