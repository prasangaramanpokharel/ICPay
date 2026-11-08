import type { IconSvgElement } from "@hugeicons/react"
import {
  Analytics01Icon,
  Clock01Icon,
  CloudIcon,
  Coins01Icon,
  Download01Icon,
  Globe02Icon,
  Home03Icon,
  Message01Icon,
  Rocket01Icon,
  SentIcon,
  ThreeDViewIcon,
  TimeScheduleIcon,
} from "@hugeicons/core-free-icons"
import { APP_NAV_ITEMS, isAppNavActive } from "@/lib/navigation/app-nav-items"

export type SidebarNavItem = {
  href: string
  labelKey: string
  icon: IconSvgElement
  badgeKey?: string
  badgeVariant?: "default" | "secondary" | "outline"
  badgeType?: "gradient" | "text"
}

export type SidebarNavSection = {
  sectionKey: "overview" | "payments" | "assets" | "services" | "community" | "insights"
  items: SidebarNavItem[]
}

export const SIDEBAR_FOOTER: SidebarNavItem[] = []

export const SIDEBAR_SECTIONS: SidebarNavSection[] = [
  {
    sectionKey: "overview",
    items: [{ href: "/home", labelKey: "nav.home", icon: Home03Icon }],
  },
  {
    sectionKey: "payments",
    items: [
      { href: "/transfer", labelKey: "common.send", icon: SentIcon },
      { href: "/deposit", labelKey: "common.receive", icon: Download01Icon },
      { href: "/transactions", labelKey: "settings.items.history", icon: Clock01Icon },
    ],
  },
  {
    sectionKey: "assets",
    items: [
      { href: "/wallet", labelKey: "settings.items.tokens", icon: Coins01Icon },
      { href: "/launch", labelKey: "settings.items.launch", icon: Rocket01Icon },
    ],
  },
  {
    sectionKey: "services",
    items: [
      { href: "/bucket", labelKey: "settings.items.bucket", icon: CloudIcon, badgeKey: "settings.items.bucketBadge", badgeVariant: "secondary" },
      {
        href: "/canister",
        labelKey: "settings.items.canisters",
        icon: ThreeDViewIcon,
      },
      {
        href: "/cron",
        labelKey: "settings.items.cron",
        icon: TimeScheduleIcon,
        badgeKey: "settings.items.cronBadge",
        badgeVariant: "secondary",
      },
    ],
  },
  {
    sectionKey: "community",
    items: [
      { href: "/icpverse", labelKey: "nav.verse", icon: Globe02Icon },
      {
        href: "/channels",
        labelKey: "settings.items.community",
        icon: Message01Icon,
      },
    ],
  },
  {
    sectionKey: "insights",
    items: [
      { href: "/analytics", labelKey: "settings.items.analytics", icon: Analytics01Icon },
    ],
  },
]

const ALL_ITEMS: SidebarNavItem[] = [
  ...SIDEBAR_FOOTER,
  ...SIDEBAR_SECTIONS.flatMap((section) => section.items),
]

export function isSidebarItemActive(pathname: string, href: string): boolean {
  if (href === "/home") return pathname === "/home"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function resolveAppPageTitle(
  pathname: string,
  translate: (key: string) => string,
): string {
  const bottom = APP_NAV_ITEMS.find((item) => isAppNavActive(pathname, item.href))
  if (bottom) {
    if (bottom.labelKey === "icpverse") return translate("nav.verse")
    return translate(`nav.${bottom.labelKey}`)
  }

  const sidebar = ALL_ITEMS.find((item) => isSidebarItemActive(pathname, item.href))
  if (sidebar) return translate(sidebar.labelKey)

  if (pathname.startsWith("/channels")) return translate("settings.items.community")
  if (pathname.startsWith("/governance")) return translate("settings.items.governance")
  if (pathname.startsWith("/username")) return translate("settings.items.buyPremium")
  if (pathname.startsWith("/icpay/presale")) return translate("settings.items.icpayToken")
  if (pathname.startsWith("/profile")) return translate("settings.items.profile")
  if (pathname.startsWith("/transfer")) return translate("common.send")
  if (pathname.startsWith("/deposit")) return translate("common.receive")
  if (pathname.startsWith("/trade") || pathname.startsWith("/swap")) {
    return translate("common.swap")
  }
  if (pathname.startsWith("/withdraw")) return translate("transactions.type.transfer")
  if (pathname === "/token" || pathname.startsWith("/token")) return translate("settings.items.launch")
  if (pathname === "/blog" || pathname.startsWith("/blog/")) {
    return translate("settings.items.blog")
  }
  if (pathname.startsWith("/canister")) return translate("settings.items.canisters")
  if (pathname.startsWith("/settings")) return translate("settings.items.settings")

  return "ICPay"
}
