"use client"

import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { ShieldCheckGlassIcon, LogOutGlassIcon, LayersGlassIcon, CircleCheckGlassIcon, ClockGlassIcon, ArrowRightGlassIcon, CoinsGlassIcon } from "@thesvg/ui-react"
import { clearAdminSession, getAdminSession } from "@/services/academy/admin-auth"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/ui/utils"

export function AcademyAdminNav() {
  const segment = useSelectedLayoutSegment()
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
      icon: ClockGlassIcon,
      active: segment === "dashboard" || segment === null,
    },
    {
      title: "Courses & Tracks",
      href: "/acadamey/courses",
      icon: LayersGlassIcon,
      active: segment === "courses",
    },
    {
      title: "Treasury & Payout",
      href: "/acadamey/payout",
      icon: CoinsGlassIcon,
      active: segment === "payout",
    },
    {
      title: "Audit Trail",
      href: "/acadamey/audit",
      icon: CircleCheckGlassIcon,
      active: segment === "audit",
    },
  ]

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/acadamey/dashboard" className="flex items-center gap-2.5">
            <Icon icon={ShieldCheckGlassIcon} className="size-5 text-primary" strokeWidth={1.75} />
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
                <Icon icon={link.icon} className="size-3.5" strokeWidth={1.75} />
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
            <Icon icon={ArrowRightGlassIcon} className="size-3 text-muted-foreground" strokeWidth={2} />
          </Link>

          {isAuthenticated && shortPrincipal ? (
            <Badge
              variant="outline"
              title={callerPrincipal}
              className="hidden items-center gap-1.5 border-border/50 bg-muted/30 text-[11px] font-semibold text-success sm:inline-flex"
            >
              Signer: {shortPrincipal}
            </Badge>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void login()}
              className="h-8 gap-1.5 border-warning/30 bg-warning/10 text-xs font-semibold text-warning hover:bg-warning/20"
            >
              <Icon icon={ShieldCheckGlassIcon} className="size-3.5" strokeWidth={1.75} />
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
            className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Icon icon={LogOutGlassIcon} className="size-4" strokeWidth={1.75} />
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
            <Icon icon={link.icon} className="size-3" strokeWidth={2} />
            {link.title}
          </Link>
        ))}
      </div>
    </header>
  )
}
