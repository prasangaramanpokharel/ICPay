import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { compileMDX } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import { extractHeadings } from "@/lib/cron/docs/headings"
import { cronMdxComponents } from "@/lib/cron/docs/mdx-components"
import type { CronDocFrontmatter, CronDocMeta, LoadedCronDoc } from "@/lib/cron/docs/types"

const DOCS_ROOT = path.join(process.cwd(), "public/docs/iccron")

function getDocsRoot(): string {
  return DOCS_ROOT
}

function listMdxFiles(dir: string, prefix: string[] = []): string[][] {
  if (!fs.existsSync(dir)) return []
  const slugs: string[][] = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      slugs.push(...listMdxFiles(path.join(dir, entry.name), [...prefix, entry.name]))
      continue
    }
    if (!entry.name.endsWith(".mdx")) continue
    const name = entry.name.replace(/\.mdx$/, "")
    slugs.push(name === "index" ? prefix : [...prefix, name])
  }

  return slugs
}

function resolveFilePath(slugParts: string[]): string | null {
  const root = getDocsRoot()
  if (slugParts.length === 0) {
    const index = path.join(root, "index.mdx")
    return fs.existsSync(index) ? index : null
  }
  const file = path.join(root, ...slugParts) + ".mdx"
  if (fs.existsSync(file)) return file
  const dirIndex = path.join(root, ...slugParts, "index.mdx")
  if (fs.existsSync(dirIndex)) return dirIndex
  return null
}

function parseFrontmatter(data: Record<string, unknown>): CronDocFrontmatter {
  return {
    title: String(data.title ?? "Untitled"),
    description: data.description ? String(data.description) : undefined,
    group: String(data.group ?? "Docs"),
    order: Number(data.order ?? 99),
    eyebrow: data.eyebrow ? String(data.eyebrow) : undefined,
  }
}

function toFullMarkdown(frontmatter: CronDocFrontmatter, body: string): string {
  const lines = ["---"]
  lines.push(`title: ${JSON.stringify(frontmatter.title)}`)
  if (frontmatter.description) {
    lines.push(`description: ${JSON.stringify(frontmatter.description)}`)
  }
  lines.push(`group: ${JSON.stringify(frontmatter.group)}`)
  lines.push(`order: ${frontmatter.order}`)
  if (frontmatter.eyebrow) {
    lines.push(`eyebrow: ${JSON.stringify(frontmatter.eyebrow)}`)
  }
  lines.push("---")
  lines.push("")
  lines.push(body.trim())
  return lines.join("\n")
}

export function cronDocSlugs(): string[][] {
  return listMdxFiles(getDocsRoot())
}

export function loadAllCronDocMeta(): CronDocMeta[] {
  const slugs = cronDocSlugs()
  const results: CronDocMeta[] = []

  for (const slugParts of slugs) {
    const filePath = resolveFilePath(slugParts)
    if (!filePath) continue
    try {
      const raw = fs.readFileSync(filePath, "utf-8")
      const { data } = matter(raw)
      const frontmatter = parseFrontmatter(data)
      results.push({
        ...frontmatter,
        slug: slugParts.join("/"),
        slugParts,
      })
    } catch {
      // ignore
    }
  }

  return results
}

export async function loadCronDoc(slugParts: string[]): Promise<LoadedCronDoc | null> {
  const filePath = resolveFilePath(slugParts)
  if (!filePath) return null

  try {
    const raw = fs.readFileSync(filePath, "utf-8")
    const { data, content: body } = matter(raw)
    const frontmatter = parseFrontmatter(data)
    const headings = extractHeadings(body)

    const compiled = await compileMDX({
      source: body,
      components: cronMdxComponents,
      options: {
        parseFrontmatter: false,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug],
        },
      },
    })

    return {
      ...frontmatter,
      slug: slugParts.join("/"),
      slugParts,
      content: compiled.content,
      rawBody: body,
      fullMarkdown: toFullMarkdown(frontmatter, body),
      headings,
    }
  } catch {
    return null
  }
}
