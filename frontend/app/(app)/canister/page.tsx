import type { Metadata } from "next"
import { CanisterWorkspaceView } from "@/components/canister/canister-workspace-view"

export const metadata: Metadata = {
  title: "Canisters — icFalcon",
}

export default function AppCanisterPage() {
  return <CanisterWorkspaceView />
}
