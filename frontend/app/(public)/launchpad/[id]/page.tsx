import { CampaignView } from "./campaign-view"

export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "id" }]
}

export default function LaunchpadDetailPage() {
  return (
    <div className="px-4 py-8 md:px-6 md:py-12">
      <CampaignView />
    </div>
  )
}
