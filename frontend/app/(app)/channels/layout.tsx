import type { Metadata } from "next"
import { CommunityWorkspace } from "@/components/community/community-workspace"

export const metadata: Metadata = {
  title: "Channels",
  description: "Verified on-chain community channels and broadcasts on ICPay.",
}

export default function ChannelsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <CommunityWorkspace>{children}</CommunityWorkspace>
    </div>
  )
}
