"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "motion/react"
import { useAuth } from "@/components/auth/auth-provider"
import { TradeForm, type TradeSuccess } from "@/components/trade/trade-form"
import { TradeSuccessView } from "@/components/trade/trade-success"
import { useApplyTradeBalances } from "@/hooks/trade/useTrade"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { Skeleton } from "@/components/ui/skeleton"

function TradePageContent() {
  const t = useTranslations("trade")
  const { identity } = useAuth()
  const applyTradeBalances = useApplyTradeBalances()
  const params = useSearchParams()
  const [done, setDone] = useState<TradeSuccess | null>(null)

  const from = params.get("from")
  const to = params.get("to")

  return (
    <AppPage title={done ? undefined : t("title")} description={done ? undefined : t("subtitle")}>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="trade-success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="mx-auto w-full max-w-md"
          >
            <TradeSuccessView
              amountIn={done.amountIn}
              amountOut={done.amountOut}
              tokenIn={done.tokenIn}
              tokenOut={done.tokenOut}
              beforeIn={done.beforeIn}
              beforeOut={done.beforeOut}
              onDone={() => setDone(null)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="trade-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          >
            <TradeForm
              identity={identity}
              initialTokenIn={from}
              initialTokenOut={to}
              onSuccess={(result) => {
                applyTradeBalances({
                  tokenInId: result.tokenIn.ledgerId,
                  tokenOutId: result.tokenOut.ledgerId,
                  amountIn: result.amountIn,
                  amountOut: result.amountOut,
                  tokenInFee: result.tokenIn.fee,
                })
                setDone(result)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </AppPage>
  )
}

function TradePageFallback() {
  return (
    <AppPage>
      <div className="mx-auto w-full max-w-md space-y-4">
        <Skeleton className="h-44 w-full rounded-(--radius)" />
        <Skeleton className="h-28 w-full rounded-(--radius)" />
        <Skeleton className="h-12 w-full rounded-(--radius)" />
      </div>
    </AppPage>
  )
}

export default function TradePage() {
  return (
    <Suspense fallback={<TradePageFallback />}>
      <TradePageContent />
    </Suspense>
  )
}
