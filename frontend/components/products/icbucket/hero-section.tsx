"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { HeroSignOptions } from "@/components/public/hero-sign-options"
import { Button } from "@/components/ui/button"
import { OnboardBucketHeroPill } from "@/components/bucket/onboard-bucket-hero-pill"

export function HeroSection() {
  const t = useTranslations("publicSite.icbucket.hero")

  return (
    <section className="border-b border-border/60 bg-background relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-8 md:px-6 md:pt-10 md:pb-10 lg:pt-12 lg:pb-12 relative z-10">
        <div className="mb-8 flex justify-center w-full sm:mb-10">
          <OnboardBucketHeroPill />
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="space-y-6">
            <p className="shimmer text-xs font-semibold uppercase tracking-[0.24em] text-primary shimmer-duration-3000">
              {t("eyebrow")}
            </p>
            <h1 className="max-w-xl text-4xl font-extrabold tracking-tight bg-linear-to-b from-foreground via-foreground/90 to-foreground/45 bg-clip-text text-transparent md:text-5xl lg:text-[3.35rem] lg:leading-[1.06]">
              {t("title")}
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              {t("tagline")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-full px-6 cursor-pointer font-semibold shadow-md"
                nativeButton={false}
                render={<Link href="/bucket" />}
              >
                {t("tryIcBucket")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-5 cursor-pointer font-medium"
                nativeButton={false}
                render={<Link href="/bucket/docs" />}
              >
                Docs
              </Button>
            </div>
            <HeroSignOptions />
          </div>

          <div className="flex items-center justify-center w-full">
            <div className="relative mx-auto flex aspect-square w-full max-w-md sm:max-w-lg lg:max-w-xl items-center justify-center select-none">
              <Image
                src="/images/logo/icbucket/icbucket.png"
                alt="ICBucket Logo"
                width={600}
                height={600}
                priority
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 w-full border-t border-border/40 pt-6 sm:mt-10 sm:pt-8">
          <div className="grid grid-cols-2 gap-8 text-left sm:grid-cols-4 md:gap-12">
            <div>
              <div className="tabular-nums text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl bg-linear-to-r from-primary via-primary/80 to-foreground bg-clip-text text-transparent">
                1,390+
              </div>
              <div className="mt-2 text-xs text-muted-foreground sm:text-sm">
                npm downloads
              </div>
            </div>
            <div>
              <div className="tabular-nums text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-foreground">
                400 GB
              </div>
              <div className="mt-2 text-xs text-muted-foreground sm:text-sm">
                Canister storage capacity
              </div>
            </div>
            <div>
              <div className="tabular-nums text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-foreground">
                $0
              </div>
              <div className="mt-2 text-xs text-muted-foreground sm:text-sm">
                Egress & bandwidth fees
              </div>
            </div>
            <div>
              <div className="tabular-nums text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-foreground">
                100%
              </div>
              <div className="mt-2 text-xs text-muted-foreground sm:text-sm">
                S3 API compatible
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
