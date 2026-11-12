"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { FormRouteLoading } from "@/components/layout/route-loading"
import { LaunchDetail } from "@/app/(app)/launch/[id]/launch-detail"
import { useToken } from "@/hooks/token/useLaunchData"

function TokenPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get("id") || searchParams.get("token") || searchParams.get("ledgerId")
  const { token, isLoading } = useToken(id || null)

  useEffect(() => {
    if (!id) {
      router.replace("/wallet")
      return
    }
    if (!isLoading && !token) {
      router.replace(`/wallet?token=${encodeURIComponent(id)}`)
    }
  }, [id, isLoading, token, router])

  if (!id || (!isLoading && !token)) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  if (token) {
    return <LaunchDetail id={id} />
  }

  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  )
}

export function TokenRouteView() {
  return (
    <Suspense fallback={<FormRouteLoading />}>
      <TokenPageContent />
    </Suspense>
  )
}
