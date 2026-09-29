"use client"

import { useEffect } from "react"
import { BucketListPanel } from "@/components/bucket/bucket-list-panel"

export default function BucketPage() {
  useEffect(() => {
    document.title = "Buckets — ICPay Cloud"
  }, [])

  return <BucketListPanel />
}
