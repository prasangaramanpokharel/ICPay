"use client"

import { useTranslations } from "next-intl"
import { CloudGlassIcon, MessageSquareGlassIcon, ShieldGlassIcon, TerminalGlassIcon, UserGlassIcon, EyeGlassIcon } from "@thesvg/ui-react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

const FEATURE_CONFIG = [
  { id: "0", icon: UserGlassIcon },
  { id: "1", icon: ShieldGlassIcon },
  { id: "2", icon: MessageSquareGlassIcon },
  { id: "3", icon: CloudGlassIcon },
  { id: "4", icon: TerminalGlassIcon },
  { id: "5", icon: EyeGlassIcon },
] as const

export function LandingFeatures() {
  const t = useTranslations("publicSite.landing.features")

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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURE_CONFIG.map(({ id, icon: FeatureIcon }) => (
            <Card
              key={id}
              className="group border-border/60 bg-card shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md"
            >
              <CardHeader className="gap-3.5 p-6">
                <div className="flex items-center gap-2.5">
                  <FeatureIcon
                    className="size-5 shrink-0 text-primary transition-transform duration-200 group-hover:scale-105"
                    strokeWidth={1.75}
                  />
                  <CardTitle className="text-base font-semibold text-foreground">
                    {t(`items.${id}.title`)}
                  </CardTitle>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`items.${id}.body`)}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
