"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { TransactionList } from "@/components/transactions/transaction-list"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { Skeleton } from "@/components/ui/skeleton"
import { useTransactions } from "@/hooks/wallet/useWalletData"

const PAGE_SIZE = 20

function TransactionsPageContent() {
  const t = useTranslations("transactions")
  const searchParams = useSearchParams()
  const txIdQuery = searchParams.get("id")
  const [page, setPage] = useState(0)
  const { items, total, isLoading } = useTransactions(page, PAGE_SIZE)

  return (
    <AppPage title={t("title")} description={t("subtitle")}>
      {isLoading && items.length === 0 ? (
        <div className="space-y-5">
          <section>
            <Skeleton className="mb-2 h-3.5 w-24 rounded-md" />
            <div className="divide-y divide-border/60 overflow-hidden rounded-(--radius) border border-border/60 bg-card">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-28 rounded-md" />
                      <Skeleton className="h-3 w-16 rounded-md" />
                    </div>
                  </div>
                  <div className="space-y-1.5 text-right flex flex-col items-end">
                    <Skeleton className="h-4 w-20 rounded-md" />
                    <Skeleton className="h-3 w-12 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <TransactionList
          transactions={items}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          initialSelectedTxId={txIdQuery}
          onPageChange={setPage}
        />
      )}
    </AppPage>
  )
}

export function TransactionsView() {
  return (
    <Suspense fallback={null}>
      <TransactionsPageContent />
    </Suspense>
  )
}
