"use client"

import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  GlobalIcon,
  Message01Icon,
  CpuIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

const MESH_PRIMITIVES = [
  {
    icon: Message01Icon,
    title: "Transactional Outbox Pattern",
    description: "Mutations and outgoing event notifications commit atomically inside the same canister update call, preventing lost events.",
  },
  {
    icon: CheckmarkCircle02Icon,
    title: "Idempotent Inboxes",
    description: "Every incoming event carries deterministic deduplication IDs, ensuring zero double-processing during transient subnet retries.",
  },
  {
    icon: CpuIcon,
    title: "Decoupled Micro-Canisters",
    description: "Split billing, order books, heavy analytics, and storage into isolated specialized canisters without coupling storage schemas.",
  },
]

const SCAFFOLD_CANISTER_CODE = `# Scaffold an independent micro-canister wired to Falcon Universe
falcon make:canister Vault

# Deploy to local replica
falcon backend:deploy --canister vault --local`

export function UniverseSection() {
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
            Multi-Canister Scaling
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Falcon Universe: Multi-Canister Event Mesh
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            When dApps scale beyond a single canister memory limit, Falcon Universe serves as an asynchronous, event-driven mesh — Kafka for the Internet Computer.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="grid gap-6 md:grid-cols-3 mb-12"
        >
          {MESH_PRIMITIVES.map((item, idx) => (
            <Card key={idx} className="border-border/60 bg-card/60 backdrop-blur-xs transition-colors hover:border-primary/40 hover:bg-card/90">
              <CardHeader>
                <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary mb-2">
                  <HugeiconsIcon icon={item.icon} className="size-5" />
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed mt-1">
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <Card className="border-border/60 bg-card/70 backdrop-blur-xs">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
              <HugeiconsIcon icon={GlobalIcon} className="size-4" />
              <span>Micro-Canister Scaffolding</span>
            </div>
            <CardTitle className="text-lg">Spawn New Canisters in Seconds</CardTitle>
            <CardDescription className="text-xs">
              Generate independent Rust or Motoko micro-canisters auto-registered with dfx.json and the event mesh.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={SCAFFOLD_CANISTER_CODE}
              language="bash"
              className="border-border/60"
            />
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </section>
  )
}
