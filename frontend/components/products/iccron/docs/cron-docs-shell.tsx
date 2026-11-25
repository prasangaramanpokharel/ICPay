"use client"

import { useState } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { CronDocsTopbar } from "./cron-docs-topbar"
import { CronDocsSearch } from "./cron-docs-search"
import { CronDocsSidebar } from "./cron-docs-sidebar"
import { CronDocsCopyMenu } from "./cron-docs-copy-menu"
import { CronDocsPageToc } from "./cron-docs-page-toc"
import { CronDocsPagination } from "./cron-docs-pagination"
import type { CronDocMeta, CronDocNavGroup, LoadedCronDoc } from "@/lib/cron/docs/types"

interface CronDocsShellProps {
  doc: LoadedCronDoc
  navGroups: CronDocNavGroup[]
  allDocs: CronDocMeta[]
}

export function CronDocsShell({ doc, navGroups, allDocs }: CronDocsShellProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <CronDocsSidebar
          navGroups={navGroups}
          onOpenSearch={() => setSearchOpen(true)}
        />
        <SidebarInset className="min-w-0 flex flex-col flex-1">
          <CronDocsTopbar doc={doc} onOpenSearch={() => setSearchOpen(true)} />
          <div className="flex-1 w-full flex justify-between min-w-0">
            <main className="flex-1 min-w-0 px-4 py-8 md:px-8 md:py-10 max-w-4xl mx-auto xl:mx-0 xl:max-w-3xl">
              <header className="mb-6 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  {doc.title}
                </h1>
                {doc.description && (
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {doc.description}
                  </p>
                )}
                <div className="pt-2">
                  <CronDocsCopyMenu markdown={doc.fullMarkdown} title={doc.title} />
                </div>
                <div className="border-b border-border/40 pt-4" />
              </header>
              <div className="min-w-0 prose prose-invert max-w-none">{doc.content}</div>
              <CronDocsPagination currentSlug={doc.slug} navGroups={navGroups} />
              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-4 text-xs text-muted-foreground">
                <a
                  href="https://github.com/prasangapokharel/ICPay/tree/main/pkg/iccron"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground underline underline-offset-4"
                >
                  Edit on GitHub
                </a>
                <span>Mainnet Canister: w2fxo-5qaaa-aaaan-q6zxq-cai</span>
              </div>
              <div className="pb-16" />
            </main>
            <aside className="hidden xl:block w-56 shrink-0 px-4 py-10 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
              <CronDocsPageToc headings={doc.headings} />
            </aside>
          </div>
          <CronDocsSearch
            open={searchOpen}
            onOpenChange={setSearchOpen}
            allDocs={allDocs}
          />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
