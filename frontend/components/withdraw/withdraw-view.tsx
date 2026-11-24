"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "motion/react"
import { WithdrawForm } from "@/components/withdraw/withdraw-form"
import { SendSuccess } from "@/components/wallet/send-success"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { useAuth } from "@/components/auth/auth-provider"
import { useLiveBalance, useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { Skeleton } from "@/components/ui/skeleton"
import { withdraw } from "@/services/withdraw/withdraw"

type Sent = { amount: bigint; recipient: string; blockIndex: bigint }

export function WithdrawView() {
  const t = useTranslations("withdraw")
  const { identity } = useAuth()
  const balance = useLiveBalance()
  const refreshWallet = useRefreshWallet()
  const [sent, setSent] = useState<Sent | null>(null)

  const handleWithdraw = async (amount: bigint, destination: string): Promise<string | null> => {
    const result = await withdraw(identity, amount, destination)
    if ("err" in result) return result.err

    refreshWallet()
    setSent({ amount, recipient: destination, blockIndex: result.ok.blockIndex })
    return null
  }

  return (
    <AppPage title={sent ? undefined : t("title")} description={sent ? undefined : t("subtitle")}>
      <div className="mx-auto w-full max-w-md">
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="withdraw-success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            >
              <SendSuccess
                amount={sent.amount}
                recipient={sent.recipient}
                blockIndex={sent.blockIndex}
                onDone={() => setSent(null)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="withdraw-form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            >
              {balance === undefined ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Skeleton className="h-3.5 w-16 rounded-md" />
                    <Skeleton className="h-14 w-full rounded-(--radius)" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3.5 w-24 rounded-md" />
                    <Skeleton className="h-10 w-full rounded-(--radius)" />
                  </div>
                  <div className="space-y-2 rounded-(--radius) bg-muted/40 p-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-3.5 w-20 rounded-md" />
                      <Skeleton className="h-3.5 w-16 rounded-md" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-3.5 w-24 rounded-md" />
                      <Skeleton className="h-3.5 w-20 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full rounded-(--radius)" />
                </div>
              ) : (
                <WithdrawForm balance={balance} onWithdraw={handleWithdraw} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppPage>
  )
}
