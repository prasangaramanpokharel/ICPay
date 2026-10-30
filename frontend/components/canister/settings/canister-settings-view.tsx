"use client"

import { useState } from "react"
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
}: {
  canisterId: string
  data: CanisterStatusView
  isController: boolean
  onRefresh: () => void
}) {
  const [activeTab, setActiveTab] = useState("controllers")

  return (
    <div className="flex flex-col gap-5">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-4">
        <TabsList>
          <TabsTrigger value="controllers" className="cursor-pointer">
            Controllers
          </TabsTrigger>
          <TabsTrigger value="resources" className="cursor-pointer">
            Resources
          </TabsTrigger>
          <TabsTrigger value="visibility" className="cursor-pointer">
            Visibility
          </TabsTrigger>
          <TabsTrigger value="danger" className="cursor-pointer text-destructive data-active:text-destructive">
            Lifecycle
          </TabsTrigger>
        </TabsList>

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

        <TabsContent value="danger" className="flex flex-col gap-4">
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
