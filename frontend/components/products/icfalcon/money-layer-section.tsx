"use client"

import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { Icon } from "@/components/ui/icon"
import { CoinsGlassIcon, ShieldGlassIcon, LockGlassIcon, CircleCheckGlassIcon, UserCheckGlassIcon } from "@thesvg/ui-react"

const PROTOCOL_STEPS = [
  {
    step: "01",
    title: "Propose Transfer",
    actor: "Client -> Canister",
    description: "Client calls proposeTransfer. Canister validates available user balance (amount + fee) and locks the amount with a unique transferId.",
    icon: LockGlassIcon,
  },
  {
    step: "02",
    title: "Human Confirmation",
    actor: "Human in the Loop",
    description: "Client displays a clear confirmation preview. The user reviews destination principal, subaccount, and transparent ledger fee.",
    icon: UserCheckGlassIcon,
  },
  {
    step: "03",
    title: "Execute ICRC-1 Outcall",
    actor: "Canister -> Ledger",
    description: "Canister invokes the ledger canister with idempotency memo. Upon success, the internal balance deducts and returns the block index.",
    icon: CoinsGlassIcon,
  },
  {
    step: "04",
    title: "Atomic Receipt",
    actor: "Dual-Entry Audit",
    description: "Transaction records into immutable on-chain history with status #completed, guaranteeing zero double-spends or balance leakage.",
    icon: CircleCheckGlassIcon,
  },
]

const SUBACCOUNT_CODE = `import Subaccount "mo:subaccount";

let depositSubaccount = Subaccount.fromPrincipal(userPrincipal);`

export function MoneyLayerSection() {
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
            The Money Layer
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Custodial Wallets & Safe ICRC Token Transfers
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Derived from battle-tested financial primitives running on ICPay mainnet. Protect user assets from re-entrancy traps, unconfirmed transfers, and balance desync.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="grid gap-6 lg:grid-cols-12 mb-12 items-center"
        >
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-border/60 bg-card/70 backdrop-blur-xs">
              <CardHeader>
                <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
                  <Icon icon={ShieldGlassIcon} className="size-4" />
                  <span>Subaccount Derivation</span>
                </div>
                <CardTitle className="text-lg">Deterministic User Accounts</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Every user gets a deterministic 32-byte subaccount derived strictly from their authenticated caller principal. No private keys or seed phrases stored on-chain.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3 font-mono text-xs text-foreground mb-4">
                  Subaccount = SHA224(Principal) ‖ Checksum
                </div>
                <CodeBlock
                  code={SUBACCOUNT_CODE}
                  language="motoko"
                  className="border-border/60"
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="mb-2">
              <h3 className="text-base font-semibold text-foreground">
                Two-Phase Safe Transfer Protocol Flow
              </h3>
              <p className="text-xs text-muted-foreground">
                Prevents premature ledger deductions during network timeouts or upgrade pauses.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {PROTOCOL_STEPS.map((step) => (
                <Card key={step.step} className="border-border/60 bg-card/60 backdrop-blur-xs transition-colors hover:border-primary/40">
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">{step.step}</span>
                        <CardTitle className="text-sm font-semibold">{step.title}</CardTitle>
                      </div>
                      <Icon icon={step.icon} className="size-4 text-muted-foreground" />
                    </div>
                    <span className="text-[11px] font-medium text-primary/80 block">{step.actor}</span>
                    <CardDescription className="text-xs leading-relaxed mt-1">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
