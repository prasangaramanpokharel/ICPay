"use client"

import { motion } from "motion/react"
import { useTranslations } from "next-intl"
import { Icon } from "@/components/ui/icon"
import { LayersGlassIcon, TerminalGlassIcon, ExternalLinkGlassIcon, PackageGlassIcon } from "@thesvg/ui-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

const PROBLEM_IDS = ["0", "1", "2", "3"] as const
const SOLUTION_ICONS = [
  LayersGlassIcon,
  TerminalGlassIcon,
  ExternalLinkGlassIcon,
  PackageGlassIcon,
] as const

export function ProblemSolution() {
  const t = useTranslations("publicSite.icfalcon.problemSolution")

  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center space-y-3 mb-14 md:mb-16"
        >
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            {t("title")}
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="size-2 rounded-full bg-destructive/80" />
              <h3 className="text-lg font-semibold tracking-tight text-foreground">{t("problemHeading")}</h3>
            </div>
            <div className="space-y-3">
              {PROBLEM_IDS.map((id) => (
                <Card key={id} size="sm" className="border-border/60 bg-card/60 backdrop-blur-xs transition-colors hover:border-destructive/30 hover:bg-card/90">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-semibold text-foreground">{t(`problems.${id}.title`)}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed mt-1">{t(`problems.${id}.description`)}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              <h3 className="text-lg font-semibold tracking-tight text-foreground">{t("solutionHeading")}</h3>
            </div>
            <div className="space-y-3">
              {PROBLEM_IDS.map((id, index) => (
                <Card key={id} size="sm" className="border-border/60 bg-card/60 backdrop-blur-xs transition-colors hover:border-primary/40 hover:bg-card/90">
                  <CardHeader className="p-4">
                    <CardTitle className="flex items-start gap-2.5 text-sm font-semibold text-foreground">
                      <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                        <Icon
                          icon={SOLUTION_ICONS[index]}
                          className="size-3.5"
                        />
                      </div>
                      <span className="pt-0.5">{t(`solutions.${id}.title`)}</span>
                    </CardTitle>
                    <CardDescription className="pl-8.5 text-xs leading-relaxed mt-1">{t(`solutions.${id}.description`)}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
