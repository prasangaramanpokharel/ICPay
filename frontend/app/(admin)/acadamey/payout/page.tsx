import type { Metadata } from "next"
import { AdminPayoutView } from "@/components/products/icacademy/admin/payout/admin-payout-view"

export const metadata: Metadata = {
  title: "Treasury & Payouts — Admin",
}

export default function AcademyAdminPayoutPage() {
  return <AdminPayoutView />
}
