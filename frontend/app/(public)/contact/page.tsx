import type { Metadata } from "next"
import { ContactView } from "@/components/public/contact/contact-view"

export const metadata: Metadata = {
  title: "Contact Us — ICPay Support & Inquiries",
  description:
    "Get in touch with the ICPay team for technical support, partnerships, security disclosures, and on-chain storage inquiries. Email contact@icpay.cloud.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us — ICPay",
    description:
      "Official support channels, partnership inquiries, and responsible security disclosures for the ICPay ecosystem.",
    url: "https://icpay.app/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us — ICPay",
    description:
      "Get in touch with the ICPay team for support, partnerships, and technical inquiries.",
  },
}

export default function ContactPage() {
  return <ContactView />
}
