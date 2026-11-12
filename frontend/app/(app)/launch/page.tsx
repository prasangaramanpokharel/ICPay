import type { Metadata } from "next"
import { LaunchTokenView } from "@/components/launch/launch-token-view"

export const metadata: Metadata = {
  title: "Launch Token",
}

export default function LaunchPage() {
  return <LaunchTokenView />
}
