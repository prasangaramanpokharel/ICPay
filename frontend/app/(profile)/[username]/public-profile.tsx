"use client"

import { useEffect, useState, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Principal } from "@icp-sdk/core/principal"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PremiumBadge } from "@/components/verified/premium-badge"
import { PayQr } from "@/components/profile/pay-qr"
import { QuickPayDrawer } from "@/components/profile/quick-pay-drawer"
import { Custom404Page } from "@/app/(error)/404"
import { avatarUriFor } from "@/lib/profile/avatar"
import { profileUrlFor } from "@/lib/profile/url"
import { parsePaymentLink } from "@/services/pay/pay"
import { copyText, formatE8s } from "@/lib/wallet/utils"
import { accountIdentifier, icrc1Account } from "@/lib/wallet/accountId"
import { isPossibleHandle, isReservedHandle } from "@/lib/profile/reservedHandles"
import { useResolvedUsername, useLiveBalance, useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { useRewrittenLastSegment } from "@/lib/routing/rewrittenRoute"
import { APP_LOGO, APP_LOGO_ALT } from "@/lib/ui/brand-images"
import { custodialSubaccount } from "@/services/tokens"
import { WALLET_CANISTER_ID } from "@/services/icp"
import { tip } from "@/services/transfer/transfer"
import { useAuth } from "@/components/auth/auth-provider"

type PayRequest = { amount: bigint; memo?: string }

function ProfileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background shadow-sm">
        {children}
      </div>
    </div>
  )
}

export function PublicProfile() {
  const t = useTranslations("publicProfile")
  const tc = useTranslations("common")
  const raw = useRewrittenLastSegment()
  const username = raw.replace(/^@/, "").toLowerCase()
  const { identity, isAuthenticated, login } = useAuth()
  const balance = useLiveBalance()
  const refreshWallet = useRefreshWallet()
  const [payOpen, setPayOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [legacy, setLegacy] = useState(false)

  const [read, setRead] = useState<{ request: PayRequest | null } | null>(null)
  useEffect(() => {
    const req = parsePaymentLink(window.location.href)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRead({ request: req?.amount ? { amount: req.amount, memo: req.memo } : null })
  }, [])
  const request = read?.request ?? null

  const claimable = isPossibleHandle(username) && !isReservedHandle(username)
  const { principal, isLoading } = useResolvedUsername(claimable ? username : "")

  const subaccount = principal ? custodialSubaccount(Principal.fromText(principal)) : undefined
  const canister = Principal.fromText(WALLET_CANISTER_ID)
  const payAddress = !subaccount
    ? ""
    : legacy
      ? accountIdentifier(canister, subaccount)
      : icrc1Account(canister, subaccount)

  const handleCopy = async () => {
    if (!payAddress) return
    await copyText(payAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handlePay = async (amount: bigint, message?: string) => {
    const result = await tip(identity, username, amount, message)
    if ("err" in result) return result.err
    refreshWallet()
    return { blockIndex: result.ok.blockIndex }
  }

  const handlePayClick = async () => {
    if (isAuthenticated) {
      setPayOpen(true)
      return
    }
    try {
      await login()
      setPayOpen(true)
    } catch {
      return
    }
  }

  useEffect(() => {
    if (!claimable || (!isLoading && !principal)) {
      let meta = document.querySelector('meta[name="robots"]')
      if (!meta) {
        meta = document.createElement("meta")
        meta.setAttribute("name", "robots")
        document.head.appendChild(meta)
      }
      meta.setAttribute("content", "noindex, follow")
    }
  }, [claimable, isLoading, principal])

  if (!read || !username || (claimable && isLoading)) {
    return (
      <ProfileShell>
        <ProfileLoading />
      </ProfileShell>
    )
  }

  if (!claimable || !principal) {
    return <Custom404Page />
  }

  const isSelf = principal === identity?.getPrincipal().toText()

  return (
    <ProfileShell>
      <main className="flex flex-1 flex-col items-center px-5 pb-10 pt-12">
        <Avatar className="size-24">
          <AvatarImage src={avatarUriFor(username)} alt="" />
          <AvatarFallback className="bg-muted text-lg font-medium uppercase">
            {username.slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        <h1 className="flex items-center gap-1.5 pt-4 text-2xl font-bold tracking-tight">
          {username}
          <PremiumBadge name={username} className="size-5" />
        </h1>
        <p className="pt-1 text-sm text-muted-foreground">
          {request ? t("requestTagline") : t("tagline")}
        </p>

        {request && !isSelf ? (
          <div className="mt-8 w-full space-y-3 rounded-2xl bg-muted/40 p-6 text-center">
            <p className="text-4xl font-bold tracking-tight tabular-nums">
              {formatE8s(request.amount)}
            </p>
            <p className="text-xs text-muted-foreground">ICP</p>
            {request.memo ? <p className="border-t pt-3 text-sm">{request.memo}</p> : null}
          </div>
        ) : (
          <>
            <PayQr value={profileUrlFor(username)} className="pt-8" />

            <Button
              variant="outline"
              onClick={handleCopy}
              aria-label={t("copyAddress")}
              className="mt-7 h-auto w-full justify-start gap-3 rounded-2xl bg-muted/40 p-4 text-left hover:bg-muted"
            >
              <span className="min-w-0 flex-1 truncate font-mono text-xs">
                {payAddress.slice(0, 14)}…{payAddress.slice(-10)}
              </span>
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                {copied ? tc("copied") : tc("copy")}
              </span>
            </Button>

            <Label className="mt-3 flex w-full items-center justify-between gap-3 px-1">
              <span className="text-xs text-muted-foreground">
                {legacy ? t("formatLegacy") : t("formatIcrc")}
              </span>
              <Switch checked={legacy} onCheckedChange={setLegacy} />
            </Label>
          </>
        )}

        {isSelf ? (
          <p className="mt-6 text-center text-xs text-muted-foreground">{t("ownLink")}</p>
        ) : (
          <Button size="lg" className="mt-6 w-full" onClick={handlePayClick}>
            {request ? t("payAmount", { amount: formatE8s(request.amount) }) : t("pay")}
          </Button>
        )}

        <p className="mt-5 text-center text-[11px] text-muted-foreground">{t("onlyIcp")}</p>

        <Footer />

        <QuickPayDrawer
          open={payOpen}
          onOpenChange={setPayOpen}
          username={username}
          balance={balance}
          request={request ?? undefined}
          onPay={handlePay}
        />
      </main>
    </ProfileShell>
  )
}

function Footer() {
  const t = useTranslations("publicProfile")
  return (
    <div className="mt-auto flex flex-col items-center pt-12">
      <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Image
          src={APP_LOGO}
          alt={APP_LOGO_ALT}
          title={APP_LOGO_ALT}
          width={40}
          height={40}
          className="size-5 object-contain"
        />
        ICPay
      </Link>
      <p className="pt-1 text-[11px] text-muted-foreground">{t("footerTagline")}</p>
    </div>
  )
}

function ProfileLoading() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </main>
  )
}
