"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HeroSignOptions } from "@/components/public/hero-sign-options"
import { Button } from "@/components/ui/button"
import {
  Globe,
  DEFAULT_COUNTRY_NODES,
  type GlobeCountryNode,
} from "@/components/ui/globe"
import { LocaleFlag } from "@/components/i18n/locale-flag"
import { cn } from "@/lib/ui/utils"
import { Gitlab } from "@dev.icons/react"

export function HeroSection() {
  const t = useTranslations("publicSite.icbucket.hero")
  const [selectedCountry, setSelectedCountry] = useState<GlobeCountryNode | null>(null)

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-6 md:py-14 lg:grid-cols-2 lg:items-center lg:gap-16">
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
              className="rounded-full px-6"
              nativeButton={false}
              render={<Link href="/bucket" />}
            >
              {t("tryIcBucket")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 rounded-full px-5"
              nativeButton={false}
              render={
                <Link
                  href="https://gitlab.com/prasangapokharel/icpay"
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
              className="rounded-full px-5"
              nativeButton={false}
              render={<Link href="/bucket/docs" />}
            >
              Docs
            </Button>
          </div>
          <HeroSignOptions />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center bg-transparent lg:max-w-lg">
            <Globe
              selectedCountryId={selectedCountry?.id}
              onSelectCountry={setSelectedCountry}
            />
          </div>

          {/* Active Subnet Country Node Details */}
          {selectedCountry && (
            <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/85 p-3.5 shadow-sm backdrop-blur-md transition-all duration-300">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <LocaleFlag
                    country={selectedCountry.country}
                    label={selectedCountry.name}
                    size="md"
                    className="size-5 rounded-full object-cover shadow-xs shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground">
                        {selectedCountry.name}
                      </span>
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
                        Subnet Active
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{selectedCountry.region}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-right">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Capacity</span>
                    <span className="font-semibold text-foreground">{selectedCountry.nodes} Canisters</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Latency</span>
                    <span className="font-semibold text-emerald-400">{selectedCountry.latency}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Country Selector Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-md">
            {DEFAULT_COUNTRY_NODES.map((node) => {
              const isSelected = selectedCountry?.id === node.id
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedCountry(node)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all duration-200 cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary font-medium shadow-xs"
                      : "border-border/60 bg-muted/40 text-muted-foreground hover:border-border hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  <LocaleFlag
                    country={node.country}
                    label={node.name}
                    size="sm"
                    className="size-3.5 rounded-full object-cover shrink-0"
                  />
                  <span>{node.name.split(" ")[0]}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
