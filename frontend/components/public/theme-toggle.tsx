"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { Icon } from "@/components/ui/icon"
import { MoonGlassIcon, SunGlassIcon } from "@thesvg/ui-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  if (!mounted) {
    return <div className="size-9 shrink-0 animate-pulse rounded-full bg-muted" aria-hidden />
  }

  const dark = resolvedTheme !== "light"

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      className="rounded-full text-muted-foreground hover:text-foreground"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      <Icon icon={dark ? SunGlassIcon : MoonGlassIcon} className="size-4.5" strokeWidth={1.75} />
    </Button>
  )
}
