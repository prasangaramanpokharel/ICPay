"use client"

import { useState } from "react"
import { toast } from "@/components/ui/toast"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  File01Icon,
  GripVerticalIcon,
  Image01Icon,
  MusicNote01Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import {
  Sortable,
  SortableItem,
  SortableItemHandle,
} from "@/components/ui/sortable"
import { cn } from "@/lib/ui/utils"

export interface SortableMediaItem {
  id: string
  title: string
  description: string
  type: "image" | "document" | "audio" | "video"
  size: string
}

const defaultItems: SortableMediaItem[] = [
  {
    id: "1",
    title: "Product Demo",
    description: "Main product image",
    type: "image",
    size: "2.4 MB",
  },
  {
    id: "2",
    title: "Product Specification",
    description: "Technical details document",
    type: "document",
    size: "1.2 MB",
  },
  {
    id: "3",
    title: "Product Demo Video",
    description: "How to use the product",
    type: "video",
    size: "15.7 MB",
  },
  {
    id: "4",
    title: "Product Audio Guide",
    description: "Audio instructions",
    type: "audio",
    size: "8.3 MB",
  },
  {
    id: "5",
    title: "Product Specification",
    description: "Additional product view",
    type: "image",
    size: "3.1 MB",
  },
]

function getTypeIcon(type: SortableMediaItem["type"]) {
  switch (type) {
    case "image":
      return <HugeiconsIcon icon={Image01Icon} className="size-4 shrink-0" strokeWidth={1.75} />
    case "document":
      return <HugeiconsIcon icon={File01Icon} className="size-4 shrink-0" strokeWidth={1.75} />
    case "audio":
      return <HugeiconsIcon icon={MusicNote01Icon} className="size-4 shrink-0" strokeWidth={1.75} />
    case "video":
      return <HugeiconsIcon icon={Video01Icon} className="size-4 shrink-0" strokeWidth={1.75} />
  }
}

function getTypeBadgeClasses(type: SortableMediaItem["type"]) {
  switch (type) {
    case "image":
      return "border-primary/20 bg-primary/10 text-primary"
    case "document":
      return "border-success/20 bg-success/10 text-success"
    case "audio":
      return "border-destructive/20 bg-destructive/10 text-destructive"
    case "video":
      return "border-info/20 bg-info/10 text-info"
  }
}

export function Pattern() {
  const [items, setItems] = useState<SortableMediaItem[]>(defaultItems)

  const handleValueChange = (newItems: SortableMediaItem[]) => {
    setItems(newItems)
    toast.success("Items reordered successfully!", {
      description: newItems.map((item, index) => `${index + 1}. ${item.title}`).join(", "),
    })
  }

  const getItemValue = (item: SortableMediaItem) => item.id

  return (
    <div className="mx-auto w-full max-w-xl space-y-8 p-6">
      <Sortable
        value={items}
        onValueChange={handleValueChange}
        getItemValue={getItemValue}
        strategy="vertical"
        className="space-y-2"
      >
        {items.map((item) => (
          <SortableItem key={item.id} value={item.id}>
            <div className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/80 bg-card p-3 shadow-xs transition-colors hover:border-border hover:bg-muted/40">
              <SortableItemHandle className="text-muted-foreground transition-colors hover:text-foreground">
                <HugeiconsIcon icon={GripVerticalIcon} className="size-4" strokeWidth={1.75} />
              </SortableItemHandle>

              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground">
                {getTypeIcon(item.type)}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-medium text-foreground">{item.title}</h4>
                <p className="truncate text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn("text-[11px] font-normal capitalize", getTypeBadgeClasses(item.type))}
                >
                  {item.type}
                </Badge>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {item.size}
                </span>
              </div>
            </div>
          </SortableItem>
        ))}
      </Sortable>
    </div>
  )
}
