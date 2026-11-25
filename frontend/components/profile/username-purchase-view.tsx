"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { Icon } from "@/components/ui/icon"
import { CheckGlassOutlineIcon, XGlassIcon, InfoGlassIcon, CloudGlassIcon, GiftGlassIcon, RocketGlassIcon, ArrowRightGlassIcon } from "@thesvg/ui-react"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { BadgeMark, PremiumBadge } from "@/components/verified/premium-badge"
import { ShineBorder } from "@/components/ui/shine-border"
import {
  BADGE_RANGES,
  tierBadgeSpans,
  type BadgeSpan,
} from "@/lib/verified/premiumTick"
import { purchaseUsername } from "@/services/buy/buy"
import { claimProPerk } from "@/services/profile/profile"
import type { Purchase } from "@/services/types"
import { useAuth } from "@/components/auth/auth-provider"
import {
  useRefreshWallet,
  useUsernameAvailability,
  useUsernameTreasury,
  useLiveBalance,
  useDashboard,
  useTokenHolding,
  useProPerkClaimed,
} from "@/hooks/wallet/useWalletData"
import { isProPerkClaimed, markProPerkClaimed } from "@/lib/profile/claimPerk"
import { ICPAY_LEDGER_ID } from "@/services/tokens"
import { formatAmount, formatTokenAmount, ICP_FEE, shortPrincipal } from "@/lib/wallet/utils"
import { useBalanceVisibility } from "@/components/wallet/balance-visibility-provider"
import { ICP_LOGO } from "@/lib/token/icon"
import {
  priceFor,
  tierFor,
  validateUsername,
  TIERS,
  USERNAME_MAX_LENGTH,
  USERNAME_FREE_MIN_LENGTH,
  type CurrencyMode,
} from "@/lib/profile/username"
import { SendSuccess } from "@/components/wallet/send-success"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { Card, CardContent } from "@/components/ui/card"
import { primeSuccessChime } from "@/lib/ui/successChime"
import { cn } from "@/lib/ui/utils"

const SHINE_VARS = ["var(--primary)", "var(--chart-2)", "var(--chart-3)"]

export function UsernamePurchaseView() {
  const t = useTranslations("buyUsername")
  const tc = useTranslations("common")
  const router = useRouter()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const { data: dashboard } = useDashboard()
  const icpayHolding = useTokenHolding(ICPAY_LEDGER_ID)
  const { hidden } = useBalanceVisibility()

  const [name, setName] = useState("")
  const [currency, setCurrency] = useState<CurrencyMode>("ICP")
  const [purchasedCurrency, setPurchasedCurrency] = useState<CurrencyMode>("ICP")
  const [error, setError] = useState<string | null>(null)
  const [buying, setBuying] = useState(false)
  const [bought, setBought] = useState<Purchase | null>(null)
  const [claimedLocal, setClaimedLocal] = useState(false)
  const { claimed: onChainClaimed, refresh: refreshPerkClaimed } = useProPerkClaimed()

  const existingHandle = dashboard?.user.username[0]
  const existingTier = existingHandle ? tierFor(existingHandle) : null
  const isExistingPro = existingTier && existingTier.perks.storageGb > 0
  const proStorageGb = existingTier?.perks.storageGb ?? 0
  const perkClaimed = claimedLocal || onChainClaimed || isProPerkClaimed(dashboard?.user.id)

  const handleClaimPerk = () => {
    if (!dashboard?.user.id || !existingHandle) return
    if (identity) {
      void claimProPerk(identity)
    }
    markProPerkClaimed(dashboard.user.id)
    setClaimedLocal(true)
    refreshPerkClaimed()
    primeSuccessChime()
    toast.success(t("perkActivated"), {
      description: t("perkReady", { gb: proStorageGb, handle: existingHandle }),
    })
    router.push(`/bucket?create=1&storage=${proStorageGb}`)
  }

  const trimmed = name.trim()
  const shapeError = trimmed ? validateUsername(trimmed) : null
  const { available, isLoading: checking } = useUsernameAvailability(
    shapeError ? "" : trimmed
  )

  const tier = trimmed ? tierFor(trimmed) : null
  const priceIcp = trimmed ? priceFor(trimmed, "ICP") : 0n
  const priceIcpay = trimmed ? priceFor(trimmed, "ICPAY") : 0n
  const totalIcp = priceIcp + ICP_FEE

  const balanceIcp = useLiveBalance()
  const balanceIcpay = icpayHolding?.token?.balance ?? 0n

  const insufficient =
    currency === "ICP"
      ? balanceIcp !== undefined && trimmed !== "" && totalIcp > balanceIcp
      : trimmed !== "" && priceIcpay > balanceIcpay

  const treasury = useUsernameTreasury()
  const canBuy =
    trimmed !== "" &&
    !shapeError &&
    available === true &&
    !insufficient &&
    !buying

  const handleBuy = async () => {
    if (!identity || !canBuy) return
    primeSuccessChime()
    setBuying(true)
    setError(null)
    setPurchasedCurrency(currency)
    const result = await purchaseUsername(identity, trimmed, currency)
    setBuying(false)
    if ("err" in result) {
      setError(result.err)
      return
    }
    refreshWallet()
    setBought(result.ok)
  }

  return (
    <AppPage title={bought ? undefined : t("title")} description={bought ? undefined : t("subtitle")}>
      <div className="mx-auto w-full max-w-md">
        <AnimatePresence mode="wait">
          {bought ? (
            <motion.div
              key="bought-success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            >
              <SendSuccess
                amount={bought.price}
                recipient={`@${bought.username}`}
                blockIndex={bought.blockIndex}
                kind="purchase"
                symbol={purchasedCurrency === "ICPAY" ? "$ICPAY" : "ICP"}
                decimals={8}
                onDone={() => router.push("/profile")}
              />
            </motion.div>
          ) : (
            <motion.div
              key="purchase-form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="space-y-4"
            >
        {isExistingPro && !perkClaimed && (
          <Card className="border-primary/40 bg-linear-to-r from-primary/10 via-background to-card shadow-sm">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Icon icon={GiftGlassIcon} className="size-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {t("perkAvailable")}
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                    Unclaimed
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  As the owner of <span className="font-semibold text-foreground">@{existingHandle}</span>, you qualify for{" "}
                  <span className="font-semibold text-foreground">{t("cloudStoragePerk", { gb: proStorageGb })}</span> in icBucket.
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleClaimPerk}
                className="shrink-0 gap-1.5 font-semibold"
              >
                <Icon icon={CloudGlassIcon} className="size-4" />
                <span>{t("claimPerk", { gb: proStorageGb })}</span>
                <Icon icon={ArrowRightGlassIcon} className="size-3.5" />
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="border-border/60 shadow-sm">
          <CardContent className="space-y-6 px-5 py-7">
            <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/40 p-1">
              <Button
                type="button"
                variant={currency === "ICP" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setCurrency("ICP")
                  setError(null)
                }}
                className="flex-1 rounded-xl text-xs font-semibold"
              >
                {t("payWithIcp")}
              </Button>
              <Button
                type="button"
                variant={currency === "ICPAY" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setCurrency("ICPAY")
                  setError(null)
                }}
                className="flex-1 gap-1.5 rounded-xl text-xs font-semibold"
              >
                <span>{t("payWithIcpay")}</span>
                <Badge variant="secondary" className="h-4.5 px-1.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                  -20% OFF
                </Badge>
              </Button>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/40 bg-muted/20 px-3.5 py-2.5 text-xs">
              <span className="text-muted-foreground">Available balance:</span>
              <div className="flex items-center gap-2 tabular-nums">
                {currency === "ICP" ? (
                  <span className="font-semibold text-foreground">
                    {balanceIcp !== undefined ? `${hidden ? "••••••" : formatAmount(balanceIcp)} ICP` : "—"}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {hidden ? "••••••" : `${formatTokenAmount(balanceIcpay, 8)} $ICPAY`}
                    </span>
                    <Link
                      href="/swap"
                      className="text-primary hover:underline"
                    >
                      Swap
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex min-h-6 items-center justify-between gap-2">
                <Label htmlFor="buy-username" className="shrink-0">{t("label")}</Label>
                {currency === "ICP" && balanceIcp !== undefined && (
                  <Badge variant="secondary" className="shrink-0 max-w-[65%] truncate font-normal tabular-nums">
                    {tc("balance")}{" "}
                    <span className="font-semibold text-foreground">
                      {hidden ? "••••••" : `${formatAmount(balanceIcp)} ICP`}
                    </span>
                  </Badge>
                )}
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base text-muted-foreground">
                  @
                </span>
                <Input
                  id="buy-username"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setError(null)
                  }}
                  placeholder="btc"
                  maxLength={USERNAME_MAX_LENGTH}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="pr-10 pl-9"
                />
                {trimmed !== "" && !shapeError && !checking && (
                  <span className="absolute top-1/2 right-4 -translate-y-1/2">
                    <Icon
                      icon={available ? CheckGlassOutlineIcon : XGlassIcon}
                      className={cn(
                        "size-5",
                        available ? "text-success" : "text-destructive"
                      )}
                    />
                  </span>
                )}
                {checking && (
                  <Spinner className="absolute top-1/2 right-4 size-4 -translate-y-1/2" />
                )}
              </div>
              {shapeError && (
                <p className="text-xs text-destructive">
                  {t(`errors.${shapeError}`, {
                    max: USERNAME_MAX_LENGTH,
                    min: USERNAME_FREE_MIN_LENGTH,
                  })}
                </p>
              )}
              {!shapeError && available === false && (
                <p className="text-xs text-destructive">
                  {t("taken", { name: trimmed })}
                </p>
              )}
              {!shapeError && available === true && (
                <p className="text-xs text-success">
                  {t("availableName", { name: trimmed })}
                </p>
              )}
            </div>

            {trimmed !== "" && !shapeError && tier && (
              <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs">
                <ShineBorder
                  className="rounded-2xl"
                  borderWidth={1.2}
                  duration={12}
                  shineColor={SHINE_VARS}
                />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      {t(`tiers.${tier.labelKey}`)}
                      <PremiumBadge name={trimmed} className="size-3.5" />
                    </span>
                    <span className="flex items-center gap-1.5 text-lg font-bold tabular-nums">
                      {currency === "ICP" ? (
                        <>
                          <Image
                            src={ICP_LOGO}
                            alt=""
                            width={40}
                            height={40}
                            className="size-5 object-contain"
                          />
                          {formatAmount(priceIcp)}
                        </>
                      ) : (
                        <span>{formatTokenAmount(priceIcpay, 8)} $ICPAY</span>
                      )}
                    </span>
                  </div>

                  <div className="space-y-1.5 rounded-xl border border-border/50 bg-muted/30 p-3 text-xs">
                    <p className="font-semibold text-foreground">{t("bundledPerks")}</p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon icon={CloudGlassIcon} className="size-3.5 text-primary shrink-0" />
                      <span>
                        {tier.perks.storageGb > 0
                          ? t("cloudStoragePerk", { gb: tier.perks.storageGb })
                          : "Handle alias forwarding & vanity routing"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon icon={CheckGlassOutlineIcon} className="size-3.5 text-primary shrink-0" />
                      <span>
                        {tier.perks.badge === "gold"
                          ? "Gold Verified Badge & #1 directory search rank"
                          : tier.perks.badge === "blue"
                            ? "Blue Verified Badge & priority search rank"
                            : t("verifiedIdentity")}
                      </span>
                    </div>
                    {tier.perks.launchpadDiscountPercent > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon icon={RocketGlassIcon} className="size-3.5 text-primary shrink-0" />
                        <span>{tier.perks.launchpadDiscountPercent}% Token Launcher voucher</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between text-xs text-muted-foreground">
                    <span>{t("networkFee")}</span>
                    <span className="tabular-nums">
                      {currency === "ICP" ? `${formatAmount(ICP_FEE)} ICP` : t("standardLedgerFee")}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-border/60 pt-3 text-sm font-medium">
                    <span>{t("total")}</span>
                    <span className="tabular-nums font-bold">
                      {currency === "ICP"
                        ? `${formatAmount(totalIcp)} ICP`
                        : `${formatTokenAmount(priceIcpay, 8)} $ICPAY`}
                    </span>
                  </div>
                  {treasury && (
                    <p className="text-xs text-muted-foreground">
                      {t("treasuryNote", { principal: shortPrincipal(treasury) })}
                    </p>
                  )}
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              size="lg"
              className="h-12 w-full rounded-2xl text-base font-semibold"
              disabled={!canBuy}
              onClick={handleBuy}
            >
              {buying ? <Spinner data-icon="inline-start" /> : null}
              <span>
                {buying
                  ? t("buying")
                  : insufficient
                    ? t("insufficient")
                    : currency === "ICPAY" && trimmed
                      ? t("buyWithDiscount")
                      : t("buy")}
              </span>
            </Button>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("pricing")}
                </p>
                <Popover>
                  <PopoverTrigger
                    aria-label={t("badgeInfoTitle")}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Icon icon={InfoGlassIcon} className="size-4" />
                  </PopoverTrigger>
                  <PopoverContent align="start" className="gap-3">
                    <PopoverHeader>
                      <PopoverTitle className="text-sm">
                        {t("badgeInfoTitle")}
                      </PopoverTitle>
                      <PopoverDescription className="text-xs">
                        {t("badgeInfo", { min: USERNAME_FREE_MIN_LENGTH })}
                      </PopoverDescription>
                    </PopoverHeader>
                    <div className="flex flex-col gap-2 text-xs">
                      {(["gold", "blue"] as const).map((badge) => (
                        <div key={badge} className="flex items-start gap-2">
                          <BadgeMark tier={badge} className="mt-px size-3.5" />
                          <span>
                            <span className="font-medium text-foreground">
                              {t(
                                badge === "gold" ? "goldBadgeTitle" : "blueBadgeTitle"
                              )}
                            </span>{" "}
                            <span className="text-muted-foreground">
                              {t(
                                badge === "gold" ? "goldBadgeInfo" : "blueBadgeInfo",
                                {
                                  lengths: `${BADGE_RANGES[badge].min}-${BADGE_RANGES[badge].max}`,
                                }
                              )}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/40 shadow-xs">
                <ShineBorder
                  className="rounded-2xl"
                  borderWidth={1.2}
                  duration={14}
                  shineColor={SHINE_VARS}
                />
                <div className="relative z-10">
                  {TIERS.map((tItem, i) => (
                    <div
                      key={tItem.labelKey}
                      className={cn(
                        "flex items-baseline justify-between px-4 py-3 text-sm",
                        i > 0 && "border-t border-border/60"
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{t(`tiers.${tItem.labelKey}`)}</p>
                          {tItem.perks.storageGb > 0 && (
                            <Badge variant="secondary" className="text-[10px] font-normal">
                              {tItem.perks.storageGb} GB / 1 Yr
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t(`tiers.${tItem.rangeKey}`)}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {tierBadgeSpans(tItem).map((span) => (
                            <BadgeChip key={span.badge} span={span} />
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold tabular-nums">
                          {currency === "ICP"
                            ? `${formatAmount(tItem.priceIcp)} ICP`
                            : `${formatTokenAmount(tItem.priceIcpay, 8)} $ICPAY`}
                        </span>
                        {currency === "ICPAY" && (
                          <p className="text-[10px] text-primary font-medium">{t("savePercent")}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">{t("note")}</p>
              <Link
                href="/brand-protection"
                className="inline-block text-xs font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
              >
                {t("brandProtectionLink")}
              </Link>
            </div>
          </CardContent>
        </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppPage>
  )
}

function BadgeChip({ span }: { span: BadgeSpan }) {
  const t = useTranslations("buyUsername")
  const lengths =
    span.min === span.max ? `${span.min}` : `${span.min}-${span.max}`

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground">
        <BadgeMark tier={span.badge} className="size-3" />
        {t("badgeChip", { lengths })}
      </PopoverTrigger>
      <PopoverContent align="start" className="gap-2">
        <PopoverHeader>
          <PopoverTitle className="flex items-center gap-1.5 text-sm">
            <BadgeMark tier={span.badge} />
            {t(span.badge === "gold" ? "goldBadgeTitle" : "blueBadgeTitle")}
          </PopoverTitle>
        </PopoverHeader>
        <PopoverDescription className="text-xs">
          {t(span.badge === "gold" ? "goldBadgeInfo" : "blueBadgeInfo", {
            lengths,
          })}
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  )
}
