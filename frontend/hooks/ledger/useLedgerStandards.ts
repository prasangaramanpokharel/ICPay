"use client"

import useSWRImmutable from "swr/immutable"
import { useAuth } from "@/components/auth/auth-provider"
import { fetchLedgerStandards } from "@/services/ledger/standards"

export function useLedgerStandards(ledgerId: string | null) {
  const { identity } = useAuth()
  const { data, isLoading } = useSWRImmutable(
    ledgerId ? (["ledger-standards", ledgerId] as const) : null,
    () => fetchLedgerStandards(identity, ledgerId!)
  )
  return { standards: data ?? [], isLoading }
}
