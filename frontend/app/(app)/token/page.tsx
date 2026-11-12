import type { Metadata } from "next"
import { TokenRouteView } from "@/components/token/token-route-view"

export const metadata: Metadata = {
  title: "Token Details",
}

export default function TokenPage() {
  return <TokenRouteView />
}
