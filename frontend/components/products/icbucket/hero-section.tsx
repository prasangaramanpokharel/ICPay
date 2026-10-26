"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { motion } from "motion/react"
import { HeroSignOptions } from "@/components/public/hero-sign-options"
import { Button } from "@/components/ui/button"
import { MetatronsCubeSvg } from "@/components/ui/svg-shapes-animated"
import { Gitlab } from "@dev.icons/react"

export function HeroSection() {
  const t = useTranslations("publicSite.icbucket.hero")
  const [replayKey, setReplayKey] = useState<number>(0)

  return (
    <section className="border-b border-border/60 bg-background relative overflow-hidden">

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-6 md:py-20 lg:py-24 lg:grid-cols-2 lg:items-center lg:gap-16 relative z-10">
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
              className="gap-2 rounded-full px-5 cursor-pointer font-medium"
              nativeButton={false}
              render={
                <Link
                  href="https://gitlab.com/prasangapokharel/icbucket"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <Gitlab size={16} />
              <span>GitLab</span>
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
          <div
            onClick={() => setReplayKey((k) => k + 1)}
            title="Click to replay slow animation"
            className="relative mx-auto flex aspect-square w-full max-w-md sm:max-w-lg lg:max-w-xl items-center justify-center bg-transparent cursor-pointer select-none group"
          >
            <div className="pointer-events-none absolute -inset-6 rounded-full bg-[radial-gradient(circle_at_center,var(--primary)/18,transparent_70%)] blur-3xl transition-opacity duration-700 group-hover:opacity-100" />

            <motion.div
              key={replayKey}
              animate={{ y: [-5, 5, -5], rotate: [-0.3, 0.3, -0.3] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-full h-full flex items-center justify-center drop-shadow-[0_0_24px_rgba(244,63,94,0.25)] dark:drop-shadow-[0_0_36px_rgba(244,63,94,0.45)] transition-all duration-500"
            >
              <MetatronsCubeSvg
                tightViewBox
                themed
                duration={2.6}
                staggerDelay={0.02}
                className="w-full h-full max-w-full max-h-full"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
