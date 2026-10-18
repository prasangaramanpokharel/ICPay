import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/ui/utils"

export function SpinnerBadge({
  children,
  variant = "default",
  className,
}: {
  children?: React.ReactNode
  variant?: "default" | "secondary" | "outline" | "destructive"
  className?: string
}) {
  return (
    <Badge variant={variant} className={cn("gap-1.5", className)}>
      <Spinner data-icon="inline-start" />
      {children}
    </Badge>
  )
}

export function SpinnerBadgeDemo() {
  return (
    <div className="flex items-center gap-4 [--radius:1.2rem]">
      <Badge>
        <Spinner data-icon="inline-start" />
        Syncing
      </Badge>
      <Badge variant="secondary">
        <Spinner data-icon="inline-start" />
        Updating
      </Badge>
      <Badge variant="outline">
        <Spinner data-icon="inline-start" />
        Processing
      </Badge>
    </div>
  )
}
