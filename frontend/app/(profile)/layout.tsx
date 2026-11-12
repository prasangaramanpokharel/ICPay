import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pay",
  description:
    "Send ICP to an ICPay username. Scan the QR code or copy the address to pay from any Internet Computer wallet.",
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
