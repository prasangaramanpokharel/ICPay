"use client"

import { CodeBlock } from "@/components/ui/code-block"

export type CronLanguageKey = "typescript" | "python" | "go" | "rust" | "php" | "curl"

const LANG_CONFIG: { key: CronLanguageKey; label: string; language: string }[] = [
  { key: "typescript", label: "TypeScript", language: "typescript" },
  { key: "python", label: "Python", language: "python" },
  { key: "go", label: "Go", language: "go" },
  { key: "rust", label: "Rust", language: "rust" },
  { key: "php", label: "PHP", language: "php" },
  { key: "curl", label: "cURL", language: "bash" },
]

export function CronCodeTabs({
  examples = {},
  className,
}: {
  examples?: Partial<Record<CronLanguageKey, string>>
  className?: string
}) {
  const tabs = LANG_CONFIG.filter((item) => Boolean(examples?.[item.key])).map((item) => ({
    label: item.label,
    code: examples?.[item.key] ?? "",
    language: item.language,
  }))

  if (tabs.length === 0) return null

  return <CodeBlock tabs={tabs} className={className} />
}
