"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/ui/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { prefetchAppRoute } from "@/lib/navigation/prefetchRoute"
import { APP_NAV_ITEMS, isAppNavActive } from "@/lib/navigation/app-nav-items"

export const bottomNavSpacerClass =
  "pb-[calc(5.5rem+max(0.75rem,env(safe-area-inset-bottom,0px))+0.75rem)]"

export function BottomNav() {
  const pathname = usePathname()
  const t = useTranslations("nav")
  const { identity } = useAuth()

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md",
        "px-3.5 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-1",
      )}
    >
      <div
        className={cn(
          "grid h-[4.25rem] grid-cols-5 items-center rounded-3xl px-1.5 py-1",
          "border border-white/20 dark:border-white/10",
          "bg-card/85 dark:bg-card/75 backdrop-blur-2xl",
          "shadow-[0_12px_36px_-6px_rgba(0,0,0,0.15),inset_0_1px_1px_0_rgba(255,255,255,0.3)]",
          "dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6),inset_0_1px_1px_0_rgba(255,255,255,0.08)]",
        )}
      >
        {APP_NAV_ITEMS.map((item) => (
          <NavTab
            key={item.href}
            href={item.href}
            label={t(item.labelKey)}
            active={isAppNavActive(pathname, item.href)}
            icon={item.icon}
            center={item.center}
            onWarm={() => prefetchAppRoute(item.href, identity)}
          />
        ))}
      </div>
    </nav>
  )
}

function NavTab({
  href,
  label,
  icon,
  active,
  center,
  onWarm,
}: {
  href: string
  label: string
  icon: (typeof APP_NAV_ITEMS)[number]["icon"]
  active: boolean
  center?: boolean
  onWarm: () => void
}) {
  if (center) {
    return (
      <Link
        href={href}
        prefetch
        onMouseEnter={onWarm}
        onFocus={onWarm}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className="group relative flex min-w-0 flex-col items-center justify-center -translate-y-2 transition-transform duration-200 active:scale-95 focus-visible:outline-none"
      >
        <span
          className={cn(
            "relative flex size-11 items-center justify-center rounded-2xl transition-all duration-200",
            "bg-gradient-to-b from-primary via-primary to-primary/95 text-primary-foreground",
            "shadow-md shadow-primary/30 border border-primary-foreground/25",
            "group-hover:shadow-lg group-hover:shadow-primary/45 group-hover:-translate-y-0.5",
            active && "ring-2 ring-primary-foreground/40 shadow-lg shadow-primary/50"
          )}
        >
          <HugeiconsIcon icon={icon} className="size-5.5" strokeWidth={2} />
        </span>
        <span
          className={cn(
            "mt-1 max-w-full truncate text-[10px] leading-none transition-colors",
            active
              ? "font-semibold text-primary dark:text-primary-foreground"
              : "font-medium text-muted-foreground group-hover:text-foreground"
          )}
        >
          {label}
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      prefetch
      onMouseEnter={onWarm}
      onFocus={onWarm}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="group relative flex min-w-0 flex-col items-center justify-center py-1 transition-transform duration-200 active:scale-95 focus-visible:outline-none"
    >
      <span
        className={cn(
          "relative flex size-9 items-center justify-center rounded-xl transition-all duration-200",
          active
            ? "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary-foreground"
            : "text-muted-foreground/80 hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <HugeiconsIcon
          icon={icon}
          className="size-5 transition-transform duration-200 group-hover:scale-105"
          strokeWidth={active ? 2 : 1.75}
        />
      </span>
      <span
        className={cn(
          "mt-1 max-w-full truncate text-[10.5px] leading-none transition-colors",
          active
            ? "font-semibold text-primary dark:text-foreground"
            : "font-medium text-muted-foreground/75 group-hover:text-foreground"
        )}
      >
        {label}
      </span>
    </Link>
  )
}
