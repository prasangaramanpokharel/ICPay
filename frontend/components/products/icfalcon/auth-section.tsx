"use client"

import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { Icon } from "@/components/ui/icon"
import { FingerprintPatternGlassIcon, SmartphoneGlassIcon, GlobeGlassIcon, RefreshCwGlassIcon } from "@thesvg/ui-react"

const AUTH_PILLARS = [
  {
    icon: FingerprintPatternGlassIcon,
    title: "Passkeys & Internet Identity",
    description: "Hardware-level biometric sign-in via WebAuthn (TouchID, FaceID, YubiKey) with zero seed phrases or passwords.",
  },
  {
    icon: GlobeGlassIcon,
    title: "Federated Web3 OpenID",
    description: "Frictionless onboarding for non-crypto users via Google, Apple, and Microsoft single sign-on backed by Internet Identity.",
  },
  {
    icon: SmartphoneGlassIcon,
    title: "Dual-Transport Architecture",
    description: "Desktop popups (window) and mobile redirects (redirect) with automatic URL-hash session resumption on iOS Safari and Android Chrome.",
  },
  {
    icon: RefreshCwGlassIcon,
    title: "Self-Healing Session Hydration",
    description: "Probes the backend canister on mount. If a stored delegation has expired or network changed, it gracefully refreshes or clears.",
  },
]

const AUTH_CLIENT_CODE = `import { AuthClient } from "@icp-sdk/auth/client";

const authClient = new AuthClient({
  identityProvider: {
    authorizeUrl: "https://identity.ic0.app",
    canisterId: "rdmx6-jaaaa-aaaaa-aaadq-cai",
  },
  agentOptions: { host: "https://icp-api.io" },
  windowOpenerFeatures: "toolbar=0,location=0,menubar=0,width=500,height=700",
});`

const HYDRATION_CODE = `try {
  const client = await createAuthClient();
  if (client.isAuthenticated()) {
    const id = await client.getIdentity();
    await openBackendSession(id);
    setIdentity(id);
  }
} catch {
  await discardRejectedSession();
}`

export function AuthSection() {
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
            Authentication Standard
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Production-Ready Auth with @icp-sdk/auth
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Eliminates legacy @dfinity runtime TypeErrors, broken popup blocks on mobile devices, and delegation expiry edge-cases.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12"
        >
          {AUTH_PILLARS.map((pillar, idx) => (
            <Card key={idx} className="border-border/60 bg-card/60 backdrop-blur-xs transition-colors hover:border-primary/40 hover:bg-card/90">
              <CardHeader>
                <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary mb-2">
                  <Icon icon={pillar.icon} className="size-5" />
                </div>
                <CardTitle className="text-base">{pillar.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed mt-1">
                  {pillar.description}
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
            <CardTitle className="text-lg">Modern Client Setup & Self-Healing Pattern</CardTitle>
            <CardDescription className="text-xs">
              Direct implementation patterns built into every IcFalcon scaffold.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              tabs={[
                {
                  label: "1. Client Signature (@icp-sdk/auth/client)",
                  code: AUTH_CLIENT_CODE,
                  language: "typescript",
                },
                {
                  label: "2. Self-Healing Hydration (auth-provider.tsx)",
                  code: HYDRATION_CODE,
                  language: "typescript",
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
