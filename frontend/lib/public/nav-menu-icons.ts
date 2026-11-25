import type { UiIcon } from "@thesvg/ui-react"
import { BookOpenGlassIcon, ObjectStorageGlassIcon, LayoutDashboardGlassIcon, DownloadGlassIcon, HeartGlassIcon, ChartLineGlassIcon, FileGlassIcon, InfoGlassIcon, CircleQuestionMarkGlassIcon, NewspaperGlassIcon, CameraGlassIcon, PackageGlassIcon, RocketGlassIcon, RouteGlassIcon, SettingsGlassIcon, ShieldCheckGlassIcon, ShoppingBagGlassIcon, TerminalGlassIcon, EyeGlassIcon, WalletBalanceGlassIcon, ZapGlassIcon, ClockGlassIcon } from "@thesvg/ui-react"

export const NAV_MENU_ICONS: Record<string, UiIcon> = {
  "/downloads": DownloadGlassIcon,
  "/charity": HeartGlassIcon,
  "/market": ChartLineGlassIcon,
  "/blog": NewspaperGlassIcon,
  "/login": WalletBalanceGlassIcon,
  "/token/create": RocketGlassIcon,
  "/canister": LayoutDashboardGlassIcon,
  "/canister/tools": PackageGlassIcon,
  "/canister/manage": SettingsGlassIcon,
  "/canister/create": PackageGlassIcon,
  "/canister/cycles": WalletBalanceGlassIcon,
  "/canister/snapshots": CameraGlassIcon,
  "/topup": ZapGlassIcon,
  "/icbucket": ObjectStorageGlassIcon,
  "/icfalcon": RocketGlassIcon,
  "/iccron": ClockGlassIcon,
  "/cron": ClockGlassIcon,
  "/cron/docs": BookOpenGlassIcon,
  "/iccron/docs": BookOpenGlassIcon,
  "/products/icFalcon/commands": TerminalGlassIcon,
  "/products/icFalcon/packages": PackageGlassIcon,
  "/bucket/docs": BookOpenGlassIcon,
  "/about": InfoGlassIcon,
  "/faq": CircleQuestionMarkGlassIcon,
  "/roadmap": RouteGlassIcon,
  "/brand-protection": ShoppingBagGlassIcon,
  "/terms": FileGlassIcon,
  "/privacy": ShieldCheckGlassIcon,
  "/transparency": EyeGlassIcon,
}

export function getNavMenuIcon(href: string): UiIcon {
  return NAV_MENU_ICONS[href] ?? FileGlassIcon
}
