"use client"

import { Suspense, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "motion/react"
import { Icon } from "@/components/ui/icon"
import { PlusGlassIcon, ArrowLeftGlassIcon, CoinsGlassIcon } from "@thesvg/ui-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { LaunchForm } from "@/components/launch/launch-form"
import { TokenCard } from "@/components/launch/token-card"
import { LaunchTokenDrawer } from "@/components/launch/launch-token-drawer"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { useMyTokens } from "@/hooks/token/useLaunchData"
import { useAuth } from "@/components/auth/auth-provider"
import { useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { launchToken, type LaunchInput } from "@/services/launch/launch"
import type { TokenPublic } from "@/services/types"

function LaunchPageContent() {
  const t = useTranslations("launch")
  const searchParams = useSearchParams()
  const queryId = searchParams.get("id") || searchParams.get("token") || searchParams.get("ledgerId")
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const { tokens, isLoading, refresh } = useMyTokens()
  const [showForm, setShowForm] = useState(false)
  const [selectedTokenId, setSelectedTokenId] = useState<string | null | false>(null)

  const effectiveId = selectedTokenId === false ? null : (selectedTokenId ?? queryId ?? null)

  const handleSelectToken = useCallback((token: TokenPublic) => {
    setSelectedTokenId(token.id)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("id", token.id)
      window.history.replaceState(null, "", url.toString())
    }
  }, [])

  const handleDrawerOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setSelectedTokenId(false)
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href)
        url.searchParams.delete("id")
        url.searchParams.delete("token")
        url.searchParams.delete("ledgerId")
        const nextUrl = url.pathname + (url.search ? url.search : "")
        window.history.replaceState(null, "", nextUrl)
      }
    }
  }, [])

  const handleLaunch = async (input: LaunchInput): Promise<string | null> => {
    const result = await launchToken(identity, input)
    if ("err" in result) return result.err

    refreshWallet()
    await refresh()
    setShowForm(false)
    handleSelectToken(result.ok)
    return null
  }

  const hasTokens = tokens.length > 0

  return (
    <AppPage
      title={showForm ? t("formTitle") : t("title")}
      description={showForm ? t("formSubtitle") : t("subtitle")}
      back={
        showForm ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(false)}
            className="mb-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Icon icon={ArrowLeftGlassIcon} data-icon="inline-start" />
            Back to my tokens
          </Button>
        ) : undefined
      }
      actions={
        !showForm && hasTokens ? (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Icon icon={PlusGlassIcon} data-icon="inline-start" />
            {t("createCta")}
          </Button>
        ) : null
      }
    >
      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="launch-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          >
            <LaunchForm onLaunch={handleLaunch} />
          </motion.div>
        ) : (
          <motion.div
            key="token-list"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="flex flex-col gap-6"
          >
            {isLoading && !hasTokens ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-14 w-full rounded-(--radius)" />
                <Skeleton className="h-14 w-full rounded-(--radius)" />
              </div>
            ) : !hasTokens ? (
              <Empty className="rounded-(--radius) border border-dashed border-border/60 bg-muted/15 py-14">
                <EmptyMedia variant="icon">
                  <Icon
                    icon={CoinsGlassIcon}
                    className="size-5 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle className="text-base font-semibold">{t("empty")}</EmptyTitle>
                  <EmptyDescription className="text-xs text-muted-foreground">
                    Deploy your custom ICRC-1 token on the Internet Computer with zero presale and full decentralization.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={() => setShowForm(true)}>
                    <Icon icon={PlusGlassIcon} data-icon="inline-start" />
                    {t("createCta")}
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">{t("myTokens")}</h2>
                  <Badge variant="outline" className="text-xs">
                    {tokens.length} {tokens.length === 1 ? "token" : "tokens"}
                  </Badge>
                </div>
                <Card className="divide-y divide-border/60 overflow-hidden rounded-(--radius) border border-border/60">
                  {tokens.map((token) => (
                    <TokenCard
                      key={token.id}
                      token={token}
                      onSelect={handleSelectToken}
                    />
                  ))}
                </Card>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <LaunchTokenDrawer
        open={Boolean(effectiveId)}
        onOpenChange={handleDrawerOpenChange}
        tokenId={effectiveId}
      />
    </AppPage>
  )
}

export function LaunchTokenView() {
  return (
    <Suspense fallback={null}>
      <LaunchPageContent />
    </Suspense>
  )
}
