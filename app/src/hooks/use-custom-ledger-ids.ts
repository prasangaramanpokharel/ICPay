import { useCallback, useSyncExternalStore } from 'react'
import type { TokenMetadata } from '@/services/tokens'
import {
  addCustomLedgerId,
  getCustomLedgerIdsSnapshot,
} from '@/lib/wallet/customTokens'
import { subscribeKv } from '@/services/storage/kv'

const EMPTY_IDS: string[] = []

export function useCustomLedgerIds(principal: string | undefined) {
  const getSnapshot = useCallback(
    () => getCustomLedgerIdsSnapshot(principal),
    [principal],
  )
  const getServerSnapshot = useCallback(() => EMPTY_IDS, [])

  const ids = useSyncExternalStore(
    subscribeKv,
    getSnapshot,
    getServerSnapshot,
  )

  const add = useCallback(
    (ledgerId: string, meta?: TokenMetadata) => {
      if (!principal) return []
      return addCustomLedgerId(principal, ledgerId, meta)
    },
    [principal],
  )

  return { ids, add }
}
