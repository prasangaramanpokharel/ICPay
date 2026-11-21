import type { ReactNode } from "react"

export default function DocsLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground antialiased">{children}</div>
}
