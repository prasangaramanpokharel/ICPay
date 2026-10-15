"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { useTokenLedgerId } from "@/lib/routing/rewrittenRoute"

export function TokenView() {
  const router = useRouter()
  const ledgerId = useTokenLedgerId()

  useEffect(() => {
    if (ledgerId) {
      router.replace(`/wallet?token=${ledgerId}`)
    } else {
      router.replace("/wallet")
    }
  }, [ledgerId, router])

  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  )
}
