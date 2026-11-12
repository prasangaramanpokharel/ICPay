import type { Metadata } from "next"
import { TransactionsView } from "@/components/transactions/transactions-view"

export const metadata: Metadata = {
  title: "Activity & Transactions",
}

export default function TransactionsPage() {
  return <TransactionsView />
}
