import { cn } from "@/lib/ui/utils"

export function CommunityChannelPremiumLabel({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning",
        className
      )}
    >
      {label}
    </span>
  )
}
