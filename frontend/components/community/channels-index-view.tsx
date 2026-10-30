"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { CommunityEmptyPane } from "@/components/community/community-empty-pane"
import { CommunityWorkspace } from "@/components/community/community-workspace"
import { ChannelsPublicDirectory } from "@/components/community/channels-public-directory"
import { ChannelPublicLanding } from "@/components/community/channel-public-landing"
import { CommunityChannelScreen } from "@/app/(app)/channels/[slug]/community-channel-screen"
import { useChannelSlug } from "@/lib/routing/rewrittenRoute"
import { AppShell } from "@/components/layout/app-shell"
import { Spinner } from "@/components/ui/spinner"
import type { CommunityChannelSnapshot } from "@/lib/community/snapshot"

export function ChannelsIndexView({ channels }: { channels: CommunityChannelSnapshot[] }) {
  const { isAuthenticated, isLoading } = useAuth()
  const slug = useChannelSlug()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <AppShell>
        <CommunityWorkspace>
          {slug && slug !== "slug" ? (
            <CommunityChannelScreen key={slug} slug={slug} />
          ) : (
            <CommunityEmptyPane />
          )}
        </CommunityWorkspace>
      </AppShell>
    )
  }

  if (slug && slug !== "slug") {
    const knownChannel = channels.find((c) => c.slug === slug) ?? null
    return <ChannelPublicLanding key={slug} slug={slug} channel={knownChannel} />
  }

  return <ChannelsPublicDirectory channels={channels} />
}
