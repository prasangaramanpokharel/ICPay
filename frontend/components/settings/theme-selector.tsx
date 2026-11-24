"use client"

import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { Icon } from "@/components/ui/icon"
import { SunGlassIcon, MoonGlassIcon } from "@thesvg/ui-react"
import { Switch } from "@/components/ui/switch"

export function ThemeSelector() {
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations("theme")
  const dark = resolvedTheme !== "light"

  return (
    <div className="flex items-center gap-3 rounded-2xl border px-4 py-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon icon={dark ? MoonGlassIcon : SunGlassIcon} className="size-4.5" />
      </span>
      <div className="flex-1">
        <p className="text-sm">{t("label")}</p>
        <p className="text-xs text-muted-foreground">{t("description")}</p>
      </div>
      <Switch
        checked={dark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label={t("dark")}
        className="shrink-0"
      />
    </div>
  )
}
