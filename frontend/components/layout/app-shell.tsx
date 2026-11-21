"use client"

import { useSyncExternalStore, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { BottomNav, bottomNavSpacerClass } from "@/components/layout/bottom-nav"
import { AppDashboardShell } from "@/components/layout/dashboard/app-dashboard-shell"
import { subscribeNavigation } from "@/lib/routing/rewrittenRoute"
import { cn } from "@/lib/ui/utils"

function getBrowserChannelChat(pathname: string): boolean {
  if (typeof window === "undefined") return false
  if (pathname === "/channels") {
    try {
      const params = new URLSearchParams(window.location.search)
      const id = params.get("id") || params.get("slug")
      return Boolean(id && id !== "slug" && id !== "new" && id !== "join")
    } catch {
      return false
    }
  }
  if (!pathname.startsWith("/channels/")) return false
  return pathname !== "/channels/new" && !pathname.startsWith("/channels/join")
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const channels = pathname === "/channels" || pathname.startsWith("/channels/")
  const channelChat = useSyncExternalStore(
    subscribeNavigation,
    () => getBrowserChannelChat(pathname),
    () => false,
  )

  return (
    <AppDashboardShell hidePublicNavMobile={channelChat}>
      <div
        className={cn(
          "mx-auto flex w-full flex-1 flex-col max-w-md md:max-w-none",
          channels
            ? channelChat
              ? "h-full min-h-0 overflow-hidden p-0"
              : cn("px-0 pt-0", bottomNavSpacerClass, "md:pb-0")
            : cn("px-4 pt-2 overscroll-y-contain", bottomNavSpacerClass, "md:px-6 md:py-6 md:pb-6"),
        )}
      >
        {children}
      </div>
      <div className={cn("md:hidden", channelChat && "hidden")}>
        <BottomNav />
      </div>
    </AppDashboardShell>
  )
}