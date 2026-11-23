"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"

const TREE_LAYOUT = `.
├── .agent/                         # AI Agent Knowledge System
│   ├── SKILLS.md                   # Hierarchical router for coding agents
│   └── skills/                     # 64 verified engineering standards
├── backend/                        # Motoko Canister Backend
│   ├── mops.toml                   # Pinned dependencies (mo:core 2.6.1, moc 1.6.0)
│   ├── pkg/                        # Standard Hub packages (ORM, logger, saga, dao)
│   ├── src/                        # 4-Tier User Code (Untouched by updates)
│   │   ├── api/v1/                 # Public Candid mixins & caller validation
│   │   ├── services/               # Pure business logic & ledger integration
│   │   ├── repositories/           # FalconORM models & index queries
│   │   ├── storage/                # Orthogonal persistent stable memory
│   │   ├── middleware/             # Authentication & rate-limiting guards
│   │   ├── validators/             # Domain parameter validation
│   │   ├── main.mo                 # Main canister actor composition
│   │   └── types.mo                # Shared domain records & ApiResult variants
│   └── testing/                    # Comprehensive Motoko unit tests
├── frontend/                       # Next.js 15 Full-Stack UI
│   ├── app/                        # App Router (RSC & static export ready)
│   │   ├── (app)/page.tsx          # Main dashboard & wallet view
│   │   ├── (auth)/login/page.tsx   # Production auth view (Passkeys, Google, Apple)
│   │   └── layout.tsx              # Root layout with Tooltip & AuthProvider
│   ├── components/                 # shadcn/ui components & feature panels
│   ├── lib/auth/                   # Auth configuration, transport, & mobile redirect
│   └── services/                   # @icp-sdk actor client & auth service
├── ops/                            # Ops CLI Runner, Templates & Scripts
│   ├── falcon                      # Unified CLI executable
│   ├── install.sh                  # Global symlink installer
│   └── templates/                  # Scaffolding templates for modules & micro-canisters
├── falcon.yaml                     # Command & alias configuration
└── package.json                    # Root npm package metadata`

export function DirectoryLayoutSection() {
  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mx-auto max-w-3xl text-center space-y-3 mb-16">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            Clean Organization
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Predictable Project Directory Layout
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Every IcFalcon repository shares a standard layout. Onboarding new engineers or AI agents takes zero ramp-up time.
          </p>
        </div>

        <Card className="border-border/60 bg-card/70 backdrop-blur-xs">
          <CardHeader>
            <CardTitle className="text-lg">Full-Stack Monorepo Structure</CardTitle>
            <CardDescription className="text-xs">
              Clear separation between canister backend, Next.js frontend, AI skills, and ops tooling.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={TREE_LAYOUT}
              language="text"
              className="border-border/60 font-mono text-xs"
            />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
