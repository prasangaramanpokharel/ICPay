"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { Gitlab } from "@dev.icons/react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { docHref } from "@/lib/bucket/docs/nav"
import type { BucketDocNavGroup } from "@/lib/bucket/docs/types"

interface BucketDocsSidebarProps {
  navGroups: BucketDocNavGroup[]
  onOpenSearch: () => void
}

export function BucketDocsSidebar({ navGroups, onOpenSearch }: BucketDocsSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-border/40 bg-sidebar">
      <SidebarHeader className="gap-3 p-3">
        <div className="flex items-center justify-between px-1">
          <Link
            href="/bucket/docs"
            className="flex items-center gap-2.5 font-semibold text-sm text-foreground hover:opacity-90 transition-opacity"
          >
            <div className="flex size-7 items-center justify-center rounded-lg border border-border/60 bg-card overflow-hidden">
              <Image
                src="/images/logo/icbucket/icbucket.png"
                alt="ICBucket"
                width={28}
                height={28}
                className="size-5 object-contain"
              />
            </div>
            <span>ICBucket</span>
            <span className="rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
              v1.0
            </span>
          </Link>
        </div>

        <button
          type="button"
          onClick={onOpenSearch}
          className="flex h-9 w-full items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground cursor-pointer"
        >
          <HugeiconsIcon icon={Search01Icon} className="size-3.5" />
          <span>Search docs...</span>
          <kbd className="pointer-events-none ml-auto inline-flex h-4 items-center rounded border border-border/70 bg-background px-1 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="p-0 py-2">
            <SidebarGroupLabel className="h-7 px-2 text-xs font-semibold text-muted-foreground/80">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const href = docHref(item.slug)
                  const isActive = pathname === href

                  return (
                    <SidebarMenuItem key={item.slug}>
                      <SidebarMenuButton
                        render={<Link href={href} />}
                        isActive={isActive}
                        aria-current={isActive ? "page" : undefined}
                        className="h-9 rounded-lg px-2.5 text-sm font-normal text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-accent-foreground"
                      >
                        <span className="truncate">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <Separator className="mb-2" />
        <div className="flex items-center justify-between gap-1">
          <Button
            variant="ghost"
            size="xs"
            render={<Link href="/icbucket" />}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Pricing
          </Button>
          <Button
            variant="ghost"
            size="xs"
            render={
              <Link
                href="https://gitlab.com/prasangapokharel/icbucket"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <Gitlab size={13} />
            <span>GitLab</span>
          </Button>
          <Button
            size="xs"
            render={<Link href="/bucket" />}
            className="text-xs font-medium cursor-pointer"
          >
            New bucket
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
