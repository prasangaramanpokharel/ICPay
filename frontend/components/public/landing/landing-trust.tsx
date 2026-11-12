"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  CodeIcon,
  Database01Icon,
  Globe02Icon,
  NewTwitterIcon,
  ShieldIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ICPAY_CANISTERS, TRUST_LINK_DEFS } from "@/lib/public/trust-links"

const TRUST_ICONS: Record<string, typeof CodeIcon> = {
  github: CodeIcon,
  backendCanister: Database01Icon,
  transparency: ShieldIcon,
  x: NewTwitterIcon,
  linkedin: UserGroupIcon,
  frontendCanister: Globe02Icon,
}

export function LandingTrust() {
  const t = useTranslations("publicSite.landing.trust") as (
    key: string,
    values?: Record<string, string | number>
  ) => string

  const trustLinks = TRUST_LINK_DEFS.map((def) => {
    const canisterId =
      def.id === "backendCanister"
        ? ICPAY_CANISTERS.backend
        : def.id === "frontendCanister"
          ? ICPAY_CANISTERS.frontend
          : undefined

    return {
      ...def,
      label: t(`items.${def.id}.label`),
      description: canisterId
        ? t(`items.${def.id}.description`, { canisterId })
        : t(`items.${def.id}.description`),
    }
  })

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-10 max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {t("eyebrow")}
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight bg-linear-to-b from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent md:text-4xl">
            {t("title")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trustLinks.map((item) => {
            const Icon = TRUST_ICONS[item.id] ?? ShieldIcon
            const content = (
              <Card className="h-full border-border/60 bg-card shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <HugeiconsIcon
                        icon={Icon}
                        className="size-5 shrink-0 text-primary transition-transform duration-200 group-hover:scale-105"
                        strokeWidth={1.75}
                      />
                      <CardTitle className="truncate text-base font-semibold leading-snug transition-colors group-hover:text-primary">
                        {item.label}
                      </CardTitle>
                    </div>
                    <HugeiconsIcon
                      icon={item.external ? ArrowUpRight01Icon : ArrowRight01Icon}
                      className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                      strokeWidth={1.75}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            )

            if (item.external) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {content}
                </a>
              )
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {content}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
