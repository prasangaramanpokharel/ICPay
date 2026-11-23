"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import Image from "next/image"
import { PAGE_IMAGES } from "@/lib/public/page-images"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Particles } from "@/components/ui/particles"
import { ShineBorder } from "@/components/ui/shine-border"

import { cn } from "@/lib/ui/utils"
import { Gitlab, NextjsIcon, NpmIcon } from "@dev.icons/react"

export function HeroSection() {
  const t = useTranslations("publicSite.icfalcon.hero")
  const { resolvedTheme } = useTheme()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"curl" | "npm">("curl")
  const color = resolvedTheme === "dark" ? "#ffffff" : "#000000"

  const curlCommand = "curl -sSL https://icpay.app/flc/install.sh | bash"
  const npmCommand = "npm create icfalcon@latest my-app"
  const activeCommand = activeTab === "curl" ? curlCommand : npmCommand

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden border-b border-border/60 bg-background px-4 py-16 text-center">
      <Particles
        className="absolute inset-0 z-0"
        quantity={120}
        ease={80}
        color={color}
        refresh
      />

      <div className="relative z-10 mx-auto max-w-5xl space-y-8">
        <div className="flex justify-center">
          <div className="relative mx-auto flex w-full max-w-[200px] sm:max-w-[240px] items-center justify-center">
            <Image
              src={PAGE_IMAGES.icfalcon.hero}
              alt={t("imageAlt")}
              title={t("imageAlt")}
              width={240}
              height={240}
              priority
              className="h-auto w-full max-w-[170px] sm:max-w-[210px] object-contain transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-foreground shadow-xs">
            <span className="size-1.5 rounded-full bg-success" />
            <span>Motoko 1.6.0</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-foreground shadow-xs">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>mo:core 2.6.1</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-foreground shadow-xs">
            <NextjsIcon size={13} className="size-3.5 shrink-0 rounded-full dark:invert" />
            <span>Next.js 15 + @icp-sdk</span>
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-b from-foreground via-foreground/90 to-foreground/45 bg-clip-text text-transparent sm:text-5xl md:text-6xl">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="mx-auto flex flex-col items-center space-y-3">
          <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 p-1 backdrop-blur-xs">
            <Button
              type="button"
              variant={activeTab === "curl" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("curl")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold h-7 transition-all",
                activeTab === "curl"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              curl (One-Liner)
            </Button>
            <Button
              type="button"
              variant={activeTab === "npm" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("npm")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold h-7 transition-all",
                activeTab === "npm"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              npm create
            </Button>
          </div>

          <div className="relative mx-auto flex w-full max-w-lg items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-2.5 shadow-sm backdrop-blur-xs">
            <ShineBorder
              shineColor={["var(--primary)", "var(--accent)", "var(--success)"]}
              borderWidth={1.2}
              duration={12}
            />
            <span className="font-mono text-xs sm:text-sm text-foreground select-all tracking-tight truncate">
              {activeCommand}
            </span>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={handleCopy}
              className="size-7 shrink-0 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-colors"
              aria-label={t("copyCommand")}
            >
              <HugeiconsIcon
                icon={copied ? Tick02Icon : Copy01Icon}
                className={`size-4 transition-colors ${copied ? "text-primary" : "text-muted-foreground"}`}
              />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {activeTab === "curl" ? "One command to install and initialize on macOS / Linux / WSL" : t("installHint")}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 pt-6 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="gap-2 rounded-full px-6 shadow-sm"
            nativeButton={false}
            render={
              <Link
                href="https://www.npmjs.com/package/create-icfalcon"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <NpmIcon size={16} />
            <span>{t("npm")}</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 rounded-full px-5"
            nativeButton={false}
            render={
              <Link
                href="https://gitlab.com/prasangapokharel/icfalcon"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <Gitlab size={16} />
            <span>GitLab</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-5"
            nativeButton={false}
            render={<Link href="/products/icFalcon/packages" />}
          >
            {t("packages")}
          </Button>
        </div>

        <div className="mt-14 w-full border-t border-border/40 pt-10 sm:mt-16 sm:pt-12">
          <div className="grid grid-cols-2 gap-8 text-left sm:grid-cols-4 md:gap-12">
            <div>
              <div className="tabular-nums text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl bg-linear-to-r from-primary via-primary/80 to-foreground bg-clip-text text-transparent">
                3,460+
              </div>
              <div className="mt-2 text-xs text-muted-foreground sm:text-sm">
                npm downloads
              </div>
            </div>
            <div>
              <div className="tabular-nums text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-foreground">
                117+
              </div>
              <div className="mt-2 text-xs text-muted-foreground sm:text-sm">
                Motoko packages
              </div>
            </div>
            <div>
              <div className="tabular-nums text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-foreground">
                18+
              </div>
              <div className="mt-2 text-xs text-muted-foreground sm:text-sm">
                CLI releases
              </div>
            </div>
            <div>
              <div className="tabular-nums text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-foreground">
                100%
              </div>
              <div className="mt-2 text-xs text-muted-foreground sm:text-sm">
                Layered architecture
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
