"use client"

import useSWRImmutable from "swr/immutable"
import { useAuth } from "@/components/auth/auth-provider"
import { fetchSnsMeta } from "@/services/sns/proposals"

export function useSnsTokenMeta(ledgerId: string | null) {
  const { identity } = useAuth()
  const { data, isLoading } = useSWRImmutable(
    ledgerId ? (["sns-meta", ledgerId] as const) : null,
    () => fetchSnsMeta(identity, ledgerId!)
  )
  return { meta: data ?? null, isLoading }
}
