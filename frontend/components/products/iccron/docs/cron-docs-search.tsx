"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cronDocHref } from "@/lib/cron/docs/nav"
import type { CronDocMeta } from "@/lib/cron/docs/types"

interface CronDocsSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allDocs: CronDocMeta[]
}

export function CronDocsSearch({ open, onOpenChange, allDocs }: CronDocsSearchProps) {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  const handleSelect = (slug: string) => {
    onOpenChange(false)
    router.push(cronDocHref(slug))
  }

  const groupedDocs = allDocs.reduce<Record<string, CronDocMeta[]>>((acc, doc) => {
    const group = doc.group || "Overview"
    if (!acc[group]) acc[group] = []
    acc[group].push(doc)
    return acc
  }, {})

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Documentation"
      description="Quickly find developer documentation, API endpoints, guides, and tutorials."
    >
      <CommandInput placeholder="Search icCron documentation..." />
      <CommandList>
        <CommandEmpty>No documentation pages found.</CommandEmpty>
        {Object.entries(groupedDocs).map(([group, docs]) => (
          <CommandGroup key={group} heading={group}>
            {docs.map((doc) => (
              <CommandItem
                key={doc.slug}
                value={`${doc.title} ${doc.description ?? ""} ${doc.group}`}
                onSelect={() => handleSelect(doc.slug)}
                className="cursor-pointer flex flex-col items-start gap-1 py-2.5"
              >
                <span className="font-medium text-foreground">{doc.title}</span>
                {doc.description && (
                  <span className="text-xs text-muted-foreground line-clamp-1">{doc.description}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
