"use client"

import { useTranslations } from "next-intl"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Icon } from "@/components/ui/icon"
import { CircleAlertGlassIcon, CircleCheckGlassIcon, CloudGlassIcon, HandCoinsGlassIcon, DatabaseGlassIcon, ShieldGlassIcon } from "@thesvg/ui-react"

const ROW_IDS = ["0", "1", "2", "3"] as const

const ROW_ICONS = [
  {
    problem: HandCoinsGlassIcon,
    solution: HandCoinsGlassIcon,
  },
  {
    problem: DatabaseGlassIcon,
    solution: ShieldGlassIcon,
  },
  {
    problem: CircleAlertGlassIcon,
    solution: CircleCheckGlassIcon,
  },
  {
    problem: CloudGlassIcon,
    solution: CloudGlassIcon,
  },
] as const

function TopicCell({
  icon,
  title,
  description,
  tone,
}: {
  icon: typeof HandCoinsGlassIcon
  title: string
  description: string
  tone: "problem" | "solution"
}) {
  const iconClass = tone === "problem" ? "text-destructive" : "text-primary"

  return (
    <div className="flex gap-3 py-1">
      <Icon icon={icon} className={`mt-0.5 size-5 shrink-0 ${iconClass}`} />
      <div className="min-w-0 space-y-1">
        <p className="font-medium leading-snug">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export function ProblemSolution() {
  const t = useTranslations("publicSite.icbucket.problemSolution")

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-10 space-y-3 text-center md:mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-linear-to-b from-foreground via-foreground/90 to-foreground/45 bg-clip-text text-transparent md:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{t("subtitle")}</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/60">
                <TableHead className="w-1/2 px-5 py-4 text-base font-semibold text-foreground">
                  {t("problemColumn")}
                </TableHead>
                <TableHead className="w-1/2 border-l border-border/60 px-5 py-4 text-base font-semibold text-foreground">
                  {t("solutionColumn")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROW_IDS.map((id, index) => (
                <TableRow key={id} className="align-top border-b border-border/60 last:border-b-0 hover:bg-muted/20">
                  <TableCell className="whitespace-normal px-5 py-5">
                    <TopicCell
                      icon={ROW_ICONS[index].problem}
                      title={t(`rows.${id}.problemTitle`)}
                      description={t(`rows.${id}.problemDescription`)}
                      tone="problem"
                    />
                  </TableCell>
                  <TableCell className="whitespace-normal border-l border-border/60 px-5 py-5">
                    <TopicCell
                      icon={ROW_ICONS[index].solution}
                      title={t(`rows.${id}.solutionTitle`)}
                      description={t(`rows.${id}.solutionDescription`)}
                      tone="solution"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}
