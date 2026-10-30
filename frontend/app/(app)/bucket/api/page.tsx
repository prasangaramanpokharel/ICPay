"use client"

import { Suspense } from "react"
import { BucketApiView } from "@/components/bucket/bucket-api-view"

export default function BucketApiPage() {
  return (
    <Suspense fallback={null}>
      <BucketApiView />
    </Suspense>
  )
}
