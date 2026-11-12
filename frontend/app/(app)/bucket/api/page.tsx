import type { Metadata } from "next"
import { Suspense } from "react"
import { BucketApiView } from "@/components/bucket/bucket-api-view"
import { FormRouteLoading } from "@/components/layout/route-loading"

export const metadata: Metadata = {
  title: "Bucket API Keys",
  description: "Manage S3-compatible API keys and developer access for ICPay Cloud storage buckets.",
}

export default function BucketApiPage() {
  return (
    <Suspense fallback={<FormRouteLoading />}>
      <BucketApiView />
    </Suspense>
  )
}
