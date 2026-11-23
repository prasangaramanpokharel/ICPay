"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Copy01Icon,
  Tick02Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

const CLI_COMMANDS = [
  {
    cmd: "falcon setup:init",
    short: "falcon s:init",
    action: "Complete first-time setup: installs dependencies, starts replica, deploys canister, launches Next.js dev server",
    category: "Setup",
  },
  {
    cmd: "falcon setup:update",
    short: "falcon up",
    action: "Safe framework updater: syncs framework packages, agent skills, and linters without touching user code",
    category: "Updater",
  },
  {
    cmd: "falcon make:feature <Name>",
    short: "falcon m:f <Name>",
    action: "Scaffolds complete 4-tier module: API mixin, Service, Repository, Storage, Candid types, and Next.js UI panel",
    category: "Scaffold",
  },
  {
    cmd: "falcon make:canister <Name>",
    short: "falcon m:c <Name>",
    action: "Scaffolds an independent micro-canister wired to Falcon Universe event mesh",
    category: "Scaffold",
  },
  {
    cmd: "falcon backend:test",
    short: "falcon b:test",
    action: "Runs all Motoko backend unit tests with local replica isolation",
    category: "Backend",
  },
  {
    cmd: "falcon backend:deploy",
    short: "falcon b:deploy",
    action: "Deploys canister to target environment with interactive mainnet confirmation guard",
    category: "Backend",
  },
  {
    cmd: "falcon cycles:fund",
    short: "falcon y:fund",
    action: "Generates interactive terminal QR code to fund developer identity with ICP for cycles conversion",
    category: "Cycles",
  },
  {
    cmd: "falcon prod:check",
    short: "falcon p:check",
    action: "Comprehensive production audit: skills validation + Motoko code audit + canister build + Next.js build",
    category: "Audit",
  },
]

export function CliSection() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null)

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd)
    setCopiedCmd(cmd)
    setTimeout(() => setCopiedCmd(null), 2000)
  }

  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center space-y-3 mb-14 md:mb-16"
        >
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            Developer Tooling
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            The Global falcon Ops CLI
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            One unified executable replaces fragmented dfx, mops, npm, and bash scripts. Every command comes with high-speed short aliases.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="grid gap-4 md:grid-cols-2 mb-10"
        >
          {CLI_COMMANDS.map((item) => (
            <Card key={item.cmd} className="border-border/60 bg-card/60 backdrop-blur-xs transition-colors hover:border-primary/40">
              <CardHeader className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-foreground">{item.cmd}</span>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {item.short}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-7 p-0 shrink-0"
                    onClick={() => handleCopy(item.short)}
                    aria-label={`Copy ${item.short}`}
                  >
                    <HugeiconsIcon
                      icon={copiedCmd === item.short ? Tick02Icon : Copy01Icon}
                      className={`size-3.5 ${copiedCmd === item.short ? "text-success" : "text-muted-foreground"}`}
                    />
                  </Button>
                </div>
                <CardDescription className="text-xs leading-relaxed">
                  {item.action}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
          className="flex justify-center"
        >
          <Button
            variant="outline"
            className="gap-2 rounded-full border-border/70 hover:border-border"
            nativeButton={false}
            render={
              <Link href="/products/icFalcon/commands" className="flex items-center gap-2">
                <span>Explore All 24+ Falcon Commands</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
              </Link>
            }
          />
        </motion.div>
      </div>
    </section>
  )
}
