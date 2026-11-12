"use client"

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Download01Icon,
  Logout01Icon,
  SentIcon,
  Settings01Icon,
  UserIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDashboard, useDepositAddress } from "@/hooks/wallet/useWalletData"
import { avatarUriFor } from "@/lib/profile/avatar"
import { icrc1Account } from "@/lib/wallet/accountId"
import { copyText } from "@/lib/wallet/utils"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/ui/utils"

export function PublicNavAuth() {
  const tNav = useTranslations("publicSite.nav")
  const tSettings = useTranslations("settings")
  const tDeposit = useTranslations("deposit")
  const tCommon = useTranslations("common")
  const { identity, isAuthenticated, isLoading, logout } = useAuth()
  const { data: dashboard } = useDashboard()
  const { data: deposit } = useDepositAddress()

  const [copied, setCopied] = React.useState(false)

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const principal = identity?.getPrincipal().toText() ?? ""
  const icrcAddress = deposit ? icrc1Account(deposit.address.owner, deposit.address.subaccount[0]) : ""
  const depositAddress = icrcAddress || principal
  const username = dashboard?.user.username?.[0]
  const displayName = username || tNav("wallet")

  const avatarUri = React.useMemo(
    () => (principal ? avatarUriFor(principal) : ""),
    [principal]
  )
  const userInitials = displayName.slice(0, 2).toUpperCase()

  const formattedAddress = depositAddress.length > 14
    ? `${depositAddress.slice(0, 8)}…${depositAddress.slice(-4)}`
    : depositAddress || "..."

  const handleCopy = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    if (!depositAddress) return
    try {
      await copyText(depositAddress)
      setCopied(true)
      toast.add({
        title: tDeposit("copyAddress"),
        type: "info",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.add({
        title: tCommon("retry"),
        type: "error",
      })
    }
  }

  if (!mounted || isLoading) {
    return (
      <div className="h-9 w-28 shrink-0 animate-pulse rounded-lg bg-muted/60" aria-hidden />
    )
  }

  if (isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="group h-auto gap-2.5 rounded-lg border-border/70 bg-card/60 px-2.5 py-1 text-left transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring select-none"
            />
          }
        >
          <Avatar className="size-7 shrink-0 rounded-full">
            {avatarUri ? <AvatarImage src={avatarUri} alt={displayName} /> : null}
            <AvatarFallback className="text-[10px] font-semibold bg-muted text-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-foreground">
              {displayName}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {formattedAddress}
            </span>
          </div>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className="size-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48" sideOffset={8}>
          <DropdownMenuGroup>
            <DropdownMenuItem render={<Link href="/home" />}>
              <HugeiconsIcon icon={Wallet01Icon} className="size-4" strokeWidth={1.75} />
              {tNav("wallet")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopy}>
              <HugeiconsIcon
                icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
                className={cn("size-4", copied && "text-success")}
                strokeWidth={1.75}
              />
              {copied ? tCommon("copied") : tDeposit("copyAddress")}
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/deposit" />}>
              <HugeiconsIcon icon={Download01Icon} className="size-4" strokeWidth={1.75} />
              {tDeposit("title")}
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/transfer" />}>
              <HugeiconsIcon icon={SentIcon} className="size-4" strokeWidth={1.75} />
              {tCommon("send")}
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/profile" />}>
              <HugeiconsIcon icon={UserIcon} className="size-4" strokeWidth={1.75} />
              {tSettings("items.profile")}
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/settings" />}>
              <HugeiconsIcon icon={Settings01Icon} className="size-4" strokeWidth={1.75} />
              {tSettings("items.settings")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => void logout()}>
            <HugeiconsIcon icon={Logout01Icon} className="size-4" strokeWidth={1.75} />
            {tSettings("signOut")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      size="sm"
      nativeButton={false}
      render={<Link href="/login" />}
      className="rounded-full px-4"
    >
      {tNav("signIn")}
    </Button>
  )
}
