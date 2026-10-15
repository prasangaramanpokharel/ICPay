"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { MyCanistersPanel } from "@/components/canister/my-canisters-panel"
import { CanisterDetailView } from "@/components/canister/canister-detail-view"

function CanisterPageContent() {
  const searchParams = useSearchParams()
  const canisterId = searchParams.get("id")

  if (canisterId) {
    return <CanisterDetailView canisterId={canisterId} />
  }

  return <MyCanistersPanel />
}

export default function AppCanisterPage() {
  return (
    <Suspense fallback={null}>
      <CanisterPageContent />
    </Suspense>
  )
}
