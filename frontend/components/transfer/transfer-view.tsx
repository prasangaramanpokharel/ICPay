"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "motion/react"
import { TransferForm } from "@/components/transfer/transfer-form"
import { SendSuccess } from "@/components/wallet/send-success"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { useAuth } from "@/components/auth/auth-provider"
import { useRefreshWallet, useLiveBalance } from "@/hooks/wallet/useWalletData"
import { transfer, type TransferMode } from "@/services/transfer/transfer"
import { ICP_LEDGER_ID } from "@/services/tokens"

type Sent = { amount: bigint; recipient: string; blockIndex: bigint; memo?: string }

function TransferPageContent() {
  const t = useTranslations("transfer")
  const searchParams = useSearchParams()
  const initialTo = searchParams.get("to") ?? undefined
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const balance = useLiveBalance()
  const [sent, setSent] = useState<Sent | null>(null)

  const handleTransfer = async (
    mode: TransferMode,
    to: string,
    amount: bigint,
    memo?: string,
    subaccount?: Uint8Array
  ): Promise<string | null> => {
    const result = await transfer(identity, ICP_LEDGER_ID, mode, to, amount, memo, subaccount)
    if ("err" in result) return result.err

    refreshWallet()
    setSent({
      amount,
      recipient: mode === "username" && !to.startsWith("@") ? `@${to}` : to,
      blockIndex: result.ok.blockIndex,
      memo,
    })
    return null
  }

  return (
    <AppPage title={sent ? undefined : t("title")} description={sent ? undefined : t("subtitle")}>
      <div className="mx-auto w-full max-w-md">
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="sent-success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            >
              <SendSuccess
                amount={sent.amount}
                recipient={sent.recipient}
                blockIndex={sent.blockIndex}
                memo={sent.memo}
                onDone={() => setSent(null)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="transfer-form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            >
              <TransferForm onTransfer={handleTransfer} balance={balance} initialTo={initialTo} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppPage>
  )
}

export function TransferView() {
  return (
    <Suspense fallback={null}>
      <TransferPageContent />
    </Suspense>
  )
}
