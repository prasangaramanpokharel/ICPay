import type { Metadata } from "next"
import { IcpayPresaleView } from "@/components/icpay/icpay-presale-view"

export const metadata: Metadata = {
  title: "ICPAY Token Presale",
}

export default function IcpayPresalePage() {
  return <IcpayPresaleView />
}
