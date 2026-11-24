"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { CodeGlassIcon, CheckGlassOutlineIcon, CopyGlassIcon, TerminalGlassIcon, CpuGlassIcon } from "@thesvg/ui-react"

const CODE_TABS = [
  {
    id: "curl",
    label: "cURL Webhook",
    icon: TerminalGlassIcon,
    snippet: `curl -X POST "https://uzt4z-lp777-77774-qaabq-cai.raw.icp0.io/api/v1/jobs" \\
  -H "Authorization: Bearer cr_live_9f82bc4e7d1a..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Hourly Database Sync",
    "schedule": "0 * * * *",
    "target": {
      "type": "Webhook",
      "url": "https://api.my-app.com/v1/sync",
      "method": "POST",
      "headers": { "X-Webhook-Secret": "env_prod_secret" }
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

  // Autonomous scheduled logic
  await syncStripeInvoices();
  return NextResponse.json({ ok: true, timestamp: Date.now() });
}`,
  },
  {
    id: "motoko",
    label: "Motoko Inter-Canister",
    icon: CpuGlassIcon,
    snippet: `import IcCron "canister:uzt4z-lp777-77774-qaabq-cai";

actor MyCanister {
  public func setupScheduler() : async () {
    let jobId = await IcCron.create_job({
      schedule = "0 0 * * *"; // Daily at midnight
      target = #CanisterCall({
        canister_id = Principal.fromActor(this);
        method = "harvest_rewards";
        payload = blob "";
      });
    });
  };
};`,
  },
  {
    id: "mcp",
    label: "Claude Code / AI MCP",
    icon: TerminalGlassIcon,
    snippet: `# Connect icCron directly to Claude Code or Cursor AI
claude mcp add iccron -- npx -y @icpay/iccron-mcp

# Prompt your AI agent to schedule autonomous tasks:
# "Schedule an hourly webhook to https://my-app.com/api/sync using icCron"`,
  },
]

export function QuickstartSection() {
  const [activeTab, setActiveTab] = useState(CODE_TABS[0].id)
  const [copied, setCopied] = useState(false)

  const activeSnippet = CODE_TABS.find((t) => t.id === activeTab) ?? CODE_TABS[0]

  const copyCode = () => {
    navigator.clipboard.writeText(activeSnippet.snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            Developer Integration
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Deploy in Less Than 60 Seconds
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Integrate via standard REST APIs, protected Next.js handlers, native Candid interfaces, or AI agent MCP tooling.
          </p>
        </div>

        <div className="mt-12 mx-auto max-w-4xl">
          <Card className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl">
            <div className="flex flex-wrap items-center justify-between border-b border-border/60 bg-secondary/30 px-4 py-3 sm:px-6">
              <div className="flex flex-wrap gap-2">
                {CODE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon icon={tab.icon} className="size-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="xs"
                onClick={copyCode}
                className="gap-1.5 rounded-lg text-xs font-medium"
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

            <div className="bg-background p-6">
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground/90">
                <code>{activeSnippet.snippet}</code>
              </pre>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
