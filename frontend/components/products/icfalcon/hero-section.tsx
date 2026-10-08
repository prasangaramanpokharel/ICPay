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

function GitLabIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="currentColor" {...props}>
      <path d="m23.6 9.58-1.02-3.14a.8.8 0 0 0-.3-.39.84.84 0 0 0-.49-.14.86.86 0 0 0-.5.15.82.82 0 0 0-.29.4L19.2 11.9H4.8L3 6.46a.82.82 0 0 0-.29-.4.86.86 0 0 0-.5-.15.84.84 0 0 0-.49.14.8.8 0 0 0-.3.39L.4 9.58a.9.9 0 0 0 .33 1l11.08 8.06a.37.37 0 0 0 .38 0L23.27 10.6a.9.9 0 0 0 .33-1.02Z"/>
    </svg>
  )
}

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

      <div className="relative z-10 mx-auto max-w-4xl space-y-8">
        <div className="flex justify-center">
          <div className="relative mx-auto flex w-full max-w-[200px] sm:max-w-[240px] items-center justify-center">
            <Image
              src={PAGE_IMAGES.icfalcon.hero}
              alt={t("imageAlt")}
              title={t("imageAlt")}
              width={240}
              height={160}
              priority
              className="h-auto w-full max-w-[170px] sm:max-w-[210px] object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-b from-foreground via-foreground/90 to-foreground/45 bg-clip-text text-transparent sm:text-5xl md:text-6xl">
            {t("title")}
          </h1>
          <p className="text-xl text-muted-foreground sm:text-2xl">{t("subtitle")}</p>
          <p className="text-base text-muted-foreground">{t("features")}</p>
        </div>

        <div className="mx-auto flex flex-col items-center space-y-3">
          <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 p-1 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => setActiveTab("curl")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "curl"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              curl (One-Liner)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("npm")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "npm"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              npm create
            </button>
          </div>

          <div className="relative mx-auto flex w-full max-w-lg items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-2.5 shadow-sm backdrop-blur-xs">
            <ShineBorder
              shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
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
            className="rounded-full px-6 shadow-sm"
            nativeButton={false}
            render={
              <Link
                href="https://www.npmjs.com/package/create-icfalcon"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            {t("npm")}
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
            <GitLabIcon />
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
      </div>
    </section>
  )
}
