"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AppIcon, type AppIconName } from "@/components/ui/app-icon"
import { Badge } from "@/components/ui/badge"

export function ServiceTile({
  href,
  label,
  icon,
  onClick,
  badge,
  onPrefetch,
}: {
  href?: string
  label: string
  icon: AppIconName
  onClick?: () => void
  badge?: string
  onPrefetch?: () => void
}) {
  const tile = (
    <>
      <span className="relative">
        <span className="flex size-11 items-center justify-center rounded-full bg-muted text-primary">
          <AppIcon name={icon} size={20} className="text-primary" />
        </span>
        {badge ? (
          <Badge
            variant="secondary"
            className="absolute -top-2 -right-2 z-10 h-4.5 px-1.5 text-[9px] font-semibold tracking-wider uppercase"
          >
            {badge}
          </Badge>
        ) : null}
      </span>
      <span className="text-[11px] font-medium leading-tight">{label}</span>
    </>
  )

  const className =
    "h-auto flex-col gap-2 rounded-none bg-transparent p-0 text-center font-normal hover:bg-transparent"

  if (onClick) {
    return (
      <Button variant="ghost" size="sm" onClick={onClick} className={className}>
        {tile}
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      nativeButton={false}
      render={<Link href={href ?? "#"} prefetch onMouseEnter={onPrefetch} onFocus={onPrefetch} />}
      className={className}
    >
      {tile}
    </Button>
  )
}
