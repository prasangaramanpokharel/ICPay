"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import {
  CodeGlassIcon,
  CheckGlassOutlineIcon,
  CopyGlassIcon,
  TerminalGlassIcon,
  CpuGlassIcon,
  ExternalLinkGlassIcon,
} from "@thesvg/ui-react"

const CODE_TABS = [
  {
    id: "sdk",
    label: "icpay-cron SDK",
    icon: CodeGlassIcon,
    snippet: `import { IcCronClient } from "icpay-cron";

const client = new IcCronClient({
  apiKey: process.env.ICCRON_API_KEY,
});

const job = await client.createJob({
  label: "Hourly Database Sync",
  cronExpression: "0 * * * *",
  target: {
    type: "HttpWebhook",
    url: "https://api.my-app.com/v1/sync",
    method: "POST",
    headers: [["X-Webhook-Secret", "env_prod_secret"]],
  },
});

const logs = await client.getProjectLogs();`,
  },
  {
    id: "curl",
    label: "cURL REST API",
    icon: TerminalGlassIcon,
    snippet: `curl -X POST "https://w2fxo-5qaaa-aaaan-q6zxq-cai.raw.icp0.io/api/v1/cron/jobs" \\
  -H "Authorization: Bearer icp_cron_8bc8dec2c4c1..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "label": "Hourly Database Sync",
    "cron_expression": "0 * * * *",
    "target": {
      "type": "HttpWebhook",
      "url": "https://api.my-app.com/v1/sync",
      "method": "POST",
      "headers": [["X-Webhook-Secret", "env_prod_secret"]]
    }
  }'`,
  },
  {
    id: "nextjs",
    label: "Next.js Route Handler",
    icon: CodeGlassIcon,
    snippet: `import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== \`Bearer \${process.env.ICCRON_SECRET}\`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await syncStripeInvoices();
  return NextResponse.json({ ok: true, timestamp: Date.now() });
}`,
  },
  {
    id: "motoko",
    label: "Motoko Inter-Canister",
    icon: CpuGlassIcon,
    snippet: `import IcCron "canister:w2fxo-5qaaa-aaaan-q6zxq-cai";

actor MyCanister {
  public func setupScheduler(projectId : Nat64) : async () {
    let _res = await IcCron.create_job({
      project_id = projectId;
      label = "Daily Harvest";
      cron_expression = "0 0 * * *";
      max_retries = ?10;
      target = #CanisterCall({
        canister_id = Principal.fromActor(this);
        method = "harvest_rewards";
        payload = blob "";
      });
    });
  };
};`,
  },
]

const SDK_PACKAGES = [
  {
    name: "icpay-cron",
    ecosystem: "npm / TypeScript",
    install: "npm i icpay-cron",
    href: "https://www.npmjs.com/package/icpay-cron",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/npm/npm-original-wordmark.svg",
  },
  {
    name: "icpay-cron",
    ecosystem: "Python",
    install: "pip install icpay-cron",
    href: "https://github.com/prasangapokharel/ICPay/tree/main/pkg/iccron/py/icpay-cron",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
  },
  {
    name: "icpay-cron-go",
    ecosystem: "Go",
    install: "go get github.com/prasangaramanpokharel/icpay-cron-go",
    href: "https://github.com/prasangaramanpokharel/icpay-cron-go",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/go/go-original.svg",
  },
  {
    name: "icpay-cron",
    ecosystem: "Rust",
    install: "cargo add icpay-cron",
    href: "https://github.com/prasangapokharel/ICPay/tree/main/pkg/iccron/rust/icpay-cron",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rust/rust-original.svg",
    invertInDark: true,
  },
  {
    name: "icpay/cron",
    ecosystem: "PHP",
    install: "composer require icpay/cron",
    href: "https://github.com/prasangapokharel/ICPay/tree/main/pkg/iccron/php/icpay-cron",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg",
  },
]

export function QuickstartSection() {
  const [activeTab, setActiveTab] = useState(CODE_TABS[0].id)
  const [copied, setCopied] = useState(false)
  const [copiedPkg, setCopiedPkg] = useState<string | null>(null)
  const [npmVersion, setNpmVersion] = useState<string>("1.0.1")
  const [githubTag, setGithubTag] = useState<string>("v1.7.0")

  useEffect(() => {
    let active = true
    fetch("https://registry.npmjs.org/icpay-cron/latest")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { version?: string } | null) => {
        if (active && data?.version) setNpmVersion(data.version)
      })
      .catch(() => {})

    fetch("https://api.github.com/repos/prasangapokharel/ICPay/releases/latest")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { tag_name?: string } | null) => {
        if (active && data?.tag_name) setGithubTag(data.tag_name)
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  const activeSnippet = CODE_TABS.find((t) => t.id === activeTab) ?? CODE_TABS[0]

  const copyCode = () => {
    navigator.clipboard.writeText(activeSnippet.snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyInstall = (installCmd: string, name: string) => {
    navigator.clipboard.writeText(installCmd)
    setCopiedPkg(name)
    setTimeout(() => setCopiedPkg(null), 2000)
  }

  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Quickstart
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            Integrate via official SDKs, standard REST APIs, Next.js route handlers, or native Candid interfaces.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="https://www.npmjs.com/package/icpay-cron"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2.5 rounded-full border border-border/70 bg-card/80 px-3.5 text-xs font-medium text-foreground shadow-2xs backdrop-blur-xs transition-all hover:border-primary/50 hover:bg-card hover:text-primary"
            >
              <div className="flex size-5 shrink-0 items-center justify-center">
                <Image
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/npm/npm-original-wordmark.svg"
                  alt="npm"
                  width={20}
                  height={14}
                  unoptimized
                  className="h-3.5 w-auto object-contain"
                />
              </div>
              <span className="font-mono text-[11px] font-semibold text-foreground">npm: icpay-cron</span>
              <Badge variant="secondary" className="h-5 px-1.5 font-mono text-[10px] font-medium leading-none">
                v{npmVersion}
              </Badge>
              <Icon icon={ExternalLinkGlassIcon} className="size-3 text-muted-foreground" />
            </Link>

            <Link
              href="https://github.com/prasangapokharel/ICPay/tree/main/pkg/iccron"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2.5 rounded-full border border-border/70 bg-card/80 px-3.5 text-xs font-medium text-foreground shadow-2xs backdrop-blur-xs transition-all hover:border-primary/50 hover:bg-card hover:text-primary"
            >
              <div className="flex size-5 shrink-0 items-center justify-center">
                <Image
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg"
                  alt="GitHub"
                  width={18}
                  height={18}
                  unoptimized
                  className="size-4 object-contain dark:invert"
                />
              </div>
              <span className="font-mono text-[11px] font-semibold text-foreground">GitHub: ICPay</span>
              <Badge variant="secondary" className="h-5 px-1.5 font-mono text-[10px] font-medium leading-none">
                {githubTag}
              </Badge>
              <Icon icon={ExternalLinkGlassIcon} className="size-3 text-muted-foreground" />
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/40 px-3 py-2 sm:px-4">
              <div className="flex flex-wrap gap-1.5">
                {CODE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon icon={tab.icon} className="size-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="xs"
                onClick={copyCode}
                className="gap-1.5 rounded-lg text-xs font-medium cursor-pointer"
              >
                {copied ? (
                  <>
                    <Icon icon={CheckGlassOutlineIcon} className="size-3.5 text-success" strokeWidth={2.5} />
                    <span className="text-success font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Icon icon={CopyGlassIcon} className="size-3.5" strokeWidth={2} />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>

            <div className="bg-background/95 p-5 sm:p-6">
              <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed text-foreground">
                <code>{activeSnippet.snippet}</code>
              </pre>
            </div>
          </Card>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SDK_PACKAGES.map((pkg) => (
            <div
              key={pkg.ecosystem}
              className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card/70 p-4 transition-colors hover:border-primary/50 hover:bg-card"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-background p-1.5 shadow-2xs">
                    <Image
                      src={pkg.iconUrl}
                      alt={pkg.ecosystem}
                      width={20}
                      height={20}
                      unoptimized
                      className={pkg.invertInDark ? "size-5 object-contain dark:invert" : "size-5 object-contain"}
                      style={{ width: "auto", height: "auto" }}
                    />
                  </div>
                  <Link
                    href={pkg.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={`View ${pkg.name} package documentation`}
                  >
                    <Icon icon={ExternalLinkGlassIcon} className="size-3.5 transition-transform hover:scale-110" />
                  </Link>
                </div>
                <div>
                  <Link
                    href={pkg.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-foreground underline decoration-border underline-offset-4 hover:decoration-primary hover:text-primary transition-colors"
                  >
                    {pkg.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">{pkg.ecosystem}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => copyInstall(pkg.install, pkg.ecosystem)}
                  className="flex w-full items-center justify-between gap-1.5 rounded-lg border border-border/60 bg-muted/60 px-2.5 py-1.5 text-left font-mono text-[11px] text-foreground transition-colors hover:bg-muted hover:border-border"
                >
                  <span className="truncate">{pkg.install}</span>
                  {copiedPkg === pkg.ecosystem ? (
                    <Icon icon={CheckGlassOutlineIcon} className="size-3 text-success shrink-0" strokeWidth={2.5} />
                  ) : (
                    <Icon icon={CopyGlassIcon} className="size-3 text-muted-foreground shrink-0" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
