"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShineBorder } from "@/components/ui/shine-border"
import { Icon } from "@/components/ui/icon"
import { ArrowRightGlassIcon, ClockGlassIcon, ExternalLinkGlassIcon } from "@thesvg/ui-react"

export function CtaSection() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="relative rounded-3xl p-px">
          <Card className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-background p-8 md:p-14 text-center shadow-2xl">
            <ShineBorder
              borderWidth={1.5}
              duration={10}
              shineColor={["var(--primary)", "var(--accent)", "var(--success)"]}
            />

            <div className="mx-auto max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                <Icon icon={ClockGlassIcon} className="size-3.5" />
                Zero Infrastructure · Infinite Reliability
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
                Ready to Automate Your Workflows on Chain?
              </h2>

              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                Launch your first scheduled job in less than 30 seconds.
                Enjoy 60 free execution runs every month with no credit card required.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  size="lg"
                  className="rounded-xl px-7 font-semibold shadow-lg"
                  nativeButton={false}
                  render={<Link href="/login" />}
                >
                  Start Free with Internet Identity
                  <Icon icon={ArrowRightGlassIcon} className="size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl px-6 font-medium"
                  nativeButton={false}
                  render={
                    <Link
                      href="https://dashboard.internetcomputer.org/canister/uzt4z-lp777-77774-qaabq-cai"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <Icon icon={ExternalLinkGlassIcon} className="size-4" />
                  View Canister on icScan
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-muted-foreground">
                <span>✓ 60 free runs / month</span>
                <span>✓ No credit card required</span>
                <span>✓ $0.0005 per execution</span>
                <span>✓ Sub-second precision</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
