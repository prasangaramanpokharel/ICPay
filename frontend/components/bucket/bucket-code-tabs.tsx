"use client"

import { CodeBlock } from "@/components/ui/code-block"
import type { DocsExampleLang } from "@/lib/bucket/docsExamples"

const LANG_CONFIG: { key: DocsExampleLang; label: string; language: string }[] = [
  { key: "typescript", label: "TypeScript", language: "typescript" },
  { key: "python", label: "Python", language: "python" },
  { key: "curl", label: "cURL", language: "bash" },
]

type BucketCodeTabsProps = {
  examples: Record<DocsExampleLang, string>
  defaultLang?: DocsExampleLang
  className?: string
}

export function BucketCodeTabs({
  examples,
  className,
}: BucketCodeTabsProps) {
  const tabs = LANG_CONFIG.filter((item) => Boolean(examples[item.key])).map((item) => ({
    label: item.label,
    code: examples[item.key],
    language: item.language,
  }))

  if (tabs.length === 0) return null

  return (
    <CodeBlock
      tabs={tabs}
      className={className}
    />
  )
}
