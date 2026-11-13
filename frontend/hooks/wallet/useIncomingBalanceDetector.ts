"use client"

import { useEffect, useRef } from "react"
import { Principal } from "@icp-sdk/core/principal"
import { IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc"
import { useAuth } from "@/components/auth/auth-provider"
import { useDepositAddress, useTokenHoldings, useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { custodialSubaccount } from "@/services/tokens"
import { createAgent } from "@/services/icp"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { playSuccessChime } from "@/lib/ui/successChime"
import { toast } from "sonner"

const POLL_INTERVAL_MS = 5000
const ICP_LEDGER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai"

export type BalanceCheckResult = {
  ledgerId: string
  symbol: string
  decimals: number
  delta: bigint
}

export function detectBalanceIncreases(
  previousMap: Map<string, bigint>,
  currentMap: Map<string, bigint>,
  metaMap: Map<string, { symbol: string; decimals: number }>
): BalanceCheckResult[] {
  const increases: BalanceCheckResult[] = []

  for (const [ledgerId, current] of currentMap.entries()) {
    const prev = previousMap.get(ledgerId)
    if (prev !== undefined && current > prev) {
      const delta = current - prev
      const meta = metaMap.get(ledgerId) ?? {
        symbol: ledgerId === ICP_LEDGER_ID ? "ICP" : "Tokens",
        decimals: 8,
      }
      increases.push({
        ledgerId,
        symbol: meta.symbol,
        decimals: meta.decimals,
        delta,
      })
    }
  }

  return increases
}

export function useIncomingBalanceDetector() {
  const { identity } = useAuth()
  const { data: deposit } = useDepositAddress()
  const { holdings } = useTokenHoldings()
  const refreshWallet = useRefreshWallet()

  const custodian = deposit?.address.owner
  const previousBalancesRef = useRef<Map<string, bigint> | null>(null)
  const isPollingRef = useRef(false)
  const holdingsRef = useRef(holdings)

  useEffect(() => {
    holdingsRef.current = holdings
  }, [holdings])

  useEffect(() => {
    if (!identity || !custodian) {
      previousBalancesRef.current = null
      return
    }

    const principal = identity.getPrincipal()
    const subaccount = custodialSubaccount(principal)

    let isCancelled = false

    const poll = async () => {
      if (isCancelled || isPollingRef.current) return
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return
      }

      isPollingRef.current = true

      try {
        const agent = await createAgent(identity)
        const currentHoldings = holdingsRef.current
        const metaMap = new Map<string, { symbol: string; decimals: number }>()

        metaMap.set(ICP_LEDGER_ID, { symbol: "ICP", decimals: 8 })

        const ledgerIdsSet = new Set<string>([ICP_LEDGER_ID])
        for (const h of currentHoldings) {
          ledgerIdsSet.add(h.ledgerId)
          metaMap.set(h.ledgerId, {
            symbol: h.symbol || "Tokens",
            decimals: h.decimals ?? 8,
          })
        }

        const ledgerIds = Array.from(ledgerIdsSet)

        const queryResults = await Promise.all(
          ledgerIds.map(async (ledgerId): Promise<[string, bigint | null]> => {
            try {
              const canister = IcrcLedgerCanister.create({
                agent,
                canisterId: Principal.fromText(ledgerId),
              })
              const bal = await canister.balance({
                owner: custodian,
                subaccount,
                certified: false,
              })
              return [ledgerId, bal]
            } catch {
              return [ledgerId, null]
            }
          })
        )

        if (isCancelled) return

        const currentMap = new Map<string, bigint>()
        for (const [id, bal] of queryResults) {
          if (bal !== null) {
            currentMap.set(id, bal)
          } else if (previousBalancesRef.current?.has(id)) {
            currentMap.set(id, previousBalancesRef.current.get(id)!)
          }
        }

        if (previousBalancesRef.current === null) {
          previousBalancesRef.current = currentMap
        } else {
          const increases = detectBalanceIncreases(
            previousBalancesRef.current,
            currentMap,
            metaMap
          )

          if (increases.length > 0) {
            playSuccessChime()
            for (const inc of increases) {
              const formatted = formatTokenAmount(inc.delta, inc.decimals, 4)
              toast.success(`Received +${formatted} ${inc.symbol}`, {
                description: "Your balance has been updated.",
              })
            }
            void refreshWallet()
          }

          previousBalancesRef.current = currentMap
        }
      } catch {
      } finally {
        isPollingRef.current = false
      }
    }

    void poll()
    const timer = setInterval(() => {
      void poll()
    }, POLL_INTERVAL_MS)

    return () => {
      isCancelled = true
      clearInterval(timer)
      isPollingRef.current = false
    }
  }, [identity, custodian, refreshWallet])
}
