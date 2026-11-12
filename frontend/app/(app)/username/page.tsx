import type { Metadata } from "next"
import { UsernamePurchaseView } from "@/components/profile/username-purchase-view"

export const metadata: Metadata = {
  title: "Claim Username",
  description: "Claim a verified @username handle on ICPay to send and receive ICP without principal addresses.",
}

export default function UsernamePage() {
  return <UsernamePurchaseView />
}
