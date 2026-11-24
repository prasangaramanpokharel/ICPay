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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/ui/code-block"
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

  const curlCode = `curl -X POST ${API_ENDPOINT} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"project_id": "${projectId}", "job_id": 1}'`

  const nodeCode = `const res = await fetch("${API_ENDPOINT}", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${process.env.ICCRON_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    project_id: "${projectId}",
    job_id: 1,
  }),
});

const data = await res.json();
console.log("icCron execution response:", data);`

  const canisterCode = `dfx canister call ${CRON_CANISTER_ID} api_trigger_job '("YOUR_API_KEY", 1)'`

  const envCode = `ICCRON_PROJECT_ID="${projectId}"
ICCRON_PROJECT_NAME="${projectName}"
ICCRON_API_URL="${API_ENDPOINT}"
ICCRON_API_KEY="icp_cron_YOUR_KEY"`

  const tabs = [
    { label: "cURL", code: curlCode, language: "bash" },
    { label: "Node.js", code: nodeCode, language: "typescript" },
    { label: "Canister", code: canisterCode, language: "bash" },
    { label: ".env", code: envCode, language: "bash" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-xl overflow-hidden p-6 min-w-0">
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
            Trigger jobs on-demand via HTTP webhooks, serverless handlers, or on-chain calls.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 min-w-0 w-full overflow-hidden">
          <CodeBlock tabs={tabs} className="w-full text-xs" />
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
              <a
                href="/docs/iccron"
                target="_blank"
                rel="noreferrer"
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
