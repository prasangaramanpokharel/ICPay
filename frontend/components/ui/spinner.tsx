import { cn } from "@/lib/ui/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading02Icon } from "@hugeicons/core-free-icons"

type SpinnerProps = Omit<React.ComponentProps<typeof HugeiconsIcon>, "icon">

function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <HugeiconsIcon
      icon={Loading02Icon}
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
