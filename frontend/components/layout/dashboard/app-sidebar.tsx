"use client"

import type { ComponentProps } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import { DashboardNavFooter, DashboardNavMain } from "@/components/layout/dashboard/nav-main"
import { SidebarUserFooter } from "@/components/layout/dashboard/sidebar-user-footer"
import { SIDEBAR_FOOTER } from "@/lib/navigation/app-sidebar-nav"
import { cn } from "@/lib/ui/utils"

export function AppSidebar({ className, ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="offcanvas"
      className={cn(
        "inset-y-auto top-14 bottom-0 h-[calc(100svh-3.5rem)] md:top-16 md:h-[calc(100svh-4rem)]",
        className,
      )}
      {...props}
    >
      <SidebarContent className="gap-0 pt-2">
        <DashboardNavMain />
      </SidebarContent>
      <SidebarFooter className="mt-auto border-t border-sidebar-border/40 p-2.5 pb-3">
        {SIDEBAR_FOOTER.length > 0 ? (
          <div className="mb-2 border-b border-sidebar-border/60 pb-2">
            <DashboardNavFooter />
          </div>
        ) : null}
        <SidebarUserFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
