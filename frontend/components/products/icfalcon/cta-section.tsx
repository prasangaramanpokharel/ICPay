"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShineBorder } from "@/components/ui/shine-border"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Copy01Icon,
  Tick02Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { NpmIcon } from "@dev.icons/react"

export function CtaSection() {
  const [copiedCurl, setCopiedCurl] = useState(false)
  const [copiedRaw, setCopiedRaw] = useState(false)

  const curlCmd = "npm create icfalcon@latest my-app"
  const rawEndpoint = "curl -fsSL https://raw.githubusercontent.com/prasangaramanpokharel/icfalcon/main/docs/landing/fullcontentwithrawendpointofgithubdata.md"

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCmd)
    setCopiedCurl(true)
    setTimeout(() => setCopiedCurl(false), 2000)
  }

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(rawEndpoint)
    setCopiedRaw(true)
    setTimeout(() => setCopiedRaw(false), 2000)
  }

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="relative overflow-hidden border-border/80 bg-gradient-to-b from-card via-card to-muted/20 p-8 md:p-12 text-center shadow-xl">
            <ShineBorder
              borderWidth={1.5}
              duration={14}
              shineColor={["var(--primary)", "var(--accent)", "var(--success)"]}
              className="opacity-40"
            />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                Ready to Ship
              </Badge>

              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
                Build Your Next dApp with IcFalcon
              </h2>

              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Scaffold full-stack Motoko canisters, Next.js UI with Internet Identity, 3NF FalconORM queries, and 64 AI agent skills in 60 seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/80 px-4 py-2 font-mono text-xs text-foreground shadow-xs backdrop-blur-xs w-full sm:w-auto justify-between">
                  <span>{curlCmd}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCurl}
                    className="size-6 p-0 shrink-0 ml-2"
                    aria-label="Copy install command"
                  >
                    <HugeiconsIcon
                      icon={copiedCurl ? Tick02Icon : Copy01Icon}
                      className={`size-3.5 ${copiedCurl ? "text-success" : "text-muted-foreground"}`}
                    />
                  </Button>
                </div>

                <Button
                  className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold"
                  nativeButton={false}
                  render={
                    <Link
                      href="https://github.com/prasangaramanpokharel/icfalcon#readme"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <span>Read GitHub Docs</span>
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                    </Link>
                  }
                />
              </div>

              <div className="pt-4 border-t border-border/50 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyRaw}
                  className="gap-2 rounded-full border-border/60 text-xs"
                >
                  <HugeiconsIcon
                    icon={copiedRaw ? Tick02Icon : Copy01Icon}
                    className={`size-3.5 ${copiedRaw ? "text-success" : "text-muted-foreground"}`}
                  />
                  <span>Copy Raw Markdown API Endpoint</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-xs text-muted-foreground hover:text-foreground"
                  nativeButton={false}
                  render={
                    <Link
                      href="https://www.npmjs.com/package/create-icfalcon"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <NpmIcon className="size-4" />
                      <span>create-icfalcon</span>
                    </Link>
                  }
                />

                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-xs text-muted-foreground hover:text-foreground"
                  nativeButton={false}
                  render={
                    <Link
                      href="https://www.npmjs.com/package/icfalcon"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <NpmIcon className="size-4" />
                      <span>icfalcon CLI</span>
                    </Link>
                  }
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
