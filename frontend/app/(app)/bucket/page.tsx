import type { Metadata } from "next"
import { BucketWorkspaceView } from "@/components/bucket/bucket-workspace-view"

export const metadata: Metadata = {
  title: "Buckets — ICPay Cloud",
}

export default function BucketPage() {
  return <BucketWorkspaceView />
}
