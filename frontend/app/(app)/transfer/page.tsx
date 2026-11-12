import type { Metadata } from "next"
import { TransferView } from "@/components/transfer/transfer-view"

export const metadata: Metadata = {
  title: "Send ICP",
}

export default function TransferPage() {
  return <TransferView />
}
