import type { Metadata } from "next"
import { IcpverseDirectoryView } from "@/components/icpverse/icpverse-directory-view"

export const metadata: Metadata = {
  title: "ICPVerse Directory",
}

export default function IcpversePage() {
  return <IcpverseDirectoryView />
}
