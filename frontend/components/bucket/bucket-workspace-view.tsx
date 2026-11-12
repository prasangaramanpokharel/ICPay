"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { BucketListPanel } from "@/components/bucket/bucket-list-panel"
import { BucketDetail } from "@/components/bucket/bucket-detail"

function BucketPageContent() {
  const searchParams = useSearchParams()
  const bucketId = searchParams.get("id")

  if (bucketId) {
    return <BucketDetail bucketId={bucketId} />
  }

  return <BucketListPanel />
}

export function BucketWorkspaceView() {
  return (
    <Suspense fallback={null}>
      <BucketPageContent />
    </Suspense>
  )
}
