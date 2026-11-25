import type { CronDocMeta, CronDocNavGroup } from "./types"

const GROUP_ORDER = [
  "Overview",
  "Guides",
  "API Reference",
  "Errors",
  "FAQ",
] as const

export function buildCronNavGroups(pages: CronDocMeta[]): CronDocNavGroup[] {
  const byGroup = new Map<string, CronDocMeta[]>()

  for (const page of pages) {
    if (page.slugParts.length === 0) continue
    const groupName = page.group || "Overview"
    const list = byGroup.get(groupName) ?? []
    list.push(page)
    byGroup.set(groupName, list)
  }

  const result: CronDocNavGroup[] = []
  const seenGroups = new Set<string>()

  for (const label of GROUP_ORDER) {
    if (byGroup.has(label)) {
      seenGroups.add(label)
      result.push({
        label,
        items: (byGroup.get(label) ?? [])
          .sort((a, b) => a.order - b.order)
          .map((page) => ({ slug: page.slug, title: page.title })),
      })
    }
  }

  for (const [label, list] of byGroup.entries()) {
    if (!seenGroups.has(label)) {
      result.push({
        label,
        items: list
          .sort((a, b) => a.order - b.order)
          .map((page) => ({ slug: page.slug, title: page.title })),
      })
    }
  }

  return result
}

export function cronDocHref(slug: string): string {
  return slug ? `/cron/docs/${slug}` : "/cron/docs"
}
