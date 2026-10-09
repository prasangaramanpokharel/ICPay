"use client"

import { CodeBlock } from "@/components/ui/code-block"

type BucketCodeBlockProps = {
  code: string
  language?: string
  className?: string
}

export function BucketCodeBlock({
  code,
  language = "bash",
  className,
}: BucketCodeBlockProps) {
  return (
    <CodeBlock
      code={code}
      language={language}
      className={className}
    />
  )
}
