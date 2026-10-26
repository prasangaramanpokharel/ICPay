"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SecurityCheckIcon,
  Logout01Icon,
  Layers01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  ArrowRight01Icon,
  Coins01Icon,
} from "@hugeicons/core-free-icons"
import { clearAdminSession, getAdminSession } from "@/services/academy/admin-auth"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/ui/utils"

export function AcademyAdminNav() {
  const pathname = usePathname()
  const session = getAdminSession()
  const { identity, isAuthenticated, login } = useAuth()
  const callerPrincipal = identity?.getPrincipal().toText()
  const shortPrincipal = callerPrincipal
    ? `${callerPrincipal.slice(0, 5)}...${callerPrincipal.slice(-3)}`
    : null

  const handleSignOut = () => {
    clearAdminSession()
    window.location.reload()
  }

  const navLinks = [
    {
      title: "Dashboard",
      href: "/acadamey/dashboard",
      icon: Clock01Icon,
      active: pathname === "/acadamey/dashboard" || pathname === "/acadamey",
    },
    {
      title: "Courses & Tracks",
      href: "/acadamey/courses",
      icon: Layers01Icon,
      active: pathname.startsWith("/acadamey/courses"),
    },
    {
      title: "Treasury & Payout",
      href: "/acadamey/payout",
      icon: Coins01Icon,
      active: pathname.startsWith("/acadamey/payout"),
    },
    {
      title: "Audit Trail",
      href: "/acadamey/audit",
      icon: CheckmarkCircle02Icon,
      active: pathname.startsWith("/acadamey/audit"),
    },
  ]

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/acadamey/dashboard" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HugeiconsIcon icon={SecurityCheckIcon} className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-foreground">
                ICAcademy Admin
              </span>
              <span className="text-[10px] font-medium text-muted-foreground">
                On-Chain Platform Control
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  buttonVariants({
                    variant: link.active ? "secondary" : "ghost",
                    size: "sm",
                  }),
                  "h-8 gap-2 px-3 text-xs font-semibold",
                  link.active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <HugeiconsIcon icon={link.icon} className="size-3.5" />
                {link.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/academy"
            target="_blank"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden h-8 gap-1.5 border-border bg-card text-xs font-medium text-foreground hover:bg-accent sm:flex"
            )}
          >
            View Public Academy
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3 text-muted-foreground" />
          </Link>

          {isAuthenticated && shortPrincipal ? (
            <Badge
              variant="outline"
              title={callerPrincipal}
              className="hidden items-center gap-1.5 border-success/30 bg-success/10 text-[11px] font-semibold text-success sm:inline-flex"
            >
              <span className="size-1.5 rounded-full bg-success animate-pulse" />
              Signer: {shortPrincipal}
            </Badge>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void login()}
              className="h-8 gap-1.5 border-warning/30 bg-warning/10 text-xs font-semibold text-warning hover:bg-warning/20"
            >
              <HugeiconsIcon icon={SecurityCheckIcon} className="size-3.5" />
              Connect Signer
            </Button>
          )}

          {session && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold leading-none text-foreground">
                  {session.name}
                </span>
                <span className="text-[10px] leading-tight text-muted-foreground">
                  {session.email}
                </span>
              </div>
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/10 text-[10px] font-semibold uppercase tracking-wider text-primary"
              >
                {session.role === "super_admin" ? "Super" : "Admin"}
              </Badge>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            title="Sign out of Admin Session"
            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <HugeiconsIcon icon={Logout01Icon} className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-1.5 md:hidden">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              buttonVariants({
                variant: link.active ? "secondary" : "ghost",
                size: "sm",
              }),
              "h-7 gap-1.5 px-2.5 text-[11px] font-semibold",
              link.active
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <HugeiconsIcon icon={link.icon} className="size-3" />
            {link.title}
          </Link>
        ))}
      </div>
    </header>
  )
}
