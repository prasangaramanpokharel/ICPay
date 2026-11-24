import type { UiIcon } from "@thesvg/ui-react"
import { ArrowUpRightGlassIcon, ClockGlassIcon, GlobeGlassIcon, HouseGlassIcon, MenuGlassIcon, ShoppingBagGlassIcon } from "@thesvg/ui-react"

export type AppNavItem = {
  href: string
  labelKey: "home" | "icpverse" | "history" | "menu" | "presale"
  icon: UiIcon
  center?: boolean
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  { href: "/home", labelKey: "home", icon: HouseGlassIcon },
  { href: "/icpverse", labelKey: "icpverse", icon: GlobeGlassIcon },
  { href: "/icpay/presale", labelKey: "presale", icon: ShoppingBagGlassIcon, center: true },
  { href: "/transactions", labelKey: "history", icon: ClockGlassIcon },
  { href: "/settings", labelKey: "menu", icon: MenuGlassIcon },
]

export const APP_QUICK_ACTION = {
  href: "/transfer",
  labelKey: "send" as const,
  icon: ArrowUpRightGlassIcon,
}

export function isAppNavActive(pathname: string, href: string): boolean {
  return href === "/home" ? pathname === "/home" : pathname.startsWith(href)
}
