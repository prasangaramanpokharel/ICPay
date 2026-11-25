import type { ReactNode } from "react"
import Link from "next/link"
import { CodeBlock } from "@/components/ui/code-block"
import { CronDocHubCards } from "@/lib/cron/docs/doc-hub-cards"
import { CronCodeTabs } from "@/lib/cron/docs/code-tabs"
import { cn } from "@/lib/ui/utils"

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
  return <CodeBlock code={code} language={language} className="my-5" />
}

function MdxTable({ children }: { children?: ReactNode }) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-border/60 bg-card">
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

function MdxThead({ children }: { children?: ReactNode }) {
  return <thead className="border-b border-border/60 bg-muted/50 text-left font-medium">{children}</thead>
}

function MdxTh({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground", className)}>{children}</th>
}

function MdxTd({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("border-b border-border/40 px-4 py-3 text-sm text-foreground", className)}>{children}</td>
}

function MdxBlockquote({ children }: { children?: ReactNode }) {
  return (
    <blockquote className="my-4 border-l-2 border-primary/60 bg-primary/5 px-4 py-3 text-sm italic text-foreground rounded-r-lg">
      {children}
    </blockquote>
  )
}

function MdxA({ href, children, ...props }: { href?: string; children?: ReactNode; [key: string]: unknown }) {
  const isExternal = href?.startsWith("http")
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
        {...props}
      >
        {children}
      </a>
    )
  }
  return (
    <Link href={href ?? "#"} className="font-medium text-primary underline underline-offset-4 hover:opacity-80" {...props}>
      {children}
    </Link>
  )
}

export const cronMdxComponents = {
  DocHubCards: CronDocHubCards,
  CronDocHubCards,
  CodeTabs: CronCodeTabs,
  CronCodeTabs,
  pre: MdxPre,
  table: MdxTable,
  thead: MdxThead,
  th: MdxTh,
  td: MdxTd,
  blockquote: MdxBlockquote,
  a: MdxA,
}
