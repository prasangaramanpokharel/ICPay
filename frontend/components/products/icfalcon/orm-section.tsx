"use client"

import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DatabaseIcon,
  Search01Icon,
  Link01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"

const ORM_FEATURES = [
  {
    icon: DatabaseIcon,
    title: "Normalized 3NF Models",
    description:
      "Eliminates flat array scans and redundant fields. Strongly typed Motoko schemas with automatic primary key validation.",
  },
  {
    icon: Search01Icon,
    title: "Auto-Synchronized Indices",
    description:
      "Secondary indices on foreign keys, statuses, and timestamps update atomically during inserts, updates, and deletes with zero manual sync.",
  },
  {
    icon: SparklesIcon,
    title: "Fluent Query Builder",
    description:
      "Chainable, type-safe API with .where(), .orderBy(), .limit(), and .offset() compiling to high-speed sub-millisecond lookups.",
  },
  {
    icon: Link01Icon,
    title: "Relational Navigation",
    description:
      "Built-in support for belongsTo and hasMany relations, making relational canister architecture feel like Rails ActiveRecord or Prisma.",
  },
]

const SCHEMA_CODE = `import ORM "mo:orm";

public type Order = {
  id : Text;
  userId : Principal;
  productId : Text;
  status : {#pending; #completed; #cancelled};
  amount : Nat;
  createdAt : Int;
};`

const QUERY_CODE = `let orders = OrderModel.query()
  .where(#userId(userPrincipal))
  .where(#status(#pending))
  .orderBy(#createdAt, #desc)
  .limit(20)
  .offset(0)
  .execute();`

export function OrmSection() {
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
            Relational Data Engine
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            FalconORM: 3NF Relational Engine for Motoko
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Stop managing raw arrays and bloated maps. FalconORM brings structured queries, atomic indexing, and normalized relationships directly to the Internet Computer.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12"
        >
          {ORM_FEATURES.map((feat, idx) => (
            <Card key={idx} className="border-border/60 bg-card/60 backdrop-blur-xs transition-colors hover:border-primary/40 hover:bg-card/90">
              <CardHeader>
                <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary mb-2">
                  <HugeiconsIcon icon={feat.icon} className="size-5" />
                </div>
                <CardTitle className="text-base">{feat.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed mt-1">
                  {feat.description}
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
            <CardTitle className="text-lg">Schema & Fluent Query Showcase</CardTitle>
            <CardDescription className="text-xs">
              Define entities and run indexed queries with zero boilerplates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              tabs={[
                {
                  label: "1. Model Schema (Order.mo)",
                  code: SCHEMA_CODE,
                  language: "motoko",
                },
                {
                  label: "2. Fluent Query Builder",
                  code: QUERY_CODE,
                  language: "motoko",
                },
              ]}
              className="border-border/60"
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </section>
  )
}
