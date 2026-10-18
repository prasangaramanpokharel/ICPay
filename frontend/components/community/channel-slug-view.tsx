"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { CommunityChannelScreen } from "@/app/(app)/channels/[slug]/community-channel-screen"
import { CommunityWorkspace } from "@/components/community/community-workspace"
import { ChannelPublicLanding } from "@/components/community/channel-public-landing"
import { AppShell } from "@/components/layout/app-shell"
import { useChannelSlug } from "@/lib/routing/rewrittenRoute"
import { Spinner } from "@/components/ui/spinner"
import type { CommunityChannelSnapshot } from "@/lib/community/snapshot"

export function ChannelSlugView({
  slug: propSlug,
  channel,
  avatarBytes,
}: {
  slug: string
  channel: CommunityChannelSnapshot | null
  avatarBytes?: Uint8Array
}) {
  const dynamicSlug = useChannelSlug()
  const slug = propSlug && propSlug !== "slug" ? propSlug : dynamicSlug
  const { isAuthenticated, isLoading } = useAuth()

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
          <CommunityChannelScreen key={slug} slug={slug} />
        </CommunityWorkspace>
      </AppShell>
    )
  }

  return <ChannelPublicLanding key={slug} slug={slug} channel={channel} avatarBytes={avatarBytes} />
}
