import type { Metadata } from "next"
import { IcpayTokenView } from "@/components/icpay/icpay-token-view"

export const metadata: Metadata = {
  title: "$ICPAY Token",
}

export default function IcpayTokenPage() {
  return <IcpayTokenView />
}
