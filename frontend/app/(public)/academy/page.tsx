import type { Metadata } from "next"
import {
  AcademyHero,
  AcademyStatsBanner,
  CourseCardCatalog,
  CourseCurriculumExplorer,
  AcademyFaq,
  AcademyCta,
} from "@/components/products/icacademy"

export const metadata: Metadata = {
  title: "ICAcademy - Web3 & Motoko Developer Academy | ICPay",
  description:
    "Master full-stack Internet Computer engineering, Motoko canister persistence, zero-egress S3 cloud architectures with ICBucket, and WebAuthn custody. Free on-chain developer courses.",
  keywords: [
    "ICAcademy",
    "Motoko tutorial",
    "Internet Computer developer course",
    "Web3 academy",
    "ICBucket cloud storage",
    "canister engineering",
    "orthogonal persistence",
    "Internet Identity tutorial",
    "ICRC-1 token standard",
    "PocketIC testing",
    "ICP smart contract tutorial",
    "blockchain development courses",
  ],
  openGraph: {
    title: "ICAcademy - Web3 & Motoko Developer Academy | ICPay",
    description:
      "Master Motoko canister engineering, ICBucket cloud storage, and passkey authentication with interactive video masterclasses and hands-on labs.",
    url: "https://icpay.app/academy",
    siteName: "ICPay",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ICAcademy - Web3 & Motoko Developer Academy | ICPay",
    description:
      "Interactive curriculum for building production canisters, zero-egress cloud storage, and non-custodial fintech on the Internet Computer.",
    creator: "@IcpayOfficial",
  },
  alternates: {
    canonical: "https://icpay.app/academy",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Course",
      "name": "Motoko Canister Mastery & Orthogonal Persistence",
      "description":
        "Comprehensive engineering curriculum covering WebAssembly execution, actor model, orthogonal persistence, and cycles economics on the Internet Computer.",
      "provider": {
        "@type": "Organization",
        "name": "ICPay",
        "url": "https://icpay.app",
      },
      "educationalCredentialAwarded": "ICAcademy Certified Web3 Architect",
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "Online",
        "courseWorkload": "PT18H",
      },
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://icpay.app",
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Academy",
          "item": "https://icpay.app/academy",
        },
      ],
    },
  ],
}

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AcademyHero />
      <CourseCardCatalog />
      <CourseCurriculumExplorer />
      <AcademyStatsBanner />
      <AcademyFaq />
      <AcademyCta />
    </div>
  )
}
