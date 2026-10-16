import type { Metadata } from "next"
import {
  channelJsonLd,
  channelMetadata,
  isChannelIndexable,
} from "@/lib/community/seo"
import { getCachedPublicChannelSnapshot } from "@/lib/community/publicCache"
import { Suspense } from "react"
import { ChannelSlugView } from "@/components/community/channel-slug-view"
import { Spinner } from "@/components/ui/spinner"

export function generateStaticParams() {
  return [{ slug: "slug", messageId: "message" }]
}

async function getChannelWithTimeout(slug: string) {
  if (!slug || slug === "slug") return null
  try {
    return await Promise.race([
      getCachedPublicChannelSnapshot(slug),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
    ])
  } catch {
    return null
  }
}

type PageProps = { params: Promise<{ slug: string; messageId: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (slug === "slug") {
    return { title: "ICPay Channels", robots: { index: false, follow: false } }
  }
  const channel = await getChannelWithTimeout(slug)
  const base = channelMetadata(slug, channel)
  return {
    ...base,
    robots: { index: false, follow: true },
  }
}

export default async function ChannelMessagePublicPage({ params }: PageProps) {
  const { slug } = await params
  if (slug === "slug") {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-svh items-center justify-center">
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        }
      >
        <ChannelSlugView slug={slug} channel={null} />
      </Suspense>
    )
  }
  const channel = await getChannelWithTimeout(slug)
  const jsonLd =
    channel && isChannelIndexable(channel) ? channelJsonLd(slug, channel) : null

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <Suspense
        fallback={
          <div className="flex min-h-svh items-center justify-center">
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        }
      >
        <ChannelSlugView key={slug} slug={slug} channel={channel} />
      </Suspense>
    </>
  )
}
