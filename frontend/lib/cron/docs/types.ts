import type { ReactNode } from "react"

export type CronDocFrontmatter = {
  title: string
  description?: string
  group: string
  order: number
  eyebrow?: string
}

export type CronDocHeading = {
  id: string
  text: string
  level: 2 | 3
}

export type CronDocMeta = CronDocFrontmatter & {
  slug: string
  slugParts: string[]
}

export type CronDocNavGroup = {
  label: string
  items: { slug: string; title: string }[]
}

export type LoadedCronDoc = CronDocMeta & {
  content: ReactNode
  rawBody: string
  fullMarkdown: string
  headings: CronDocHeading[]
}
