"use client"

import { Suspense, type ReactNode, type CSSProperties } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/layout/dashboard/app-sidebar"
import { AppSiteHeader } from "@/components/layout/dashboard/app-site-header"
import { PublicNav } from "@/components/public/nav"
import { cn } from "@/lib/ui/utils"

const shellStyle = {
  "--sidebar-width": "calc(var(--spacing) * 60)",
  "--header-height": "calc(var(--spacing) * 12)",
} as CSSProperties

function PublicNavFallback() {
  return (
    <header className="sticky top-0 z-50 h-14 shrink-0 border-b border-border/40 bg-background/80 backdrop-blur-md md:h-16" />
  )
}

export function AppDashboardShell({
  children,
  showSidebar = true,
  showHeader = true,
  hidePublicNavMobile = false,
}: {
  children: ReactNode
  showSidebar?: boolean
  showHeader?: boolean
  hidePublicNavMobile?: boolean
}) {
  return (
    <TooltipProvider>
      <div className="flex h-svh w-full flex-col overflow-hidden bg-background">
        <Suspense fallback={<PublicNavFallback />}>
          <div className={cn("shrink-0 border-b border-border/40", hidePublicNavMobile && "max-md:hidden")}>
            <PublicNav />
          </div>
        </Suspense>
        <div className="relative flex min-h-0 flex-1 w-full overflow-hidden">
          <SidebarProvider style={shellStyle} className="h-full min-h-0 flex-1 overflow-hidden">
            {showSidebar ? <AppSidebar variant="inset" /> : null}
            <SidebarInset>
              {showHeader ? <AppSiteHeader /> : null}
              {children}
            </SidebarInset>
          </SidebarProvider>
        </div>
      </div>
    </TooltipProvider>
  )
}
