import type { Metadata } from "next"
import { NativeAuthView } from "@/components/auth/native-auth-view"

export const metadata: Metadata = {
  title: "Mobile Sign In — Internet Identity",
}

export default function NativeAuthBridgePage() {
  return <NativeAuthView />
}
