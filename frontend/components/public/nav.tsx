"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { APP_LOGO, APP_LOGO_ALT } from "@/lib/ui/brand-images"
import { getNavMenuIcon } from "@/lib/public/nav-menu-icons"
import { charityCampaignShellClass, isCharityCampaignPath } from "@/lib/public/charity/shell"
import type { NavMenuItem } from "@/lib/public/site-links"
import { cn } from "@/lib/ui/utils"
import { Icon } from "@/components/ui/icon"
import { StoreGlassIcon, ScatterPlotGlassIcon, HeatTileGlassIcon, DropdownGlassIcon, type UiIcon } from "@thesvg/ui-react"
import { LanguageSwitch } from "@/components/i18n/language-switch"
import { NavMenuItemContent } from "@/components/public/nav-menu-item"
import { PublicNavAuth, PublicNavMobileUser, PublicNavMobileAuthFallback } from "@/components/public/public-nav-auth"
import { PublicNavMobile } from "@/components/public/public-nav-mobile"
import { ThemeToggle } from "@/components/public/theme-toggle"
import { MotionHighlight, MotionHighlightItem } from "@/components/ui/motion-highlight"
import { usePublicSiteLinks } from "@/hooks/i18n/use-public-site-links"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavMenuListItem({ item }: { item: NavMenuItem }) {
  const icon = getNavMenuIcon(item.href)
  const body = (
    <NavMenuItemContent title={item.title} description={item.description} icon={icon} />
  )

  if (item.external) {
    return (
      <li>
        <NavigationMenuLink
          className="w-full"
          render={
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              {body}
            </a>
          }
        />
      </li>
    )
  }

  return (
    <li>
      <NavigationMenuLink className="w-full" render={<Link href={item.href}>{body}</Link>} />
    </li>
  )
}

function NavDropdown({
  label,
  icon: NavIcon,
  items,
  columns = 1,
}: {
  label: string
  icon?: UiIcon
  items: NavMenuItem[]
  columns?: 1 | 2
}) {
  return (
    <MotionHighlightItem asChild value={label}>
      <NavigationMenuItem>
        <NavigationMenuTrigger
          suppressHydrationWarning
          className="bg-transparent px-3 font-normal text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground data-open:bg-transparent data-popup-open:bg-transparent flex items-center gap-1.5"
        >
          {NavIcon && <Icon icon={NavIcon} className="size-3.5 shrink-0" />}
          <span suppressHydrationWarning>{label}</span>
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul
            className={cn(
              "gap-0.5 p-1",
              columns === 1 ? "w-[22rem]" : "grid w-[32rem] grid-cols-2 lg:w-[36rem]"
            )}
          >
            {items.map((item) => (
              <NavMenuListItem key={item.href} item={item} />
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </MotionHighlightItem>
  )
}

export function PublicNav() {
  const pathname = usePathname()
  const {
    primaryLinks,
    productMenu,
    canisterMenu,
    resourceMenu,
    legalMenu,
    sectionLabels,
  } = usePublicSiteLinks()

  const isCharityCampaignPage = isCharityCampaignPath(pathname)

  return (
    <header
      suppressHydrationWarning
      className={cn(
        "sticky top-0 z-50 backdrop-blur-md bg-background/80",
        isCharityCampaignPage && charityCampaignShellClass
      )}
    >
      <div className="mx-auto flex h-14 w-full items-center justify-between gap-4 px-4 md:h-16 md:px-6 lg:px-8">
        <div className="flex items-center md:hidden">
          <PublicNavMobileUser />
        </div>

        <div className="hidden min-w-0 items-center gap-5 md:flex lg:gap-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Image
              src={APP_LOGO}
              alt={APP_LOGO_ALT}
              title={APP_LOGO_ALT}
              width={36}
              height={36}
              className="size-9 rounded-lg object-cover"
              priority
              loading="eager"
            />
            <span className="h-4.5 w-px bg-border/80" aria-hidden="true" />
            <span className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              ic<span className="text-primary">Pay</span>
            </span>
          </Link>

          <NavigationMenu suppressHydrationWarning className="hidden max-w-none lg:flex" align="start">
            <MotionHighlight
              hover
              value={null}
              className="flex items-center"
              highlightClassName="rounded-xl bg-muted/80"
            >
              <NavigationMenuList className="flex-wrap justify-start gap-0.5">
                {primaryLinks.map((link) => {
                  const active = isActive(pathname, link.href)
                  return (
                    <MotionHighlightItem asChild key={link.href} value={link.href}>
                      <NavigationMenuItem>
                        <NavigationMenuLink
                          className={cn(
                            navigationMenuTriggerStyle(),
                            "bg-transparent px-3 font-normal shadow-none hover:bg-transparent hover:text-foreground",
                            active ? "text-foreground" : "text-muted-foreground"
                          )}
                          render={
                            <Link href={link.href} suppressHydrationWarning>
                              <span suppressHydrationWarning>{link.label}</span>
                            </Link>
                          }
                        />
                      </NavigationMenuItem>
                    </MotionHighlightItem>
                  )
                })}

                <NavDropdown label={sectionLabels.products} icon={StoreGlassIcon} items={productMenu} />
                <NavDropdown label={sectionLabels.resources} icon={ScatterPlotGlassIcon} items={resourceMenu} columns={2} />
                <NavDropdown label={sectionLabels.canisters} icon={HeatTileGlassIcon} items={canisterMenu} />
                <NavDropdown label={sectionLabels.more} icon={DropdownGlassIcon} items={legalMenu} columns={2} />
              </NavigationMenuList>
            </MotionHighlight>
          </NavigationMenu>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <LanguageSwitch />
          <div className="hidden md:flex md:items-center md:gap-1.5">
            <ThemeToggle />
            <span aria-hidden className="mx-0.5 h-5 w-px bg-border/60" />
            <PublicNavAuth />
          </div>
          <div className="md:hidden">
            <PublicNavMobileAuthFallback />
          </div>
          <div className="hidden md:block lg:hidden">
            <PublicNavMobile />
          </div>
        </div>
      </div>
    </header>
  )
}
