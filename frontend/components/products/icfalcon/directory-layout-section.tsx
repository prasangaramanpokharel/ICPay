"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileTree } from "@/components/ui/file-tree"
import type { FileTreeFile, FileTreeNode } from "@/lib/file-tree"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Folder01Icon,
  File01Icon,
  CheckmarkCircle02Icon,
  Layers01Icon,
} from "@hugeicons/core-free-icons"

type FileMetadata = {
  tag: string
  description: string
  invariant: string
}

const TREE_NODES: FileTreeNode<FileMetadata>[] = [
  {
    kind: "folder",
    name: ".agent",
    path: "/.agent",
    children: [
      {
        kind: "file",
        name: "SKILLS.md",
        path: "/.agent/SKILLS.md",
        data: {
          tag: "AI Router",
          description: "Hierarchical skills directory and entry point for coding agents (Cursor, Claude Code, Gemini CLI, Antigravity).",
          invariant: "Must link to all 64 domain skills without broken references.",
        },
      },
      {
        kind: "folder",
        name: "skills",
        path: "/.agent/skills",
        children: [
          {
            kind: "file",
            name: "layeringStandard.md",
            path: "/.agent/skills/layeringStandard.md",
            data: {
              tag: "Standard",
              description: "Enforces strict downward calls: api -> services -> repositories -> storage.",
              invariant: "API endpoints must never access storage directly.",
            },
          },
          {
            kind: "file",
            name: "codingStandard.md",
            path: "/.agent/skills/codingStandard.md",
            data: {
              tag: "Standard",
              description: "Motoko 1.6 and mo:core 2.6.1 rules; bans deprecated mo:base references.",
              invariant: "All files audited with falcon audit code:motoko.",
            },
          },
          {
            kind: "file",
            name: "financeStandard.md",
            path: "/.agent/skills/financeStandard.md",
            data: {
              tag: "Standard",
              description: "Subaccount derivation, two-phase safe transfers, and TxStore audit.",
              invariant: "Guarantees zero balance desync or double-spend risks.",
            },
          },
          {
            kind: "file",
            name: "ormStandard.md",
            path: "/.agent/skills/ormStandard.md",
            data: {
              tag: "Standard",
              description: "FalconORM 3NF schemas, auto-synchronized secondary indices, and fluent query builder.",
              invariant: "Replaces flat array linear scans with sub-millisecond indices.",
            },
          },
        ],
      },
    ],
  },
  {
    kind: "folder",
    name: "backend",
    path: "/backend",
    children: [
      {
        kind: "file",
        name: "mops.toml",
        path: "/backend/mops.toml",
        data: {
          tag: "Toolchain",
          description: "Pinned compiler and package registry dependencies (moc 1.6.0, mo:core 2.6.1).",
          invariant: "Automatically updated during falcon update.",
        },
      },
      {
        kind: "folder",
        name: "src",
        path: "/backend/src",
        children: [
          {
            kind: "file",
            name: "main.mo",
            path: "/backend/src/main.mo",
            data: {
              tag: "Actor",
              description: "Main canister actor composition combining all Candid mixin endpoints.",
              invariant: "Contains zero direct business logic; delegates to services.",
            },
          },
          {
            kind: "file",
            name: "types.mo",
            path: "/backend/src/types.mo",
            data: {
              tag: "Domain",
              description: "Shared domain records, ApiResult<T> variants, and error code enumerations.",
              invariant: "All public API responses wrap in Types.ApiResult.",
            },
          },
          {
            kind: "folder",
            name: "api/v1",
            path: "/backend/src/api/v1",
            children: [
              {
                kind: "file",
                name: "Order.mo",
                path: "/backend/src/api/v1/Order.mo",
                data: {
                  tag: "Tier 1: API",
                  description: "Thin Candid RPC endpoint mixin with caller validation and early error handling.",
                  invariant: "Destructures caller; rejects Principal.isAnonymous(caller).",
                },
              },
            ],
          },
          {
            kind: "folder",
            name: "services",
            path: "/backend/src/services",
            children: [
              {
                kind: "file",
                name: "OrderService.mo",
                path: "/backend/src/services/OrderService.mo",
                data: {
                  tag: "Tier 2: Service",
                  description: "Pure business logic, state mutations, and external ICRC-1 token transfers.",
                  invariant: "Coordinates repositories and ledger outcalls.",
                },
              },
            ],
          },
          {
            kind: "folder",
            name: "repositories",
            path: "/backend/src/repositories",
            children: [
              {
                kind: "file",
                name: "OrderRepository.mo",
                path: "/backend/src/repositories/OrderRepository.mo",
                data: {
                  tag: "Tier 3: Repo",
                  description: "FalconORM models, secondary index synchronization, and filtering queries.",
                  invariant: "Only layer permitted to interact with storage.",
                },
              },
            ],
          },
          {
            kind: "folder",
            name: "storage",
            path: "/backend/src/storage",
            children: [
              {
                kind: "file",
                name: "OrderStorage.mo",
                path: "/backend/src/storage/OrderStorage.mo",
                data: {
                  tag: "Tier 4: Storage",
                  description: "Enhanced Orthogonal Persistence (EOP) collections in stable canister memory.",
                  invariant: "Guarantees zero serialization loss across upgrades.",
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    kind: "folder",
    name: "frontend",
    path: "/frontend",
    children: [
      {
        kind: "folder",
        name: "app",
        path: "/frontend/app",
        children: [
          {
            kind: "file",
            name: "layout.tsx",
            path: "/frontend/app/layout.tsx",
            data: {
              tag: "Root Layout",
              description: "Root layout providing AuthProvider, ThemeProvider, and global toast notifications.",
              invariant: "Supports Next.js 15 static export without SSR runtime.",
            },
          },
          {
            kind: "file",
            name: "page.tsx",
            path: "/frontend/app/page.tsx",
            data: {
              tag: "Page",
              description: "Full-stack dashboard with real-time on-chain balances and activity streams.",
              invariant: "Composed from feature panels under components/.",
            },
          },
        ],
      },
      {
        kind: "folder",
        name: "lib/auth",
        path: "/frontend/lib/auth",
        children: [
          {
            kind: "file",
            name: "config.ts",
            path: "/frontend/lib/auth/config.ts",
            data: {
              tag: "Auth Lib",
              description: "Production authentication configuration with @icp-sdk/auth/client v11+.",
              invariant: "Strict object signature for identityProvider.",
            },
          },
        ],
      },
    ],
  },
  {
    kind: "folder",
    name: "ops",
    path: "/ops",
    children: [
      {
        kind: "file",
        name: "falcon",
        path: "/ops/falcon",
        data: {
          tag: "CLI Executable",
          description: "Global CLI runner unifying scaffolding, compilation, test suites, and deployments.",
          invariant: "Executable binary accessible globally via ~/.local/bin/falcon.",
        },
      },
    ],
  },
  {
    kind: "file",
    name: "falcon.yaml",
    path: "/falcon.yaml",
    data: {
      tag: "Configuration",
      description: "Declarative command aliases and execution matrix for the global falcon CLI.",
      invariant: "Configures both long names and short aliases.",
    },
  },
]

export function DirectoryLayoutSection() {
  const [selectedFile, setSelectedFile] = React.useState<FileTreeFile<FileMetadata>>({
    kind: "file",
    name: "Order.mo",
    path: "/backend/src/api/v1/Order.mo",
    data: {
      tag: "Tier 1: API",
      description: "Thin Candid RPC endpoint mixin with caller validation and early error handling.",
      invariant: "Destructures caller; rejects Principal.isAnonymous(caller).",
    },
  })

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
            Clean Organization
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Predictable Project Directory Layout
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Explore the standard IcFalcon repository tree. Click any file to inspect its architectural layer, purpose, and strict isolation invariants.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="grid gap-6 lg:grid-cols-12 items-start"
        >
          <Card className="lg:col-span-6 border-border/60 bg-card/70 backdrop-blur-xs shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Folder01Icon} className="size-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">Repository Explorer</CardTitle>
                </div>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  Interactive Tree
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <ScrollArea className="h-[420px] pr-3">
                <FileTree
                  nodes={TREE_NODES}
                  selectedPath={selectedFile.path}
                  onSelect={(file) => setSelectedFile(file)}
                  defaultExpandedDepth={2}
                  label="IcFalcon Project Layout"
                />
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="lg:col-span-6 border-border/60 bg-card/70 backdrop-blur-xs shadow-sm h-full flex flex-col justify-between">
            <div>
              <CardHeader className="pb-4 border-b border-border/50">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-xs">
                    {selectedFile.data.tag}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground truncate">
                    {selectedFile.path}
                  </span>
                </div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HugeiconsIcon icon={File01Icon} className="size-5 text-primary" />
                  <span>{selectedFile.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Purpose & Functionality
                  </h4>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {selectedFile.data.description}
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-success" />
                    <span>Layer Invariant:</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                    {selectedFile.data.invariant}
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-card/90 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1">
                    <HugeiconsIcon icon={Layers01Icon} className="size-4" />
                    <span>Scaffold Generator</span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">
                    Generated automatically with: falcon make:feature &lt;Name&gt;
                  </p>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
