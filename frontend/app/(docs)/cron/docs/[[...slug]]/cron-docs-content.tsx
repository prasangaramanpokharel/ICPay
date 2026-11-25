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
  return <CronDocsShell doc={doc} navGroups={navGroups} allDocs={allDocs} />
}
