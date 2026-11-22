"use client"

import Link, { useLinkStatus } from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { motion } from "motion/react"
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
        "pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md touch-manipulation",
        "px-3.5 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-1",
      )}
    >
      <div
        className={cn(
          "pointer-events-auto grid h-16 grid-cols-5 items-center rounded-3xl px-1.5 py-1",
          "border border-border/60 bg-card/85 shadow-lg backdrop-blur-2xl dark:bg-card/75",
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
  onWarm,
}: {
  href: string
  label: string
  icon: (typeof APP_NAV_ITEMS)[number]["icon"]
  active: boolean
  center?: boolean
  onWarm: () => void
}) {
  return (
    <Link
      href={href}
      prefetch
      onMouseEnter={onWarm}
      onFocus={onWarm}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-full min-w-0 flex-col items-center justify-center py-1 touch-manipulation focus-visible:outline-none",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
      onClick={(e) => {
        if (active) {
          e.preventDefault()
        }
      }}
    >
      {active && (
        <motion.span
          layoutId="bottomNavIndicator"
          transition={{ type: "spring", stiffness: 450, damping: 35 }}
          className="absolute inset-x-1.5 inset-y-1 -z-10 rounded-2xl bg-primary/12 dark:bg-primary/18 shadow-[0_0_12px_0px] shadow-primary/20"
        />
      )}
      <NavTabContent label={label} icon={icon} active={active} />
    </Link>
  )
}

function NavTabContent({
  label,
  icon,
  active,
}: {
  label: string
  icon: (typeof APP_NAV_ITEMS)[number]["icon"]
  active: boolean
}) {
  const { pending } = useLinkStatus()

  return (
    <span
      className={cn(
        "flex min-w-0 flex-col items-center justify-center transition-opacity",
        pending && "opacity-70"
      )}
    >
      <motion.span
          whileTap={{ scale: 0.84 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="relative flex size-8 items-center justify-center"
        >
        <HugeiconsIcon
          icon={icon}
          className="size-5 transition-transform duration-200 group-hover:scale-105"
          strokeWidth={active ? 2 : 1.75}
        />
      </motion.span>
      <span
        className={cn(
          "mt-0.5 max-w-full truncate text-[10.5px] leading-none transition-colors",
          active
            ? "font-semibold text-primary"
            : "font-medium text-muted-foreground group-hover:text-foreground"
        )}
      >
        {label}
      </span>
    </span>
  )
}
