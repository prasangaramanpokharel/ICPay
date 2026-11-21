"use client"

import { useState } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DocsTopbar } from "@/components/docs/docs-topbar"
import { DocsSearch } from "@/components/docs/docs-search"
import { BucketDocsSidebar } from "@/components/products/icbucket/bucket-docs-sidebar"
import { BucketDocsCopyMenu } from "@/components/products/icbucket/bucket-docs-copy-menu"
import { BucketDocsPageToc } from "@/components/products/icbucket/bucket-docs-page-toc"
import { BucketDocsPagination } from "@/components/products/icbucket/bucket-docs-pagination"
import type { BucketDocMeta, BucketDocNavGroup, LoadedBucketDoc } from "@/lib/bucket/docs/types"

interface BucketDocsShellProps {
  doc: LoadedBucketDoc
  navGroups: BucketDocNavGroup[]
  allDocs: BucketDocMeta[]
}

export function BucketDocsShell({ doc, navGroups, allDocs }: BucketDocsShellProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <BucketDocsSidebar
          navGroups={navGroups}
          onOpenSearch={() => setSearchOpen(true)}
        />
        <SidebarInset className="min-w-0 flex flex-col flex-1">
          <DocsTopbar doc={doc} onOpenSearch={() => setSearchOpen(true)} />
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
                  <BucketDocsCopyMenu markdown={doc.fullMarkdown} title={doc.title} />
                </div>
                <div className="border-b border-border/40 pt-4" />
              </header>
              <div className="min-w-0">{doc.content}</div>
              <BucketDocsPagination currentSlug={doc.slug} navGroups={navGroups} />
              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-4 text-xs text-muted-foreground">
                <a
                  href="https://gitlab.com/prasangapokharel/icbucket"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground underline underline-offset-4"
                >
                  Edit this page on GitLab
                </a>
                <span>Updated recently</span>
              </div>
              <div className="pb-16" />
            </main>
            <aside className="hidden xl:block w-56 shrink-0 px-4 py-10 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
              <BucketDocsPageToc headings={doc.headings} />
            </aside>
          </div>
          <DocsSearch
            open={searchOpen}
            onOpenChange={setSearchOpen}
            allDocs={allDocs}
          />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
