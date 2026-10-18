"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FileCategory } from "@/components/bucket/bucket-file-icon"

export type FileSortKey = "name" | "size" | "type"

const SORT_ITEMS: FileSortKey[] = ["name", "size", "type"]

const CATEGORY_ITEMS: { value: FileCategory; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "images", label: "Images" },
  { value: "documents", label: "Documents" },
  { value: "media", label: "Media" },
  { value: "archives", label: "Archives" },
  { value: "code", label: "Code" },
]

export function BucketFilesToolbar({
  query,
  sort,
  category = "all",
  viewMode = "list",
  refreshing,
  onQueryChange,
  onSortChange,
  onCategoryChange,
  onViewModeChange,
  onRefresh,
}: {
  query: string
  sort: FileSortKey
  category?: FileCategory
  viewMode?: "list" | "grid"
  refreshing: boolean
  canWrite?: boolean
  onQueryChange: (value: string) => void
  onSortChange: (value: FileSortKey) => void
  onCategoryChange?: (value: FileCategory) => void
  onViewModeChange?: (value: "list" | "grid") => void
  onRefresh: () => void
}) {
  const t = useTranslations("bucket")
  const items = SORT_ITEMS.map((value) => ({
    value,
    label: t(value === "name" ? "sortName" : value === "size" ? "sortSize" : "sortType"),
  }))

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <HugeiconsIcon
          icon={Search01Icon}
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t("filterFiles")}
          className="pl-9"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onCategoryChange ? (
          <Select
            value={category}
            onValueChange={(value) => onCategoryChange(value as FileCategory)}
            items={CATEGORY_ITEMS}
          >
            <SelectTrigger size="sm" className="w-[7.5rem]" aria-label="Filter by type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <Select
          value={sort}
          onValueChange={(value) => {
            if (value === "name" || value === "size" || value === "type") onSortChange(value)
          }}
          items={items}
        >
          <SelectTrigger size="sm" className="w-[8rem]" aria-label={t("sortBy")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {onViewModeChange ? (
          <div className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
            <Button
              type="button"
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon-xs"
              className="size-7"
              aria-label="List view"
              onClick={() => onViewModeChange("list")}
            >
              <List className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon-xs"
              className="size-7"
              aria-label="Grid view"
              onClick={() => onViewModeChange("grid")}
            >
              <LayoutGrid className="size-3.5" />
            </Button>
          </div>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={t("refresh")}
          disabled={refreshing}
          onClick={onRefresh}
        >
          <HugeiconsIcon
            icon={Refresh01Icon}
            className={refreshing ? "size-4 animate-spin" : "size-4"}
            strokeWidth={1.75}
          />
        </Button>
      </div>
    </div>
  )
}

