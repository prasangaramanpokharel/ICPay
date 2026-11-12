"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { CrownIcon } from "@hugeicons/core-free-icons"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { buttonVariants } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { resolveAppPageTitle } from "@/lib/navigation/app-sidebar-nav"
import { cn } from "@/lib/ui/utils"

function HeaderTitleOrBreadcrumb({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams()
  const t = useTranslations()

  if (pathname.startsWith("/cron") || pathname.startsWith("/iccron")) {
    if (pathname === "/cron/api" || pathname === "/iccron/api") {
      return (
        <Breadcrumb className="flex-1 min-w-0">
          <BreadcrumbList className="text-xs sm:text-sm">
            <BreadcrumbItem>
              <BreadcrumbLink href="/cron" className="text-muted-foreground hover:text-foreground">
                icCron
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-foreground">
                API Keys
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    }

    if (pathname === "/cron/create" || pathname === "/iccron/create") {
      const projectName = searchParams.get("id") || searchParams.get("name")
      return (
        <Breadcrumb className="flex-1 min-w-0">
          <BreadcrumbList className="text-xs sm:text-sm">
            <BreadcrumbItem>
              <BreadcrumbLink href="/cron" className="text-muted-foreground hover:text-foreground">
                icCron
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {projectName && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={`/cron?id=${encodeURIComponent(projectName)}`}
                    className="text-muted-foreground hover:text-foreground truncate max-w-32"
                  >
                    {decodeURIComponent(projectName)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-foreground">
                Create Job
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    }

    const projectId = searchParams.get("id")
    if (projectId) {
      return (
        <Breadcrumb className="flex-1 min-w-0">
          <BreadcrumbList className="text-xs sm:text-sm">
            <BreadcrumbItem>
              <BreadcrumbLink href="/cron" className="text-muted-foreground hover:text-foreground">
                icCron
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-foreground truncate max-w-40 sm:max-w-xs">
                {decodeURIComponent(projectId)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    }

    return (
      <Breadcrumb className="flex-1 min-w-0">
        <BreadcrumbList className="text-xs sm:text-sm">
          <BreadcrumbItem>
            <span className="text-muted-foreground">Services</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium text-foreground">
              icCron
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  const title = resolveAppPageTitle(pathname, (key) => t(key as never))
  return <h1 className="flex-1 truncate text-sm font-normal">{title}</h1>
}

export function AppSiteHeader() {
  const pathname = usePathname()
  const t = useTranslations()

  return (
    <header className="sticky top-0 z-20 hidden h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-sm md:flex">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-3 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-1 h-4 data-vertical:self-auto" />
        <React.Suspense fallback={<h1 className="flex-1 truncate text-sm font-normal">icPay</h1>}>
          <HeaderTitleOrBreadcrumb pathname={pathname} />
        </React.Suspense>
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href="/presale"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "size-8 rounded-full p-1 transition-transform hover:scale-105 active:scale-95",
            )}
            title={t("nav.presale" as never) || "ICPAY Token Presale"}
            aria-label={t("nav.presale" as never) || "ICPAY Token Presale"}
          >
            <Image
              src="/images/pages/dashboard/presale.webp"
              alt="Presale"
              width={20}
              height={20}
              className="size-5 shrink-0 object-contain rounded-sm"
              priority
            />
          </Link>
          <Link
            href="/username"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "size-8 rounded-full text-muted-foreground hover:text-primary transition-colors",
            )}
            aria-label={t("settings.items.buyPremium" as never)}
          >
            <HugeiconsIcon
              icon={CrownIcon}
              className="size-4 shrink-0"
              strokeWidth={1.75}
            />
          </Link>
        </div>
      </div>
    </header>
  )
}
