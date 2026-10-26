"use client"

import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"

export function AcademyStatsBanner() {
  const stats = [
    {
      value: "42+ Hours",
      label: "Technical Curriculum",
      description: "Step-by-step video masterclasses and deep architectural walkthroughs",
    },
    {
      value: "50+ Labs",
      label: "Production Canister Demos",
      description: "Deployable Motoko and Rust repos with PocketIC automated tests",
    },
    {
      value: "100% On-Chain",
      label: "Verifiable Credentials",
      description: "Cryptographically proven to your Internet Identity caller principal",
    },
    {
      value: "0 Egress",
      label: "Zero Bandwidth Fees",
      description: "Learn cloud models that eliminate unpredictable AWS data transfer invoices",
    },
  ]

  return (
    <section className="border-b border-border/60 bg-muted/20 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
            >
              <Card className="h-full border-border/70 bg-card p-5 shadow-xs">
                <CardContent className="space-y-1.5 p-0">
                  <p className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                    {stat.value}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {stat.label}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
