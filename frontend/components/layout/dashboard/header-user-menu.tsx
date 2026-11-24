"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Icon } from "@/components/ui/icon"
import { BookOpenGlassIcon, LogOutGlassIcon, SettingsGlassIcon, UserGlassIcon } from "@thesvg/ui-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth/auth-provider"
import { useDashboard } from "@/hooks/wallet/useWalletData"
import { avatarUriFor } from "@/lib/profile/avatar"

export function HeaderUserMenu() {
  const { identity, logout } = useAuth()
  const { data } = useDashboard()
  const t = useTranslations("settings")

  const principal = identity?.getPrincipal().toText() ?? ""
  const username = data?.user.username?.[0]
  const displayName = username ? `@${username}` : principal.slice(0, 8) + "…"

  const avatarUri = useMemo(
    () => (principal ? avatarUriFor(principal) : ""),
    [principal],
  )

  if (!principal) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            aria-label={displayName}
          />
        }
      >
        <Avatar className="size-8">
          {avatarUri ? <AvatarImage src={avatarUri} alt="" /> : null}
          <AvatarFallback className="text-xs">
            {principal.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56" sideOffset={8}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="size-8">
                {avatarUri ? <AvatarImage src={avatarUri} alt="" /> : null}
                <AvatarFallback className="text-xs">
                  {principal.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">{principal}</span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/profile" />}>
            <Icon icon={UserGlassIcon} className="size-4" strokeWidth={1.75} />
            {t("items.profile")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/blog" />}>
            <Icon icon={BookOpenGlassIcon} className="size-4" strokeWidth={1.75} />
            {t("items.blog")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/settings" />}>
            <Icon icon={SettingsGlassIcon} className="size-4" strokeWidth={1.75} />
            {t("items.settings")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void logout()}>
          <Icon icon={LogOutGlassIcon} className="size-4" strokeWidth={1.75} />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
