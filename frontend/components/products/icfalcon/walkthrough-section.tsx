"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"

const SCAFFOLD_CODE = `# 1. Scaffold a full-stack feature slice
falcon make:feature Invoice

# Automatically generated files:
# ✓ backend/src/api/v1/Invoice.mo
# ✓ backend/src/services/InvoiceService.mo
# ✓ backend/src/repositories/InvoiceRepository.mo
# ✓ backend/src/storage/InvoiceStorage.mo
# ✓ backend/src/validators/InvoiceValidator.mo
# ✓ frontend/services/invoice/invoice.ts
# ✓ frontend/components/invoice/invoice-panel.tsx
# ✓ Wires Candid types into backend/src/main.mo`

const CHECK_CODE = `# 2. Run the complete production verification pipeline
falcon prod:check --local

# Terminal Output:
# ▸ prod:check (local)
# ==> validate-skills (.agent/skills)
# skills checked: 64 | errors: 0 | warnings: 0
# ok: validate-skills passed
#
# ==> Motoko Code Validator (IcFalcon Standard)
# Auditing 36 Motoko file(s)...
# ✓ backend/src/api/v1/Invoice.mo
# ✓ backend/src/services/InvoiceService.mo
# ✓ backend/src/repositories/InvoiceRepository.mo
# Files audited: 36 | Warnings: 0 | Errors: 0
# motoko-validator PASSED successfully!
#
# ==> Building with icp-cli (app)
# Canisters built successfully
#
# > next build
# ✓ Compiled successfully
# ✓ Generating static pages (5/5)
# ✓ Exporting static output to out/
#
# [✓ Production check PASSED (100%)]`

export function WalkthroughSection() {
  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mx-auto max-w-3xl text-center space-y-3 mb-16">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            Developer Experience
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Scaffold & Verify in Seconds
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            See how IcFalcon automates full-stack feature creation and validates all 4 tiers, AI skills, and Next.js builds in a single pipeline.
          </p>
        </div>

        <Card className="border-border/60 bg-card/70 backdrop-blur-xs">
          <CardHeader>
            <CardTitle className="text-lg">Real-World Walkthrough</CardTitle>
            <CardDescription className="text-xs">
              From scaffolding a new business module to 100% green production verification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              tabs={[
                {
                  label: "1. falcon make:feature Invoice",
                  code: SCAFFOLD_CODE,
                  language: "bash",
                },
                {
                  label: "2. falcon prod:check --local",
                  code: CHECK_CODE,
                  language: "bash",
                },
              ]}
              className="border-border/60"
            />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
