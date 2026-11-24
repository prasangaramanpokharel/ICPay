"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Icon } from "@/components/ui/icon"
import { ArrowRightGlassIcon } from "@thesvg/ui-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function AcademyCta() {
  return (
    <section className="border-t border-border/60 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Card className="mx-auto max-w-4xl rounded-3xl border border-border/70 bg-card p-8 text-center md:p-14 shadow-sm">
            <CardContent className="space-y-6 p-0">
              <Badge variant="outline" className="px-3 py-1 text-xs">
                Zero Cost Start · On-Chain Credentials
              </Badge>

              <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
                Ready to Become an On-Chain Architect?
              </h2>

              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Start with open-access architecture lessons, deploy production canisters with PocketIC, and earn verifiable credentials for your developer profile.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  size="lg"
                  className="gap-2 rounded-full px-6 font-semibold shadow-md"
                  nativeButton={false}
                  render={<Link href="#courses" />}
                >
                  <span>Start Learning Now</span>
                  <Icon icon={ArrowRightGlassIcon} className="size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-5 font-medium"
                  nativeButton={false}
                  render={<Link href="/wallet" />}
                >
                  Open ICPay Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
