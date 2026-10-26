import { Suspense } from "react"
import { CommunityJoinScreen } from "./[slug]/community-join-screen"
import { Spinner } from "@/components/ui/spinner"

export default function CommunityJoinPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      }
    >
      <CommunityJoinScreen />
    </Suspense>
  )
}
