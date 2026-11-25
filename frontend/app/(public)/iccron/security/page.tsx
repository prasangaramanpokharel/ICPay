import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import {
  ArrowLeftGlassIcon,
  ArrowRightGlassIcon,
  HeatShieldGlassIcon,
  LockGlassIcon,
  ServerGlassIcon,
  CircleAlertGlassIcon,
  ExternalLinkGlassIcon,
  ApiKeyGlassIcon,
  GlobeLockGlassIcon,
} from "@thesvg/ui-react"
import { PAGE_IMAGES, pageImageUrl } from "@/lib/public/page-images"

export const metadata: Metadata = {
  title: "icCron Security Architecture | ICPay",
  description:
    "How icCron secures autonomous on-chain cron scheduling: SHA-256 hashed project-scoped API keys, SSRF protection, subnet HTTPS outcall consensus, and circuit breakers.",
  openGraph: {
    title: "icCron Security Architecture | ICPay",
    description:
      "Defense-in-depth security model for icCron on the Internet Computer: zero plaintext keys, strict SSRF filtering, and deterministic subnet consensus.",
    url: "https://icpay.app/iccron/security",
    siteName: "ICPay",
    images: [
      {
        url: pageImageUrl(PAGE_IMAGES.iccron.og),
        width: 1254,
        height: 1254,
        alt: "icCron Security Architecture",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "https://icpay.app/iccron/security",
  },
}

const SECURITY_PILLARS = [
  {
    icon: ApiKeyGlassIcon,
    badge: "SHA-256 Hashed",
    title: "Project-Scoped API Keys",
    description:
      "API keys (icp_cron_...) are hashed with SHA-256 before persistence. Raw secrets are shown once at creation and every HTTP request is strictly scoped to that key's project_id and owner.",
  },
  {
    icon: HeatShieldGlassIcon,
    badge: "SSRF Guard",
    title: "Strict Target URL Validation",
    description:
      "Every HttpWebhook target must use HTTPS and passes SSRF validation rejecting localhost, 127.0.0.1, ::1, private RFC 1918 networks, and cloud metadata endpoints (169.254.169.254).",
  },
  {
    icon: ServerGlassIcon,
    badge: "Threshold Consensus",
    title: "Deterministic Subnet Outcalls",
    description:
      "HTTPS outcalls execute across independent Internet Computer subnet nodes and pass through transform_http_response to strip non-deterministic headers before consensus.",
  },
  {
    icon: LockGlassIcon,
    badge: "Internet Identity",
    title: "Principal-Gated Control Plane",
    description:
      "Project creation, renaming, API key issuance, and credit purchases require authenticated Internet Identity callers. Anonymous principals are rejected at the canister boundary.",
  },
  {
    icon: CircleAlertGlassIcon,
    badge: "Circuit Breaker",
    title: "Dead Letter Queue & Auto-Pause",
    description:
      "Jobs exceeding max_retries are automatically moved out of the active timer queue into Dead Letter Queue or AutoPausedDormant states to prevent runaway cycle burn.",
  },
  {
    icon: GlobeLockGlassIcon,
    badge: "Stable Memory",
    title: "Upgrade-Safe Rust State",
    description:
      "Projects, jobs, schedules, API keys, and execution logs reside in ic-stable-structures BTreeMaps so Wasm upgrades preserve state deterministically without heap migration risk.",
  },
]

export default function IcCronSecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border/60 bg-background py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-4 md:px-6 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/iccron" />}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Icon icon={ArrowLeftGlassIcon} className="size-3.5" />
              Back to icCron
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <Link
                    href="https://dashboard.internetcomputer.org/canister/w2fxo-5qaaa-aaaan-q6zxq-cai"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                className="gap-1.5 text-xs"
              >
                <Icon icon={ExternalLinkGlassIcon} className="size-3.5" />
                Verify Canister
              </Button>
              <Button
                size="sm"
                nativeButton={false}
                render={<Link href="/cron" />}
                className="gap-1.5 text-xs"
              >
                Open Dashboard
                <Icon icon={ArrowRightGlassIcon} className="size-3.5" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              Security & Consensus Model
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              icCron Security Architecture
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
              icCron executes scheduled workloads inside an isolated Rust canister{" "}
              <span className="font-mono text-foreground">w2fxo-5qaaa-aaaan-q6zxq-cai</span> on the Internet Computer,
              combining cryptographic caller identity, SHA-256 API key isolation, and subnet-wide consensus.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SECURITY_PILLARS.map((pillar) => (
              <Card key={pillar.title} className="rounded-2xl border-border/70 bg-card/70 shadow-xs">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon icon={pillar.icon} className="size-4" />
                    </div>
                    <Badge variant="secondary" className="text-[11px] font-mono">
                      {pillar.badge}
                    </Badge>
                  </div>
                  <h2 className="text-base font-bold text-foreground">{pillar.title}</h2>
                  <p className="text-xs leading-relaxed text-muted-foreground">{pillar.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="rounded-2xl border-border/70 bg-muted/30">
            <CardContent className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-foreground">Webhook Consensus Requirement</h2>
                <p className="text-xs text-muted-foreground max-w-2xl">
                  Because every replica on the IC subnet independently sends each HTTPS outcall, webhook endpoints must
                  return deterministic response bodies (such as <span className="font-mono text-foreground">{`{"ok":true}`}</span>)
                  rather than per-node IP echoes or random timestamps.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/iccron/llm.txt" />}
                className="shrink-0 text-xs font-mono"
              >
                Read llm.txt
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
