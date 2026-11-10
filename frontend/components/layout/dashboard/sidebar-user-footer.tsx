"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CloudIcon,
  Coins01Icon,
  Logout01Icon,
  MoreVerticalIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"

import { PremiumBadge } from "@/components/verified/premium-badge"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/components/auth/auth-provider"
import { useDashboard } from "@/hooks/wallet/useWalletData"
import { avatarUriFor } from "@/lib/profile/avatar"

export type NavUserProps = {
  user?: {
    name?: string
    email?: string
    avatar?: string
  }
}

export function NavUser({ user }: NavUserProps) {
  const router = useRouter()
  const { identity, logout } = useAuth()
  const { data } = useDashboard()
  const { isMobile } = useSidebar()

  const principal = identity?.getPrincipal().toText() ?? ""
  const username = data?.user.username?.[0]

  const displayName = user?.name || (username ? `@${username}` : (principal ? `@${principal.slice(0, 8)}` : "@nikolads"))
  const subtitle = user?.email || (principal ? `${principal.slice(0, 8)}…${principal.slice(-4)}` : "Verified Principal")

  const generatedAvatar = useMemo(
    () => (principal ? avatarUriFor(principal) : ""),
    [principal],
  )
  const avatarSrc = user?.avatar || generatedAvatar

  const initials = displayName.replace(/^@/, "").slice(0, 2).toUpperCase() || "CN"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  {avatarSrc ? <AvatarImage src={avatarSrc} alt={displayName} /> : null}
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="flex items-center gap-1.5 truncate font-medium">
                    <span className="truncate">{displayName}</span>
                    <PremiumBadge name={username} className="size-3.5" />
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {subtitle}
                  </span>
                </div>
                <HugeiconsIcon icon={MoreVerticalIcon} className="ml-auto size-4" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    {avatarSrc ? <AvatarImage src={avatarSrc} alt={displayName} /> : null}
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="flex items-center gap-1.5 truncate font-medium">
                      <span className="truncate">{displayName}</span>
                      <PremiumBadge name={username} className="size-3.5" />
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {subtitle}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <HugeiconsIcon icon={UserCircleIcon} className="size-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/bucket")}>
                <HugeiconsIcon icon={CloudIcon} className="size-4" />
                Bucket
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/wallet")}>
                <HugeiconsIcon icon={Coins01Icon} className="size-4" />
                Tokens
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void logout()}>
              <HugeiconsIcon icon={Logout01Icon} className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

// Backwards compatibility alias for app-sidebar
export const SidebarUserFooter = NavUser
