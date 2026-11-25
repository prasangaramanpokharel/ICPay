"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "motion/react"
import { useAuth } from "@/components/auth/auth-provider"
import { TradeForm, type TradeSuccess } from "@/components/trade/trade-form"
import { TradeSuccessView } from "@/components/trade/trade-success"
import { useApplyTradeBalances } from "@/hooks/trade/useTrade"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"
import { Icon } from "@/components/ui/icon"
import { ArrowRightIcon, ChartLineGlassIcon, ShieldGlassIcon, ZapGlassIcon } from "@thesvg/ui-react"

function TradePageContent() {
  const t = useTranslations("trade")
  const { identity } = useAuth()
  const applyTradeBalances = useApplyTradeBalances()
  const params = useSearchParams()
  const [done, setDone] = useState<TradeSuccess | null>(null)

  const from = params.get("from")
  const to = params.get("to")

  return (
    <AppPage
      title={done ? undefined : t("title")}
      description={done ? undefined : t("subtitle")}
      actions={
        !done ? (
          <Link
            href="/market/trade"
            className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 py-1 pl-2 pr-3 text-xs font-medium text-foreground shadow-xs backdrop-blur-xs transition-all hover:border-border hover:bg-card hover:shadow-sm"
          >
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
              Pro
            </span>
            <AnimatedShinyText className="inline-flex items-center gap-1 text-xs">
              <span className="font-medium text-foreground">Terminal</span>
            </AnimatedShinyText>
            <ArrowRightIcon className="size-3 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : undefined
      }
    >
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
            className="grid gap-8 lg:grid-cols-12 lg:items-start"
          >
            <div className="mx-auto w-full max-w-md lg:col-span-7 lg:max-w-none xl:col-span-7">
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
            </div>

            <div className="hidden lg:col-span-5 lg:flex lg:flex-col lg:gap-4 xl:col-span-5">
              <Card className="rounded-3xl border border-border/70 bg-card/60 p-5 shadow-xs space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                      Spot Liquidity
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-success">
                      <span className="size-1.5 rounded-full bg-success" />
                      Live
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    Pro Market Terminal
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Trade SNS and ICRC tokens versus ICP with live TradingView candlestick charts, limit orderbooks, and deep liquidity.
                  </p>
                </div>

                <div className="space-y-3 rounded-2xl border border-border/50 bg-secondary/20 p-3.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <Icon icon={ChartLineGlassIcon} className="size-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Live Orderbooks & Depth</p>
                      <p className="text-[11px] text-muted-foreground">
                        Inspect real-time buy/sell walls and pair swap transactions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <Icon icon={ZapGlassIcon} className="size-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">On-Chain Limit Orders</p>
                      <p className="text-[11px] text-muted-foreground">
                        Place target bids that execute autonomously through canister state.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <Icon icon={ShieldGlassIcon} className="size-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Custodial Protection</p>
                      <p className="text-[11px] text-muted-foreground">
                        Internet Identity proving caller execution with zero hot private keys.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  size="default"
                  variant="outline"
                  className="w-full gap-2 rounded-xl text-xs font-semibold"
                  nativeButton={false}
                  render={<Link href="/market/trade" />}
                >
                  Terminal
                  <ArrowRightIcon className="size-3.5" />
                </Button>
              </Card>
            </div>
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
        <Skeleton className="h-44 w-full rounded-3xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </AppPage>
  )
}

export function TradeView() {
  return (
    <Suspense fallback={<TradePageFallback />}>
      <TradePageContent />
    </Suspense>
  )
}
