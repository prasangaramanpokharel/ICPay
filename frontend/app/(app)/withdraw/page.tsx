import type { Metadata } from "next"
import { WithdrawView } from "@/components/withdraw/withdraw-view"

export const metadata: Metadata = {
  title: "Withdraw",
}

export default function WithdrawPage() {
  return <WithdrawView />
}
