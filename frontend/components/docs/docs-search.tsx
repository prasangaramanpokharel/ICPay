"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { docHref } from "@/lib/bucket/docs/nav"
import type { BucketDocMeta } from "@/lib/bucket/docs/types"

interface DocsSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allDocs: BucketDocMeta[]
}

export function DocsSearch({ open, onOpenChange, allDocs }: DocsSearchProps) {
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
    router.push(docHref(slug))
  }

  const groupedDocs = allDocs.reduce<Record<string, BucketDocMeta[]>>((acc, doc) => {
    const group = doc.group || "Overview"
    if (!acc[group]) acc[group] = []
    acc[group].push(doc)
    return acc
  }, {})

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search documentation"
      description="Quickly find guides, APIs, and reference docs"
    >
      <Command>
        <CommandInput placeholder="Search documentation..." />
        <CommandList className="max-h-80 overflow-y-auto p-2">
          <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
            No matching documentation found.
          </CommandEmpty>
          {Object.entries(groupedDocs).map(([group, docs]) => (
            <CommandGroup key={group} heading={group} className="text-xs font-semibold text-muted-foreground">
              {docs.map((doc) => (
                <CommandItem
                  key={doc.slug}
                  value={`${doc.title} ${doc.description ?? ""} ${group}`}
                  onSelect={() => handleSelect(doc.slug)}
                  className="flex flex-col items-start gap-0.5 rounded-lg px-3 py-2 cursor-pointer"
                >
                  <span className="text-sm font-medium text-foreground">{doc.title}</span>
                  {doc.description && (
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {doc.description}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
