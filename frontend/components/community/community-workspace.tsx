"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CommunityExplorer } from "@/components/community/community-explorer"
import { useIsDesktop } from "@/hooks/ui/useMobile"
import { useChannelSlug } from "@/lib/routing/rewrittenRoute"

export function CommunityWorkspace({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const slug = useChannelSlug()
  const isDesktop = useIsDesktop()
  const hasSelectedChannel = Boolean(slug && slug !== "slug" && slug !== "new" && slug !== "join")
  const onList = pathname === "/channels" && !hasSelectedChannel
  const hideExplorer = pathname === "/channels/new" || pathname.startsWith("/channels/join")

  return (
    <TooltipProvider delay={200}>
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        {hideExplorer ? (
          <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
        ) : isDesktop ? (
          <ResizablePanelGroup orientation="horizontal" className="h-full min-h-0 w-full flex-1">
            <ResizablePanel
              id="community-explorer"
              defaultSize="32%"
              minSize="24%"
              maxSize="42%"
              className="h-full overflow-hidden"
            >
              <CommunityExplorer />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
              id="community-feed"
              defaultSize="68%"
              minSize="45%"
              className="h-full min-h-0 overflow-hidden"
            >
              <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : onList ? (
          <div className="flex h-full min-h-0 flex-col">
            <CommunityExplorer />
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
        )}
      </div>
    </TooltipProvider>
  )
}
