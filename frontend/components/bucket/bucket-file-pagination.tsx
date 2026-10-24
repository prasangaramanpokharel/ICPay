"use client"

import { useTranslations } from "next-intl"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

function getPageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, 4, "ellipsis", total]
  }

  if (current >= total - 2) {
    return [1, "ellipsis", total - 3, total - 2, total - 1, total]
  }

  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total]
}

export function BucketFilePagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}) {
  const t = useTranslations("bucket")

  if (totalPages <= 1) return null

  const currentPage = page + 1
  const pageItems = getPageItems(currentPage, totalPages)

  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground order-2 sm:order-1">
        {t("pageOf", {
          page: String(currentPage),
          total: String(totalPages),
          count: String(total),
        })}
      </p>

      <Pagination className="mx-0 w-auto justify-end order-1 sm:order-2">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              disabled={page <= 0}
              onClick={() => onPageChange(page - 1)}
              text={t("prevPage") || "Previous"}
            />
          </PaginationItem>

          {pageItems.map((item, index) =>
            item === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  isActive={item === currentPage}
                  onClick={() => onPageChange(item - 1)}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              text={t("nextPage") || "Next"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
