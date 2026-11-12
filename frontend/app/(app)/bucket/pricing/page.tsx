import type { Metadata } from "next"
import { BucketPricingView } from "@/components/bucket/bucket-pricing-view"

export const metadata: Metadata = {
  title: "Cloud Storage Pricing",
  description: "On-chain decentralized cloud storage pricing and bandwidth tiers for ICPay Cloud.",
}

export default function BucketPricingPage() {
  return <BucketPricingView />
}
