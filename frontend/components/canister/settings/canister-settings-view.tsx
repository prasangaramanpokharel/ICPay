"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CanisterControllersCard } from "./canister-controllers-card"
import { CanisterResourcesCard } from "./canister-resources-card"
import { CanisterVisibilityCard } from "./canister-visibility-card"
import { CanisterLifecycleCard } from "./canister-lifecycle-card"
import type { CanisterStatusView } from "@/services/canister/management"

export function CanisterSettingsView({
  canisterId,
  data,
  isController,
  onRefresh,
  activeSection = "controllers",
  onSectionChange,
}: {
  canisterId: string
  data: CanisterStatusView
  isController: boolean
  onRefresh: () => void
  activeSection?: string
  onSectionChange?: (section: string) => void
}) {
  const tab = activeSection === "danger" ? "lifecycle" : activeSection

  const handleTabChange = (val: string) => {
    onSectionChange?.(val)
  }

  return (
    <div className="flex flex-col gap-5">
      <Tabs value={tab} onValueChange={handleTabChange} className="flex flex-col gap-4">
        <div className="md:hidden">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="controllers" className="cursor-pointer text-xs">
              Controllers
            </TabsTrigger>
            <TabsTrigger value="resources" className="cursor-pointer text-xs">
              Resources
            </TabsTrigger>
            <TabsTrigger value="visibility" className="cursor-pointer text-xs">
              Visibility
            </TabsTrigger>
            <TabsTrigger value="lifecycle" className="cursor-pointer text-xs text-destructive data-active:text-destructive">
              Lifecycle
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="controllers" className="flex flex-col gap-4">
          <CanisterControllersCard
            canisterId={canisterId}
            controllers={data.controllers}
            isController={isController}
            onRefresh={onRefresh}
          />
        </TabsContent>

        <TabsContent value="resources" className="flex flex-col gap-4">
          <CanisterResourcesCard
            canisterId={canisterId}
            data={data}
            isController={isController}
            onRefresh={onRefresh}
          />
        </TabsContent>

        <TabsContent value="visibility" className="flex flex-col gap-4">
          <CanisterVisibilityCard
            canisterId={canisterId}
            initialLogVisibility={data.logVisibility}
            isController={isController}
            onRefresh={onRefresh}
          />
        </TabsContent>

        <TabsContent value="lifecycle" className="flex flex-col gap-4">
          <CanisterLifecycleCard
            canisterId={canisterId}
            runStatus={data.runStatus}
            isController={isController}
            onRefresh={onRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
