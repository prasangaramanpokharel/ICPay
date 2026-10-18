"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { CrownIcon } from "@hugeicons/core-free-icons"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { buttonVariants } from "@/components/ui/button"
import { ShineBorder } from "@/components/ui/shine-border"
import { LanguageSwitch } from "@/components/i18n/language-switch"
import { HeaderUserMenu } from "@/components/layout/dashboard/header-user-menu"
import { ThemeToggle } from "@/components/public/theme-toggle"
import { resolveAppPageTitle } from "@/lib/navigation/app-sidebar-nav"
import { cn } from "@/lib/ui/utils"

export function AppSiteHeader() {
  const pathname = usePathname()
  const t = useTranslations()
  const title = resolveAppPageTitle(pathname, (key) => t(key as never))

  return (
    <header className="sticky top-0 z-20 hidden h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-sm md:flex">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-3 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-1 h-4 data-vertical:self-auto" />
        <h1 className="flex-1 truncate text-sm font-normal">{title}</h1>
        <div className="flex shrink-0 items-center rounded-full border border-border/70 bg-muted/40 p-0.5">
          <Link
            href="/username"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "relative size-8 rounded-full text-primary transition-all hover:bg-muted/80 hover:text-primary active:scale-95",
            )}
            aria-label={t("settings.items.buyPremium" as never)}
          >
            <ShineBorder
              borderWidth={1.2}
              duration={7}
              shineColor={["var(--primary)", "#a855f7", "var(--primary)"]}
            />
            <HugeiconsIcon
              icon={CrownIcon}
              className="relative z-10 size-4.5 shrink-0 text-primary"
              strokeWidth={1.75}
            />
          </Link>
          <Separator orientation="vertical" className="mx-0.5 h-5 data-vertical:self-auto" />
          <LanguageSwitch variant="globe" />
          <Separator orientation="vertical" className="mx-0.5 h-5 data-vertical:self-auto" />
          <ThemeToggle />
          <Separator orientation="vertical" className="mx-0.5 h-5 data-vertical:self-auto" />
          <HeaderUserMenu />
        </div>
      </div>
    </header>
  )
}
