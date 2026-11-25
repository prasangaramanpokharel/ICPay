"use client"

import * as React from "react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/ui/code-block"
import { MultiAgentGlassIcon, PackageGlassIcon } from "@thesvg/ui-react"
import { CRON_CANISTER_ID } from "@/services/cron/actor"
import type { RemoteProjectRecord } from "@/services/cron/types"
import { formatProjectId } from "./cron-types"

interface CronConnectModalProps {
  project: RemoteProjectRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const API_ENDPOINT = `https://${CRON_CANISTER_ID}.raw.icp0.io/api/v1/cron/trigger`

export function CronConnectModal({
  project,
  open,
  onOpenChange,
}: CronConnectModalProps) {
  const projectId = formatProjectId(project?.id)
  const projectName = project ? project.name : "my-project"

  const newProjectPrompt = `You are an expert engineer integrating autonomous on-chain cron scheduling via icCron on the Internet Computer.

Project Configuration:
- Project Name: "${projectName}"
- Project ID: "${projectId}"
- Official SDK: "icpay-cron" (npm / pnpm / yarn / bun / pip)
- Gateway Endpoint: "${API_ENDPOINT}"
- Canister ID: "${CRON_CANISTER_ID}"

Integration Steps:
1. Install Official SDK:
   npm install icpay-cron
   (or pip install icpay-cron for Python)

2. Configure Environment:
   Add to .env:
   ICCRON_PROJECT_ID="${projectId}"
   ICCRON_API_KEY="your_api_key_here"

3. Initialize Client & Trigger Dispatcher:
   Use the official IcCronClient SDK rather than raw HTTP calls:
   import { IcCronClient } from "icpay-cron"

   const cron = new IcCronClient({
     apiKey: process.env.ICCRON_API_KEY,
   })

   await cron.trigger({
     projectId: "${projectId}",
     jobId: 1,
   })

4. Secure Webhook Receiver:
   Create a webhook handler route (e.g., /api/cron/trigger):
   - Verify incoming authorization: req.headers.get("authorization") === \`Bearer \${process.env.CRON_SECRET}\`
   - Return deterministic response JSON: { "ok": true } with HTTP 200 within 5 seconds.
   - For long-running workloads, enqueue tasks or execute asynchronously.`

  const migratePrompt = `You are an expert engineer migrating existing scheduled cron jobs (from Vercel Cron, AWS EventBridge, GitHub Actions, or node-cron) to icCron.

Target icCron Namespace:
- Project Name: "${projectName}"
- Project ID: "${projectId}"
- Official SDK: "icpay-cron" (npm install icpay-cron / pip install icpay-cron)
- Gateway Endpoint: "${API_ENDPOINT}"
- Canister ID: "${CRON_CANISTER_ID}"

Migration Checklist:
1. Audit Existing Workloads:
   - Identify cron schedules in vercel.json, .github/workflows, serverless.yml, or node-cron daemons.
   - Extract scheduled routes and frequencies (e.g., "0 * * * *").

2. Install SDK & Configure Environment:
   npm install icpay-cron
   Add to .env:
   ICCRON_PROJECT_ID="${projectId}"
   ICCRON_API_KEY="your_api_key_here"

3. Programmatic Dispatch with SDK:
   Replace raw fetch or local cron runners with the official client:
   import { IcCronClient } from "icpay-cron"

   const cron = new IcCronClient({
     apiKey: process.env.ICCRON_API_KEY,
   })

   await cron.trigger({
     projectId: "${projectId}",
     jobId: 1,
   })

4. Webhook Compatibility:
   - Ensure the receiver endpoint returns deterministic status 200 { "ok": true } to satisfy subnet consensus.
   - Secure the route with a shared secret header (Authorization: Bearer <SECRET>).
   - Decommission legacy paid scheduler configurations once running on icCron.`

  const promptTabs = [
    { label: "New Project", code: newProjectPrompt, language: "markdown" },
    { label: "Migrate Existing", code: migratePrompt, language: "markdown" },
  ]

  const npmCode = `npm install icpay-cron`

  const nodeCode = `import { IcCronClient } from "icpay-cron"

const client = new IcCronClient({
  apiKey: process.env.ICCRON_API_KEY,
})

const res = await client.trigger({
  projectId: "${projectId}",
  jobId: 1,
})

console.log("icCron response:", res)`

  const pythonCode = `import os
from icpay_cron import IcCronClient

client = IcCronClient(api_key=os.environ["ICCRON_API_KEY"])

res = client.trigger("${projectId}", 1)
print("icCron response:", res)`

  const curlCode = `curl -X POST ${API_ENDPOINT} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"project_id": "${projectId}", "job_id": 1}'`

  const canisterCode = `dfx canister call ${CRON_CANISTER_ID} api_trigger_job '("YOUR_API_KEY", 1)'`

  const envCode = `ICCRON_PROJECT_ID="${projectId}"
ICCRON_PROJECT_NAME="${projectName}"
ICCRON_API_URL="${API_ENDPOINT}"
ICCRON_API_KEY="icp_cron_YOUR_KEY"`

  const codeTabs = [
    { label: "Node.js", code: nodeCode, language: "typescript" },
    { label: "Python", code: pythonCode, language: "python" },
    { label: "npm", code: npmCode, language: "bash" },
    { label: "cURL", code: curlCode, language: "bash" },
    { label: "Canister", code: canisterCode, language: "bash" },
    { label: ".env", code: envCode, language: "bash" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl overflow-hidden p-6 min-w-0">
        <DialogHeader className="gap-1 min-w-0 w-full">
          <div className="flex items-center gap-2">
            <DialogTitle>
              Connect to {projectName}
            </DialogTitle>
            <Badge variant="secondary" className="text-[11px] font-mono">
              ID: {projectId}
            </Badge>
          </div>
          <DialogDescription>
            Onboard AI coding agents or trigger jobs on-demand via HTTP webhooks, serverless handlers, or canisters.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 min-w-0 w-full overflow-hidden">
          <Tabs defaultValue="prompt" className="w-full min-w-0">
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="prompt" className="flex items-center justify-center gap-1.5 text-xs">
                <MultiAgentGlassIcon className="size-3.5" />
                <span>Prompt</span>
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center justify-center gap-1.5 text-xs">
                <PackageGlassIcon className="size-3.5" />
                <span>Code</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="prompt" className="mt-0 min-w-0">
              <CodeBlock tabs={promptTabs} preClassName="h-[270px] overflow-y-auto" className="w-full text-xs" />
            </TabsContent>

            <TabsContent value="code" className="mt-0 min-w-0">
              <CodeBlock tabs={codeTabs} preClassName="h-[270px] overflow-y-auto" className="w-full text-xs" />
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex-row items-center justify-between border-t border-border pt-4 sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={
              <Link
                href={`/cron/api?projectId=${projectId}`}
                onClick={() => onOpenChange(false)}
              />
            }
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Manage API Keys
          </Button>

          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link
                href="/cron/docs"
                onClick={() => onOpenChange(false)}
              />
            }
            className="text-xs"
          >
            API Docs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
