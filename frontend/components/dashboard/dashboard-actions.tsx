"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDataTransferHorizontalIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Exchange01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 380, damping: 28 } },
}

type DashboardAction = {
  href: string
  labelKey: "common.send" | "common.receive" | "common.swap" | "transactions.type.transfer"
  icon: typeof ArrowUp01Icon
}

const actions: DashboardAction[] = [
  { href: "/transfer", labelKey: "common.send", icon: ArrowUp01Icon },
  { href: "/deposit", labelKey: "common.receive", icon: ArrowDown01Icon },
  { href: "/trade", labelKey: "common.swap", icon: Exchange01Icon },
  {
    href: "/withdraw",
    labelKey: "transactions.type.transfer",
    icon: ArrowDataTransferHorizontalIcon,
  },
]

export function DashboardActions() {
  const t = useTranslations()

  return (
    <>
      <motion.div
        className="grid grid-cols-4 gap-2 md:hidden"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {actions.map((item) => (
          <motion.div key={item.href} variants={itemVariants}>
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href={item.href} prefetch />}
              aria-label={t(item.labelKey)}
              className="h-auto w-full flex-col gap-1.5 p-1 rounded-2xl transition-transform hover:bg-transparent"
            >
              <motion.span
                whileTap={{ scale: 0.86 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
                className="flex size-11 items-center justify-center rounded-full bg-muted text-foreground"
              >
                <HugeiconsIcon icon={item.icon} className="size-5 text-primary" strokeWidth={1.75} />
              </motion.span>
              <span className="text-[11px] font-medium lowercase text-foreground">
                {t(item.labelKey)}
              </span>
            </Button>
          </motion.div>
        ))}
      </motion.div>

      <Card className="hidden md:flex">
        <CardHeader className="border-b">
          <CardTitle>{t("dashboard.quickActions")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 pt-4">
          {actions.map((item) => (
            <Button
              key={item.href}
              variant={item.labelKey === "common.swap" ? "default" : "outline"}
              className="h-10 justify-start gap-2 rounded-xl px-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xs active:translate-y-0 active:scale-[0.98]"
              nativeButton={false}
              render={<Link href={item.href} />}
            >
              <HugeiconsIcon icon={item.icon} className="size-4" strokeWidth={1.75} />
              <span className="truncate text-sm font-medium">{t(item.labelKey)}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </>
  )
}
