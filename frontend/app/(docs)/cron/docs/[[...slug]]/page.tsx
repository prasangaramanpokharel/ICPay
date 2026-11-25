import type { Metadata } from "next"
import { Suspense } from "react"
import { cronDocSlugs, loadCronDoc } from "@/lib/cron/docs/load"
import { PAGE_IMAGES, pageImageUrl } from "@/lib/public/page-images"
import { CronDocsContent } from "./cron-docs-content"
import { CronDocsPageFallback } from "./cron-docs-fallback"

type PageProps = {
  params: Promise<{ slug?: string[] }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return cronDocSlugs().map((slugParts) => ({
    slug: slugParts.length > 0 ? slugParts : undefined,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug = [] } = await params
  const doc = await loadCronDoc(slug)
  if (!doc) return { title: "icCron Docs | ICPay" }

  const path = slug.length > 0 ? `/cron/docs/${slug.join("/")}` : "/cron/docs"
  const title = `${doc.title} | icCron Docs | ICPay`

  return {
    title,
    description: doc.description ?? "icCron documentation — autonomous on-chain scheduler and webhook dispatcher.",
    alternates: { canonical: `https://icpay.app${path}` },
    openGraph: {
      title,
      description: doc.description,
      url: `https://icpay.app${path}`,
      siteName: "ICPay",
      type: "article",
      images: [
        {
          url: pageImageUrl(PAGE_IMAGES.iccron.og),
          width: 1254,
          height: 1254,
          alt: "icCron Documentation",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: doc.description,
      images: [pageImageUrl(PAGE_IMAGES.iccron.og)],
      creator: "@IcpayOfficial",
    },
  }
}

export default function CronDocsSlugPage({ params }: PageProps) {
  return (
    <Suspense fallback={<CronDocsPageFallback />}>
      <CronDocsContent params={params} />
    </Suspense>
  )
}
