import type { Metadata } from "next"
import { SettingsMenuView } from "@/components/settings/settings-menu-view"

export const metadata: Metadata = {
  title: "Settings",
  description: "Explore ICPay wallet services, storage buckets, canisters, governance, and preferences.",
}

export default function MenuPage() {
  return <SettingsMenuView />
}
