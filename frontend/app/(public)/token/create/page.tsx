import type { Metadata } from "next"
import { PublicTokenCreate } from "@/components/launch/public-token-create"
import { Particles } from "@/components/ui/particles"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"

export const metadata: Metadata = {
  title: "Create ICRC-1 Token on ICP — No-Code Token Launcher",
  description:
    "Deploy a custom ICRC-1 token ledger canister on the Internet Computer in seconds with ICPay. Configure token symbol, supply, decimals, and logo with no code required.",
  keywords: [
    "create ICRC-1 token",
    "ICP token launcher",
    "deploy token Internet Computer",
    "no-code ICP token",
    "ICRC-1 ledger canister",
    "ICPay token launch",
  ],
  alternates: { canonical: `${siteUrl}/token/create` },
  openGraph: {
    title: "Create ICRC-1 Token on ICP — ICPay",
    description:
      "Deploy a custom ICRC-1 token ledger on the Internet Computer with no code required.",
    url: `${siteUrl}/token/create`,
    siteName: "ICPay",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create ICRC-1 Token on ICP — ICPay",
    description:
      "Deploy a custom ICRC-1 token ledger on the Internet Computer with no code required.",
    creator: "@IcpayOfficial",
  },
}

export default function PublicTokenCreatePage() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden border-b border-border/60 bg-background">
      <Particles
        className="absolute inset-0 z-0 invert dark:invert-0"
        quantity={90}
        ease={80}
      />
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col px-4 py-10 md:px-6 md:py-14">
        <PublicTokenCreate />
      </div>
    </section>
  )
}
