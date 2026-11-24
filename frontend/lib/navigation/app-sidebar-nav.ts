import type { UiIcon } from "@thesvg/ui-react"
import { ChartColumnGlassIcon, ClockGlassIcon, ObjectStorageGlassIcon, CoinsGlassIcon, ArrowDownLeftGlassIcon, GlobeGlassIcon, HouseGlassIcon, MessageSquareGlassIcon, RocketGlassIcon, ArrowUpRightGlassIcon, Axis3dGlassIcon } from "@thesvg/ui-react"
import { APP_NAV_ITEMS, isAppNavActive } from "@/lib/navigation/app-nav-items"

export type SidebarNavSubItem = {
  href: string
  labelKey: string
}

export type SidebarNavItem = {
  href: string
  labelKey: string
  icon: UiIcon
  badgeKey?: string
  badgeVariant?: "default" | "secondary" | "outline"
  badgeType?: "gradient" | "text"
  subItems?: SidebarNavSubItem[]
}

export type SidebarNavSection = {
  sectionKey: "overview" | "payments" | "assets" | "services" | "community" | "insights"
  items: SidebarNavItem[]
}

export const SIDEBAR_FOOTER: SidebarNavItem[] = []

export const SIDEBAR_SECTIONS: SidebarNavSection[] = [
  {
    sectionKey: "overview",
    items: [{ href: "/home", labelKey: "nav.home", icon: HouseGlassIcon }],
  },
  {
    sectionKey: "payments",
    items: [
      { href: "/transfer", labelKey: "common.send", icon: ArrowUpRightGlassIcon },
      { href: "/deposit", labelKey: "common.receive", icon: ArrowDownLeftGlassIcon },
      { href: "/transactions", labelKey: "settings.items.history", icon: ClockGlassIcon },
    ],
  },
  {
    sectionKey: "assets",
    items: [
      { href: "/wallet", labelKey: "settings.items.tokens", icon: CoinsGlassIcon },
      { href: "/launch", labelKey: "settings.items.launch", icon: RocketGlassIcon },
    ],
  },
  {
    sectionKey: "services",
    items: [
      {
        href: "/bucket",
        labelKey: "settings.items.bucket",
        icon: ObjectStorageGlassIcon,
        badgeKey: "settings.items.bucketBadge",
        badgeVariant: "secondary",
        subItems: [
          { href: "/bucket", labelKey: "settings.sections.overview" },
          { href: "/bucket/api", labelKey: "cron.apiKeys" },
          { href: "/bucket/docs", labelKey: "bucket.docs" },
        ],
      },
      {
        href: "/canister",
        labelKey: "settings.items.canisters",
        icon: Axis3dGlassIcon,
      },
    ],
  },
  {
    sectionKey: "community",
    items: [
      { href: "/icpverse", labelKey: "nav.verse", icon: GlobeGlassIcon },
      {
        href: "/channels",
        labelKey: "settings.items.community",
        icon: MessageSquareGlassIcon,
      },
    ],
  },
  {
    sectionKey: "insights",
    items: [
      { href: "/analytics", labelKey: "settings.items.analytics", icon: ChartColumnGlassIcon },
    ],
  },
]

const ALL_ITEMS: SidebarNavItem[] = [
  ...SIDEBAR_FOOTER,
  ...SIDEBAR_SECTIONS.flatMap((section) => section.items),
]

export function isSidebarItemActive(pathname: string, href: string): boolean {
  if (href === "/home" || href === "/") {
    return pathname === "/home" || pathname === "/"
  }
  if (href === "/cron") {
    return pathname === "/cron" || pathname.startsWith("/cron/")
  }
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
