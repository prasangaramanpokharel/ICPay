"use client"

import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { Icon } from "@/components/ui/icon"
import { BrainGlassIcon, CircleCheckGlassIcon } from "@thesvg/ui-react"

const SKILL_DOMAINS = [
  {
    name: "layeringStandard",
    scope: "Strict 4-tier separation: api -> services -> repositories -> storage",
  },
  {
    name: "codingStandard",
    scope: "Motoko 1.6 & mo:core 2.6.1 standards, no deprecated mo:base",
  },
  {
    name: "financeStandard",
    scope: "Subaccount derivation, two-phase safe transfers, TxStore audit",
  },
  {
    name: "ormStandard",
    scope: "FalconORM 3NF schemas, auto-synchronized secondary indices",
  },
  {
    name: "errorHandlingStandard",
    scope: "Types.ApiResult<T>, early validation returns, M0033 shared return safety",
  },
  {
    name: "motokoStandard",
    scope: "Compiler rules, reserved keyword collisions (#dbg vs #debug), HTTP outcalls",
  },
]

const VALIDATE_CODE = `# Validate all 64 agent skills, YAML headers, and internal schemas
falcon skills:validate

# Audit all Motoko code for layering and mo:core compliance
falcon audit code:motoko`

export function AgentSkillsSection() {
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
            AI-Native Engineering
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            64 Autonomous AI Agent Skills Built In
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            IcFalcon is designed for Cursor, Claude Code, Gemini CLI, and Antigravity. 64 verified architectural skills prevent AI coding agents from hallucinating deprecated Motoko APIs or invalid patterns.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-12 mb-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-7 space-y-3"
          >
            <div className="mb-2">
              <h3 className="text-base font-semibold text-foreground">
                Core Standard Domains (.agent/skills/)
              </h3>
              <p className="text-xs text-muted-foreground">
                Checked into repository root and automatically discovered by modern coding assistants.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {SKILL_DOMAINS.map((domain) => (
                <Card key={domain.name} className="border-border/60 bg-card/60 backdrop-blur-xs transition-colors hover:border-primary/40">
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon icon={CircleCheckGlassIcon} className="size-4 text-primary shrink-0" />
                      <CardTitle className="font-mono text-xs font-bold text-foreground">
                        {domain.name}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs leading-relaxed">
                      {domain.scope}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-5 space-y-4"
          >
            <Card className="border-border/60 bg-card/70 backdrop-blur-xs">
              <CardHeader>
                <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
                  <Icon icon={BrainGlassIcon} className="size-4" />
                  <span>Agent Linter & Validator</span>
                </div>
                <CardTitle className="text-lg">One-Command Quality Gate</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Enforce skills consistency and audit code before staging or deploying to mainnet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={VALIDATE_CODE}
                  language="bash"
                  className="border-border/60"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
