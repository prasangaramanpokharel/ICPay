import type { CronDocHeading } from "./types"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

export function extractHeadings(markdown: string): CronDocHeading[] {
  const headings: CronDocHeading[] = []
  const lines = markdown.split(/\r?\n/)
  let inCodeBlock = false

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue

    const h2Match = line.match(/^##\s+(.+)$/)
    if (h2Match) {
      const text = h2Match[1].trim()
      headings.push({ id: slugify(text), text, level: 2 })
      continue
    }

    const h3Match = line.match(/^###\s+(.+)$/)
    if (h3Match) {
      const text = h3Match[1].trim()
      headings.push({ id: slugify(text), text, level: 3 })
    }
  }

  return headings
}
