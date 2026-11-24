"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/ui/copy-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { PremiumBadge } from "@/components/verified/premium-badge"
import { Icon } from "@/components/ui/icon"
import { UserGlassIcon, CheckGlassOutlineIcon, XGlassIcon, ShoppingBagGlassIcon, ArrowRightGlassIcon, ExternalLinkGlassIcon } from "@thesvg/ui-react"
import type { UserPublic } from "@/services/types"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { useUsernameAvailability, useOwnUsernames, useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { setPrimaryUsername } from "@/services/profile/profile"
import { primeSuccessChime } from "@/lib/ui/successChime"
import { toast } from "sonner"
import {
  validateFreeUsername,
  USERNAME_MAX_LENGTH,
  USERNAME_FREE_MIN_LENGTH,
} from "@/lib/profile/username"

type ProfileCardProps = {
  user: UserPublic
  onUpdateUsername: (username: string) => Promise<string | null>
}

export function ProfileCard({ user, onUpdateUsername }: ProfileCardProps) {
  const t = useTranslations("profile")
  const te = useTranslations("buyUsername.errors")
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const claimed = user.username?.[0]
  const [username, setUsername] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [switchingPrimary, setSwitchingPrimary] = useState<string | null>(null)

  const { data: fetchedUsernames, mutate: mutateUsernames } = useOwnUsernames()
  const handles =
    fetchedUsernames && fetchedUsernames.length > 0
      ? fetchedUsernames
      : claimed
        ? [claimed]
        : []

  const trimmed = username.trim()
  const { available, isLoading: checking } = useUsernameAvailability(trimmed)
  const tooShortToClaim =
    trimmed !== "" && trimmed.length < USERNAME_FREE_MIN_LENGTH

  const handleSetPrimary = async (targetHandle: string) => {
    if (!identity || switchingPrimary) return
    setSwitchingPrimary(targetHandle)
    const res = await setPrimaryUsername(identity, targetHandle)
    setSwitchingPrimary(null)
    if ("ok" in res) {
      primeSuccessChime()
      toast.success(t("primaryUpdated", { handle: targetHandle }))
      await Promise.all([mutateUsernames(), refreshWallet()])
    } else {
      toast.error(res.err || t("primaryFailed"))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const name = username.trim()
    if (!name) { setError(t("required")); return }
    const invalid = validateFreeUsername(name)
    if (invalid) {
      setError(te(invalid, { max: USERNAME_MAX_LENGTH, min: USERNAME_FREE_MIN_LENGTH }))
      return
    }
    setLoading(true)
    const err = await onUpdateUsername(name)
    if (err) setError(err)
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon={UserGlassIcon} className="h-5 w-5" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{t("userId")}</Label>
          <p className="font-mono text-xs text-muted-foreground">{user.id}</p>
        </div>
        {handles.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-foreground">{t("handlesTitle")}</Label>
              <span className="text-[11px] text-muted-foreground">{handles.length}</span>
            </div>
            <div className="space-y-1.5">
              {handles.map((handle, idx) => {
                const isPrimary = idx === 0
                return (
                  <div
                    key={handle}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs transition-colors hover:bg-muted/50"
                  >
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate font-medium text-foreground">@{handle}</span>
                      <PremiumBadge name={handle} className="size-3.5 shrink-0" />
                      <Badge
                        variant={isPrimary ? "default" : "secondary"}
                        className="px-1.5 py-0 text-[10px] font-normal"
                      >
                        {isPrimary ? t("primaryHandle") : t("aliasHandle")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!isPrimary && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={switchingPrimary !== null}
                          onClick={() => handleSetPrimary(handle)}
                          className="h-6 px-2 text-[10px] font-medium"
                        >
                          {switchingPrimary === handle && <Spinner data-icon="inline-start" className="size-3" />}
                          <span>{t("setPrimary")}</span>
                        </Button>
                      )}
                      <CopyButton text={`@${handle}`} size="icon-xs" variant="ghost" />
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        nativeButton={false}
                        render={<Link href={`/@${handle}`} aria-label={`View @${handle} profile`} />}
                      >
                        <Icon icon={ExternalLinkGlassIcon} className="size-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-[11px] text-muted-foreground">{t("handlesHint")}</p>
            <p className="text-xs text-muted-foreground">{t("permanentNote")}</p>
          </div>
        )}
        {handles.length === 0 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("choose")}</Label>
              <div className="flex gap-2">
                <Input
                  id="username"
                  placeholder="@username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setError(null)
                  }}
                  maxLength={USERNAME_MAX_LENGTH}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
                {trimmed !== "" && !tooShortToClaim && !checking && available === true && (
                  <Icon icon={CheckGlassOutlineIcon} className="h-5 w-5 text-success" strokeWidth={2.5} />
                )}
                {trimmed !== "" && !tooShortToClaim && !checking && available === false && (
                  <Icon icon={XGlassIcon} className="h-5 w-5 text-destructive" />
                )}
              </div>
              {trimmed !== "" && !tooShortToClaim && !checking && available === true && (
                <p className="text-xs text-success">{t("available")}</p>
              )}
              {trimmed !== "" && !tooShortToClaim && !checking && available === false && (
                <p className="text-xs text-destructive">{t("taken")}</p>
              )}
              {tooShortToClaim ? (
                <p className="text-xs text-muted-foreground">
                  {t("tooShort", { min: USERNAME_FREE_MIN_LENGTH })}{" "}
                  <Link href="/username" className="font-medium text-primary underline underline-offset-2">
                    {t("buyShorter")}
                  </Link>
                  .
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t("freeRange", { min: USERNAME_FREE_MIN_LENGTH, max: USERNAME_MAX_LENGTH })}
                </p>
              )}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Spinner data-icon="inline-start" />}
              <span>{loading ? t("saving") : t("claim")}</span>
            </Button>
          </form>
        )}
        <Link
          href="/username"
          className="flex items-center justify-between gap-3 rounded-xl border border-dashed px-3 py-2.5 transition-colors hover:bg-accent"
        >
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon icon={ShoppingBagGlassIcon} className="size-4 shrink-0" />
            {t("upsell")}
          </span>
          <Icon icon={ArrowRightGlassIcon} className="size-4 shrink-0 text-muted-foreground" />
        </Link>
      </CardContent>
    </Card>
  )
}
