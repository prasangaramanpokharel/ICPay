"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { useRewrittenLastSegment } from "@/lib/routing/rewrittenRoute"

export function TransactionDetail() {
  const router = useRouter()
  const txId = useRewrittenLastSegment()

  useEffect(() => {
    if (txId && txId !== "id") {
      router.replace(`/transactions?id=${encodeURIComponent(txId)}`)
    } else {
      router.replace("/transactions")
    }
  }, [txId, router])

  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  )
}
