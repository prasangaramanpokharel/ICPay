"use client"

import { Icon } from "@/components/ui/icon"
import { InfoGlassIcon } from "@thesvg/ui-react"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

export function InfoTip({
  label,
  title,
  body,
  className,
}: {
  label: string
  title: string
  body: string
  className?: string
}) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={label}
        className={`inline-flex shrink-0 text-muted-foreground transition-colors hover:text-foreground ${className ?? ""}`}
      >
        <Icon icon={InfoGlassIcon} className="size-4" strokeWidth={1.75} />
      </PopoverTrigger>
      <PopoverContent align="start" className="max-w-xs gap-2">
        <PopoverHeader>
          <PopoverTitle className="text-sm">{title}</PopoverTitle>
          <PopoverDescription className="text-xs leading-relaxed whitespace-pre-line">
            {body}
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}
