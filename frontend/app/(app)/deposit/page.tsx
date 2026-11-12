import type { Metadata } from "next"
import { DepositView } from "@/components/deposit/deposit-view"

export const metadata: Metadata = {
  title: "Deposit ICP",
}

export default function DepositPage() {
  return <DepositView />
}
