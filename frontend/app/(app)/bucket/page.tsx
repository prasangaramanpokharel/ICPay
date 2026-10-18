"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { BucketListPanel } from "@/components/bucket/bucket-list-panel"
import { BucketDetail } from "@/components/bucket/bucket-detail"

function BucketPageContent() {
  const searchParams = useSearchParams()
  const bucketId = searchParams.get("id")

  useEffect(() => {
    if (!bucketId) {
      document.title = "Buckets — ICPay Cloud"
    }
  }, [bucketId])

  if (bucketId) {
    return <BucketDetail bucketId={bucketId} />
  }

  return <BucketListPanel />
}

export default function BucketPage() {
  return (
    <Suspense fallback={null}>
      <BucketPageContent />
    </Suspense>
  )
}

