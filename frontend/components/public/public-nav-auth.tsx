"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Clock01Icon,
  Copy01Icon,
  Logout01Icon,
  Moon02Icon,
  Settings01Icon,
  Sun01Icon,
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
import { LanguageSwitch } from "@/components/i18n/language-switch"
import { useDashboard, useDepositAddress } from "@/hooks/wallet/useWalletData"
import { avatarUriFor } from "@/lib/profile/avatar"
import { icrc1Account } from "@/lib/wallet/accountId"
import { copyText } from "@/lib/wallet/utils"
import { APP_LOGO, APP_LOGO_ALT } from "@/lib/ui/brand-images"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/ui/utils"

function useNavUserData() {
  const tNav = useTranslations("publicSite.nav")
  const tCommon = useTranslations("common")
  const tDeposit = useTranslations("deposit")
  const { identity, isAuthenticated, isLoading, logout } = useAuth()
  const { data: dashboard } = useDashboard()
  const { data: deposit } = useDepositAddress()

  const [copied, setCopied] = React.useState(false)

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const principal = identity?.getPrincipal().toText() ?? ""
  const icrcAddress = deposit ? icrc1Account(deposit.address.owner, deposit.address.subaccount[0]) : ""
  const depositAddress = icrcAddress || principal
  const username = dashboard?.user.username?.[0]
  const displayName = username || tNav("wallet")

  const avatarUri = React.useMemo(
    () => (principal ? avatarUriFor(principal) : ""),
    [principal],
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
      toast.success(tDeposit("copyAddress"))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.add({
        title: tCommon("retry"),
        type: "error",
      })
    }
  }

  return {
    tNav,
    identity,
    isAuthenticated,
    isLoading,
    logout,
    copied,
    mounted,
    displayName,
    avatarUri,
    userInitials,
    formattedAddress,
    handleCopy,
  }
}

function NavUserMenuItems({
  displayName,
  avatarUri,
  userInitials,
  formattedAddress,
  copied,
  handleCopy,
  logout,
}: {
  displayName: string
  avatarUri: string
  userInitials: string
  formattedAddress: string
  copied: boolean
  handleCopy: (e?: React.MouseEvent | React.KeyboardEvent) => Promise<void>
  logout: () => void
}) {
  const tNav = useTranslations("publicSite.nav")
  const tNavRoot = useTranslations("nav")
  const tSettings = useTranslations("settings")
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <>
      <div className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30">
        <Avatar className="size-9 shrink-0 rounded-full border border-border/60">
          {avatarUri ? <AvatarImage src={avatarUri} alt={displayName} /> : null}
          <AvatarFallback className="text-xs font-semibold bg-muted text-foreground">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold text-foreground">
            {displayName}
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <span className="truncate">{formattedAddress}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Copy address"
              aria-label="Copy address"
            >
              <HugeiconsIcon
                icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
                className={cn("size-3", copied && "text-success")}
              />
            </button>
          </div>
        </div>
      </div>

      <DropdownMenuSeparator className="my-1.5" />

      <DropdownMenuGroup>
        <DropdownMenuItem render={<Link href="/home" />} className="cursor-pointer gap-2.5 text-xs py-2">
          <HugeiconsIcon icon={Wallet01Icon} className="size-4 text-muted-foreground" strokeWidth={1.75} />
          <span>{tNav("wallet")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/transactions" />} className="cursor-pointer gap-2.5 text-xs py-2">
          <HugeiconsIcon icon={Clock01Icon} className="size-4 text-muted-foreground" strokeWidth={1.75} />
          <span>{tNavRoot("history")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/profile" />} className="cursor-pointer gap-2.5 text-xs py-2">
          <HugeiconsIcon icon={UserIcon} className="size-4 text-muted-foreground" strokeWidth={1.75} />
          <span>{tSettings("items.profile")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings" />} className="cursor-pointer gap-2.5 text-xs py-2">
          <HugeiconsIcon icon={Settings01Icon} className="size-4 text-muted-foreground" strokeWidth={1.75} />
          <span>{tSettings("items.settings")}</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator className="my-1.5" />

      <div className="px-1 py-1 space-y-1">
        <LanguageSwitch variant="row" />
        <div className="flex items-center justify-between px-2.5 py-1 text-xs text-foreground">
          <div className="flex items-center gap-2.5">
            <HugeiconsIcon icon={Moon02Icon} className="size-4 text-muted-foreground" strokeWidth={1.75} />
            <span>Theme</span>
          </div>
          <div className="flex items-center gap-0.5 rounded-full border border-border/60 bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors cursor-pointer",
                resolvedTheme === "light" && "bg-background text-foreground shadow-xs",
              )}
              aria-label="Light mode"
            >
              <HugeiconsIcon icon={Sun01Icon} className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors cursor-pointer",
                resolvedTheme === "dark" && "bg-background text-foreground shadow-xs",
              )}
              aria-label="Dark mode"
            >
              <HugeiconsIcon icon={Moon02Icon} className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      <DropdownMenuSeparator className="my-1.5" />

      <DropdownMenuItem
        onClick={() => void logout()}
        className="cursor-pointer gap-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive text-xs py-2"
      >
        <HugeiconsIcon icon={Logout01Icon} className="size-4 text-destructive" strokeWidth={1.75} />
        <span>{tSettings("signOut")}</span>
      </DropdownMenuItem>
    </>
  )
}

export function PublicNavAuth() {
  const data = useNavUserData()

  if (!data.mounted || data.isLoading) {
    return (
      <div className="size-8 sm:size-9 shrink-0 animate-pulse rounded-full bg-muted/60" aria-hidden />
    )
  }

  if (data.isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 sm:size-9 rounded-full p-0 transition-transform hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              aria-label={data.displayName}
            />
          }
        >
          <Avatar className="size-8 sm:size-9 shrink-0 rounded-full border border-border/60">
            {data.avatarUri ? <AvatarImage src={data.avatarUri} alt={data.displayName} /> : null}
            <AvatarFallback className="text-xs font-semibold bg-muted text-foreground">
              {data.userInitials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-1.5" sideOffset={8}>
          <NavUserMenuItems
            displayName={data.displayName}
            avatarUri={data.avatarUri}
            userInitials={data.userInitials}
            formattedAddress={data.formattedAddress}
            copied={data.copied}
            handleCopy={data.handleCopy}
            logout={data.logout}
          />
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
      {data.tNav("signIn")}
    </Button>
  )
}

export function PublicNavMobileUser() {
  const data = useNavUserData()

  if (!data.mounted || data.isLoading) {
    return (
      <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted/60" aria-hidden />
    )
  }

  if (data.isAuthenticated) {
    return (
      <Link
        href="/profile"
        className="flex shrink-0 items-center rounded-full outline-none transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={data.displayName}
      >
        <Avatar className="size-8 shrink-0 rounded-full border border-border/60">
          {data.avatarUri ? <AvatarImage src={data.avatarUri} alt={data.displayName} /> : null}
          <AvatarFallback className="text-[10px] font-semibold bg-muted text-foreground">
            {data.userInitials}
          </AvatarFallback>
        </Avatar>
      </Link>
    )
  }

  return (
    <Link
      href="/"
      className="flex shrink-0 items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Home"
    >
      <Image
        src={APP_LOGO}
        alt={APP_LOGO_ALT}
        title={APP_LOGO_ALT}
        width={32}
        height={32}
        className="size-8 rounded-lg object-cover"
        priority
        loading="eager"
      />
    </Link>
  )
}

export function PublicNavMobileAuthFallback() {
  const { isAuthenticated, isLoading } = useAuth()
  const tNav = useTranslations("publicSite.nav")
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!mounted || isLoading || isAuthenticated) return null

  return (
    <Button
      size="sm"
      nativeButton={false}
      render={<Link href="/login" />}
      className="rounded-full px-3 text-xs"
    >
      {tNav("signIn")}
    </Button>
  )
}