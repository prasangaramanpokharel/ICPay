import type { BucketDocHeading } from "@/lib/bucket/docs/types"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

export function extractHeadings(markdown: string): BucketDocHeading[] {
  const headings: BucketDocHeading[] = []
  const lines = markdown.split(/\r?\n/)
  let inCodeBlock = false
  const seen = new Map<string, number>()

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue

    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (!match) continue

    const level = match[1].length as 2 | 3
    const text = match[2].replace(/\{#.+\}$/, "").trim()
    const base = slugify(text)
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    const id = count === 0 ? base : `${base}-${count}`

    headings.push({ id, text, level })
  }

  return headings
}

