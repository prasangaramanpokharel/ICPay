import type { ReactNode } from "react"
import Link from "next/link"
import { BucketCodeBlock } from "@/components/bucket/bucket-code-block"
import { BucketCodeTabs } from "@/components/bucket/bucket-code-tabs"
import { BucketDocsInstallRow } from "@/components/products/icbucket/bucket-docs-install"
import { apiDocSections } from "@/lib/bucket/docsApiSections"
import { BUCKET_API_METHODS } from "@/lib/bucket/docsMethodList"
import { WALLET_CANISTER_ID } from "@/services/icp"
import { DocHubCards } from "@/lib/bucket/docs/doc-hub-cards"
import { cn } from "@/lib/ui/utils"
import { Gitlab } from "@dev.icons/react"

type CodeTabsProps = { section: string }

function extractCode(children: ReactNode): string {
  if (typeof children === "string") return children.trim()
  if (Array.isArray(children)) return children.map(extractCode).join("").trim()
  if (children && typeof children === "object" && "props" in children) {
    const props = children.props as { children?: ReactNode }
    return extractCode(props.children ?? "")
  }
  return ""
}

function extractLanguage(children: ReactNode): string {
  if (children && typeof children === "object" && "props" in children) {
    const props = children.props as { className?: string }
    if (props.className && typeof props.className === "string") {
      const match = props.className.match(/language-([a-zA-Z0-9_-]+)/)
      if (match) return match[1]
    }
  }
  return "bash"
}

function MdxPre({ children }: { children?: ReactNode }) {
  const code = extractCode(children)
  if (!code) return <pre>{children}</pre>
  const language = extractLanguage(children)
  return <BucketCodeBlock code={code} language={language} className="my-5" />
}

function MdxCodeTabs({ section }: CodeTabsProps) {
  const match = apiDocSections().find((item) => item.id === section)
  if (!match) return null
  return <BucketCodeTabs examples={match.examples()} />
}

function ApiMethodTable() {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border/60 bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/50 text-left">
            <th className="px-4 py-3 font-medium">Method</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Auth</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {BUCKET_API_METHODS.map((row) => (
            <tr key={row.name} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-2.5 text-foreground">{row.name}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{row.kind}</td>
              <td className="px-4 py-2.5 font-sans text-muted-foreground">{row.auth}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ApiCanisterId() {
  return (
    <p className="my-4 font-mono text-xs text-muted-foreground md:text-sm">
      Canister ID: {WALLET_CANISTER_ID}. Sign in through ICPay or use @dfinity/agent with your
      Internet Identity delegation.
    </p>
  )
}

type DocCardProps = { href: string; title: string; description: string }

function DocCard({ href, title, description }: DocCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-border hover:bg-muted/30"
    >
      <h3 className="font-semibold text-foreground group-hover:text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </Link>
  )
}

function DocCardGrid({ items = [] }: { items?: DocCardProps[] }) {
  if (!items || !Array.isArray(items)) return null
  return (
    <div className="my-8 grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <DocCard key={item.href} {...item} />
      ))}
    </div>
  )
}

function Callout({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
      {title ? <p className="mb-1 text-sm font-semibold text-foreground">{title}</p> : null}
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  )
}

function resolveMdxHref(href?: string): string {
  if (!href) return "#"
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//") ||
    href.startsWith("mailto:") ||
    href.startsWith("#")
  ) {
    return href
  }
  let clean = href.replace(/\.mdx?$/, "")
  clean = clean.replace(/^\.\.\//, "").replace(/^\.\//, "")
  if (!clean.startsWith("/bucket/docs") && !clean.startsWith("/")) {
    clean = `/bucket/docs/${clean}`
  }
  return clean
}

export const bucketMdxComponents = {
  pre: MdxPre,
  CodeTabs: MdxCodeTabs,
  ApiMethodTable,
  ApiCanisterId,
  InstallRow: BucketDocsInstallRow,
  DocCard,
  DocCardGrid,
  DocHubCards,
  Callout,
  Gitlab,
  h2: ({ children, id }: { children?: ReactNode; id?: string }) => (
    <h2
      id={id}
      className="group scroll-mt-20 border-b border-border/40 pb-2 text-xl font-semibold tracking-tight md:text-2xl text-foreground mt-10 mb-4 flex items-center justify-between"
    >
      <span>{children}</span>
      {id && (
        <a
          href={`#${id}`}
          aria-label={`Link to ${children}`}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground text-sm font-normal ml-2"
        >
          #
        </a>
      )}
    </h2>
  ),
  h3: ({ children, id }: { children?: ReactNode; id?: string }) => (
    <h3
      id={id}
      className="group scroll-mt-20 text-base font-semibold tracking-tight md:text-lg text-foreground mt-6 mb-2 flex items-center justify-between"
    >
      <span>{children}</span>
      {id && (
        <a
          href={`#${id}`}
          aria-label={`Link to ${children}`}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground text-xs font-normal ml-2"
        >
          #
        </a>
      )}
    </h3>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="my-4 text-sm leading-relaxed text-muted-foreground md:text-base">{children}</p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="my-4 list-disc space-y-2 pl-6 text-sm text-muted-foreground md:text-base">
      {children}
    </ul>
  ),
  li: ({ children }: { children?: ReactNode }) => <li className="leading-relaxed">{children}</li>,
  table: ({ children }: { children?: ReactNode }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: ReactNode }) => (
    <thead className="border-b border-border/60 bg-muted/50 text-left">{children}</thead>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="px-4 py-3 font-medium text-foreground">{children}</th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="border-t border-border/40 px-4 py-2.5 text-muted-foreground">{children}</td>
  ),
  a: ({ href, children }: { href?: string; children?: ReactNode }) => {
    const resolved = resolveMdxHref(href)
    const isExternal = resolved.startsWith("http://") || resolved.startsWith("https://")
    if (isExternal) {
      return (
        <a
          href={resolved}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground"
        >
          {children}
        </a>
      )
    }
    return (
      <Link
        href={resolved}
        className={cn("font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground")}
      >
        {children}
      </Link>
    )
  },
}
