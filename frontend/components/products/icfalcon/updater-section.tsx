"use client"

import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { Icon } from "@/components/ui/icon"
import { RefreshCwGlassIcon } from "@thesvg/ui-react"

const GUARANTEES = [
  {
    target: "backend/src/ (Your Code)",
    status: "100% UNTOUCHED",
    description: "Custom canister services, APIs, and business models are completely preserved.",
  },
  {
    target: "frontend/ (Your UI)",
    status: "100% UNTOUCHED",
    description: "Pages, components, and Tailwind styling are never overwritten during framework updates.",
  },
  {
    target: "Canister State & .env",
    status: "100% UNTOUCHED",
    description: "Live canister storage, identity keys, and environment secrets remain completely safe.",
  },
  {
    target: "Tooling & Skills",
    status: "UPGRADED AUTOMATICALLY",
    description: "ops/ scripts, .agent/skills/, and hub packages update to the latest compiler standards.",
  },
]

const UPDATE_CODE = `# Update framework tooling, agent skills, and linters
falcon update

# or use the short alias:
falcon up`

export function UpdaterSection() {
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
            Continuous Evolution
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Zero-Friction Updates with falcon up
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Never get stuck on an outdated boilerplate. Update framework tooling and compiler pins with a single command while your business logic remains 100% protected.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-12 mb-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-5 space-y-4"
          >
            <Card className="border-border/60 bg-card/70 backdrop-blur-xs">
              <CardHeader>
                <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
                  <Icon icon={RefreshCwGlassIcon} className="size-4" />
                  <span>One-Command Sync</span>
                </div>
                <CardTitle className="text-lg">Stay on Latest Standards</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Pins mo:core 2.6.1 and moc 1.6.0 compiler dependencies automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={UPDATE_CODE}
                  language="bash"
                  className="border-border/60"
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-7 space-y-3"
          >
            <div className="mb-2">
              <h3 className="text-base font-semibold text-foreground">
                The IcFalcon Protection Guarantee
              </h3>
              <p className="text-xs text-muted-foreground">
                Strict separation between framework infrastructure and your application logic.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {GUARANTEES.map((g) => (
                <Card key={g.target} className="border-border/60 bg-card/60 backdrop-blur-xs transition-colors hover:border-primary/40">
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <CardTitle className="font-mono text-xs font-bold text-foreground truncate">
                        {g.target}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                        {g.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs leading-relaxed mt-1">
                      {g.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
