"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavIcon } from "@/components/layout/dashboard/nav-icon"
import { Badge } from "@/components/ui/badge"
import { MotionHighlight, MotionHighlightItem } from "@/components/ui/motion-highlight"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/ui/utils"
import {
  isSidebarItemActive,
  SIDEBAR_FOOTER,
  SIDEBAR_SECTIONS,
  type SidebarNavItem,
} from "@/lib/navigation/app-sidebar-nav"
import { prefetchAppRoute } from "@/lib/navigation/prefetchRoute"

const itemClass =
  "h-9 gap-2.5 rounded-lg px-2.5 text-sm font-medium text-foreground [&>svg]:size-5 data-active:bg-muted data-active:font-semibold"

export function DashboardNavMain() {
  const pathname = usePathname()
  const t = useTranslations()
  const { identity } = useAuth()

  return (
    <MotionHighlight
      hover
      value={null}
      className="w-full"
      highlightClassName="rounded-lg bg-sidebar-accent/80"
    >
      {SIDEBAR_SECTIONS.map((section) => (
        <SidebarGroup key={section.sectionKey} className="py-1">
          {section.sectionKey !== "overview" ? (
            <SidebarGroupLabel className="mb-0.5 h-6 px-2.5 text-xs font-semibold tracking-wider text-muted-foreground/90 uppercase">
              {t(`settings.sections.${section.sectionKey}`)}
            </SidebarGroupLabel>
          ) : null}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {section.items.map((item) => (
                <NavRow
                  key={item.href}
                  item={item}
                  label={t(item.labelKey as never)}
                  active={isSidebarItemActive(pathname, item.href)}
                  onWarm={() => prefetchAppRoute(item.href, identity)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </MotionHighlight>
  )
}

export function DashboardNavFooter() {
  const pathname = usePathname()
  const t = useTranslations()
  const { identity } = useAuth()

  return (
    <MotionHighlight
      hover
      value={null}
      className="w-full"
      highlightClassName="rounded-lg bg-sidebar-accent/80"
    >
      <SidebarMenu className="gap-0.5">
        {SIDEBAR_FOOTER.map((item) => (
          <NavRow
            key={item.href}
            item={item}
            label={t(item.labelKey as never)}
            active={isSidebarItemActive(pathname, item.href)}
            onWarm={() => prefetchAppRoute(item.href, identity)}
          />
        ))}
      </SidebarMenu>
    </MotionHighlight>
  )
}

function NavRow({
  item,
  label,
  active,
  onWarm,
}: {
  item: SidebarNavItem
  label: string
  active: boolean
  onWarm: () => void
}) {
  const t = useTranslations()

  return (
    <MotionHighlightItem asChild value={item.href}>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={label}
          isActive={active}
          className={cn(
            itemClass,
            "hover:bg-transparent data-open:hover:bg-transparent data-active:hover:bg-muted"
          )}
          render={<Link href={item.href} />}
          onMouseEnter={onWarm}
          onFocus={onWarm}
        >
          <NavIcon
            icon={item.icon}
            className={
              active
                ? "text-primary"
                : "text-muted-foreground transition-colors group-hover/menu-button:text-foreground"
            }
          />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {item.badgeKey ? (
            <Badge
              variant={item.badgeVariant ?? "secondary"}
              className="ml-auto h-5 px-1.5 text-[10px] font-semibold tracking-wider uppercase"
            >
              {t(item.badgeKey as never)}
            </Badge>
          ) : null}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </MotionHighlightItem>
  )
}
