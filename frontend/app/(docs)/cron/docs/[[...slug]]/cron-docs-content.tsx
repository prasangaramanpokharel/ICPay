import { notFound } from "next/navigation"
import { CronDocsShell } from "@/components/products/iccron/docs/cron-docs-shell"
import { buildCronNavGroups } from "@/lib/cron/docs/nav"
import { loadAllCronDocMeta, loadCronDoc } from "@/lib/cron/docs/load"

export async function CronDocsContent({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug = [] } = await params
  const doc = await loadCronDoc(slug)
  if (!doc) notFound()

  const allDocs = loadAllCronDocMeta()
  const navGroups = buildCronNavGroups(allDocs)

  const path = slug.length > 0 ? `/cron/docs/${slug.join("/")}` : "/cron/docs"
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: doc.title,
        description: doc.description,
        url: `https://icpay.app${path}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://icpay.app",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "icCron Docs",
            item: "https://icpay.app/cron/docs",
          },
          ...(slug.length > 0
            ? [
                {
                  "@type": "ListItem",
                  position: 3,
                  name: doc.title,
                  item: `https://icpay.app${path}`,
                },
              ]
            : []),
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CronDocsShell doc={doc} navGroups={navGroups} allDocs={allDocs} />
    </>
  )
}
