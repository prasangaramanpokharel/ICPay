import type { Metadata } from "next"
import { SwapRedirectView } from "@/components/trade/swap-redirect-view"

export const metadata: Metadata = {
  title: "Swap",
}

export default function SwapPage() {
  return <SwapRedirectView />
}
