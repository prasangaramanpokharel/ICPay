"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { Gitlab } from "@dev.icons/react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/public/theme-toggle"
import type { LoadedBucketDoc } from "@/lib/bucket/docs/types"

interface DocsTopbarProps {
  doc: LoadedBucketDoc
  onOpenSearch: () => void
}

export function DocsTopbar({ doc, onOpenSearch }: DocsTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger className="cursor-pointer size-8 text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="h-4 mx-1" />
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap whitespace-nowrap overflow-hidden text-xs sm:text-sm">
            <BreadcrumbItem className="hidden sm:inline-flex">
              <BreadcrumbLink render={<Link href="/bucket/docs" />}>
                ICBucket
              </BreadcrumbLink>
            </BreadcrumbItem>
            {doc.group && (
              <>
                <BreadcrumbSeparator className="hidden sm:inline-flex" />
                <BreadcrumbItem className="hidden sm:inline-flex">
                  <span className="text-muted-foreground">{doc.group}</span>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator className="hidden sm:inline-flex" />
            <BreadcrumbItem className="min-w-0 truncate">
              <BreadcrumbPage className="font-medium text-foreground truncate max-w-[200px] sm:max-w-xs">
                {doc.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenSearch}
          className="hidden md:flex h-8 gap-2 rounded-lg px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <HugeiconsIcon icon={Search01Icon} className="size-3.5" />
          <span>Search docs...</span>
          <kbd className="pointer-events-none inline-flex h-4 items-center rounded border border-border/70 bg-muted/50 px-1 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onOpenSearch}
          className="md:hidden size-8 text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label="Search docs"
        >
          <HugeiconsIcon icon={Search01Icon} className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          render={
            <Link
              href="https://gitlab.com/prasangapokharel/icbucket"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ICBucket on GitLab"
            />
          }
          className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Gitlab size={15} />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  )
}
