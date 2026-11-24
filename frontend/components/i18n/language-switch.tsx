"use client"

import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Icon } from "@/components/ui/icon"
import { GlobeGlassIcon } from "@thesvg/ui-react"
import { LOCALES } from "@/language/config"
import { useLocale } from "@/components/i18n/locale-provider"
import { LocaleFlag } from "@/components/i18n/locale-flag"
import { SelectContent, SelectItem } from "@/components/ui/select"
import { cn } from "@/lib/ui/utils"

export function LanguageSwitch({ variant = "icon" }: { variant?: "icon" | "row" | "globe" }) {
  const { locale, setLocale } = useLocale()
  const active = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]

  return (
    <SelectPrimitive.Root
      value={locale}
      onValueChange={(value) => setLocale(value as (typeof LOCALES)[number]["code"])}
    >
      <SelectPrimitive.Trigger
        aria-label={active.label}
        className={cn(
          "flex items-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
          variant === "icon"
            ? "size-8 justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 sm:size-9"
            : variant === "globe"
              ? "size-8 justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95"
              : "h-8 w-full gap-2.5 rounded-lg px-2.5 text-[13px] text-foreground hover:bg-muted",
        )}
      >
        {variant === "row" ? (
          <>
            <Icon
              icon={GlobeGlassIcon}
              className="size-4 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
            />
            <span className="min-w-0 flex-1 truncate text-left">{active.label}</span>
          </>
        ) : variant === "globe" ? (
          <Icon
            icon={GlobeGlassIcon}
            className="size-4.5 shrink-0"
            strokeWidth={1.75}
          />
        ) : (
          <LocaleFlag country={active.country} label={active.label} size="sm" priority />
        )}
      </SelectPrimitive.Trigger>
      <SelectContent align={variant === "row" ? "start" : "end"} side={variant === "row" ? "top" : "bottom"}>
        {LOCALES.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            <LocaleFlag country={l.country} label={l.label} />
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectPrimitive.Root>
  )
}
