"use client"

import * as React from "react"
import { LaunchpadCard } from "./launchpad-card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, SlidersHorizontal, Sparkles } from "lucide-react"
import type { LaunchpadCampaign } from "@/services/launchpad/types"

interface LaunchpadListProps {
  campaigns: LaunchpadCampaign[]
}

export function LaunchpadList({ campaigns }: LaunchpadListProps) {
  const [search, setSearch] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<string>("all")
  const [sortBy, setSortBy] = React.useState<"raised" | "ending" | "newest">("raised")

  const filteredCampaigns = React.useMemo(() => {
    return campaigns
      .filter((c) => {
        // Tab filter
        if (activeTab === "live" && c.status !== "Open") return false
        if (activeTab === "success" && c.status !== "Committed" && c.status !== "Finalized")
          return false
        if (activeTab === "aborted" && c.status !== "Aborted") return false

        // Search filter
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
          c.tokenName.toLowerCase().includes(q) ||
          c.tokenSymbol.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        if (sortBy === "raised") {
          return b.totalIcpRaised - a.totalIcpRaised
        }
        if (sortBy === "ending") {
          return a.endTimestamp - b.endTimestamp
        }
        return b.startTimestamp - a.startTimestamp
      })
  }, [campaigns, activeTab, search, sortBy])

  const liveCount = campaigns.filter((c) => c.status === "Open").length
  const successCount = campaigns.filter((c) => c.status === "Committed" || c.status === "Finalized").length

  return (
    <div className="space-y-6">
      {/* Controls: Tabs, Search, and Sort */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
          <TabsList className="bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg text-xs font-medium">
              All ({campaigns.length})
            </TabsTrigger>
            <TabsTrigger value="live" className="rounded-lg text-xs font-medium">
              Live ({liveCount})
            </TabsTrigger>
            <TabsTrigger value="success" className="rounded-lg text-xs font-medium">
              Success ({successCount})
            </TabsTrigger>
            <TabsTrigger value="aborted" className="rounded-lg text-xs font-medium">
              Refunds
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search token or symbol..."
              className="h-9 pl-9 text-xs rounded-xl bg-card/60 border-border/60"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-card/60 px-2.5 py-1.5 text-xs text-muted-foreground">
            <SlidersHorizontal className="size-3.5" />
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "raised" | "ending" | "newest")
              }
              className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="raised">Most Raised</option>
              <option value="ending">Ending Soonest</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Campaigns */}
      {filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCampaigns.map((campaign) => (
            <LaunchpadCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 p-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
            <Sparkles className="size-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">No launchpad campaigns found</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            {search
              ? `No projects matched "${search}". Try searching for another symbol or name.`
              : "There are currently no campaigns matching the selected filter."}
          </p>
        </div>
      )}
    </div>
  )
}
