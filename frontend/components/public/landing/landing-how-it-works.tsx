"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkBadge01Icon,
  Layers01Icon,
  SentIcon,
  Share08Icon,
  ShieldIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { Card, CardTitle } from "@/components/ui/card"

const STEP_CONFIG = [
  { id: "0", icon: ShieldIcon },
  { id: "1", icon: UserIcon },
  { id: "2", icon: Share08Icon },
  { id: "3", icon: SentIcon },
  { id: "4", icon: CheckmarkBadge01Icon },
  { id: "5", icon: Layers01Icon },
] as const

export function LandingHowItWorks() {
  const t = useTranslations("publicSite.landing.howItWorks") as (
    key: string,
    values?: Record<string, string | number>
  ) => string

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
          {STEP_CONFIG.map(({ id: stepId, icon: Icon }, index) => {
            const stepNum = String(index + 1).padStart(2, "0")
            return (
              <Card
                key={stepId}
                className="group relative overflow-hidden border-border/60 bg-card p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <HugeiconsIcon
                      icon={Icon}
                      className="size-5 shrink-0 text-primary transition-transform duration-200 group-hover:scale-105"
                      strokeWidth={1.75}
                    />
                    <CardTitle className="text-base font-semibold leading-snug text-foreground">
                      {t(`steps.${stepId}.title`)}
                    </CardTitle>
                  </div>
                  <span className="shrink-0 rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">
                    {t("stepLabel", { step: stepNum })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`steps.${stepId}.body`)}
                </p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
