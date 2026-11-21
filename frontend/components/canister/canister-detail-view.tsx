"use client"

import { useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { MyCanisterDetails, type CanisterDetailTab } from "@/components/canister/details"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { useAuth } from "@/components/auth/auth-provider"
import { useCanisterStatus } from "@/hooks/canister/useCanisterStatus"
import { useSavedCanisterEntries } from "@/hooks/canister/useSavedCanisters"
import { fetchCanisterIndexMeta } from "@/services/canister/controlledCanisters"
import { buildCanisterHref } from "@/lib/canister/canisterNav"

export function CanisterDetailView({ canisterId: canisterIdProp }: { canisterId?: string } = {}) {
  const router = useRouter()
  const { identity, isAuthenticated } = useAuth()
  const searchParams = useSearchParams()

  const canisterId = canisterIdProp || searchParams.get("id") || ""

  const tabParam = searchParams.get("tab") as CanisterDetailTab | null
  const defaultTab: CanisterDetailTab =
    tabParam === "settings" ||
    tabParam === "snapshots" ||
    tabParam === "logs" ||
    tabParam === "audit" ||
    tabParam === "assets"
      ? tabParam
      : "overview"

  const sectionParam = searchParams.get("section") || "controllers"

  const principal = identity?.getPrincipal().toText() ?? null
  const entries = useSavedCanisterEntries(principal)
  const nameById = useMemo(() => new Map(entries.map((e) => [e.id, e.name])), [entries])
  const localName = canisterId ? nameById.get(canisterId) ?? "" : ""

  const status = useCanisterStatus(
    identity,
    canisterId,
    Boolean(isAuthenticated && canisterId)
  )

  const { data: indexMeta } = useSWR(
    canisterId ? (["canister-index-meta", canisterId] as const) : null,
    ([, id]) => fetchCanisterIndexMeta(id),
    { revalidateOnFocus: false, dedupingInterval: 120_000 }
  )
  const meta = indexMeta ?? null

  const handleTabChange = (tab: CanisterDetailTab) => {
    const currentSection = searchParams.get("section") || undefined
    router.replace(buildCanisterHref(canisterId, { tab, section: tab === "settings" ? currentSection : undefined }))
  }

  const handleSectionChange = (section: string) => {
    router.replace(buildCanisterHref(canisterId, { tab: "settings", section }))
  }

  return (
    <AppPage>
      {canisterId ? (
        <MyCanisterDetails
          canisterId={canisterId}
          localName={localName}
          meta={meta}
          status={status}
          defaultTab={defaultTab}
          activeSection={sectionParam}
          onTabChange={handleTabChange}
          onSectionChange={handleSectionChange}
          onCopyId={() => void navigator.clipboard.writeText(canisterId)}
          onRefresh={() => status.refresh()}
        />
      ) : null}
    </AppPage>
  )
}
