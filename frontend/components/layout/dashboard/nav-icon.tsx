import { Icon } from "@/components/ui/icon"
import type { UiIcon } from "@thesvg/ui-react"
import { cn } from "@/lib/ui/utils"

export function NavIcon({
  icon,
  className,
  strokeWidth = 1.75,
}: {
  icon: UiIcon
  className?: string
  strokeWidth?: number
}) {
  return (
    <Icon icon={icon} className={cn("size-3.5 shrink-0", className)} strokeWidth={strokeWidth} />
  )
}
