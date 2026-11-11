import type { Metadata } from "next"
import { CommunityNewChannelView } from "@/components/community/community-new-channel-view"

export const metadata: Metadata = {
  title: "New Channel",
}

export default function NewChannelPage() {
  return <CommunityNewChannelView />
}
