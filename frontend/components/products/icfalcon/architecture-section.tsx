"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Layers01Icon,
  Shield01Icon,
  DatabaseIcon,
  HardDriveIcon,
  ArrowDown01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

const TIERS = [
  {
    tier: "Tier 1",
    name: "API Layer",
    path: "backend/src/api/v1/",
    icon: Shield01Icon,
    summary: "Thin Candid endpoints & auth mixins",
    responsibilities: [
      "Caller destructuring: shared ({ caller }) func",
      "Rejects anonymous callers: Principal.isAnonymous(caller)",
      "Strict parameter validation and early Types.ApiResult errors",
      "Never touches database repositories or storage directly",
    ],
  },
  {
    tier: "Tier 2",
    name: "Service Layer",
    path: "backend/src/services/",
    icon: Layers01Icon,
    summary: "Pure business logic & orchestration",
    responsibilities: [
      "Coordinates complex state mutations and domain rules",
      "Direct ledger calls for ICRC-1 and ICRC-2 transfers",
      "Enforces two-phase safe transaction validation",
      "Mediates all communication with external canisters",
    ],
  },
  {
    tier: "Tier 3",
    name: "Repository Layer",
    path: "backend/src/repositories/",
    icon: DatabaseIcon,
    summary: "FalconORM models & relational access",
    responsibilities: [
      "Normalized 3NF relational data querying",
      "Atomic synchronization of secondary indices",
      "Pagination, compound sorting, and filtering logic",
      "Guarantees data isolation across entities",
    ],
  },
  {
    tier: "Tier 4",
    name: "Storage Layer",
    path: "backend/src/storage/",
    icon: HardDriveIcon,
    summary: "Orthogonal persistent memory",
    responsibilities: [
      "Enhanced Orthogonal Persistence (EOP) collections",
      "Zero serialization loss during canister Wasm upgrades",
      "Stable variable state partitions and safety guards",
      "In-place zero-copy upgrade migrations",
    ],
  },
]

const MOTOKO_ENDPOINT_CODE = `import Types "../../types";
import OrderService "../../services/OrderService";
import MiddlewareAuth "../../middleware/Auth";

mixin (
  service : OrderService.OrderService,
  mwConfig : MiddlewareAuth.Config,
) {
  public shared ({ caller }) func createOrder(
    productId : Text,
    quantity : Nat,
  ) : async Types.ApiResult<Types.OrderView> {
    let effectiveCaller = MiddlewareAuth.effectiveCaller(mwConfig, caller);
    if (Principal.isAnonymous(effectiveCaller)) {
      return #err({ code = 401; message = "Unauthorized: Anonymous callers rejected" });
    };

    await OrderService.create(service, effectiveCaller, productId, quantity);
  };
};`

export function ArchitectureSection() {
  const [selectedTier, setSelectedTier] = useState(0)

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
            Architecture Standard
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            The Enforced 4-Tier Backend Architecture
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            IcFalcon replaces monolithic Motoko actors with an enforced unidirectional architecture. Calls flow strictly downward from Candid endpoints to persistent storage.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="grid gap-8 lg:grid-cols-12 items-start"
        >
          <div className="lg:col-span-5 space-y-3">
            {TIERS.map((tier, idx) => {
              const isSelected = selectedTier === idx
              return (
                <div key={tier.name} className="relative">
                  <Card
                    onClick={() => setSelectedTier(idx)}
                    className={`cursor-pointer transition-all duration-200 border-border/60 ${
                      isSelected
                        ? "border-primary bg-card shadow-md ring-1 ring-primary/40"
                        : "bg-card/60 hover:bg-card/90"
                    }`}
                  >
                    <CardHeader className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${
                              isSelected
                                ? "border-primary bg-primary/15 text-primary"
                                : "border-border/60 bg-muted/40 text-muted-foreground"
                            }`}
                          >
                            <HugeiconsIcon icon={tier.icon} className="size-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-primary">{tier.tier}</span>
                              <CardTitle className="text-base">{tier.name}</CardTitle>
                            </div>
                            <CardDescription className="text-xs font-mono text-muted-foreground mt-0.5">
                              {tier.path}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                  {idx < TIERS.length - 1 && (
                    <div className="flex justify-center py-1">
                      <HugeiconsIcon icon={ArrowDown01Icon} className="size-4 text-muted-foreground/60" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Card className="border-border/60 bg-card/70 backdrop-blur-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {TIERS[selectedTier].tier} Deep Dive
                    </span>
                    <CardTitle className="text-xl">{TIERS[selectedTier].name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {TIERS[selectedTier].path}
                  </Badge>
                </div>
                <CardDescription className="text-sm pt-1">
                  {TIERS[selectedTier].summary}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Guaranteed Invariants:
                  </p>
                  <ul className="space-y-2">
                    {TIERS[selectedTier].responsibilities.map((r, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/90">
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          className="size-4 text-success shrink-0 mt-0.5"
                        />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Candid Mixin Endpoint Example:
                  </p>
                  <CodeBlock
                    code={MOTOKO_ENDPOINT_CODE}
                    language="motoko"
                    className="border-border/60"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
