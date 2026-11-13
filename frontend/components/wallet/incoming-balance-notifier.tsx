"use client"

import { useIncomingBalanceDetector } from "@/hooks/wallet/useIncomingBalanceDetector"

export function IncomingBalanceNotifier() {
  useIncomingBalanceDetector()
  return null
}
