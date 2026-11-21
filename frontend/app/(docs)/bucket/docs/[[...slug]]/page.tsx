import type { Metadata } from "next"
import { Suspense } from "react"
import { bucketDocSlugs, loadBucketDoc } from "@/lib/bucket/docs/load"
import { PAGE_IMAGES, pageImageUrl } from "@/lib/public/page-images"
import { BucketDocsContent } from "./bucket-docs-content"
import { BucketDocsPageFallback } from "./bucket-docs-fallback"

type PageProps = {
  params: Promise<{ slug?: string[] }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return bucketDocSlugs().map((slugParts) => ({
    slug: slugParts.length > 0 ? slugParts : undefined,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug = [] } = await params
  const doc = await loadBucketDoc(slug)
  if (!doc) return { title: "ICBucket Docs | ICPay" }

  const path = slug.length > 0 ? `/bucket/docs/${slug.join("/")}` : "/bucket/docs"
  const title = `${doc.title} | ICBucket Docs | ICPay`

  return {
    title,
    description: doc.description ?? "ICBucket documentation — on-chain encrypted file storage.",
    alternates: { canonical: `https://icpay.app${path}` },
    openGraph: {
      title,
      description: doc.description,
      url: `https://icpay.app${path}`,
      siteName: "ICPay",
      type: "article",
      images: [
        {
          url: pageImageUrl(PAGE_IMAGES.icbucket.og),
          width: 1254,
          height: 1254,
          alt: "ICBucket Documentation",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: doc.description,
      images: [pageImageUrl(PAGE_IMAGES.icbucket.og)],
    },
  }
}

export default function BucketDocsSlugPage({ params }: PageProps) {
  return (
    <Suspense fallback={<BucketDocsPageFallback />}>
      <BucketDocsContent params={params} />
    </Suspense>
  )
}
